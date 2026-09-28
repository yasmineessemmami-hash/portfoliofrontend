import { ChevronUp, ChevronDown } from "lucide-react";
import { AdminButton } from "./AdminButton";

interface AdminReorderControlsProps {
  index: number;
  totalItems: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  className?: string;
}

export const AdminReorderControls = ({
  index,
  totalItems,
  onMoveUp,
  onMoveDown,
  className = "",
}: AdminReorderControlsProps) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <AdminButton
        onClick={onMoveUp}
        disabled={index === 0}
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
        aria-label="Move up"
      >
        <ChevronUp className="w-4 h-4" />
      </AdminButton>
      <AdminButton
        onClick={onMoveDown}
        disabled={index === totalItems - 1}
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
        aria-label="Move down"
      >
        <ChevronDown className="w-4 h-4" />
      </AdminButton>
    </div>
  );
};

