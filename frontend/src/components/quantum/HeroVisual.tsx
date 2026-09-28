import { lazy, Suspense } from "react";

import { useHydrated } from "@/lib/use-hydrated";

const HeroFieldScene = lazy(() => import("./HeroFieldScene"));

export function HeroVisual() {
  const hydrated = useHydrated();
  return (
    <div className="absolute inset-0">
      {hydrated && (
        <Suspense fallback={null}>
          <HeroFieldScene />
        </Suspense>
      )}
    </div>
  );
}
