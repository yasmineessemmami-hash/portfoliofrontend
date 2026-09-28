import type { InputHTMLAttributes } from "react";

interface AdminToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const AdminToggle = ({
  label,
  description,
  className = "",
  ...props
}: AdminToggleProps) => {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          className="w-11 h-6 rounded-full appearance-none cursor-pointer bg-muted border border-border transition-colors relative checked:bg-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed before:content-[''] before:w-4 before:h-4 before:rounded-full before:bg-background before:absolute before:left-0.5 before:top-0.5 before:transition-transform before:duration-200 checked:before:translate-x-5"
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={props.id}
              className="block text-sm font-medium text-foreground cursor-pointer"
            >
              {label}
              {props.required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};

