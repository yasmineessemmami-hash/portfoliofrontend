import { Sparkles } from "lucide-react";
import { AdminCard, AdminInput, AdminTextarea } from "@/components/Admin";

interface MetaData {
  title: string;
  description: string;
  keywords: string;
}

interface AdminMetaEditorProps {
  title?: string;
  metaEn: MetaData;
  metaAr: MetaData;
  onMetaEnChange: (meta: MetaData) => void;
  onMetaArChange: (meta: MetaData) => void;
  enHelperText?: string;
  arHelperText?: string;
}

export const AdminMetaEditor = ({
  title = "SEO Meta Data",
  metaEn,
  metaAr,
  onMetaEnChange,
  onMetaArChange,
  enHelperText,
  arHelperText,
}: AdminMetaEditorProps) => {
  return (
    <AdminCard>
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground font-['Sora']">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* English Meta */}
        <div>
          <h3 className="text-md font-semibold text-foreground mb-3">
            English (EN)
          </h3>
          <div className="space-y-4">
            <AdminInput
              label="Meta Title"
              value={metaEn.title}
              onChange={(e) =>
                onMetaEnChange({ ...metaEn, title: e.target.value })
              }
            />
            <AdminTextarea
              label="Meta Description"
              value={metaEn.description}
              onChange={(e) =>
                onMetaEnChange({ ...metaEn, description: e.target.value })
              }
              rows={3}
            />
            <AdminInput
              label="Meta Keywords (comma-separated)"
              value={metaEn.keywords}
              onChange={(e) =>
                onMetaEnChange({ ...metaEn, keywords: e.target.value })
              }
              helperText={
                enHelperText ||
                "Separate keywords with commas (e.g., react, typescript, portfolio)"
              }
            />
          </div>
        </div>

        {/* Arabic Meta */}
        <div>
          <h3 className="text-md font-semibold text-foreground mb-3">
            Arabic (AR)
          </h3>
          <div className="space-y-4">
            <AdminInput
              label="Meta Title"
              value={metaAr.title}
              onChange={(e) =>
                onMetaArChange({ ...metaAr, title: e.target.value })
              }
            />
            <AdminTextarea
              label="Meta Description"
              value={metaAr.description}
              onChange={(e) =>
                onMetaArChange({ ...metaAr, description: e.target.value })
              }
              rows={3}
            />
            <AdminInput
              label="Meta Keywords (comma-separated)"
              value={metaAr.keywords}
              onChange={(e) =>
                onMetaArChange({ ...metaAr, keywords: e.target.value })
              }
              helperText={
                arHelperText ||
                "Separate keywords with commas (e.g., رياكت, تايبسكريبت, معرض أعمال)"
              }
            />
          </div>
        </div>
      </div>
    </AdminCard>
  );
};

