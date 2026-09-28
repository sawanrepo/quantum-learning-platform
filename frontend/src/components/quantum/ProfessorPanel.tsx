import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLab } from "@/lib/lab-store";
import {
  ApiError,
  aiText,
  chatQuantumAiApi,
  explainCircuitApi,
  generateCodeApi,
} from "@/lib/quantum-api";

type Tab = "professor" | "code";
interface Note {
  id: number;
  kind: "insight" | "question" | "answer" | "error";
  label: string;
  text: string;
}

const ACTIONS = [
  { id: "explain", label: "Explain Circuit" },
  { id: "why", label: "Why This Result?" },
  { id: "debug", label: "Debug Circuit" },
];
const FRAMEWORKS = ["qiskit", "pennylane", "cirq"] as const;

const errText = (e: unknown) =>
  e instanceof ApiError || e instanceof Error
    ? e.message
    : "The professor could not be reached.";

export function ProfessorPanel() {
  const lab = useLab();
  const [tab, setTab] = useState<Tab>("professor");
  const [notes, setNotes] = useState<Note[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [framework, setFramework] = useState<(typeof FRAMEWORKS)[number]>("qiskit");
  const [code, setCode] = useState<string>("");
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const idRef = useRef(0);

  const push = (n: Omit<Note, "id">) =>
    setNotes((prev) => [{ ...n, id: ++idRef.current }, ...prev]);

  const runAction = async (action: (typeof ACTIONS)[number]) => {
    if (busy) return;
    setBusy(action.id);
    try {
      const res = await explainCircuitApi(lab.circuit, lab.result, action.id);
      push({ kind: "insight", label: action.label, text: aiText(res) || "No explanation returned." });
    } catch (e) {
      push({ kind: "error", label: action.label, text: errText(e) });
    } finally {
      setBusy(null);
    }
  };

  const ask = async () => {
    const q = question.trim();
    if (!q || busy) return;
    setQuestion("");
    push({ kind: "question", label: "You asked", text: q });
    setBusy("chat");
    try {
      const res = await chatQuantumAiApi(q, { circuit: lab.circuit, simulation: lab.result });
      push({ kind: "answer", label: "Professor", text: aiText(res) || "No answer returned." });
    } catch (e) {
      push({ kind: "error", label: "Professor", text: errText(e) });
    } finally {
      setBusy(null);
    }
  };

  const genCode = async () => {
    setBusy("code");
    setCodeErr(null);
    try {
      const res = await generateCodeApi(lab.circuit, framework);
      setCode(res?.code ?? "");
    } catch (e) {
      setCodeErr(errText(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="panel-surface corner-ticks flex min-h-[420px] flex-col rounded-md border border-hairline">
      <header className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`absolute inset-0 rounded-full bg-phase ${busy ? "animate-ping" : ""}`} />
            <span className="relative h-2.5 w-2.5 rounded-full bg-phase" />
          </span>
          <span className="label-tech">Quantum Professor · {lab.circuit.gates.length} gates in context</span>
        </div>
        <div className="flex gap-1">
          {(["professor", "code"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`label-tech rounded px-2 py-1 ${tab === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t === "professor" ? "Inspect" : "Export code"}
            </button>
          ))}
        </div>
      </header>

      {tab === "professor" ? (
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map((a) => (
              <button
                key={a.id}
                disabled={!!busy}
                onClick={() => runAction(a)}
                className="rounded border border-hairline px-3 py-1.5 text-sm hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {busy === a.id ? "Thinking…" : a.label}
              </button>
            ))}
          </div>
          {!lab.result && (
            <p className="text-xs text-muted-foreground">
              Tip: run the circuit first so the professor can reason about real measurement results.
            </p>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto" style={{ maxHeight: 420 }}>
            {notes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Annotations about your circuit will appear here, like margin notes on a lab bench.
              </p>
            )}
            {notes.map((n) => (
              <article
                key={n.id}
                className={`border-l-2 pl-3 ${
                  n.kind === "error"
                    ? "border-destructive"
                    : n.kind === "question"
                      ? "border-measure"
                      : "border-phase"
                }`}
              >
                <div className="label-tech mb-1 text-muted-foreground">{n.label}</div>
                <div className="prose prose-invert prose-sm max-w-none text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{n.text}</ReactMarkdown>
                </div>
              </article>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask();
            }}
            className="flex gap-2 border-t border-hairline pt-3"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about this circuit, e.g. why is q1 entangled?"
              className="flex-1 rounded border border-hairline bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              disabled={!question.trim() || !!busy}
              className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {busy === "chat" ? "…" : "Ask"}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {FRAMEWORKS.map((f) => (
              <button
                key={f}
                onClick={() => setFramework(f)}
                className={`label-tech rounded border px-3 py-1.5 ${framework === f ? "border-primary text-primary" : "border-hairline text-muted-foreground"}`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={genCode}
              disabled={!!busy}
              className="ml-auto rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
            >
              {busy === "code" ? "Generating…" : "Generate"}
            </button>
          </div>
          {codeErr && <p className="text-sm text-destructive">{codeErr}</p>}
          <div className="relative flex-1">
            <pre className="num h-full min-h-[260px] overflow-auto rounded border border-hairline bg-background p-3 text-xs">
              {code || "# Pick a framework and press Generate to export your circuit."}
            </pre>
            {code && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
                className="label-tech absolute right-2 top-2 rounded border border-hairline bg-panel px-2 py-1"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
