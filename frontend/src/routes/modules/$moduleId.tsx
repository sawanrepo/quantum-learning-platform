import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  getModuleApi,
  submitChallengeApi,
  simulateCircuitApi,
  type LearningModuleDetail,
  type AssessmentResult,
  type SimulationResult,
  type Circuit,
} from "@/lib/quantum-api";
import { readCounts, readBlochVectors } from "@/lib/circuit";
import { BlochSpherePanel } from "@/components/quantum/BlochSpherePanel";
import { CircuitCanvas } from "@/components/quantum/CircuitCanvas";
import { GateLibrary } from "@/components/quantum/GateLibrary";
import { gateSpec } from "@/lib/circuit";
import { ArrowLeft, CheckCircle2, AlertCircle, Award, Sparkles, BookOpen, HelpCircle, Terminal } from "lucide-react";
import type { CircuitGate, GateId } from "@/lib/quantum-api";

export const Route = createFileRoute("/modules/$moduleId")({
  head: ({ params }) => ({
    meta: [
      { title: `Module ${params.moduleId} — Quantum Learning` },
      { name: "description", content: "Interactive quantum lesson theory, circuit sandbox, and automated challenge evaluation." },
    ],
  }),
  component: ModuleDetailPage,
});

function ModuleDetailPage() {
  const { moduleId } = Route.useParams();
  const [module, setModule] = useState<LearningModuleDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"theory" | "sandbox" | "challenge" | "quiz">("theory");

  // Circuit sandbox state
  const [circuit, setCircuit] = useState<Circuit>({
    name: "Module Sandbox",
    qubits: 2,
    gates: [
      { id: "g1", gate: "H", qubits: [0], step: 0 },
      { id: "g2", gate: "CNOT", qubits: [0, 1], step: 1 },
    ],
  });
  const [armed, setArmed] = useState<GateId | null>(null);
  const [selected, setSelected] = useState<CircuitGate | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  // Challenge evaluation state
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [submittingChallenge, setSubmittingChallenge] = useState<boolean>(false);

  // Quiz state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number | string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const data = await getModuleApi(moduleId);
        setModule(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    void loadDetail();
  }, [moduleId]);

  const handleRunSim = async () => {
    setSimulating(true);
    try {
      const res = await simulateCircuitApi(circuit);
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    void handleRunSim();
  }, [circuit]);

  const handleSubmitChallenge = async () => {
    if (!module?.challenge?.id && !module?.challenge?.challenge_id) return;
    const challengeId = (module.challenge.id || module.challenge.challenge_id || "c1").toString();
    setSubmittingChallenge(true);
    try {
      const res = await submitChallengeApi(challengeId, circuit);
      setAssessmentResult(res);
    } catch (err) {
      setAssessmentResult({
        fidelity: 0,
        score: 0,
        passed: false,
        feedback: `Error evaluating submission: ${String(err)}`,
      });
    } finally {
      setSubmittingChallenge(false);
    }
  };

  const placeGate = (qubit: number, step: number) => {
    if (!armed) return;
    const arity = gateSpec(armed).arity;
    const qubits = Array.from({ length: arity }, (_, i) => qubit + i);
    if (qubits[qubits.length - 1]! >= circuit.qubits) return;
    const newGate: CircuitGate = {
      id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      gate: armed,
      qubits,
      step,
    };
    setCircuit((prev) => ({
      ...prev,
      gates: [...prev.gates.filter((g) => !(g.qubits.includes(qubit) && g.step === step)), newGate],
    }));
  };

  const selectedGate = circuit.gates.find((g) => g.id === selected?.id) ?? null;
  const counts = readCounts(simResult);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 font-mono text-sm text-primary">
        Loading module content...
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center space-y-4">
        <p className="border border-destructive/50 p-4 text-sm text-destructive font-mono">
          Failed to load module: {error || "Module not found"}
        </p>
        <Link to="/modules" className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs font-mono">
          <ArrowLeft className="h-4 w-4" /> Return to Modules
        </Link>
      </div>
    );
  }

  const questions = module.quiz || module.questions || [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-3 text-xs font-mono">
        <Link to="/modules" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Curriculum
        </Link>
        <span className="label-tech uppercase">{module.level || module.difficulty || "Core Lesson"}</span>
      </div>

      {/* Module Title & Tab Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {module.title || module.name}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
        </div>

        <div className="flex items-center gap-1 bg-card p-1 border border-border">
          <button
            onClick={() => setActiveTab("theory")}
            className={`px-3.5 py-1.5 font-mono text-xs font-medium border transition-colors ${
              activeTab === "theory" ? "border-primary bg-primary/10 text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Theory & Concepts
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-3.5 py-1.5 font-mono text-xs font-medium border transition-colors ${
              activeTab === "sandbox" ? "border-primary bg-primary/10 text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Circuit Sandbox
          </button>
          {module.challenge && (
            <button
              onClick={() => setActiveTab("challenge")}
              className={`px-3.5 py-1.5 font-mono text-xs font-medium border transition-colors ${
                activeTab === "challenge" ? "border-primary bg-primary/10 text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Challenge
            </button>
          )}
          {questions.length > 0 && (
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-3.5 py-1.5 font-mono text-xs font-medium border transition-colors ${
                activeTab === "quiz" ? "border-primary bg-primary/10 text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Quiz ({questions.length})
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Theory Markdown */}
      {activeTab === "theory" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="border border-border bg-card p-6 text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground">
            {module.theory || module.content || module.markdown || "No theory markdown text provided for this module."}
          </div>

          <div className="space-y-4">
            <div className="border border-border bg-card p-5 space-y-3">
              <span className="label-tech">Quick Interactive Sandbox</span>
              <p className="text-xs text-muted-foreground">
                Run live statevector calculations on the Qiskit simulator while reading the theory.
              </p>
              <button
                onClick={() => setActiveTab("sandbox")}
                className="w-full bg-primary px-4 py-2 text-xs font-mono font-medium text-primary-foreground flex items-center justify-center gap-1.5"
              >
                <Terminal className="h-4 w-4" /> Open Full Sandbox
              </button>
            </div>

            <BlochSpherePanel vectors={readBlochVectors(simResult)} />
          </div>
        </div>
      )}

      {/* TAB 2 & 3: Circuit Sandbox & Challenge Solver */}
      {(activeTab === "sandbox" || activeTab === "challenge") && (
        <div className="space-y-6">
          {activeTab === "challenge" && module.challenge && (
            <div className="border border-primary/40 bg-primary/5 p-5 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-amber-400" /> Challenge Target
                </span>
                <span className="label-tech uppercase">Auto-Evaluated</span>
              </div>
              <p className="text-muted-foreground font-sans text-xs">{module.challenge.description}</p>
              {module.challenge.target_state && (
                <div className="text-primary">
                  Target Quantum State: <code>{module.challenge.target_state}</code>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-6">
            <GateLibrary
              armed={armed}
              onArm={setArmed}
              selected={selectedGate}
              onAngleChange={(id, param) => {
                setCircuit((prev) => ({
                  ...prev,
                  gates: prev.gates.map((g) => (g.id === id ? { ...g, params: [param] } : g)),
                }));
              }}
              onRemoveSelected={() => {
                if (selectedGate) {
                  setCircuit((prev) => ({ ...prev, gates: prev.gates.filter((g) => g.id !== selectedGate.id) }));
                  setSelected(null);
                }
              }}
            />

            <div className="min-w-0 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                <span className="label-tech">Circuit Wire Grid</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCircuit((prev) => ({ ...prev, gates: [] }))}
                    className="border border-border px-3 py-1 text-xs font-mono"
                  >
                    Clear Circuit
                  </button>
                  <div className="flex items-center gap-1.5 border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-mono font-medium text-primary rounded">
                    <span className="inline-block size-2 rounded-full bg-primary animate-ping" />
                    <span>Live Auto-Simulating</span>
                  </div>
                  {activeTab === "challenge" && (
                    <button
                      onClick={() => void handleSubmitChallenge()}
                      disabled={submittingChallenge}
                      className="border border-emerald-500 bg-emerald-950/40 text-emerald-300 px-4 py-1 text-xs font-mono font-bold hover:bg-emerald-900/60"
                    >
                      {submittingChallenge ? "Evaluating..." : "Submit Solution"}
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto border border-border bg-card p-4">
                <CircuitCanvas
                  circuit={circuit}
                  armedGate={armed}
                  onPlace={placeGate}
                  onRemove={(id) => setCircuit((prev) => ({ ...prev, gates: prev.gates.filter((g) => g.id !== id) }))}
                  onMove={(id, qubit, step) => {
                    setCircuit((prev) => ({
                      ...prev,
                      gates: prev.gates.map((g) => (g.id === id ? { ...g, qubits: [qubit], step } : g)),
                    }));
                  }}
                  onSelect={setSelected}
                  onToggleQubitState={(q) =>
                    setCircuit((prev) => {
                      const curStates = [...(prev.initial_states ?? Array(prev.qubits).fill("0"))];
                      curStates[q] = curStates[q] === "1" ? "0" : "1";
                      return { ...prev, initial_states: curStates };
                    })
                  }
                  selectedId={selectedGate?.id ?? null}
                  stepResults={simResult?.step_results}
                />
              </div>

              {assessmentResult && (
                <div className={`border p-4 space-y-2 font-mono text-xs ${
                  assessmentResult.passed || (assessmentResult.score ?? 0) >= 80
                    ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-300"
                    : "border-destructive/50 bg-destructive/10 text-destructive"
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {assessmentResult.passed || (assessmentResult.score ?? 0) >= 80 ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span>Fidelity Score: {((assessmentResult.fidelity ?? (assessmentResult.score ? assessmentResult.score / 100 : 0)) * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-muted-foreground font-sans text-xs">{assessmentResult.feedback || assessmentResult.explanation}</p>
                </div>
              )}

              {counts.length > 0 && (
                <div className="border border-border bg-card p-4">
                  <span className="label-tech">Measurement probabilities</span>
                  <div className="mt-3 space-y-2">
                    {counts.map((r: { state: string; probability: number }) => (
                      <div key={r.state} className="flex items-center gap-3 text-sm">
                        <span className="num w-14">|{r.state}⟩</span>
                        <div className="h-2 flex-1 bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${r.probability * 100}%` }} />
                        </div>
                        <span className="num w-14 text-right">{(r.probability * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <BlochSpherePanel vectors={readBlochVectors(simResult)} />
          </div>
        </div>
      )}

      {/* TAB 4: Quiz Questions */}
      {activeTab === "quiz" && questions.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="border border-border bg-card p-6 space-y-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" /> Assessment Quiz
            </h3>

            {questions.map((q, qIdx) => {
              const opts = q.options || q.choices || [];
              const qId = q.id?.toString() || `q_${qIdx}`;
              return (
                <div key={qId} className="border border-border bg-background p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    {qIdx + 1}. {q.question}
                  </h4>
                  <div className="space-y-2">
                    {opts.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className="flex items-center gap-3 text-xs text-muted-foreground p-2 rounded hover:bg-card cursor-pointer border border-transparent hover:border-border"
                      >
                        <input
                          type="radio"
                          name={qId}
                          checked={selectedQuizAnswers[qId] === optIdx || selectedQuizAnswers[qId] === opt}
                          onChange={() => setSelectedQuizAnswers({ ...selectedQuizAnswers, [qId]: optIdx })}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  {quizSubmitted && q.explanation && (
                    <div className="text-xs text-primary font-mono pt-2 border-t border-border">
                      💡 Explanation: {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setQuizSubmitted(true)}
              className="bg-primary px-6 py-2 text-xs font-mono font-medium text-primary-foreground"
            >
              Submit & Check Answers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
