/**
 * Client for the existing quantum backend (FastAPI).
 * All calls go straight from the browser to the backend base URL, so the
 * backend can run on the user's own machine (http://localhost:8000).
 * The base URL is overridable at runtime and persisted per browser.
 */

export const DEFAULT_API_BASE = "http://localhost:8000/api";
const STORAGE_KEY = "qlab.apiBase";

export function getApiBase(): string {
  if (typeof window === "undefined") return DEFAULT_API_BASE;
  return window.localStorage.getItem(STORAGE_KEY)?.trim() || DEFAULT_API_BASE;
}

export function setApiBase(value: string) {
  if (typeof window === "undefined") return;
  const clean = value.trim().replace(/\/+$/, "");
  if (clean) window.localStorage.setItem(STORAGE_KEY, clean);
  else window.localStorage.removeItem(STORAGE_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBase().replace(/\/+$/, "")}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(
      `Cannot reach the quantum backend at ${getApiBase()}. Start it, or set the backend address from the status chip in the header.`,
      0,
    );
  }
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { detail?: string; message?: string };
      detail = body.detail || body.message || detail;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(detail, res.status);
  }
  return (await res.json()) as T;
}

/* ---------------- circuit model ---------------- */

export type GateId =
  | "X"
  | "Y"
  | "Z"
  | "H"
  | "S"
  | "T"
  | "RX"
  | "RY"
  | "RZ"
  | "CNOT"
  | "CZ"
  | "SWAP"
  | "MEASURE";

export interface CircuitGate {
  id: string;
  gate: GateId;
  /** target qubit indices; for CNOT/CZ index 0 is control, 1 is target */
  qubits: number[];
  /** rotation angle in radians for RX/RY/RZ */
  params?: number[];
  /** column position in the circuit */
  step: number;
}

export interface Circuit {
  name: string;
  qubits: number;
  gates: CircuitGate[];
}

/** payload sent to the backend */
function serializeCircuit(circuit: Circuit) {
  return {
    name: circuit.name,
    num_qubits: circuit.qubits,
    qubits: circuit.qubits,
    gates: [...circuit.gates]
      .sort((a, b) => a.step - b.step)
      .map((g) => ({
        gate: g.gate.toLowerCase(),
        name: g.gate.toLowerCase(),
        qubits: g.qubits,
        targets: g.qubits,
        params: g.params ?? [],
        step: g.step,
      })),
  };
}

/* ---------------- responses ---------------- */

export interface BlochVector {
  x: number;
  y: number;
  z: number;
  theta: number;
  phi: number;
  qubit?: number;
}

export interface Amplitude {
  state?: string;
  basis?: string;
  real: number;
  imag: number;
  probability?: number;
  phase?: number;
}

export interface SimulationResult {
  counts?: Record<string, number>;
  shots?: number;
  probabilities?: Record<string, number>;
  statevector?: Array<Amplitude | [number, number] | { re: number; im: number }>;
  bloch_vectors?: BlochVector[];
  bloch?: BlochVector[];
  [key: string]: unknown;
}

export interface CodeGenResult {
  code: string;
  framework?: string;
  [key: string]: unknown;
}

export interface AiResult {
  response?: string;
  explanation?: string;
  message?: string;
  content?: string;
  [key: string]: unknown;
}

export interface LearningModuleSummary {
  id: string | number;
  title?: string;
  name?: string;
  description?: string;
  level?: string;
  difficulty?: string;
  topics?: string[];
  duration?: string | number;
  [key: string]: unknown;
}

export interface QuizQuestion {
  id?: string | number;
  question: string;
  options?: string[];
  choices?: string[];
  answer?: string | number;
  correct_answer?: string | number;
  explanation?: string;
}

export interface LearningModuleDetail extends LearningModuleSummary {
  theory?: string;
  content?: string;
  markdown?: string;
  circuit?: unknown;
  quiz?: QuizQuestion[];
  questions?: QuizQuestion[];
  challenge?: {
    id?: string | number;
    challenge_id?: string | number;
    title?: string;
    description?: string;
    target_state?: string;
    [key: string]: unknown;
  };
}

export interface AssessmentResult {
  fidelity?: number;
  score?: number;
  passed?: boolean;
  success?: boolean;
  explanation?: string;
  feedback?: string;
  target_state?: string;
  [key: string]: unknown;
}

export interface DemoSummary {
  id: string | number;
  demo_id?: string | number;
  title?: string;
  name?: string;
  description?: string;
  concept?: string;
  [key: string]: unknown;
}

export interface DemoDetail extends DemoSummary {
  circuit?: unknown;
  theory?: string;
  explanation?: string;
  steps?: string[];
}

/* ---------------- endpoints ---------------- */

export const simulateCircuitApi = (circuit: Circuit) =>
  request<SimulationResult>("/quantum/simulate", {
    method: "POST",
    body: JSON.stringify({ circuit: serializeCircuit(circuit), ...serializeCircuit(circuit) }),
  });

export const generateCodeApi = (circuit: Circuit, framework: string) =>
  request<CodeGenResult>("/quantum/code-gen", {
    method: "POST",
    body: JSON.stringify({ circuit: serializeCircuit(circuit), framework }),
  });

export const explainCircuitApi = (
  circuit: Circuit,
  simResult: SimulationResult | null,
  actionType: string,
) =>
  request<AiResult>("/ai/explain", {
    method: "POST",
    body: JSON.stringify({
      circuit: serializeCircuit(circuit),
      sim_result: simResult,
      simulation_result: simResult,
      action_type: actionType,
      action: actionType,
    }),
  });

export const chatQuantumAiApi = (message: string, context: unknown) =>
  request<AiResult>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, context }),
  });

export const listModulesApi = () =>
  request<LearningModuleSummary[] | { modules: LearningModuleSummary[] }>("/learning/modules");

export const getModuleApi = (id: string) =>
  request<LearningModuleDetail>(`/learning/modules/${encodeURIComponent(id)}`);

export const submitChallengeApi = (challengeId: string, circuit: Circuit) =>
  request<AssessmentResult>("/assessment/submit", {
    method: "POST",
    body: JSON.stringify({
      challenge_id: challengeId,
      challengeId,
      circuit: serializeCircuit(circuit),
    }),
  });

export const listDemosApi = () =>
  request<DemoSummary[] | { demos: DemoSummary[] }>("/demos/list");

export const getDemoApi = (demoId: string) =>
  request<DemoDetail>(`/demos/${encodeURIComponent(demoId)}`);

export async function healthApi(): Promise<boolean> {
  const root = getApiBase().replace(/\/api\/?$/, "");
  try {
    const res = await fetch(`${root}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

/** Tolerant list unwrapper for endpoints that may wrap arrays in an object. */
export function unwrapList<T>(data: T[] | Record<string, unknown> | undefined | null): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  for (const value of Object.values(data)) if (Array.isArray(value)) return value as T[];
  return [];
}

/** Pull readable text out of any of the AI response shapes. */
export function aiText(result: AiResult | undefined | null): string {
  if (!result) return "";
  return (
    result.response ||
    result.explanation ||
    result.message ||
    result.content ||
    (typeof result === "string" ? result : "")
  );
}
