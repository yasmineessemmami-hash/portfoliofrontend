import { Loader2 } from "lucide-react";

interface AdminLoadingStateProps {
  message?: string;
}

export const AdminLoadingState = ({
  message = "Loading...",
}: AdminLoadingStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

