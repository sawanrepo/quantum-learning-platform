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
  
  const stepResults = lab.result?.step_results ?? [];
  const activeStepObj = lab.activeStep !== null && stepResults[lab.activeStep]
    ? stepResults[lab.activeStep]
    : null;

  // Active Bloch vectors (step-specific or final)
  const activeBlochVectors = activeStepObj?.bloch_vectors
    ? readBlochVectors({ bloch_vectors: activeStepObj.bloch_vectors })
    : readBlochVectors(lab.result);

  // Active probabilities (step-specific or final)
  const activeCounts = activeStepObj?.probabilities
    ? Object.entries(activeStepObj.probabilities).map(([state, prob]) => ({
        state,
        probability: prob,
        count: Math.round(prob * (lab.result?.shots ?? 1024)),
      })).sort((a, b) => a.state.localeCompare(b.state))
    : readCounts(lab.result);

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
          {/* TOOLBAR CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-tech mr-1">Qubits:</span>
              <div className="flex items-center gap-1 border border-border bg-muted/30 p-1 rounded">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => lab.setQubits(n)}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                      lab.circuit.qubits === n
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <span className="label-tech ml-2 mr-1">Presets:</span>
              {EXAMPLE_CIRCUITS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => lab.setCircuit(c)}
                  className="border border-border bg-card px-2.5 py-1 text-xs font-mono hover:border-primary transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
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

          {/* CANVAS */}
          <div className="overflow-x-auto border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>Click <span className="text-primary font-bold">|0⟩ / |1⟩</span> to toggle initial qubit bit state</span>
              <span>Click step headers to inspect step state</span>
            </div>
            <CircuitCanvas
              circuit={lab.circuit}
              armedGate={armed}
              onPlace={place}
              onRemove={lab.removeGate}
              onMove={lab.moveGate}
              onSelect={setSelected}
              onToggleQubitState={lab.toggleQubitState}
              onStepClick={(s) => {
                if (stepResults.length > 0) {
                  const targetIdx = Math.min(s, stepResults.length - 1);
                  lab.setActiveStep(targetIdx);
                }
              }}
              selectedId={selectedGate?.id ?? null}
              activeStep={lab.activeStep}
            />
          </div>

          {lab.error && <p className="border border-destructive/50 p-3 text-sm text-destructive font-mono">{lab.error}</p>}

          {/* STEP-BY-STEP VISUALIZATION CONTROLLER */}
          {stepResults.length > 0 && (
            <div className="border border-primary/30 bg-primary/5 p-3 font-mono space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-bold text-primary">Step Inspector:</span>
                  <span className="text-xs font-bold border border-primary/40 bg-card px-2 py-0.5 rounded text-foreground">
                    {activeStepObj ? activeStepObj.description : "Final Output State"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => lab.setActiveStep(0)}
                    disabled={lab.activeStep === 0}
                    className="border border-border bg-card px-2 py-1 text-[11px] hover:border-primary disabled:opacity-40"
                  >
                    Initial State
                  </button>
                  <button
                    onClick={() => lab.setActiveStep(Math.max(0, (lab.activeStep ?? stepResults.length - 1) - 1))}
                    disabled={lab.activeStep === 0}
                    className="border border-border bg-card px-2 py-1 text-[11px] hover:border-primary disabled:opacity-40"
                  >
                    ◀ Prev Step
                  </button>
                  {stepResults.map((sr, idx) => (
                    <button
                      key={sr.step}
                      onClick={() => lab.setActiveStep(idx)}
                      className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                        (lab.activeStep === idx || (lab.activeStep === null && idx === stepResults.length - 1))
                          ? "border-primary bg-primary text-primary-foreground font-bold"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {idx === 0 ? "Init" : `Step ${idx - 1}`}
                    </button>
                  ))}
                  <button
                    onClick={() => lab.setActiveStep(Math.min(stepResults.length - 1, (lab.activeStep ?? stepResults.length - 1) + 1))}
                    disabled={lab.activeStep === stepResults.length - 1}
                    className="border border-border bg-card px-2 py-1 text-[11px] hover:border-primary disabled:opacity-40"
                  >
                    Next Step ▶
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MEASUREMENT PROBABILITIES */}
          {activeCounts.length > 0 && (
            <div className="border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="label-tech">
                  {activeStepObj ? `Step State Probabilities (${activeStepObj.description})` : "Final Measurement Probabilities"}
                </span>
                {lab.activeStep !== null && (
                  <button
                    onClick={() => lab.setActiveStep(null)}
                    className="text-[11px] font-mono text-primary underline hover:text-primary/80"
                  >
                    Show Final Output
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-2 font-mono">
                {activeCounts.map((r) => (
                  <div key={r.state} className="flex items-center gap-3 text-sm">
                    <span className="num w-16 text-primary font-bold">|{r.state}⟩</span>
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${r.probability * 100}%` }} />
                    </div>
                    <span className="num w-16 text-right font-bold">{(r.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <BlochSpherePanel vectors={activeBlochVectors} runToken={lab.runToken} />
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
