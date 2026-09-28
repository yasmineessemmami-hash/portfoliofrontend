import { Save, CheckCircle } from "lucide-react";
import { AdminButton } from "./AdminButton";

interface AdminSaveButtonProps {
  onSave: () => void;
  saveMessage?: string;
  loading?: boolean;
}

export const AdminSaveButton = ({
  onSave,
  saveMessage,
  loading = false,
}: AdminSaveButtonProps) => {
  return (
    <div className="flex items-center justify-end gap-4">
      {saveMessage && (
        <div className="flex items-center gap-2 text-success animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">{saveMessage}</span>
        </div>
      )}
      <AdminButton onClick={onSave} loading={loading}>
        <Save className="w-4 h-4" />
        Save Changes
      </AdminButton>
    </div>
  );
};

