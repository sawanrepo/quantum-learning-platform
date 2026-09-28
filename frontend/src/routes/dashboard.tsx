import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, Award, Zap, BookOpen, Terminal, Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Research Console — Quantum Analytics & History" },
      { name: "description", content: "Track completed curriculum modules, average circuit fidelity, and simulation execution metrics." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="label-tech uppercase">Personal Research Console</span>
          <h1 className="mt-1 text-3xl font-semibold text-foreground md:text-5xl flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" /> Quantum Analytics & History
          </h1>
          <p className="mt-2 text-xs text-muted-foreground max-w-xl">
            Monitor your quantum state fidelity scores, completed curriculum tracks, and Qiskit simulation job history.
          </p>
        </div>

        <Link
          to="/"
          className="flex items-center gap-2 bg-primary px-4 py-2 text-xs font-mono font-medium text-primary-foreground transition-opacity hover:opacity-90 w-fit"
        >
          <Terminal className="h-4 w-4" /> Open Quantum Lab
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="border border-border bg-card p-5 space-y-2">
          <span className="label-tech uppercase">Completed Modules</span>
          <div className="text-3xl font-bold text-foreground font-sans">3 / 4 Tracks</div>
          <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
            <div className="h-full bg-primary w-3/4" />
          </div>
        </div>

        <div className="border border-border bg-card p-5 space-y-2">
          <span className="label-tech uppercase">Average Circuit Fidelity</span>
          <div className="text-3xl font-bold text-emerald-400 font-sans">96.4%</div>
          <span className="text-[11px] text-muted-foreground">Based on challenge submissions</span>
        </div>

        <div className="border border-border bg-card p-5 space-y-2">
          <span className="label-tech uppercase">Simulations Executed</span>
          <div className="text-3xl font-bold text-primary font-sans">42 Jobs</div>
          <span className="text-[11px] text-muted-foreground">Qiskit Aer simulator</span>
        </div>

        <div className="border border-border bg-card p-5 space-y-2">
          <span className="label-tech uppercase">AI Tutor Insights</span>
          <div className="text-3xl font-bold text-purple-400 font-sans">18 Requests</div>
          <span className="text-[11px] text-muted-foreground">Gemini 2.5 Flash</span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="border border-border bg-card p-6 space-y-4 font-mono">
          <span className="label-tech uppercase">Completed Circuit Challenges</span>

          <div className="space-y-3">
            <div className="border border-border bg-background p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground text-sm font-sans block">Challenge 1: Create Superposition</span>
                <span className="text-xs text-muted-foreground">Target |0⟩ → (|0⟩ + |1⟩)/√2</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold text-sm block">100% Fidelity</span>
                <span className="text-[11px] text-muted-foreground">Passed</span>
              </div>
            </div>

            <div className="border border-border bg-background p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground text-sm font-sans block">Challenge 2: Bell State Entanglement</span>
                <span className="text-xs text-muted-foreground">Target (|00⟩ + |11⟩)/√2</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold text-sm block">98.2% Fidelity</span>
                <span className="text-[11px] text-muted-foreground">Passed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-border bg-card p-6 space-y-4">
          <span className="label-tech uppercase">Recommended Next Experiment</span>
          <div className="border border-border bg-background p-4 space-y-3">
            <span className="label-tech text-primary">Advanced Algorithm</span>
            <h3 className="font-bold text-foreground text-base">Grover's Quantum Search</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Test quadratic amplitude amplification on a 2-qubit database using Oracle and Diffusion operators.
            </p>
            <Link
              to="/modules"
              className="block text-center border border-primary bg-primary/10 text-primary py-2 text-xs font-mono font-medium hover:bg-primary/20"
            >
              Launch Grover Module
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
