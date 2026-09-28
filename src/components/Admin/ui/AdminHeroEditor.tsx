import { Sparkles } from "lucide-react";
import { AdminCard, AdminInput } from "@/components/Admin";

interface AdminHeroEditorProps {
  title: string;
  subtitle: string;
  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
}

export const AdminHeroEditor = ({
  title,
  subtitle,
  onTitleChange,
  onSubtitleChange,
}: AdminHeroEditorProps) => {
  return (
    <AdminCard>
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground font-['Sora']">
          Hero
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminInput
          label="Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        <AdminInput
          label="Subtitle"
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
        />
      </div>
    </AdminCard>
  );
};

