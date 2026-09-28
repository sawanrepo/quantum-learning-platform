import type {
  Amplitude,
  BlochVector,
  Circuit,
  CircuitGate,
  GateId,
  SimulationResult,
} from "./quantum-api";

export interface GateSpec {
  id: GateId;
  symbol: string;
  name: string;
  arity: 1 | 2;
  family: "pauli" | "phase" | "rotation" | "entangling" | "measure";
  hasAngle?: boolean;
  matrix?: string;
  blurb: string;
}

export const GATE_SPECS: GateSpec[] = [
  { id: "H", symbol: "H", name: "Hadamard", arity: 1, family: "pauli", blurb: "Creates an even superposition of |0⟩ and |1⟩." },
  { id: "X", symbol: "X", name: "Pauli-X", arity: 1, family: "pauli", blurb: "Bit flip — rotates π about the X axis." },
  { id: "Y", symbol: "Y", name: "Pauli-Y", arity: 1, family: "pauli", blurb: "Bit and phase flip — π about the Y axis." },
  { id: "Z", symbol: "Z", name: "Pauli-Z", arity: 1, family: "pauli", blurb: "Phase flip — π about the Z axis." },
  { id: "S", symbol: "S", name: "Phase (S)", arity: 1, family: "phase", blurb: "Quarter turn phase: adds π/2 to |1⟩." },
  { id: "T", symbol: "T", name: "π/8 (T)", arity: 1, family: "phase", blurb: "Adds π/4 phase to |1⟩." },
  { id: "RX", symbol: "Rx", name: "X rotation", arity: 1, family: "rotation", hasAngle: true, blurb: "Continuous rotation θ about X." },
  { id: "RY", symbol: "Ry", name: "Y rotation", arity: 1, family: "rotation", hasAngle: true, blurb: "Continuous rotation θ about Y." },
  { id: "RZ", symbol: "Rz", name: "Z rotation", arity: 1, family: "rotation", hasAngle: true, blurb: "Continuous phase rotation θ about Z." },
  { id: "CNOT", symbol: "⊕", name: "CNOT", arity: 2, family: "entangling", blurb: "Flips the target when the control is |1⟩. Source of entanglement." },
  { id: "CZ", symbol: "Z", name: "Controlled-Z", arity: 2, family: "entangling", blurb: "Applies a phase flip when both qubits are |1⟩." },
  { id: "SWAP", symbol: "×", name: "SWAP", arity: 2, family: "entangling", blurb: "Exchanges the states of two qubits." },
  { id: "MEASURE", symbol: "M", name: "Measurement", arity: 1, family: "measure", blurb: "Collapses the qubit onto the computational basis." },
];

export const gateSpec = (id: GateId) => GATE_SPECS.find((g) => g.id === id)!;

let counter = 0;
export const newGateId = () => `g${Date.now().toString(36)}${(counter++).toString(36)}`;

export const emptyCircuit = (qubits = 2): Circuit => ({
  name: "Untitled experiment",
  qubits,
  initial_states: Array(qubits).fill("0"),
  gates: [],
});

export const MAX_STEPS = 14;
export const MAX_QUBITS = 8;

export function circuitDepth(circuit: Circuit) {
  return circuit.gates.reduce((max, g) => Math.max(max, g.step + 1), 0);
}

export function occupied(circuit: Circuit, step: number, qubit: number, ignoreId?: string) {
  return circuit.gates.some(
    (g) => g.id !== ignoreId && g.step === step && g.qubits.includes(qubit),
  );
}

export function firstFreeStep(circuit: Circuit, qubits: number[]) {
  for (let step = 0; step < MAX_STEPS; step++) {
    if (qubits.every((q) => !occupied(circuit, step, q))) return step;
  }
  return MAX_STEPS - 1;
}

export function addGate(
  circuit: Circuit,
  gate: GateId,
  qubits: number[],
  step?: number,
  params?: number[],
): Circuit {
  const spec = gateSpec(gate);
  const targets = qubits.slice(0, spec.arity);
  if (targets.length < spec.arity) return circuit;
  const at = step ?? firstFreeStep(circuit, targets);
  const cleared = circuit.gates.filter(
    (g) => !(g.step === at && g.qubits.some((q) => targets.includes(q))),
  );
  const next: CircuitGate = {
    id: newGateId(),
    gate,
    qubits: targets,
    step: at,
    ...(spec.hasAngle ? { params: params ?? [Math.PI / 2] } : {}),
  };
  return { ...circuit, gates: [...cleared, next] };
}

export function removeGate(circuit: Circuit, id: string): Circuit {
  return { ...circuit, gates: circuit.gates.filter((g) => g.id !== id) };
}

export function moveGate(circuit: Circuit, id: string, step: number, topQubit: number): Circuit {
  const gate = circuit.gates.find((g) => g.id === id);
  if (!gate) return circuit;
  const offsets = gate.qubits.map((q) => q - gate.qubits[0]);
  const targets = offsets.map((o) => topQubit + o);
  if (targets.some((q) => q < 0 || q >= circuit.qubits)) return circuit;
  if (new Set(targets).size !== targets.length) return circuit;
  const cleared = circuit.gates.filter(
    (g) => g.id !== id && !(g.step === step && g.qubits.some((q) => targets.includes(q))),
  );
  return { ...circuit, gates: [...cleared, { ...gate, step, qubits: targets }] };
}

export function setGateAngle(circuit: Circuit, id: string, angle: number): Circuit {
  return {
    ...circuit,
    gates: circuit.gates.map((g) => (g.id === id ? { ...g, params: [angle] } : g)),
  };
}

export function toggleInitialState(circuit: Circuit, qubit: number): Circuit {
  const curStates = [...(circuit.initial_states ?? Array(circuit.qubits).fill("0"))];
  curStates[qubit] = curStates[qubit] === "1" ? "0" : "1";
  return { ...circuit, initial_states: curStates };
}

export function setQubitCount(circuit: Circuit, qubits: number): Circuit {
  const n = Math.min(MAX_QUBITS, Math.max(1, qubits));
  const curStates = circuit.initial_states ?? Array(circuit.qubits).fill("0");
  const nextStates = Array.from({ length: n }, (_, i) => curStates[i] ?? "0");
  return {
    ...circuit,
    qubits: n,
    initial_states: nextStates,
    gates: circuit.gates.filter((g) => g.qubits.every((q) => q < n)),
  };
}

/* ---------------- example circuits ---------------- */

export const EXAMPLE_CIRCUITS: Circuit[] = [
  {
    name: "Superposition",
    qubits: 1,
    gates: [
      { id: "ex1a", gate: "H", qubits: [0], step: 0 },
      { id: "ex1b", gate: "MEASURE", qubits: [0], step: 1 },
    ],
  },
  {
    name: "Bell state Φ+",
    qubits: 2,
    gates: [
      { id: "ex2a", gate: "H", qubits: [0], step: 0 },
      { id: "ex2b", gate: "CNOT", qubits: [0, 1], step: 1 },
      { id: "ex2c", gate: "MEASURE", qubits: [0], step: 2 },
      { id: "ex2d", gate: "MEASURE", qubits: [1], step: 2 },
    ],
  },
  {
    name: "GHZ state",
    qubits: 3,
    gates: [
      { id: "ex3a", gate: "H", qubits: [0], step: 0 },
      { id: "ex3b", gate: "CNOT", qubits: [0, 1], step: 1 },
      { id: "ex3c", gate: "CNOT", qubits: [1, 2], step: 2 },
    ],
  },
  {
    name: "Phase kickback",
    qubits: 2,
    gates: [
      { id: "ex4a", gate: "H", qubits: [0], step: 0 },
      { id: "ex4b", gate: "H", qubits: [1], step: 0 },
      { id: "ex4c", gate: "CZ", qubits: [0, 1], step: 1 },
      { id: "ex4d", gate: "H", qubits: [1], step: 2 },
    ],
  },
];

/** Accepts a loosely shaped circuit from the backend (module / demo payloads). */
export function normalizeCircuit(raw: unknown, fallbackName = "Loaded circuit"): Circuit | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const gatesRaw = (obj.gates ?? obj.operations ?? obj.ops) as unknown;
  if (!Array.isArray(gatesRaw)) return null;
  const gates: CircuitGate[] = [];
  gatesRaw.forEach((g, i) => {
    if (!g || typeof g !== "object") return;
    const gg = g as Record<string, unknown>;
    const nameRaw = String(gg.gate ?? gg.name ?? gg.type ?? "").toUpperCase();
    const alias: Record<string, GateId> = { CX: "CNOT", M: "MEASURE", MEASUREMENT: "MEASURE" };
    const id = (alias[nameRaw] ?? nameRaw) as GateId;
    if (!GATE_SPECS.some((s) => s.id === id)) return;
    const qs = (gg.qubits ?? gg.targets ?? gg.wires ?? []) as unknown;
    let qubits = Array.isArray(qs) ? qs.map((q) => Number(q)).filter((q) => Number.isFinite(q)) : [];
    if (gg.control !== undefined) qubits = [Number(gg.control), ...qubits];
    if (qubits.length === 0 && gg.qubit !== undefined) qubits = [Number(gg.qubit)];
    if (qubits.length === 0) return;
    const paramsRaw = (gg.params ?? gg.parameters ?? (gg.angle !== undefined ? [gg.angle] : [])) as unknown;
    const params = Array.isArray(paramsRaw) ? paramsRaw.map(Number).filter(Number.isFinite) : [];
    gates.push({
      id: newGateId(),
      gate: id,
      qubits: qubits.slice(0, gateSpec(id).arity),
      step: Number(gg.step ?? gg.column ?? i) || 0,
      ...(params.length ? { params } : {}),
    });
  });
  if (!gates.length) return null;
  const declared = Number(obj.num_qubits ?? obj.qubits ?? obj.n_qubits ?? 0);
  const inferred = Math.max(...gates.flatMap((g) => g.qubits)) + 1;
  return {
    name: String(obj.name ?? obj.title ?? fallbackName),
    qubits: Math.min(MAX_QUBITS, Math.max(Number.isFinite(declared) ? declared : 0, inferred, 1)),
    gates,
  };
}

/* ---------------- simulation result readers ---------------- */

export function readBlochVectors(result: SimulationResult | null): BlochVector[] {
  if (!result) return [];
  const raw = (result.bloch_vectors ?? result.bloch ?? (result as Record<string, unknown>).bloch_sphere) as unknown;
  const list = Array.isArray(raw) ? raw : raw && typeof raw === "object" ? [raw] : [];
  return list
    .map((v, i) => {
      const o = v as Record<string, unknown>;
      const num = (k: string) => (Number.isFinite(Number(o?.[k])) ? Number(o[k]) : 0);
      return { x: num("x"), y: num("y"), z: num("z"), theta: num("theta"), phi: num("phi"), qubit: i };
    })
    .filter(Boolean);
}

export interface BasisRow {
  state: string;
  count: number;
  probability: number;
}

export function readCounts(result: SimulationResult | null): BasisRow[] {
  if (!result) return [];
  const counts = (result.counts ?? {}) as Record<string, number>;
  const probs = (result.probabilities ?? {}) as Record<string, number>;
  const shots = Number(result.shots) || Object.values(counts).reduce((a, b) => a + Number(b), 0);
  const keys = Array.from(new Set([...Object.keys(counts), ...Object.keys(probs)]));
  return keys
    .map((state) => {
      const count = Number(counts[state] ?? 0);
      const probability = Number.isFinite(Number(probs[state]))
        ? Number(probs[state])
        : shots > 0
          ? count / shots
          : 0;
      return { state, count, probability };
    })
    .sort((a, b) => a.state.localeCompare(b.state));
}

export interface AmplitudeRow {
  state: string;
  real: number;
  imag: number;
  magnitude: number;
  probability: number;
  phase: number;
}

export function readStatevector(result: SimulationResult | null, qubits: number): AmplitudeRow[] {
  if (!result?.statevector || !Array.isArray(result.statevector)) return [];
  const width = Math.max(1, qubits);
  return result.statevector.map((entry, i) => {
    let real = 0;
    let imag = 0;
    let label = i.toString(2).padStart(width, "0");
    if (Array.isArray(entry)) {
      real = Number(entry[0]) || 0;
      imag = Number(entry[1]) || 0;
    } else if (entry && typeof entry === "object") {
      const o = entry as Amplitude & { re?: number; im?: number };
      real = Number(o.real ?? o.re ?? 0) || 0;
      imag = Number(o.imag ?? o.im ?? 0) || 0;
      label = String(o.state ?? o.basis ?? label);
    } else if (typeof entry === "number") {
      real = entry;
    }
    const magnitude = Math.hypot(real, imag);
    return {
      state: label.replace(/[|⟩>]/g, ""),
      real,
      imag,
      magnitude,
      probability: magnitude * magnitude,
      phase: Math.atan2(imag, real),
    };
  });
}

export function formatAngle(rad: number) {
  const turns = rad / Math.PI;
  const rounded = Math.round(turns * 8) / 8;
  if (Math.abs(rounded) < 1e-9) return "0";
  const fractions: Record<string, string> = {
    "0.125": "π/8",
    "0.25": "π/4",
    "0.375": "3π/8",
    "0.5": "π/2",
    "0.625": "5π/8",
    "0.75": "3π/4",
    "0.875": "7π/8",
    "1": "π",
  };
  const sign = rounded < 0 ? "−" : "";
  const key = Math.abs(rounded).toString();
  return fractions[key] ? `${sign}${fractions[key]}` : `${rad.toFixed(2)}`;
}
