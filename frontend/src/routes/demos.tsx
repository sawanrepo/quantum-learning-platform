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
} from "@/lib/quantum-api";
import { readCounts, readBlochVectors } from "@/lib/circuit";
import { BlochSpherePanel } from "@/components/quantum/BlochSpherePanel";
import { CircuitCanvas } from "@/components/quantum/CircuitCanvas";
import { Presentation, CheckCircle2, Sparkles, Layers, Terminal, Play } from "lucide-react";

export const Route = createFileRoute("/demos")({
  head: () => ({
    meta: [
      { title: "College Presentation Suite — Quantum Algorithm Demos" },
      { name: "description", content: "Interactive live demonstration flows for Superposition, Bell State Entanglement, and Quantum Teleportation." },
    ],
  }),
  component: CollegeDemosPage,
});

function CollegeDemosPage() {
  const [demos, setDemos] = useState<DemoSummary[]>([]);
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);
  const [demoDetail, setDemoDetail] = useState<DemoDetail | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);

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
      } finally {
        setLoading(false);
      }
    };
    void loadDemos();
  }, []);

  useEffect(() => {
    if (!activeDemoId) return;

    const loadDemoDetail = async () => {
      setSimulating(true);
      try {
        const detail = await getDemoApi(activeDemoId);
        setDemoDetail(detail);

        // Convert demo circuit format if present
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
          demoCircuit = {
            name: (rawC.name as string) || detail.title || "College Demo",
            qubits: (rawC.qubits as number) || (rawC.num_qubits as number) || 2,
            gates: Array.isArray(rawC.gates)
              ? rawC.gates.map((g: any, i: number) => ({
                  id: g.id || `g_${i}`,
                  gate: (g.gate || g.name || "H").toString().toUpperCase(),
                  qubits: g.qubits || [g.target || 0],
                  step: g.step || i,
                }))
              : demoCircuit.gates,
          };
        }

        const res = await simulateCircuitApi(demoCircuit);
        setSimResult(res);
      } catch (err) {
        console.error("Failed to simulate demo circuit:", err);
      } finally {
        setSimulating(false);
      }
    };

    void loadDemoDetail();
  }, [activeDemoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 font-mono text-sm text-primary">
        Loading college presentation suite...
      </div>
    );
  }

  const counts = readCounts(simResult);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="label-tech uppercase">Live Presentation Mode</span>
          <h1 className="mt-1 text-3xl font-semibold text-foreground md:text-5xl flex items-center gap-3">
            <Presentation className="h-8 w-8 text-primary" /> College Quantum Demos
          </h1>
          <p className="mt-2 text-xs text-muted-foreground max-w-xl">
            Interactive, non-slideshow live demonstration flows for university & research presentations.
          </p>
        </div>

        {/* Demo Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {demos.map((d) => {
            const dId = (d.id || d.demo_id || "").toString();
            const isActive = activeDemoId === dId;
            return (
              <button
                key={dId}
                onClick={() => setActiveDemoId(dId)}
                className={`px-3.5 py-2 font-mono text-xs font-semibold border transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground font-bold"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                {d.title || d.name || dId}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Demo Section */}
      {demoDetail && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            <div className="border border-border bg-card p-6 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                {demoDetail.title || demoDetail.name}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {demoDetail.description || demoDetail.theory || demoDetail.explanation}
              </p>

              {demoDetail.concept && (
                <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/20 p-3 font-mono text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Key Presentation Insight: {demoDetail.concept}</span>
                </div>
              )}
            </div>

            {/* Probability Distribution */}
            {counts.length > 0 && (
              <div className="border border-border bg-card p-6 space-y-4">
                <span className="label-tech">Live State Measurement Probabilities</span>
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
