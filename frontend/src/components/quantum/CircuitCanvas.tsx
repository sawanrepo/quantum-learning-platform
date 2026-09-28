import { useEffect, useRef, useState } from "react";
import { Play, Pause, Zap } from "lucide-react";

import { MAX_STEPS, circuitDepth, formatAngle, gateSpec } from "@/lib/circuit";
import type { Circuit, CircuitGate, GateId, StepStateResult } from "@/lib/quantum-api";

interface Props {
  circuit: Circuit;
  armedGate?: GateId | null;
  onPlace?: (qubit: number, step: number) => void;
  onRemove?: (id: string) => void;
  onMove?: (id: string, step: number, qubit: number) => void;
  onSelect?: (gate: CircuitGate | null) => void;
  onToggleQubitState?: (qubit: number) => void;
  onStepClick?: (step: number) => void;
  selectedId?: string | null;
  activeStep?: number | null;
  stepResults?: StepStateResult[];
  scale?: "normal" | "large";
}

const familyTone: Record<string, string> = {
  pauli: "border-beam/60 bg-beam/12 text-beam",
  phase: "border-phase/60 bg-phase/12 text-phase",
  rotation: "border-phase/50 bg-phase/10 text-phase",
  entangling: "border-entangle/60 bg-entangle/12 text-entangle",
  measure: "border-measure/60 bg-measure/12 text-measure",
};

function getQubitStateAt(
  stepResults: StepStateResult[] | undefined,
  stepIdx: number,
  qubitIdx: number,
  fallbackInit = "0"
): { label: string; prob0: number; prob1: number; z: number } {
  if (!stepResults || stepResults.length === 0) {
    const isZero = fallbackInit === "0";
    return { label: `|${fallbackInit}⟩`, prob0: isZero ? 1 : 0, prob1: isZero ? 0 : 1, z: isZero ? 1 : -1 };
  }

  const stepRes = stepResults[stepIdx];
  if (!stepRes || !stepRes.bloch_vectors) {
    const isZero = fallbackInit === "0";
    return { label: `|${fallbackInit}⟩`, prob0: isZero ? 1 : 0, prob1: isZero ? 0 : 1, z: isZero ? 1 : -1 };
  }

  const vec =
    stepRes.bloch_vectors.find((v) => (v.qubit ?? v.qubit_index) === qubitIdx) ??
    stepRes.bloch_vectors[qubitIdx];
  if (!vec) {
    const isZero = fallbackInit === "0";
    return { label: `|${fallbackInit}⟩`, prob0: isZero ? 1 : 0, prob1: isZero ? 0 : 1, z: isZero ? 1 : -1 };
  }

  let label = vec.state_str || "|0⟩";
  if (vec.z > 0.95) label = "|0⟩";
  else if (vec.z < -0.95) label = "|1⟩";
  else if (Math.abs(vec.z) < 0.15 && vec.x > 0.85) label = "|+⟩";
  else if (Math.abs(vec.z) < 0.15 && vec.x < -0.85) label = "|-⟩";

  return {
    label,
    prob0: vec.prob_0 ?? 0,
    prob1: vec.prob_1 ?? 0,
    z: vec.z ?? 1,
  };
}

function getBadgeStyle(label: string): string {
  if (label.includes("0")) {
    return "bg-cyan-500/20 text-cyan-300 border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.6)] ring-1 ring-cyan-400/30";
  }
  if (label.includes("1")) {
    return "bg-amber-500/20 text-amber-300 border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.6)] ring-1 ring-amber-400/30";
  }
  if (label.includes("+") || label.includes("-") || label.includes("θ")) {
    return "bg-purple-500/20 text-purple-300 border-purple-400/70 shadow-[0_0_12px_rgba(168,85,247,0.6)] ring-1 ring-purple-400/30";
  }
  return "bg-primary/20 text-primary border-primary/70";
}

export function CircuitCanvas({
  circuit,
  armedGate = null,
  onPlace,
  onRemove,
  onMove,
  onSelect,
  onToggleQubitState,
  onStepClick,
  selectedId = null,
  stepResults,
  scale = "normal",
}: Props) {
  const [hover, setHover] = useState<{ q: number; s: number } | null>(null);
  const editable = Boolean(onPlace);
  const cell = scale === "large" ? 80 : 64;
  const columns = Math.min(MAX_STEPS, Math.max(circuitDepth(circuit) + 2, 8));

  // AUTO-PLAY ANIMATION ENGINE (ALWAYS ACTIVE BY DEFAULT)
  const [isAnimating, setIsAnimating] = useState(true);
  const [animProgress, setAnimProgress] = useState(0);
  const animRef = useRef<number | null>(null);

  const maxSteps = Math.max(circuitDepth(circuit), 1);
  const hasSimulationResults = Boolean(stepResults && stepResults.length > 0);

  // Automatic Continuous Flow Loop
  useEffect(() => {
    if (!isAnimating) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setAnimProgress((prev) => {
        const next = prev + dt * 0.95; // Smooth travel speed
        if (next >= maxSteps + 0.6) {
          return 0; // Seamless continuous loop from left to right
        }
        return next;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isAnimating, maxSteps]);

  // Sync active step to callback when progress changes integer steps
  const currentAnimStep = Math.floor(animProgress);
  const currentStepFrac = animProgress - currentAnimStep;

  useEffect(() => {
    onStepClick?.(currentAnimStep);
  }, [currentAnimStep, onStepClick]);

  const gateAt = (q: number, s: number) =>
    circuit.gates.find((g) => g.step === s && g.qubits.includes(q));

  return (
    <div className="relative space-y-2">
      {/* Top Header Bar: Clean timeline indicator + Auto Flow status */}
      <div className="flex items-center justify-between px-2 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-primary">
            <span className="inline-block size-2 rounded-full bg-primary animate-ping" />
            Automatic Live State Flow
          </span>
          <span className="text-[11px] text-muted-foreground">
            (Bit states transform live as they enter & exit gates)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="flex items-center gap-1 rounded border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-mono hover:text-foreground"
          >
            {isAnimating ? <Pause className="h-3 w-3 fill-foreground" /> : <Play className="h-3 w-3 fill-foreground" />}
            {isAnimating ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      {/* CANVAS CONTAINER */}
      <div className="overflow-x-auto">
        <div className="min-w-max px-4 py-3">
          {/* CLEAN TIMELINE RULER (Simple tick numbers 0, 1, 2... no step buttons) */}
          <div className="flex border-b border-border/50 pb-1" style={{ paddingLeft: 96 }}>
            {Array.from({ length: columns }).map((_, s) => (
              <div
                key={s}
                className={`num text-center text-xs transition-colors ${
                  currentAnimStep === s ? "text-primary font-bold text-sm" : "text-muted-foreground/60"
                }`}
                style={{ width: cell }}
              >
                t<sub>{s}</sub>
              </div>
            ))}
          </div>

          {/* QUBIT WIRES GRID */}
          <div className="relative mt-3">
            {Array.from({ length: circuit.qubits }).map((_, q) => {
              const initState = circuit.initial_states?.[q] ?? "0";

              // Particle State calculation at animProgress
              const sIdx = Math.floor(animProgress);
              const frac = animProgress - sIdx;

              const stateBefore = getQubitStateAt(stepResults, sIdx, q, initState);
              const stateAfter = getQubitStateAt(stepResults, sIdx + 1, q, initState);

              // Particle state morphs as it crosses the gate (frac ~ 0.5)
              const particleState = frac < 0.45 ? stateBefore : stateAfter;
              const isCrossingGate = gateAt(q, sIdx) && Math.abs(frac - 0.5) < 0.25;

              // Animated Particle X position on wire
              const particlePosX = 96 + animProgress * cell + cell / 2;

              return (
                <div key={q} className="relative flex items-center" style={{ height: cell + 12 }}>
                  {/* Qubit Wire Header */}
                  <div className="num w-[96px] shrink-0 pr-3 text-right text-xs text-muted-foreground flex items-center justify-end gap-1.5">
                    <span className="font-bold">
                      q<span className="text-foreground">{q}</span>
                    </span>
                    <button
                      onClick={() => onToggleQubitState?.(q)}
                      className={`num rounded px-2 py-0.5 text-xs font-bold transition-all border cursor-pointer ${
                        initState === "1"
                          ? "bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                          : "bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                      } hover:scale-105`}
                      title="Click to toggle initial qubit bit state (|0⟩ / |1⟩)"
                    >
                      |{initState}⟩
                    </button>
                  </div>

                  {/* Qubit Wire Line */}
                  <div
                    className="absolute h-px bg-border/80"
                    style={{ left: 96, width: columns * cell, top: (cell + 12) / 2 }}
                  />

                  {/* AUTOMATIC GLIDING QUANTUM STATE PARTICLE */}
                  {animProgress <= columns && (
                    <div
                      className={`pointer-events-none absolute z-30 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
                        isCrossingGate ? "scale-125" : "scale-100"
                      }`}
                      style={{
                        left: particlePosX,
                        top: (cell + 12) / 2,
                      }}
                    >
                      <span
                        className={`num flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-extrabold shadow-2xl transition-all duration-200 ${getBadgeStyle(
                          particleState.label
                        )} ${isCrossingGate ? "scale-110 ring-4 ring-primary/60 animate-bounce" : ""}`}
                      >
                        {particleState.label}
                      </span>
                    </div>
                  )}

                  {/* Wire Cells */}
                  {Array.from({ length: columns }).map((_, s) => {
                    const gate = gateAt(q, s);
                    const isHover = hover?.q === q && hover?.s === s;

                    return (
                      <div
                        key={s}
                        className="relative flex items-center justify-center"
                        style={{ width: cell, height: cell + 12 }}
                        onMouseEnter={() => setHover({ q, s })}
                        onMouseLeave={() => setHover(null)}
                        onDragOver={(e) => {
                          if (editable) e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const id = e.dataTransfer.getData("text/gate-id");
                          const lib = e.dataTransfer.getData("text/gate-new") as GateId;
                          if (id) onMove?.(id, s, q);
                          else if (lib) onPlace?.(q, s);
                        }}
                        onClick={() => {
                          if (gate) onSelect?.(gate);
                          else if (armedGate) onPlace?.(q, s);
                        }}
                      >
                        {currentAnimStep === s && (
                          <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-primary/5 border-x border-primary/20" />
                        )}

                        {!gate && editable && (isHover || (armedGate && isHover)) && (
                          <div className="pointer-events-none absolute inset-2 border border-dashed border-primary/50 rounded" />
                        )}

                        {/* Gate Chip */}
                        {gate && (
                          <GateChip
                            gate={gate}
                            qubit={q}
                            cell={cell}
                            selected={selectedId === gate.id}
                            editable={editable}
                            onRemove={onRemove}
                            isTransforming={s === currentAnimStep && isCrossingGate}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Two-Qubit Gate Connectors (CNOT, CZ, SWAP) */}
            {circuit.gates
              .filter((g) => g.qubits.length === 2)
              .map((g) => {
                const [a, b] = g.qubits;
                const top = Math.min(a, b);
                const span = Math.abs(a - b);
                const spec = gateSpec(g.gate);
                const color =
                  spec?.family === "entangling" ? "var(--entangle)" : "var(--beam)";

                const controlQubit = g.qubits[0];
                const targetQubit = g.qubits[1];

                const cIn = getQubitStateAt(stepResults, g.step, controlQubit);
                const tIn = getQubitStateAt(stepResults, g.step, targetQubit);
                const tOut = getQubitStateAt(stepResults, g.step + 1, targetQubit);

                const isCNOTActiveHere =
                  hasSimulationResults &&
                  g.step === currentAnimStep &&
                  Math.abs(currentStepFrac - 0.5) < 0.35;

                return (
                  <div
                    key={`link-${g.id}`}
                    className="group pointer-events-auto absolute w-px cursor-pointer"
                    style={{
                      left: 96 + g.step * cell + cell / 2,
                      top: top * (cell + 12) + (cell + 12) / 2,
                      height: span * (cell + 12),
                      background: color,
                      opacity: 0.85,
                    }}
                  >
                    <span
                      className="absolute -left-[4px] -top-[4px] size-[9px] rounded-full animate-pulse"
                      style={{ background: color }}
                    />
                    <span
                      className="absolute -left-[4px] -bottom-[4px] size-[9px] rounded-full"
                      style={{ background: color }}
                    />

                    {/* LIVE CNOT LASER BEAM ANIMATION WHEN PARTICLE CROSSES CNOT */}
                    {isCNOTActiveHere && (
                      <div className="absolute inset-0 bg-entangle shadow-[0_0_15px_rgba(236,72,153,1)] animate-ping" />
                    )}

                    {/* CNOT Action Floating Banner */}
                    {isCNOTActiveHere && g.gate === "CNOT" && (
                      <div className="absolute top-1/2 left-3 -translate-y-1/2 z-40 whitespace-nowrap animate-bounce">
                        <span className="num flex items-center gap-1 border border-entangle bg-card/95 text-entangle text-xs font-bold px-2.5 py-1 rounded-md shadow-2xl">
                          <Zap className="h-3.5 w-3.5 fill-entangle" />
                          {cIn.prob1 > 0.8
                            ? `Control q${controlQubit} = |1⟩ ACTIVE ➔ Target q${targetQubit} flipped ${tIn.label} ➔ ${tOut.label}`
                            : cIn.prob0 > 0.8
                            ? `Control q${controlQubit} = |0⟩ ➔ Target q${targetQubit} unchanged`
                            : `Control q${controlQubit} Superposition ➔ Entangling q${controlQubit}, q${targetQubit}`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {circuit.gates.length === 0 && (
            <p className="num mt-4 pl-[96px] text-xs text-muted-foreground">
              {editable
                ? "Pick a gate from the library, then click a wire position to place it."
                : "No gates in this circuit."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function GateChip({
  gate,
  qubit,
  cell,
  selected,
  editable,
  onRemove,
  isTransforming,
}: {
  gate: CircuitGate;
  qubit: number;
  cell: number;
  selected: boolean;
  editable: boolean;
  onRemove?: (id: string) => void;
  isTransforming?: boolean;
}) {
  const spec = gateSpec(gate.gate);
  const isControl = gate.qubits.length === 2 && gate.qubits[0] === qubit;
  const tone = familyTone[spec?.family ?? "pauli"] ?? "border-border bg-card text-foreground";

  if (isControl && (gate.gate === "CNOT" || gate.gate === "CZ" || gate.gate === "CX")) {
    return (
      <span
        className={`size-3.5 rounded-full ring-2 ring-entangle/40 transition-all ${
          isTransforming ? "scale-150 ring-8 ring-entangle/70 bg-entangle" : "bg-entangle"
        }`}
        title={`${spec.name} Control on q${qubit}`}
      />
    );
  }

  if (gate.gate === "SWAP") {
    return (
      <span
        className={`num text-xl font-bold text-entangle transition-transform ${
          isTransforming ? "scale-150 text-beam" : ""
        }`}
        title={`SWAP on q${qubit}`}
      >
        ✕
      </span>
    );
  }

  if ((gate.gate === "CNOT" || gate.gate === "CX") && !isControl) {
    return (
      <span
        className={`relative flex size-7 items-center justify-center rounded-full border-2 border-entangle bg-card/80 text-entangle shadow-[0_0_10px_rgba(236,72,153,0.4)] transition-all ${
          isTransforming ? "scale-125 ring-4 ring-entangle shadow-[0_0_20px_rgba(236,72,153,0.9)]" : ""
        }`}
        title={`CNOT Target on q${qubit}`}
      >
        <span className="absolute h-full w-0.5 bg-entangle" />
        <span className="absolute h-0.5 w-full bg-entangle" />
      </span>
    );
  }

  return (
    <button
      draggable={editable}
      onDragStart={(e) => e.dataTransfer.setData("text/gate-id", gate.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        onRemove?.(gate.id);
      }}
      title={`${spec.name}${gate.params?.length ? ` · θ=${formatAngle(gate.params[0])}` : ""}${
        editable ? " (drag to move, right-click to delete)" : ""
      }`}
      className={`num flex flex-col items-center justify-center border text-xs font-bold transition-all rounded shadow-md ${tone} ${
        selected ? "ring-2 ring-beam border-beam shadow-[0_0_12px_rgba(92,216,230,0.5)]" : ""
      } ${
        isTransforming ? "scale-110 border-beam ring-4 ring-beam/60 shadow-[0_0_20px_rgba(92,216,230,0.9)] animate-pulse" : ""
      }`}
      style={{ width: cell - 20, height: cell - 20 }}
    >
      <span>{spec.symbol}</span>
      {gate.params?.length ? (
        <span className="text-[9px] opacity-90">{formatAngle(gate.params[0])}</span>
      ) : null}
    </button>
  );
}
