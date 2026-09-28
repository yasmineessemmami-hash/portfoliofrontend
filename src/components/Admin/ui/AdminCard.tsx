import type { ReactNode } from "react";

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export const AdminCard = ({
  children,
  className = "",
  title,
  description,
}: AdminCardProps) => {
  return (
    <div
      className={`bg-card border border-border rounded-lg p-4 lg:p-6 ${className}`}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-foreground font-['Sora'] mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

