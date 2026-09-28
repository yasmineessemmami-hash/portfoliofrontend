import type { AboutAvailability } from "@/types/about.types";
import StatusBadgeActive from "@/components/status-badge/StatusBadgeActive";
import StatusBadgeInactive from "@/components/status-badge/StatusBadgeInactive";

interface AvailabilityBadgeProps {
  availability: AboutAvailability;
}

const AvailabilityBadge = ({ availability }: AvailabilityBadgeProps) => {
  if (!availability.text) {
    return null;
  }

  if (availability.is_active) {
    return <StatusBadgeActive text={availability.text} />;
  }

  // When not active, explicitly use the inactive badge (same red/muted circle as Home)
  return <StatusBadgeInactive text={availability.text} />;
};

export default AvailabilityBadge;


