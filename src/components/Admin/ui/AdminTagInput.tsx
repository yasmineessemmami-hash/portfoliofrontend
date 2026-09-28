import { Plus } from "lucide-react";
import { AdminButton, AdminInput } from "@/components/Admin";

interface AdminTagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  label?: string;
}

export const AdminTagInput = ({
  tags,
  onAdd,
  onRemove,
  placeholder = "Add tag...",
  label = "Tags",
}: AdminTagInputProps) => {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
          >
            {tag}
            <AdminButton
              onClick={() => onRemove(index)}
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-primary hover:text-destructive"
            >
              ×
            </AdminButton>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <AdminInput
          type="text"
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const value = e.currentTarget.value.trim();
              if (value) {
                onAdd(value);
                e.currentTarget.value = "";
              }
            }
          }}
          className="flex-1"
        />
        <AdminButton
          onClick={() => {
            const inputElement = document.activeElement as HTMLInputElement;
            if (inputElement && inputElement.value.trim()) {
              onAdd(inputElement.value.trim());
              inputElement.value = "";
            }
          }}
          variant="secondary"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </AdminButton>
      </div>
    </div>
  );
};

