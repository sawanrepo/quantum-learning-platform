import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { listModulesApi, unwrapList, type LearningModuleSummary } from "@/lib/quantum-api";
import { BookOpen, Clock, ChevronRight, Sparkles, Layers } from "lucide-react";
import { InlineMarkdown } from "@/components/common/MarkdownView";

export const Route = createFileRoute("/modules/")({
  head: () => ({
    meta: [
      { title: "Learning Curriculum — Quantum Computing Modules" },
      { name: "description", content: "Master quantum computing with structured interactive modules, theory, quizzes, and circuit challenges." },
    ],
  }),
  component: ModulesPage,
});

function ModulesPage() {
  const [modules, setModules] = useState<LearningModuleSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    const loadModules = async () => {
      try {
        const raw = await listModulesApi();
        const list = unwrapList(raw);
        setModules(list);
      } catch (err) {
        console.error("Failed to load modules:", err);
      } finally {
        setLoading(false);
      }
    };
    void loadModules();
  }, []);

  const categories = [
    { id: "all", label: "All Track Modules" },
    { id: "fundamentals", label: "Fundamentals" },
    { id: "circuits", label: "Quantum Circuits" },
    { id: "entanglement", label: "Entanglement" },
    { id: "algorithms", label: "Algorithms" },
    { id: "cryptography", label: "Cryptography" },
    { id: "error_correction", label: "Error Correction" },
  ];

  const filteredModules = filterCategory === "all"
    ? modules
    : modules.filter((m) => {
        const cat = ((m as any).category || m.level || m.difficulty || m.id || "").toString().toLowerCase();
        return cat.includes(filterCategory.toLowerCase());
      });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-8">
      {/* Header Banner */}
      <div className="space-y-3 border-b border-border pb-6">
        <span className="label-tech">Interactive Learning Paths</span>
        <h1 className="text-3xl font-semibold text-foreground md:text-5xl flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" /> Quantum Computing Curriculum
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Master quantum mechanics through structured lessons combining rigorous theory, interactive 3D visualizations, circuit building challenges, and automated fidelity scoring.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3.5 py-1.5 font-mono text-xs font-medium border transition-colors ${
              filterCategory === cat.id
                ? "border-primary bg-primary/10 text-primary font-bold"
                : "border-border bg-card text-muted-foreground hover:border-primary/50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Module Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-primary font-mono text-sm">
          Loading curriculum modules...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredModules.map((m) => {
            const modId = m.id.toString();
            return (
              <div
                key={modId}
                className="group border border-border bg-card p-6 space-y-4 transition-all hover:border-primary/60 hover:bg-card/90 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="label-tech uppercase">{((m as any).category || "Core").replace("_", " ")}</span>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                        {m.level || m.difficulty || "Intro"}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {m.duration || 15} mins
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {m.title || m.name || `Module ${modId}`}
                  </h2>

                  <div className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    <InlineMarkdown content={m.description || "Explore quantum information processing principles with theory and circuit experiments."} />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center text-xs font-mono font-medium text-primary">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Theory + Circuit Challenge
                  </span>
                  <Link
                    to="/modules/$moduleId"
                    params={{ moduleId: modId }}
                    className="flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Start Lesson <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
