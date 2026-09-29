import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";

import { healthApi, getApiBase } from "../lib/quantum-api";
import { Cpu, BookOpen, Presentation, LayoutDashboard, Terminal, CheckCircle2, AlertCircle } from "lucide-react";

function HeaderNav({ isBackendOnline }: { isBackendOnline: boolean | null }) {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Quantum Lab", icon: Cpu },
    { to: "/modules", label: "Learning Modules", icon: BookOpen },
    { to: "/demos", label: "College Demos", icon: Presentation },
    { to: "/dashboard", label: "Console", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-primary/40 bg-primary/10">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-display font-bold tracking-tight text-foreground text-base">
              QUANTUM<span className="text-primary font-mono ml-1">LAB</span>
            </span>
            <span className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest -mt-1">
              Interactive AI Platform
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium transition-colors border ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div
          title={`Backend API: ${getApiBase()}`}
          className={`hidden sm:flex items-center gap-2 px-3 py-1 font-mono text-xs border ${
            isBackendOnline === true
              ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-400"
              : isBackendOnline === false
              ? "border-amber-500/30 bg-amber-950/20 text-amber-400"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          {isBackendOnline === true ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Qiskit Aer Ready</span>
            </>
          ) : isBackendOnline === false ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span>Backend Offline (Local Math Engine Active)</span>
            </>
          ) : (
            <span>Connecting...</span>
          )}
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 bg-primary px-3.5 py-1.5 text-xs font-mono font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Launch Lab</span>
        </Link>
      </div>
    </header>
  );
}

function GlobalFooter() {
  return (
    <footer className="border-t border-border bg-panel py-8 px-6 text-xs text-muted-foreground font-mono">
      <div className="mx-auto max-w-7xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          <span className="font-bold text-foreground font-sans">QUANTUM LAB</span>
          <span>— Production AI Quantum Platform</span>
        </div>
        <div className="flex gap-4 text-[11px]">
          <span>FastAPI</span>
          <span>•</span>
          <span>Qiskit Aer</span>
          <span>•</span>
          <span>Google Gemini AI</span>
          <span>•</span>
          <span>Three.js</span>
        </div>
      </div>
    </footer>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The quantum route you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to Quantum Lab
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI-Powered Quantum Computing Platform" },
      { name: "description", content: "Interactive Quantum Simulator & AI Learning Environment" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'waking' | 'online' | 'offline'>('checking');
  const [showReady, setShowReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let checkInProgress = false;
    
    // If it takes more than 2 seconds for the first response, assume it's waking up on Render
    const initialTimer = setTimeout(() => {
      if (isMounted) {
        setBackendStatus(prev => (prev === 'checking' ? 'waking' : prev));
      }
    }, 2000);

    const runCheck = async () => {
      if (checkInProgress) return;
      checkInProgress = true;
      try {
        const ok = await healthApi();
        if (!isMounted) return;
        
        if (ok) {
          setBackendStatus(prev => {
            if (prev === 'waking' || prev === 'checking') {
              setShowReady(true);
              setTimeout(() => {
                if (isMounted) setShowReady(false);
              }, 4000);
            }
            return 'online';
          });
        } else {
          setBackendStatus(prev => (prev === 'online' ? 'offline' : 'waking'));
        }
      } catch (e) {
        if (isMounted) {
          setBackendStatus(prev => (prev === 'online' ? 'offline' : 'waking'));
        }
      } finally {
        checkInProgress = false;
      }
    };

    // Initial check sends request to wake up the backend
    void runCheck();
    
    // Poll every 5 seconds; Render will hold the pending request or return errors until it's awake
    const interval = setInterval(runCheck, 5000);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground flex flex-col relative">
        {backendStatus === 'waking' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300">
            <div className="bg-card border border-border p-8 rounded-xl shadow-2xl max-w-md text-center flex flex-col items-center gap-6 animate-in zoom-in-95 fade-in duration-300">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h2 className="text-xl font-bold font-display tracking-tight mb-2">Waking up Quantum Engine</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Please wait, our cloud backend is currently offline due to inactivity. We are spinning it up right now. This may take up to a minute...
                </p>
              </div>
            </div>
          </div>
        )}

        {showReady && (
          <div className="fixed bottom-6 right-6 z-[100] bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm">System Online</h3>
              <p className="text-xs opacity-90">Website is ready to use.</p>
            </div>
          </div>
        )}

        <HeaderNav isBackendOnline={backendStatus === 'online' ? true : backendStatus === 'offline' ? false : null} />
        <div className="flex-1">
          <Outlet />
        </div>
        <GlobalFooter />
      </div>
    </QueryClientProvider>
  );
}
