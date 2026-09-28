import { Link } from "react-router-dom";
import { Home, ArrowLeft, Terminal, FileX } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

const NotFoundContent = () => {
  const path =
    typeof window !== "undefined" ? window.location.pathname : "/unknown";

  return (
    <section className="relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-404-error" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl bg-hero-primary" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-soft" />

      <div className="relative z-10 max-w-2xl w-full">
        {/* Terminal Window */}
        <div className="glass rounded-2xl overflow-hidden border border-border/50">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-surface-hover/50 border-b border-border/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-error/80" />
              <div className="w-3 h-3 rounded-full bg-warning/80" />
              <div className="w-3 h-3 rounded-full bg-success/80" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-muted-foreground font-mono">
                error_404.tsx
              </span>
            </div>
            <Terminal className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Terminal Content */}
          <div className="p-6 sm:p-8 font-mono">
            {/* Error Code */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <span className="text-primary">const</span> error{" "}
                <span className="text-primary">=</span> {"{"}
              </div>
              <div className="pl-4 space-y-1">
                <div className="text-sm">
                  <span className="text-accent">status</span>:{" "}
                  <span className="text-destructive">404</span>,
                </div>
                <div className="text-sm">
                  <span className="text-accent">message</span>:{" "}
                  <span className="text-success">"Page not found"</span>,
                </div>
                <div className="text-sm">
                  <span className="text-accent">path</span>:{" "}
                  <span className="text-success">"{path}"</span>
                </div>
              </div>
              <div className="text-muted-foreground text-sm">{"}"}</div>
            </div>

            {/* Big 404 */}
            <div className="text-center my-8">
              <div className="flex items-center justify-center gap-4">
                <FileX className="w-12 h-12 sm:w-16 sm:h-16 text-destructive/60" />
                <h1 className="font-heading text-6xl sm:text-8xl font-bold text-foreground">
                  4<span className="text-destructive">0</span>4
                </h1>
              </div>
              <p className="text-muted-foreground mt-4 text-sm sm:text-base">
                <span className="text-warning">// </span>
                The page you&apos;re looking for doesn&apos;t exist or has been
                moved.
              </p>
            </div>

            {/* Console Output */}
            <div className="bg-background/50 rounded-lg p-4 mb-6 border border-border/30">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-error">✗</span>
                <div>
                  <span className="text-error">Error:</span>
                  <span className="text-muted-foreground"> Cannot GET </span>
                  <span className="text-foreground">{path}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm mt-2">
                <span className="text-warning/75">⚠</span>
                <span className="text-muted-foreground">
                  Try navigating back to homepage
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
                aria-label="Go back to homepage"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 glass rounded-lg font-medium text-foreground hover:bg-surface-hover transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground/60 mt-6 font-mono">
          <span className="text-primary">$</span> echo "Lost? Let me help you
          find your way."
        </p>
      </div>
    </section>
  );
};

const NotFound = () => {
  return (
    <MainLayout>
      <NotFoundContent />
    </MainLayout>
  );
};

export default NotFound;


