import { useState, useEffect } from "react";
import {
  Home,
  Save,
  Trash2,
  Sparkles,
  FileText,
  FolderKanban,
} from "lucide-react";
import { homeService } from "@/services/home.service";
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminToggle, AdminLoadingState } from "@/components/Admin";
import { AdminIconSelect } from "@/components/Admin/ui/AdminIconSelect";
import { iconService, type Icon } from "@/services/icon.service";

const AdminHomeEditor = () => {
  const [iconOptions, setIconOptions] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  // Form state
  const [heroData, setHeroData] = useState({
    status_text: "",
    status_active: false,
    full_name: "",
    role_title: "",
    headline: "",
    subheadline: "",
  });
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [metaEn, setMetaEn] = useState({ title: "", description: "" });
  const [metaAr, setMetaAr] = useState({ title: "", description: "" });
  const [metaEnKeywordsString, setMetaEnKeywordsString] = useState("");
  const [metaArKeywordsString, setMetaArKeywordsString] = useState("");

  // Original states for exact comparison
  const [originalHero, setOriginalHero] = useState<any>(null);
  const [originalProjects, setOriginalProjects] = useState<any>(null);
  const [originalMetaEn, setOriginalMetaEn] = useState<any>(null);
  const [originalMetaAr, setOriginalMetaAr] = useState<any>(null);

  const [saving, setSaving] = useState(false);

  // Helper to parse keywords
  const parseKeywords = (keywords: any): string[] => {
    if (Array.isArray(keywords)) return keywords;
    if (typeof keywords === 'string') {
      try {
        const parsed = JSON.parse(keywords);
        return Array.isArray(parsed) ? parsed : [keywords];
      } catch (e) {
        return keywords ? [keywords] : [];
      }
    }
    return [];
  };

  // Cleaning functions for comparison
  const cleanHero = (data: any) => ({
    status_text: data.status_text || "",
    status_active: !!data.status_active,
    full_name: data.full_name || "",
    role_title: data.role_title || "",
    headline: data.headline || "",
    subheadline: data.subheadline || "",
  });

  const cleanProjects = (data: any[]) => (data || []).map(({ title, description, image, image_type, icon_key, tech }) => ({
    title: title || "",
    description: description || "",
    image: image || "",
    image_type: image_type || "emoji",
    icon_key: icon_key || "",
    tech: tech || "",
  }));

  const cleanMeta = (meta: any, kwString: string) => ({
    title: meta.title || "",
    description: meta.description || "",
    keywords: kwString.split(",").map(k => k.trim()).filter(k => k !== "")
  });

  // Section Changes
  const heroHasChanges = originalHero
    ? JSON.stringify(cleanHero(heroData)) !== JSON.stringify(cleanHero(originalHero))
    : !!(heroData.status_text || heroData.full_name || heroData.role_title || heroData.headline || heroData.subheadline);
  const projectsHasChanges = originalProjects && JSON.stringify(cleanProjects(featuredProjects)) !== JSON.stringify(cleanProjects(originalProjects));
  const metaEnHasChanges = originalMetaEn && JSON.stringify(cleanMeta(metaEn, metaEnKeywordsString)) !== JSON.stringify(originalMetaEn);
  const metaArHasChanges = originalMetaAr && JSON.stringify(cleanMeta(metaAr, metaArKeywordsString)) !== JSON.stringify(originalMetaAr);

  const hasAnyChanges = heroHasChanges || projectsHasChanges || metaEnHasChanges || metaArHasChanges;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [homeRes, icons] = await Promise.all([
          homeService.getHomeData(),
          iconService.getIcons(),
        ]);

        setIconOptions(icons);

        if (homeRes?.home_hero) {
          const hero = cleanHero(homeRes.home_hero);
          setHeroData(hero);
          setOriginalHero(JSON.parse(JSON.stringify(hero)));
        }

        const prjs = (homeRes?.home_featured_projects || []).map((p: any) => ({
          id: p.id,
          title: p.title || "",
          description: p.description || "",
          image: p.image || "",
          image_type: p.image_type || "emoji",
          icon_key: p.icon_key || "",
          tech: p.tech || "",
        }));
        setFeaturedProjects(prjs);
        setOriginalProjects(JSON.parse(JSON.stringify(prjs)));

        try {
          const [mEn, mAr] = await Promise.all([
            homeService.getHomeMeta("en"),
            homeService.getHomeMeta("ar")
          ]);

          if (mEn) {
            const kw = parseKeywords(mEn.keywords);
            const data = { title: mEn.title || "", description: mEn.description || "" };
            setMetaEn(data);
            setMetaEnKeywordsString(kw.join(", "));
            setOriginalMetaEn(JSON.parse(JSON.stringify({ ...data, keywords: kw })));
          }
          if (mAr) {
            const kw = parseKeywords(mAr.keywords);
            const data = { title: mAr.title || "", description: mAr.description || "" };
            setMetaAr(data);
            setMetaArKeywordsString(kw.join(", "));
            setOriginalMetaAr(JSON.parse(JSON.stringify({ ...data, keywords: kw })));
          }
        } catch (e) { /* ignore */ }

      } catch (err) {
        setError("Failed to load home page data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Save Handlers
  const handleSaveHero = async () => {
    try {
      setSaving(true);
      await homeService.updateHomeHero(heroData);
      setOriginalHero(JSON.parse(JSON.stringify(cleanHero(heroData))));
      setSaveMessage("Hero saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) {
      setError("Failed to save hero");
    } finally {
      setSaving(false);
    }
  };
  const handleSaveProjects = async () => {
    try {
      setSaving(true);
      const updated = [];
      for (const [idx, p] of featuredProjects.entries()) {
        const res = await homeService.updateFeaturedProject({ ...p, sort_order: idx + 1, id: (p.id && p.id < 1000000) ? p.id : null });
        updated.push({ id: res.id, title: res.title, description: res.description, image: res.image, image_type: res.image_type, icon_key: res.icon_key, tech: res.tech });
      }
      setFeaturedProjects(updated);
      setOriginalProjects(JSON.parse(JSON.stringify(cleanProjects(updated))));
      setSaveMessage("Projects saved!");
    } catch (e) { setError("Failed to save projects"); } finally { setSaving(false); }
  };
  const handleSaveMetaEn = async () => {
    try {
      setSaving(true);
      const current = cleanMeta(metaEn, metaEnKeywordsString);
      await homeService.updateMetaPage("home", { ...current, locale: "en" });
      setOriginalMetaEn(JSON.parse(JSON.stringify(current)));
      setSaveMessage("Meta (EN) saved!");
    } catch (e) { setError("Failed to save meta (EN)"); } finally { setSaving(false); }
  };
  const handleSaveMetaAr = async () => {
    try {
      setSaving(true);
      const current = cleanMeta(metaAr, metaArKeywordsString);
      await homeService.updateMetaPage("home", { ...current, locale: "ar" });
      setOriginalMetaAr(JSON.parse(JSON.stringify(current)));
      setSaveMessage("Meta (AR) saved!");
    } catch (e) { setError("Failed to save meta (AR)"); } finally { setSaving(false); }
  };

  const handleSaveAll = async () => {
    const p = [];
    if (heroHasChanges) p.push(handleSaveHero());
    if (projectsHasChanges) p.push(handleSaveProjects());
    if (metaEnHasChanges) p.push(handleSaveMetaEn());
    if (metaArHasChanges) p.push(handleSaveMetaAr());
    await Promise.all(p);
    setSaveMessage("All changes saved!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  if (loading) return <AdminLoadingState message="Loading home settings..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Home className="w-6 h-6 text-primary" /></div><div><h1 className="text-2xl font-bold">Home Page Editor</h1><p className="text-sm text-muted-foreground">Manage Hero, Projects, and SEO</p></div></div>
      {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">{error}</div>}

      <AdminCard>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Hero</h2></div>{heroHasChanges && <AdminButton onClick={handleSaveHero} loading={saving} size="sm" variant="secondary">Save Hero</AdminButton>}</div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><AdminInput label="Status Badge" value={heroData.status_text} onChange={(e) => setHeroData({ ...heroData, status_text: e.target.value })} /><div className="flex items-center gap-4 pt-6"><label className="text-sm font-medium">Active</label><AdminToggle checked={heroData.status_active} onChange={(e) => setHeroData({ ...heroData, status_active: e.target.checked })} /></div></div>
          <AdminInput label="Full Name" value={heroData.full_name} onChange={(e) => setHeroData({ ...heroData, full_name: e.target.value })} /><AdminInput label="Role" value={heroData.role_title} onChange={(e) => setHeroData({ ...heroData, role_title: e.target.value })} /><AdminInput label="Headline" value={heroData.headline} onChange={(e) => setHeroData({ ...heroData, headline: e.target.value })} /><AdminTextarea label="Subheadline" value={heroData.subheadline} onChange={(e) => setHeroData({ ...heroData, subheadline: e.target.value })} rows={3} />
        </div>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Featured Projects</h2>
          </div>
          <div className="flex gap-2">
            {projectsHasChanges && <AdminButton onClick={handleSaveProjects} loading={saving} size="sm" variant="secondary">Save Projects</AdminButton>}
            <AdminButton onClick={() => setFeaturedProjects([...featuredProjects, { id: Date.now(), title: "", description: "", image: "", image_type: "emoji", icon_key: "", tech: "" }])} variant="outline" size="sm">Add Project</AdminButton>
          </div>
        </div>
        <div className="space-y-4">
          {featuredProjects.map((p, idx) => (
            <div key={p.id} className="p-4 bg-secondary/30 rounded-lg space-y-4">
              <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">Project #{idx + 1}</span><button onClick={async () => { if (p.id < 1000000) await homeService.deleteFeaturedProject(p.id); setFeaturedProjects(featuredProjects.filter(x => x.id !== p.id)); }} className="text-destructive"><Trash2 className="w-4 h-4" /></button></div>
              <AdminInput label="Title" value={p.title} onChange={(e) => setFeaturedProjects(featuredProjects.map(x => x.id === p.id ? { ...x, title: e.target.value } : x))} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-2 block">Image Type</label><select value={p.image_type} onChange={(e) => setFeaturedProjects(featuredProjects.map(x => x.id === p.id ? { ...x, image_type: e.target.value } : x))} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"><option value="emoji">Emoji</option><option value="url">URL</option><option value="icon">Icon</option></select></div>
                {p.image_type === 'icon' ? <AdminIconSelect label="Icon" value={p.icon_key || ""} onChange={(v) => setFeaturedProjects(featuredProjects.map(x => x.id === p.id ? { ...x, icon_key: v } : x))} options={iconOptions} /> : <AdminInput label={p.image_type === 'emoji' ? "Emoji" : "URL"} value={p.image} onChange={(e) => setFeaturedProjects(featuredProjects.map(x => x.id === p.id ? { ...x, image: e.target.value } : x))} />}
              </div>
              <AdminTextarea label="Desc" value={p.description} onChange={(e) => setFeaturedProjects(featuredProjects.map(x => x.id === p.id ? { ...x, description: e.target.value } : x))} rows={2} /><AdminInput label="Tech" value={p.tech} onChange={(e) => setFeaturedProjects(featuredProjects.map(x => x.id === p.id ? { ...x, tech: e.target.value } : x))} />
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center gap-3 mb-6"><FileText className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">SEO Meta</h2></div>
        <div className="space-y-6">
          <div><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">English</h3>{metaEnHasChanges && <AdminButton onClick={handleSaveMetaEn} loading={saving} size="sm" variant="secondary">Save EN</AdminButton>}</div><div className="space-y-4 pl-4 border-l-2 border-border"><AdminInput label="Title" value={metaEn.title} onChange={(e) => setMetaEn({ ...metaEn, title: e.target.value })} /><AdminTextarea label="Desc" value={metaEn.description} onChange={(e) => setMetaEn({ ...metaEn, description: e.target.value })} /><AdminInput label="Keywords" value={metaEnKeywordsString} onChange={(e) => setMetaEnKeywordsString(e.target.value)} /></div></div>
          <div><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">Arabic</h3>{metaArHasChanges && <AdminButton onClick={handleSaveMetaAr} loading={saving} size="sm" variant="secondary">Save AR</AdminButton>}</div><div className="space-y-4 pl-4 border-l-2 border-border"><AdminInput label="Title" value={metaAr.title} onChange={(e) => setMetaAr({ ...metaAr, title: e.target.value })} /><AdminTextarea label="Desc" value={metaAr.description} onChange={(e) => setMetaAr({ ...metaAr, description: e.target.value })} /><AdminInput label="Keywords" value={metaArKeywordsString} onChange={(e) => setMetaArKeywordsString(e.target.value)} /></div></div>
        </div>
      </AdminCard>

      {hasAnyChanges && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4 rounded-t-xl -mx-4 -mb-4 mt-6 flex flex-col items-center gap-2">
          {saveMessage && <div className="p-2 px-4 bg-success/10 border border-success/20 rounded-full text-success text-xs">{saveMessage}</div>}
          <AdminButton onClick={handleSaveAll} disabled={saving} loading={saving} className="w-full max-w-md"><Save className="w-4 h-4 mr-2" />Save All Changes</AdminButton>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Unsaved changes detected</p>
        </div>
      )}
    </div>
  );
};

export default AdminHomeEditor;
