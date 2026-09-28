import type { ComponentType } from "react";

interface ThemeEffectToggleProps {
  effectEnabled: boolean;
  onToggle: () => void;
  Icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  enabledLabel?: string;
  disabledLabel?: string;
}

/**
 * Generic toggle button for theme effects (snow, particles, etc.)
 * 
 * Usage:
 * - When effectEnabled is true: Shows icon with line through it (to indicate "click to disable")
 * - When effectEnabled is false: Shows plain icon (to indicate "click to enable")
 * 
 * @param effectEnabled - Whether the effect is currently enabled
 * @param onToggle - Callback when toggle is clicked
 * @param Icon - Icon component from lucide-react
 * @param enabledLabel - Tooltip when effect is enabled (default: "Turn off effect")
 * @param disabledLabel - Tooltip when effect is disabled (default: "Turn on effect")
 */
export const ThemeEffectToggle = ({
  effectEnabled,
  onToggle,
  Icon,
  enabledLabel = "Turn off effect",
  disabledLabel = "Turn on effect",
}: ThemeEffectToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-[9999] p-3 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-background transition-all duration-200 hover:scale-110 group"
      aria-label={effectEnabled ? enabledLabel : disabledLabel}
      title={effectEnabled ? enabledLabel : disabledLabel}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
      }}
    >
      <div className="relative inline-flex items-center justify-center">
        <Icon
          className={`w-5 h-5 transition-all duration-300 ${
            effectEnabled
              ? "text-primary group-hover:rotate-180"
              : "text-muted-foreground group-hover:text-foreground"
          }`}
        />
        {/* Line through icon when enabled (shows effect is active, can be turned off) */}
        {effectEnabled && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="2"
              y1="2"
              x2="18"
              y2="18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-primary opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </svg>
        )}
      </div>
    </button>
  );
};

