import { useState } from "react";

import { MAX_STEPS, circuitDepth, formatAngle, gateSpec } from "@/lib/circuit";
import type { Circuit, CircuitGate, GateId } from "@/lib/quantum-api";

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
  /** highlights the executing column while a run animates */
  activeStep?: number | null;
  scale?: "normal" | "large";
}

const familyTone: Record<string, string> = {
  pauli: "border-beam/60 bg-beam/12 text-beam",
  phase: "border-phase/60 bg-phase/12 text-phase",
  rotation: "border-phase/50 bg-phase/10 text-phase",
  entangling: "border-entangle/60 bg-entangle/12 text-entangle",
  measure: "border-measure/60 bg-measure/12 text-measure",
};

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
  activeStep = null,
  scale = "normal",
}: Props) {
  const [hover, setHover] = useState<{ q: number; s: number } | null>(null);
  const editable = Boolean(onPlace);
  const cell = scale === "large" ? 64 : 48;
  const columns = Math.min(MAX_STEPS, Math.max(circuitDepth(circuit) + 2, 8));

  const gateAt = (q: number, s: number) =>
    circuit.gates.find((g) => g.step === s && g.qubits.includes(q));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max px-4 py-5">
        {/* step ruler */}
        <div className="flex" style={{ paddingLeft: 84 }}>
          {Array.from({ length: columns }).map((_, s) => (
            <button
              key={s}
              onClick={() => onStepClick?.(s)}
              className={`label-tech text-center cursor-pointer rounded py-0.5 transition-colors hover:bg-beam/20 ${
                activeStep === s ? "text-beam font-bold bg-beam/15 ring-1 ring-beam/40" : "text-muted-foreground"
              }`}
              style={{ width: cell }}
              title={`View state at Step ${s}`}
            >
              Step {s}
            </button>
          ))}
        </div>

        <div className="relative mt-1">
          {Array.from({ length: circuit.qubits }).map((_, q) => {
            const initState = circuit.initial_states?.[q] ?? "0";
            return (
              <div key={q} className="relative flex items-center" style={{ height: cell + 12 }}>
                <div className="num w-[84px] shrink-0 pr-3 text-right text-xs text-muted-foreground flex items-center justify-end gap-1">
                  <span>q<span className="text-foreground">{q}</span></span>
                  <button
                    onClick={() => onToggleQubitState?.(q)}
                    className="num rounded px-1.5 py-0.5 text-[11px] font-semibold transition-all bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20 hover:scale-105"
                    title="Click to toggle initial qubit state (|0⟩ / |1⟩)"
                  >
                    |{initState}⟩
                  </button>
                </div>

                {/* qubit wire */}
                <div
                  className="absolute h-px bg-border"
                  style={{ left: 84, width: columns * cell, top: (cell + 12) / 2 }}
                />

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
                      {activeStep === s && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-beam/10 border-x border-beam/30" />
                      )}
                      {!gate && editable && (isHover || (armedGate && isHover)) && (
                        <div className="pointer-events-none absolute inset-2 border border-dashed border-beam/40" />
                      )}
                      {gate && <GateChip gate={gate} qubit={q} cell={cell} selected={selectedId === gate.id} editable={editable} onRemove={onRemove} />}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* two-qubit connectors */}
          {circuit.gates
            .filter((g) => g.qubits.length === 2)
            .map((g) => {
              const [a, b] = g.qubits;
              const top = Math.min(a, b);
              const span = Math.abs(a - b);
              const spec = gateSpec(g.gate);
              const color =
                spec.family === "entangling" ? "var(--entangle)" : "var(--beam)";
              return (
                <div
                  key={`link-${g.id}`}
                  className="pointer-events-none absolute w-px"
                  style={{
                    left: 84 + g.step * cell + cell / 2,
                    top: top * (cell + 12) + (cell + 12) / 2,
                    height: span * (cell + 12),
                    background: color,
                    opacity: 0.7,
                  }}
                >
                  <span
                    className="absolute -left-[3px] -top-[3px] size-[7px] rounded-full"
                    style={{ background: color }}
                  />
                </div>
              );
            })}
        </div>

        {circuit.gates.length === 0 && (
          <p className="num mt-4 pl-[76px] text-xs text-muted-foreground">
            {editable
              ? "Pick a gate from the library, then click a wire position to place it."
              : "No gates in this circuit."}
          </p>
        )}
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
}: {
  gate: CircuitGate;
  qubit: number;
  cell: number;
  selected: boolean;
  editable: boolean;
  onRemove?: (id: string) => void;
}) {
  const spec = gateSpec(gate.gate);
  const isControl = gate.qubits.length === 2 && gate.qubits[0] === qubit;
  const tone = familyTone[spec.family];

  if (isControl && (gate.gate === "CNOT" || gate.gate === "CZ")) {
    return (
      <span
        className={`size-3 rounded-full ${gate.gate === "CNOT" ? "bg-entangle" : "bg-entangle"}`}
        title={`${spec.name} control`}
      />
    );
  }

  if (gate.gate === "SWAP") {
    return (
      <span className="num text-lg text-entangle" title="SWAP">
        ✕
      </span>
    );
  }

  if (gate.gate === "CNOT" && !isControl) {
    return (
      <span className="relative flex size-6 items-center justify-center rounded-full border border-entangle text-entangle">
        <span className="absolute h-full w-px bg-entangle/70" />
        <span className="absolute h-px w-full bg-entangle/70" />
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
      title={`${spec.name}${gate.params?.length ? ` · θ=${formatAngle(gate.params[0])}` : ""}${editable ? " — drag to move, right-click to delete" : ""}`}
      className={`num flex flex-col items-center justify-center border text-sm font-medium transition-shadow ${tone} ${
        selected ? "ring-1 ring-beam" : ""
      }`}
      style={{ width: cell - 14, height: cell - 14 }}
    >
      <span>{spec.symbol}</span>
      {gate.params?.length ? (
        <span className="text-[9px] opacity-80">{formatAngle(gate.params[0])}</span>
      ) : null}
    </button>
  );
}
