import StatusBadgeActive from "./StatusBadgeActive";
import StatusBadgeInactive from "./StatusBadgeInactive";
import type { StatusBadge as StatusBadgeType } from "@/types/home.types";

interface StatusBadgeProps {
  statusBadge: StatusBadgeType;
  className?: string;
}

const StatusBadge = ({ statusBadge, className = "" }: StatusBadgeProps) => {
  if (statusBadge.is_active) {
    return <StatusBadgeActive text={statusBadge.text} className={className} />;
  }

  return <StatusBadgeInactive text={statusBadge.text} className={className} />;
};

export default StatusBadge;

