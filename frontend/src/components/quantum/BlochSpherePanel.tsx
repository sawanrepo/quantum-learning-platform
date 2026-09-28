import { lazy, Suspense, useState } from "react";

import { useHydrated } from "@/lib/use-hydrated";
import type { BlochVector } from "@/lib/quantum-api";

const BlochSphereScene = lazy(() => import("./BlochSphereScene"));

const ZERO: BlochVector = { x: 0, y: 0, z: 1, theta: 0, phi: 0 };

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1.5 last:border-0">
      <span className="label-tech">{label}</span>
      <span className="num text-sm text-foreground">{value}</span>
    </div>
  );
}

export function BlochSpherePanel({
  vectors,
  runToken = 0,
  compact = false,
}: {
  vectors: BlochVector[];
  runToken?: number;
  compact?: boolean;
}) {
  const hydrated = useHydrated();
  const [qubit, setQubit] = useState(0);
  const [viewKey, setViewKey] = useState(0);
  const active = vectors[Math.min(qubit, Math.max(0, vectors.length - 1))] ?? ZERO;
  const hasData = vectors.length > 0;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="label-tech text-foreground/80">Bloch sphere</span>
          {!hasData && <span className="label-tech text-muted-foreground">· awaiting run</span>}
        </div>
        <div className="flex items-center gap-1">
          {vectors.length > 1 &&
            vectors.map((_, i) => (
              <button
                key={i}
                onClick={() => setQubit(i)}
                className={`num border px-2 py-0.5 text-[11px] transition-colors ${
                  i === qubit
                    ? "border-beam/60 bg-beam/15 text-beam"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                q{i}
              </button>
            ))}
          <button
            onClick={() => setViewKey((k) => k + 1)}
            className="ml-1 label-tech border border-border px-2 py-1 transition-colors hover:border-beam/50 hover:text-beam"
          >
            Reset view
          </button>
        </div>
      </header>

      <div className={`relative ${compact ? "h-64" : "min-h-[280px] flex-1"} scanlines`}>
        {hydrated ? (
          <Suspense fallback={<SphereFallback />}>
            <div key={`${viewKey}-${runToken}`} className="absolute inset-0">
              <BlochSphereScene vector={active} />
            </div>
          </Suspense>
        ) : (
          <SphereFallback />
        )}
        <div className="pointer-events-none absolute left-4 top-4">
          <div className="num text-xs text-muted-foreground">
            |ψ⟩ = cos(θ/2)|0⟩ + e<sup>iφ</sup>sin(θ/2)|1⟩
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-3 right-4 label-tech">
          drag to rotate · scroll to zoom
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 border-t border-border px-4 py-3 sm:grid-cols-5 sm:gap-x-5">
        <Readout label="θ" value={`${(active.theta).toFixed(3)} rad`} />
        <Readout label="φ" value={`${(active.phi).toFixed(3)} rad`} />
        <Readout label="x" value={active.x.toFixed(4)} />
        <Readout label="y" value={active.y.toFixed(4)} />
        <Readout label="z" value={active.z.toFixed(4)} />
      </div>
    </div>
  );
}

function SphereFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="size-40 rounded-full border border-beam/25">
        <div className="size-full animate-qpulse rounded-full border-t border-beam/40" />
      </div>
    </div>
  );
}
