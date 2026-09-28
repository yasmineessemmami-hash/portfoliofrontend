import { AlertTriangle } from "lucide-react";
import { AdminCard } from "./AdminCard";

interface AdminErrorStateProps {
  title?: string;
  message: string;
}

export const AdminErrorState = ({
  title = "Error loading data",
  message,
}: AdminErrorStateProps) => {
  return (
    <AdminCard>
      <div className="flex flex-col items-center gap-4 text-center py-8">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </AdminCard>
  );
};

