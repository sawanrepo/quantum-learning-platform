import { useState, useEffect } from "react";
import { generateCodeApi, type Circuit } from "@/lib/quantum-api";
import { X, Copy, Check, Code, Terminal } from "lucide-react";

interface CodeExporterModalProps {
  circuit: Circuit;
  isOpen: boolean;
  onClose: () => void;
}

export function CodeExporterModal({ circuit, isOpen, onClose }: CodeExporterModalProps) {
  const [framework, setFramework] = useState<"qiskit" | "pennylane" | "cirq">("qiskit");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadCode = async () => {
      setLoading(true);
      try {
        const res = await generateCodeApi(circuit, framework);
        setCode(res.code || "# No code returned from backend");
      } catch (err) {
        setCode(`# Error generating ${framework} code: ${String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    void loadCode();
  }, [isOpen, framework, circuit]);

  if (!isOpen) return null;

  const handleCopy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl border border-border bg-panel p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 font-mono text-sm font-semibold">
            <Code className="h-4 w-4 text-primary" />
            <span>Export Framework Code</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {(["qiskit", "pennylane", "cirq"] as const).map((fw) => (
            <button
              key={fw}
              onClick={() => setFramework(fw)}
              className={`px-3 py-1.5 font-mono text-xs uppercase font-semibold border transition-colors ${
                framework === fw
                  ? "border-primary bg-primary text-primary-foreground font-bold"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              {fw}
            </button>
          ))}
        </div>

        <div className="relative min-h-[220px] max-h-[360px] overflow-x-auto border border-border bg-background p-4 font-mono text-xs text-primary">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 border border-border bg-panel px-2.5 py-1 text-xs hover:border-primary"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground font-mono italic">
              <Terminal className="h-4 w-4 animate-spin mr-2" /> Generating {framework} Python script...
            </div>
          ) : (
            <pre className="leading-relaxed">{code}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
