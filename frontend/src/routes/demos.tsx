import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  listDemosApi,
  getDemoApi,
  simulateCircuitApi,
  unwrapList,
  type DemoSummary,
  type DemoDetail,
  type SimulationResult,
  type Circuit,
  type CircuitGate,
} from "@/lib/quantum-api";
import { readCounts, readBlochVectors } from "@/lib/circuit";
import { BlochSpherePanel } from "@/components/quantum/BlochSpherePanel";
import { CircuitCanvas } from "@/components/quantum/CircuitCanvas";
import { Presentation, CheckCircle2, Sparkles, BookOpen, Atom, Zap, Layers, RefreshCw } from "lucide-react";
import { MarkdownView, InlineMarkdown } from "@/components/common/MarkdownView";

export const Route = createFileRoute("/demos")({
  head: () => ({
    meta: [
      { title: "College Presentation Suite — Quantum Algorithm Demos" },
      { name: "description", content: "Interactive live demonstration flows for Superposition, Bell States, Teleportation, Grover Search, QFT, and Quantum Error Correction." },
    ],
  }),
  component: CollegeDemosPage,
});

const DEMO_CATEGORIES = [
  { id: "all", label: "All Demonstrations" },
  { id: "fundamentals", label: "Fundamentals" },
  { id: "entanglement", label: "Entanglement" },
  { id: "protocols", label: "Protocols" },
  { id: "algorithms", label: "Algorithms" },
  { id: "circuits", label: "Reversible Circuits" },
  { id: "error correction", label: "Error Correction" },
];

function CollegeDemosPage() {
  const [demos, setDemos] = useState<DemoSummary[]>([]);
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);
  const [demoDetail, setDemoDetail] = useState<DemoDetail | null>(null);
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDemos = async () => {
      try {
        const raw = await listDemosApi();
        const list = unwrapList(raw);
        setDemos(list);
        if (list.length > 0) {
          const firstId = (list[0].id || list[0].demo_id || "demo-superposition").toString();
          setActiveDemoId(firstId);
        }
      } catch (err) {
        console.error("Failed to load college demos:", err);
        setError("Failed to load demonstrations list from backend.");
      } finally {
        setLoading(false);
      }
    };
    void loadDemos();
  }, []);

  useEffect(() => {
    if (!activeDemoId) return;

    const loadDemoDetail = async () => {
      setError(null);
      setSimulating(true);
      try {
        const detail = await getDemoApi(activeDemoId);
        setDemoDetail(detail);

        // Convert demo circuit format
        let demoCircuit: Circuit = {
          name: detail.title || detail.name || "College Demo",
          qubits: 2,
          gates: [
            { id: "g1", gate: "H", qubits: [0], step: 0 },
            { id: "g2", gate: "CNOT", qubits: [0, 1], step: 1 },
          ],
        };

        if (detail.circuit && typeof detail.circuit === "object") {
          const rawC = detail.circuit as Record<string, unknown>;
          const rawGates = (rawC.gates as any[]) || [];
          const convertedGates: CircuitGate[] = rawGates.map((g: any, i: number) => {
            const rawGate = (g.gate || g.name || "H").toString().toUpperCase();
            const gateName = (rawGate === "M" || rawGate === "MEASUREMENT" ? "MEASURE" : (rawGate === "CX" ? "CNOT" : rawGate)) as any;
            let qubits: number[] = [0];
            if (Array.isArray(g.qubits) && g.qubits.length > 0) {
              qubits = g.qubits.map((q: any) => Number(q));
            } else if (g.control !== undefined && g.target !== undefined) {
              qubits = [Number(g.control), Number(g.target)];
            } else if (g.target !== undefined) {
              qubits = [Number(g.target)];
            }

            let params: number[] | undefined;
            if (g.params && typeof g.params === "object") {
              if (Array.isArray(g.params)) {
                params = g.params.map((p: any) => Number(p));
              } else if (typeof g.params.theta === "number") {
                params = [g.params.theta];
              }
            }

            return {
              id: g.id || `g_${i}`,
              gate: gateName,
              qubits,
              step: g.step !== undefined ? Number(g.step) : i,
              params,
            };
          });

          demoCircuit = {
            name: (rawC.name as string) || detail.title || detail.name || "College Demo",
            qubits: (rawC.qubits as number) || (rawC.num_qubits as number) || 2,
            initial_states: Array.isArray(rawC.initial_states) ? rawC.initial_states : undefined,
            gates: convertedGates,
          };
        }

        setCircuit(demoCircuit);
        const res = await simulateCircuitApi(demoCircuit);
        setSimResult(res);
      } catch (err) {
        console.error("Failed to simulate demo circuit:", err);
        setError(`Simulation failed: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setSimulating(false);
      }
    };

    void loadDemoDetail();
  }, [activeDemoId]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === "all") return;
    const inCat = demos.filter((d) => (d.category || "").toLowerCase().includes(catId.toLowerCase()));
    if (inCat.length > 0 && !inCat.some((d) => (d.id || d.demo_id) === activeDemoId)) {
      const nextId = (inCat[0].id || inCat[0].demo_id || "").toString();
      if (nextId) setActiveDemoId(nextId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 font-mono text-sm text-primary">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading college presentation suite...
      </div>
    );
  }

  const filteredDemos = selectedCategory === "all"
    ? demos
    : demos.filter((d) => {
        const cat = (d.category || "").toLowerCase();
        return cat.includes(selectedCategory.toLowerCase());
      });

  const counts = readCounts(simResult);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="label-tech uppercase flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Live Presentation Mode
          </span>
          <h1 className="mt-1 text-3xl font-semibold text-foreground md:text-4xl flex items-center gap-3">
            <Presentation className="h-8 w-8 text-primary" /> College Quantum Demonstration Suite
          </h1>
          <p className="mt-2 text-xs text-muted-foreground max-w-2xl leading-relaxed">
            Curated interactive quantum mechanics demonstrations engineered for university lectures, technical seminars, and research presentations. Features live statevector evolution and particle wave tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 border border-border bg-card px-3 py-2 text-xs font-mono">
          <Atom className="h-4 w-4 text-primary animate-spin" />
          <span className="text-muted-foreground">Loaded Demos:</span>
          <span className="font-bold text-foreground">{demos.length} Curated Topics</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {DEMO_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelectCategory(cat.id)}
            className={`px-3 py-1.5 font-mono text-xs font-medium border transition-colors ${
              selectedCategory === cat.id
                ? "border-primary bg-primary/10 text-primary font-bold"
                : "border-border bg-card text-muted-foreground hover:border-primary/50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error Banner if any */}
      {error && (
        <div className="border border-destructive/50 bg-destructive/10 p-4 font-mono text-xs text-destructive flex items-center justify-between">
          <span>Simulation Alert: {error}</span>
          <button
            onClick={() => {
              if (activeDemoId) {
                const cur = activeDemoId;
                setActiveDemoId(null);
                setTimeout(() => setActiveDemoId(cur), 50);
              }
            }}
            className="border border-destructive/60 px-3 py-1 hover:bg-destructive/20"
          >
            Retry
          </button>
        </div>
      )}

      {/* Demo Selector Buttons */}
      <div className="flex flex-wrap gap-2">
        {filteredDemos.map((d) => {
          const dId = (d.id || d.demo_id || "").toString();
          const isActive = activeDemoId === dId;
          return (
            <button
              key={dId}
              onClick={() => setActiveDemoId(dId)}
              className={`px-3.5 py-2 font-mono text-xs font-semibold border transition-all text-left ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 scale-[1.02]"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {d.title || d.name || dId}
            </button>
          );
        })}
      </div>

      {/* Active Demo Section */}
      {demoDetail && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            {/* Demo Overview Card */}
            <div className="border border-border bg-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <h2 className="text-2xl font-bold text-foreground">
                  {demoDetail.title || demoDetail.name}
                </h2>
                <div className="flex items-center gap-2">
                  {demoDetail.category && (
                    <span className="label-tech uppercase">{demoDetail.category}</span>
                  )}
                  {circuit && (
                    <span className="border border-border bg-muted/30 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      {circuit.qubits} Qubit{circuit.qubits > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted-foreground leading-relaxed">
                <InlineMarkdown content={demoDetail.description || demoDetail.explanation} />
              </div>

              {/* Presentation Key Insight Banner */}
              {(demoDetail.key_takeaway || demoDetail.concept) && (
                <div className="border border-emerald-500/40 bg-emerald-950/20 p-4 font-mono text-xs text-emerald-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Key Presentation Insight:</span>
                  </div>
                  <div className="font-sans text-xs text-emerald-200/90 pl-6 leading-relaxed">
                    <InlineMarkdown content={demoDetail.key_takeaway || demoDetail.concept} />
                  </div>
                </div>
              )}

              {/* Theoretical Physics Rigor Card */}
              {demoDetail.theory && (
                <div className="border border-primary/20 bg-primary/5 p-4 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span>Quantum Mechanics Formulation:</span>
                  </div>
                  <div className="font-sans text-xs text-muted-foreground leading-relaxed">
                    <MarkdownView content={demoDetail.theory} />
                  </div>
                </div>
              )}
            </div>

            {/* Live Interactive Circuit Canvas */}
            {circuit && (
              <div className="border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="label-tech flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-primary" /> Dynamic Particle Circuit Simulation
                  </span>
                  <div className="flex items-center gap-1.5 border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-mono font-medium text-primary rounded">
                    <span className="inline-block size-2 rounded-full bg-primary animate-ping" />
                    <span>Real-time Wave Evolution</span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-border/80 bg-background/50 p-2">
                  <CircuitCanvas
                    circuit={circuit}
                    stepResults={simResult?.step_results}
                  />
                </div>
              </div>
            )}

            {/* Measurement Probability Distribution */}
            {counts.length > 0 && (
              <div className="border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="label-tech">Live State Measurement Probabilities</span>
                  <span className="text-xs font-mono text-muted-foreground">1024 Simulated Shots</span>
                </div>
                <div className="space-y-3">
                  {counts.map((r: { state: string; probability: number }) => (
                    <div key={r.state} className="flex items-center gap-4 text-sm font-mono">
                      <span className="w-16 font-bold text-primary">|{r.state}⟩</span>
                      <div className="h-3 flex-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${r.probability * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-bold">{(r.probability * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3D Bloch Sphere View */}
          <div className="space-y-6">
            <BlochSpherePanel vectors={readBlochVectors(simResult)} />
          </div>
        </div>
      )}
    </div>
  );
}
