import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  addGate as addGateFn,
  emptyCircuit,
  moveGate as moveGateFn,
  removeGate as removeGateFn,
  setGateAngle as setGateAngleFn,
  setQubitCount as setQubitCountFn,
} from "./circuit";
import {
  ApiError,
  simulateCircuitApi,
  type Circuit,
  type GateId,
  type SimulationResult,
} from "./quantum-api";

export type RunStage = "idle" | "circuit" | "simulate" | "state" | "measure" | "visualize" | "done";

export const STAGE_SEQUENCE: Exclude<RunStage, "idle" | "done">[] = [
  "circuit",
  "simulate",
  "state",
  "measure",
  "visualize",
];

interface LabContextValue {
  circuit: Circuit;
  setCircuit: (c: Circuit) => void;
  addGate: (gate: GateId, qubits: number[], step?: number, params?: number[]) => void;
  removeGate: (id: string) => void;
  moveGate: (id: string, step: number, qubit: number) => void;
  setGateAngle: (id: string, angle: number) => void;
  setQubits: (n: number) => void;
  clearCircuit: () => void;
  result: SimulationResult | null;
  stage: RunStage;
  running: boolean;
  error: string | null;
  runCircuit: () => Promise<SimulationResult | null>;
  runToken: number;
}

const LabContext = createContext<LabContextValue | null>(null);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function LabProvider({ children }: { children: ReactNode }) {
  const [circuit, setCircuitState] = useState<Circuit>(() => emptyCircuit(2));
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [stage, setStage] = useState<RunStage>("idle");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runToken, setRunToken] = useState(0);
  const inflight = useRef(false);

  const setCircuit = useCallback((c: Circuit) => {
    setCircuitState(c);
    setResult(null);
    setStage("idle");
    setError(null);
  }, []);

  const mutate = useCallback((fn: (c: Circuit) => Circuit) => {
    setCircuitState((prev) => fn(prev));
  }, []);

  const runCircuit = useCallback(async () => {
    if (inflight.current) return null;
    if (circuit.gates.length === 0) {
      setError("Place at least one gate on the circuit before running it.");
      return null;
    }
    inflight.current = true;
    setRunning(true);
    setError(null);
    setStage("circuit");
    try {
      await wait(260);
      setStage("simulate");
      const data = await simulateCircuitApi(circuit);
      setStage("state");
      await wait(240);
      setStage("measure");
      await wait(240);
      setStage("visualize");
      setResult(data);
      setRunToken((t) => t + 1);
      await wait(260);
      setStage("done");
      return data;
    } catch (err) {
      setStage("idle");
      setError(err instanceof ApiError ? err.message : "Simulation failed.");
      return null;
    } finally {
      setRunning(false);
      inflight.current = false;
    }
  }, [circuit]);

  const value = useMemo<LabContextValue>(
    () => ({
      circuit,
      setCircuit,
      addGate: (gate, qubits, step, params) =>
        mutate((c) => addGateFn(c, gate, qubits, step, params)),
      removeGate: (id) => mutate((c) => removeGateFn(c, id)),
      moveGate: (id, step, qubit) => mutate((c) => moveGateFn(c, id, step, qubit)),
      setGateAngle: (id, angle) => mutate((c) => setGateAngleFn(c, id, angle)),
      setQubits: (n) => mutate((c) => setQubitCountFn(c, n)),
      clearCircuit: () => setCircuit({ ...circuit, name: circuit.name, gates: [] }),
      result,
      stage,
      running,
      error,
      runCircuit,
      runToken,
    }),
    [circuit, setCircuit, mutate, result, stage, running, error, runCircuit, runToken],
  );

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab() {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error("useLab must be used inside <LabProvider>");
  return ctx;
}
