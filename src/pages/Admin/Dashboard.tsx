import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Palette,
  Save,
  CheckCircle,
  AlertTriangle,
  FileText,
  Power,
} from "lucide-react";
import { commonService } from "@/services/common.service";
import type { CommonResponse } from "@/types/common.types";
import { AdminCard, AdminButton, AdminLoadingState } from "@/components/Admin";

const AdminDashboard = () => {
  const [data, setData] = useState<CommonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await commonService.getCommonData();
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = () => {
    setSaveMessage("Settings saved successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  if (loading) return <AdminLoadingState message="Loading dashboard..." />;

  if (error) {
    return (
      <AdminCard>
        <div className="flex flex-col items-center gap-4 text-center py-8">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Error loading dashboard
            </h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </AdminCard>
    );
  }

  if (!data) return null;

  const siteTheme = data.site?.theme || "Default";

  const overviewCards = [
    {
      icon: Power,
      label: "Site Mode",
      value: "Normal",
      status: "success",
    },
    {
      icon: FileText,
      label: "Pages Configured",
      value: "11",
      status: "info",
    },
    {
      icon: Palette,
      label: "Active Theme",
      value: siteTheme,
      status: "info",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <LayoutDashboard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-['Sora']">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of your portfolio configuration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-secondary">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                {card.status === "success" && <CheckCircle className="w-5 h-5 text-success" />}
                {card.status === "warning" && <AlertTriangle className="w-5 h-5 text-warning" />}
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-xl font-semibold text-foreground mt-1">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-4">
        {saveMessage && (
          <div className="flex items-center gap-2 text-success animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{saveMessage}</span>
          </div>
        )}
        <AdminButton onClick={handleSave}>
          <Save className="w-4 h-4" />
          Save Changes
        </AdminButton>
      </div>
    </div>
  );
};

export default AdminDashboard;
