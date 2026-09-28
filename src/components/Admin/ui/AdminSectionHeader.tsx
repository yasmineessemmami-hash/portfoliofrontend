import type { ComponentType, ReactNode } from "react";

interface AdminSectionHeaderProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  action?: ReactNode;
}

export const AdminSectionHeader = ({
  icon: Icon,
  title,
  action,
}: AdminSectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground font-['Sora']">
          {title}
        </h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

