import { GATE_SPECS, formatAngle } from "@/lib/circuit";
import type { CircuitGate, GateId } from "@/lib/quantum-api";

const groups: { key: string; label: string; families: string[] }[] = [
  { key: "single", label: "Single qubit", families: ["pauli", "phase"] },
  { key: "rot", label: "Rotations", families: ["rotation"] },
  { key: "multi", label: "Multi qubit", families: ["entangling"] },
  { key: "meas", label: "Readout", families: ["measure"] },
];

export function GateLibrary({
  armed,
  onArm,
  selected,
  onAngleChange,
  onRemoveSelected,
}: {
  armed: GateId | null;
  onArm: (gate: GateId | null) => void;
  selected: CircuitGate | null;
  onAngleChange: (id: string, angle: number) => void;
  onRemoveSelected: () => void;
}) {
  const spec = GATE_SPECS.find((g) => g.id === armed);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-4 py-2.5">
        <span className="label-tech text-foreground/80">Gate library</span>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {groups.map((group) => (
          <div key={group.key}>
            <div className="label-tech mb-2">{group.label}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {GATE_SPECS.filter((g) => group.families.includes(g.family)).map((g) => (
                <button
                  key={g.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/gate-new", g.id);
                    onArm(g.id);
                  }}
                  onClick={() => onArm(armed === g.id ? null : g.id)}
                  title={`${g.name} — ${g.blurb}`}
                  className={`num flex h-11 flex-col items-center justify-center border text-sm transition-colors ${
                    armed === g.id
                      ? "border-beam bg-beam/15 text-beam"
                      : "border-border bg-panel-raised/60 text-foreground/85 hover:border-beam/50 hover:text-beam"
                  }`}
                >
                  {g.symbol}
                  <span className="text-[9px] uppercase tracking-wider opacity-60">{g.id}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-3">
        {selected ? (
          <div className="space-y-2">
            <div className="label-tech text-foreground/80">Selected · {selected.gate}</div>
            {selected.params?.length ? (
              <label className="block space-y-1">
                <div className="flex items-center justify-between">
                  <span className="label-tech">angle θ</span>
                  <span className="num text-xs text-measure">{formatAngle(selected.params[0])}</span>
                </div>
                <input
                  type="range"
                  min={-Math.PI}
                  max={Math.PI}
                  step={Math.PI / 16}
                  value={selected.params[0]}
                  onChange={(e) => onAngleChange(selected.id, Number(e.target.value))}
                  className="w-full accent-beam"
                />
              </label>
            ) : null}
            <button
              onClick={onRemoveSelected}
              className="label-tech w-full border border-destructive/40 py-1.5 text-destructive transition-colors hover:bg-destructive/10"
            >
              Remove gate
            </button>
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {spec ? spec.blurb : "Select a gate to read what it does, then click a wire to place it."}
          </p>
        )}
      </div>
    </div>
  );
}
