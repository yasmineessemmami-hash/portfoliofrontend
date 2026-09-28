import { Home, RefreshCw, AlertTriangle, Mail } from "lucide-react";

const formatTimestamp = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const ServerError = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-destructive" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl bg-destructive" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-soft" />

      <div className="relative z-10 max-w-2xl w-full">
        {/* Terminal Window */}
        <div className="glass rounded-2xl overflow-hidden border border-destructive/30">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-destructive/10 border-b border-destructive/30">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-error" />
              <div className="w-3 h-3 rounded-full bg-error/50" />
              <div className="w-3 h-3 rounded-full bg-error/50" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-destructive font-mono">⚠ CRITICAL ERROR</span>
            </div>
            <AlertTriangle className="w-4 h-4 text-destructive" aria-hidden="true" />
          </div>

          {/* Terminal Content */}
          <div className="p-6 sm:p-8 font-mono">
            {/* Error Code */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <span className="text-destructive">throw new</span> ServerError({"{"}
              </div>
              <div className="pl-4 space-y-1">
                <div className="text-sm">
                  <span className="text-accent">code</span>: <span className="text-destructive">500</span>,
                </div>
                <div className="text-sm">
                  <span className="text-accent">type</span>: <span className="text-success">"Internal Server Error"</span>,
                </div>
                <div className="text-sm">
                  <span className="text-accent">timestamp</span>:{" "}
                  <span className="text-success">{formatTimestamp(new Date())}</span>
                </div>
              </div>
              <div className="text-muted-foreground text-sm">{"});"}</div>
            </div>

            {/* Big 500 */}
            <div className="text-center my-8">
              <div className="flex items-center justify-center gap-4">
                <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-destructive animate-pulse" aria-hidden="true" />
                <h1 className="font-heading text-6xl sm:text-8xl font-bold text-foreground">
                  5<span className="text-destructive">0</span>0
                </h1>
              </div>
              <p className="text-muted-foreground mt-4 text-sm sm:text-base">
                <span className="text-error">// </span>
                Something went wrong on our end. We're working on it!
              </p>
            </div>

            {/* Stack Trace */}
            <div className="bg-background/50 rounded-lg p-4 mb-6 border border-destructive/20 overflow-x-auto">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="text-destructive">Uncaught ServerException: Internal server error</div>
                <div className="pl-4">
                  at processRequest <span className="text-muted-foreground/60">(server.ts:142)</span>
                </div>
                <div className="pl-4">
                  at handleRoute <span className="text-muted-foreground/60">(router.ts:89)</span>
                </div>
                <div className="pl-4">
                  at async main <span className="text-muted-foreground/60">(index.ts:23)</span>
                </div>
              </div>
            </div>

            {/* Contact Admin */}
            <div className="bg-primary/5 rounded-lg p-4 mb-6 border border-primary/20">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Need immediate assistance?</p>
                  <p className="text-xs text-muted-foreground">
                    If this keeps happening, please contact the site administrator.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Try Again
              </button>
              <a
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 glass rounded-lg font-medium text-foreground hover:bg-surface-hover transition-all"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Go Home
              </a>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground/60 mt-6 font-mono">
          <span className="text-destructive">$</span> git blame server.ts | head -n 1
        </p>
      </div>
    </div>
  );
};

export default ServerError;


