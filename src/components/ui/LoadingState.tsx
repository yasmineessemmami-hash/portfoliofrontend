import { Loader2 } from "lucide-react";

export const LoadingState = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-primary" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl bg-accent" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <div className="absolute inset-0 blur-sm bg-primary/20 rounded-full animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-lg font-medium text-foreground tracking-tight">Loading... </p>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest animate-pulse">Initializing...</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingState;

