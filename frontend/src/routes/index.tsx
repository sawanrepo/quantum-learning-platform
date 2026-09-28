import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { BlochSpherePanel } from "@/components/quantum/BlochSpherePanel";
import { ProfessorPanel } from "@/components/quantum/ProfessorPanel";
import { CircuitCanvas } from "@/components/quantum/CircuitCanvas";
import { GateLibrary } from "@/components/quantum/GateLibrary";
import { HeroVisual } from "@/components/quantum/HeroVisual";
import { CodeExporterModal } from "@/components/quantum/CodeExporterModal";
import { EXAMPLE_CIRCUITS, gateSpec, readBlochVectors, readCounts } from "@/lib/circuit";
import { LabProvider, useLab } from "@/lib/lab-store";
import type { CircuitGate, GateId } from "@/lib/quantum-api";
import { Code, BookOpen, Presentation, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quantum Lab — Build and simulate quantum circuits" },
      { name: "description", content: "Drag gates onto qubits, run the simulation and watch the Bloch sphere respond." },
      { property: "og:title", content: "Quantum Lab — Build and simulate quantum circuits" },
      { property: "og:description", content: "Drag gates onto qubits, run the simulation and watch the Bloch sphere respond." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LabProvider>
      <Index />
    </LabProvider>
  ),
});

function Index() {
  const lab = useLab();
  const [armed, setArmed] = useState<GateId | null>(null);
  const [selected, setSelected] = useState<CircuitGate | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  const selectedGate = lab.circuit.gates.find((g) => g.id === selected?.id) ?? null;
  const counts = readCounts(lab.result);

  const place = (qubit: number, step: number) => {
    if (!armed) return;
    const arity = gateSpec(armed).arity;
    const qubits = Array.from({ length: arity }, (_, i) => qubit + i);
    if (qubits[qubits.length - 1]! >= lab.circuit.qubits) return;
    lab.addGate(armed, qubits, step);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO SECTION */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden border-b border-border">
        <HeroVisual />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-14">
          <span className="label-tech flex items-center gap-1.5 text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Interactive AI Quantum Computing Platform
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl font-display">
            Build a circuit. Watch the qubits move.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Construct live quantum circuits on the timeline grid, observe 3D Bloch sphere vector transformations in real time, and ask your Gemini AI Professor to explain quantum entanglement.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#lab" className="border border-primary bg-primary/10 px-5 py-2.5 text-xs font-mono font-medium text-primary hover:bg-primary/20">
              Open Quantum Workstation
            </a>
            <Link to="/modules" className="border border-border bg-card px-5 py-2.5 text-xs font-mono font-medium hover:border-primary">
              <BookOpen className="h-3.5 w-3.5 inline mr-1.5" /> Learning Curriculum
            </Link>
            <Link to="/demos" className="border border-border bg-card px-5 py-2.5 text-xs font-mono font-medium hover:border-primary">
              <Presentation className="h-3.5 w-3.5 inline mr-1.5" /> College Demos
            </Link>
          </div>
        </div>
      </section>

      {/* QUANTUM WORKSTATION */}
      <section id="lab" className="mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-[260px_1fr_320px]">
        <GateLibrary
          armed={armed}
          onArm={setArmed}
          selected={selectedGate}
          onAngleChange={lab.setGateAngle}
          onRemoveSelected={() => {
            if (selectedGate) lab.removeGate(selectedGate.id);
            setSelected(null);
          }}
        />

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-tech mr-1">Presets:</span>
            {EXAMPLE_CIRCUITS.map((c) => (
              <button key={c.name} onClick={() => lab.setCircuit(c)} className="border border-border bg-card px-3 py-1.5 text-xs font-mono hover:border-primary">
                {c.name}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setIsCodeModalOpen(true)}
                className="border border-border bg-card px-3 py-1.5 text-xs font-mono hover:border-primary flex items-center gap-1.5"
              >
                <Code className="h-3.5 w-3.5 text-primary" /> Export Code
              </button>
              <button onClick={lab.clearCircuit} className="border border-border bg-card px-3 py-1.5 text-xs font-mono">
                Clear
              </button>
              <button
                onClick={() => void lab.runCircuit()}
                disabled={lab.running}
                className="bg-primary px-4 py-1.5 text-xs font-mono font-medium text-primary-foreground disabled:opacity-50"
              >
                {lab.running ? `Running · ${lab.stage}` : "Run Circuit"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-border bg-card p-4">
            <CircuitCanvas
              circuit={lab.circuit}
              armedGate={armed}
              onPlace={place}
              onRemove={lab.removeGate}
              onMove={lab.moveGate}
              onSelect={setSelected}
              selectedId={selectedGate?.id ?? null}
            />
          </div>

          {lab.error && <p className="border border-destructive/50 p-3 text-sm text-destructive font-mono">{lab.error}</p>}

          {counts.length > 0 && (
            <div className="border border-border bg-card p-4">
              <span className="label-tech">Measurement probabilities</span>
              <div className="mt-3 space-y-2 font-mono">
                {counts.map((r) => (
                  <div key={r.state} className="flex items-center gap-3 text-sm">
                    <span className="num w-14 text-primary font-bold">|{r.state}⟩</span>
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${r.probability * 100}%` }} />
                    </div>
                    <span className="num w-14 text-right font-bold">{(r.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <BlochSpherePanel vectors={readBlochVectors(lab.result)} runToken={lab.runToken} />
      </section>

      {/* PROFESSOR PANEL */}
      <section id="professor" className="mx-auto max-w-7xl px-6 pb-16">
        <ProfessorPanel />
      </section>

      {/* CODE EXPORTER MODAL */}
      <CodeExporterModal
        circuit={lab.circuit}
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </main>
  );
}
