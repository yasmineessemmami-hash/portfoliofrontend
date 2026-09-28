import { useState, useEffect, useRef, useCallback } from "react";
import {
  FolderKanban,
  Save,
  Plus,
  Trash2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  FileText,
  GripVertical,
  Upload,
  ExternalLink,
  Github,
  Mail,
} from "lucide-react";
import { projectsService } from "@/services/projects.service";
import { iconService } from "@/services/icon.service";
import {
  AdminCard,
  AdminButton,
  AdminInput,
  AdminTextarea,
  AdminToggle,
  AdminLoadingState,
} from "@/components/Admin";

// Helper: Normalize data for comparison by sorting object keys
const normalize = (val: any): string => {
  if (Array.isArray(val)) {
    return "[" + val.map(normalize).join(",") + "]";
  }
  if (val && typeof val === 'object') {
    return "{" + Object.keys(val).sort().map(k => 
      `"${k}":${normalize(val[k])}`
    ).join(",") + "}";
  }
  return JSON.stringify(val === undefined ? null : val);
};

const AdminProjectsEditor = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const hasFetchedRef = useRef(false);

  // Form state
  const [heroData, setHeroData] = useState({ title: "", subtitle: "", description: "" });
  const [projects, setProjects] = useState<any[]>([]);
  const [metaEn, setMetaEn] = useState({ title: "", description: "" });
  const [metaAr, setMetaAr] = useState({ title: "", description: "" });
  const [metaEnKeywordsString, setMetaEnKeywordsString] = useState("");
  const [metaArKeywordsString, setMetaArKeywordsString] = useState("");
  const [techInputs, setTechInputs] = useState<Record<number, string>>({});

  const [saving, setSaving] = useState(false);
  
  // Original states
  const [originalHero, setOriginalHero] = useState<string>("");
  const [originalProjects, setOriginalProjects] = useState<string>("");
  const [originalMetaEn, setOriginalMetaEn] = useState<string>("");
  const [originalMetaAr, setOriginalMetaAr] = useState<string>("");

  // Cleaners for comparison
  const cleanHero = useCallback((data: any) => normalize({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    description: data?.description || ""
  }), []);

  const cleanProjects = useCallback((data: any[]) => normalize((data || []).map(p => ({
    title: p?.title || "",
    description: p?.description || "",
    tech_stack: p?.tech_stack || [],
    image: p?.image || "",
    github_url: p?.github_url || null,
    live_url: p?.live_url || null,
    contact_email: p?.contact_email || null,
    is_featured: !!p?.is_featured
  }))), []);

  const cleanMeta = useCallback((meta: any, kwString: string) => normalize({
    title: meta?.title || "",
    description: meta?.description || "",
    keywords: (kwString || "").split(",").map(k => k.trim()).filter(Boolean)
  }), []);

  // Changes detection
  const heroHasChanges = originalHero !== cleanHero(heroData);
  const projectsHasChanges = originalProjects !== cleanProjects(projects);
  const metaEnHasChanges = originalMetaEn !== cleanMeta(metaEn, metaEnKeywordsString);
  const metaArHasChanges = originalMetaAr !== cleanMeta(metaAr, metaArKeywordsString);

  const hasAnyChanges = heroHasChanges || projectsHasChanges || metaEnHasChanges || metaArHasChanges;

  // Keywords parser
  const parseKeywords = (kw: any): string[] => {
    if (!kw) return [];
    if (Array.isArray(kw)) return kw;
    if (typeof kw === 'string') {
      try {
        const parsed = JSON.parse(kw);
        return Array.isArray(parsed) ? parsed : [kw];
      } catch (e) {
        return kw.split(',').map(k => k.trim()).filter(Boolean);
      }
    }
    return [];
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [res] = await Promise.all([
          projectsService.getProjects(),
          iconService.getIcons(), // Fetch icons but don't store them
        ]);

        if (res) {
          const hero = { title: res.hero?.title || "", subtitle: res.hero?.subtitle || "", description: res.hero?.description || "" };
          setHeroData(hero);
          setOriginalHero(cleanHero(hero));

          const prjs = (res.projects || []).map((p: any) => ({ 
            ...p, 
            tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
            is_featured: !!p.is_featured,
            contact_email: p.contact_email || ""
          }));
          setProjects(prjs);
          setOriginalProjects(cleanProjects(prjs));
        }

        try {
          const [mEn, mAr] = await Promise.all([
            projectsService.getProjectsMeta("en"),
            projectsService.getProjectsMeta("ar")
          ]);
          if (mEn) {
            const d = { title: mEn.title || "", description: mEn.description || "" };
            const kw = parseKeywords(mEn.keywords);
            const kwString = kw.join(", ");
            setMetaEn(d);
            setMetaEnKeywordsString(kwString);
            setOriginalMetaEn(cleanMeta(d, kwString));
          }
          if (mAr) {
            const d = { title: mAr.title || "", description: mAr.description || "" };
            const kw = parseKeywords(mAr.keywords);
            const kwString = kw.join(", ");
            setMetaAr(d);
            setMetaArKeywordsString(kwString);
            setOriginalMetaAr(cleanMeta(d, kwString));
          }
        } catch (e) { }

        hasFetchedRef.current = true;
      } catch (err) { setError("Failed to fetch projects data"); } finally { setLoading(false); }
    };
    fetchData();
  }, [cleanHero, cleanProjects, cleanMeta]);

  const handleSaveHero = async () => {
    try { 
      setSaving(true); 
      await projectsService.updateProjectsHero(heroData); 
      setOriginalHero(cleanHero(heroData)); 
      setSaveMessage("Hero saved!"); 
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save hero"); } finally { setSaving(false); }
  };

  const handleSaveProjects = async () => {
    // Basic validation: ensure all projects have an image
    const missingImages = projects.some(p => !p.image);
    if (missingImages) {
      setError("Each project must have an image before saving.");
      return;
    }

    try {
      setSaving(true);
      const updatedList = [];
      for (const [idx, p] of projects.entries()) {
        const payload = {
          ...p,
          sort_order: idx,
          id: (typeof p.id === 'number' && p.id < 1000000000) ? p.id : null,
          image_type: 'url' // Backend will convert base64 to URL
        };
        const res = await projectsService.updateProjectItem(payload);
        updatedList.push({ 
          ...res, 
          tech_stack: Array.isArray(res.tech_stack) ? res.tech_stack : [], 
          is_featured: !!res.is_featured,
          contact_email: res.contact_email || ""
        });
      }
      setProjects(updatedList);
      setOriginalProjects(cleanProjects(updatedList));
      setSaveMessage("Projects saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save projects"); } finally { setSaving(false); }
  };

  const handleSaveMetaEn = async () => {
    try { 
      setSaving(true); 
      const kw = metaEnKeywordsString.split(",").map(k => k.trim()).filter(Boolean);
      await projectsService.updateProjectsMeta({ ...metaEn, keywords: kw, locale: "en" }); 
      setOriginalMetaEn(cleanMeta(metaEn, metaEnKeywordsString)); 
      setSaveMessage("Meta (EN) saved!"); 
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save meta (EN)"); } finally { setSaving(false); }
  };

  const handleSaveMetaAr = async () => {
    try { 
      setSaving(true); 
      const kw = metaArKeywordsString.split(",").map(k => k.trim()).filter(Boolean);
      await projectsService.updateProjectsMeta({ ...metaAr, keywords: kw, locale: "ar" }); 
      setOriginalMetaAr(cleanMeta(metaAr, metaArKeywordsString)); 
      setSaveMessage("Meta (AR) saved!"); 
      setTimeout(() => setSaveMessage(""), 3000);
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

  const addProject = () => setProjects([...projects, { id: Date.now(), title: "", description: "", tech_stack: [], image: "", github_url: "", live_url: "", contact_email: "", is_featured: false }]);
  
  const handleImageUpload = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, image: reader.result as string } : p));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProject = async (id: number) => {
    if (id < 1000000000) await projectsService.deleteProjectItem(id);
    setProjects(projects.filter(p => p.id !== id));
  };
  
  const updateProject = (id: number, f: string, v: any) => setProjects(projects.map(p => p.id === id ? { ...p, [f]: v } : p));
  const addTech = (id: number, t: string) => { if (!t.trim()) return; setProjects(projects.map(p => p.id === id ? { ...p, tech_stack: [...p.tech_stack, t.trim()] } : p)); };
  const moveProject = (idx: number, dir: "up" | "down") => { const nIdx = dir === "up" ? idx - 1 : idx + 1; if (nIdx < 0 || nIdx >= projects.length) return; const nP = [...projects]; [nP[idx], nP[nIdx]] = [nP[nIdx], nP[idx]]; setProjects(nP); };

  if (loading) return <AdminLoadingState message="Loading projects settings..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><FolderKanban className="w-6 h-6 text-primary" /></div><div><h1 className="text-2xl font-bold">Projects Page Editor</h1><p className="text-sm text-muted-foreground">Manage projects</p></div></div>
      {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">{error}</div>}

      <AdminCard>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Hero</h2></div>{heroHasChanges && <AdminButton onClick={handleSaveHero} loading={saving} size="sm" variant="secondary"><Save className="w-4 h-4 mr-2" />Save Hero</AdminButton>}</div>
        <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><AdminInput label="Title" value={heroData.title} onChange={(e) => setHeroData({ ...heroData, title: e.target.value })} /><AdminInput label="Subtitle" value={heroData.subtitle} onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })} /></div><AdminTextarea label="Description" value={heroData.description} onChange={(e) => setHeroData({ ...heroData, description: e.target.value })} rows={2} /></div>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><FolderKanban className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Projects</h2></div><div className="flex gap-2">{projectsHasChanges && <AdminButton onClick={handleSaveProjects} loading={saving} size="sm" variant="secondary">Save Projects</AdminButton>}<AdminButton onClick={addProject} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add Project</AdminButton></div></div>
        <div className="space-y-10">
          {projects.map((p, i) => (
            <div key={p.id} className="p-6 bg-secondary/30 rounded-2xl space-y-6 border border-border/50 relative">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><GripVertical className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-bold text-primary uppercase tracking-widest">Project #{i + 1}</span></div>
                <div className="flex gap-1">
                  <button onClick={() => moveProject(i, "up")} disabled={i === 0} className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                  <button onClick={() => moveProject(i, "down")} disabled={i === projects.length - 1} className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                  <button onClick={() => removeProject(p.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {/* High-Fidelity Guest View Preview Style */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Image Section (Mirroring Guest View) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="group relative aspect-video rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-500 bg-card border-2 border-dashed border-border hover:border-primary/50">
                    {p.image ? (
                      <>
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Guest-style overlay icons */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {p.live_url && (
                            <div className="p-2 glass rounded-lg"><ExternalLink className="w-4 h-4 text-primary" /></div>
                          )}
                          {p.github_url && (
                            <div className="p-2 glass rounded-lg"><Github className="w-4 h-4 text-primary" /></div>
                          )}
                          {p.contact_email && (
                            <div className="p-2 glass rounded-lg"><Mail className="w-4 h-4 text-primary" /></div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
                        <Upload className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-[10px] uppercase font-bold text-destructive">Image Required</p>
                      </div>
                    )}
                    
                    <input 
                      type="file" 
                      id={`prj-img-${p.id}`} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(p.id, e)} 
                    />
                    <button 
                      onClick={() => document.getElementById(`prj-img-${p.id}`)?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      {p.image ? "Change Project Image" : "Upload Project Image"}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center italic">Guest view style preview (Auto-bakes to 16:9)</p>
                </div>

                {/* Info Section */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AdminInput label="Project Title" value={p.title} onChange={(e) => updateProject(p.id, "title", e.target.value)} />
                    <div className="flex items-center gap-4 pt-6"><label className="text-sm font-medium">Featured</label><AdminToggle checked={p.is_featured} onChange={(e) => updateProject(p.id, "is_featured", e.target.checked)} /></div>
                  </div>
                  <AdminTextarea label="Short Description" value={p.description} onChange={(e) => updateProject(p.id, "description", e.target.value)} rows={3} />
                </div>
              </div>

              {/* Links Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/30 pt-4">
                <AdminInput label="GitHub Repo (Optional)" value={p.github_url || ""} onChange={(e) => updateProject(p.id, "github_url", e.target.value)} placeholder="https://github.com/..." />
                <AdminInput label="Live Demo (Optional)" value={p.live_url || ""} onChange={(e) => updateProject(p.id, "live_url", e.target.value)} placeholder="https://..." />
                <AdminInput label="Contact / Inquiries" value={p.contact_email || ""} onChange={(e) => updateProject(p.id, "contact_email", e.target.value)} placeholder="mailto:you@example.com" />
              </div>

              {/* Tech Stack */}
              <div>
                <label className="text-sm font-medium mb-2 block">Technologies Used</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.tech_stack.map((t: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg flex items-center gap-1 border border-primary/20">
                      {t}
                      <button onClick={() => updateProject(p.id, "tech_stack", p.tech_stack.filter((_: any, k: number) => k !== idx))} className="hover:text-destructive transition-colors text-lg line-height-0">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <AdminInput 
                    placeholder="Add technology (Press Enter)..." 
                    value={techInputs[p.id] || ""}
                    onChange={(e) => {
                      setTechInputs({ ...techInputs, [p.id]: e.target.value });
                    }}
                    onKeyDown={(e) => { 
                      if (e.key === "Enter") { 
                        e.preventDefault(); 
                        const val = (techInputs[p.id] || "").trim();
                        if (val) {
                          addTech(p.id, val);
                          setTechInputs({ ...techInputs, [p.id]: "" });
                        }
                      } 
                    }} 
                  />
                  <AdminButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const val = (techInputs[p.id] || "").trim();
                      if (val) {
                        addTech(p.id, val);
                        setTechInputs({ ...techInputs, [p.id]: "" });
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center gap-3 mb-6"><FileText className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">SEO Meta</h2></div>
        <div className="space-y-6">
          <div><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">English</h3>{metaEnHasChanges && <AdminButton onClick={handleSaveMetaEn} loading={saving} size="sm" variant="secondary">Save EN</AdminButton>}</div><div className="space-y-4 pl-4 border-l-2 border-border"><AdminInput label="Title" value={metaEn.title} onChange={(e) => setMetaEn({ ...metaEn, title: e.target.value })} /><AdminTextarea label="Description" value={metaEn.description} onChange={(e) => setMetaEn({ ...metaEn, description: e.target.value })} /><AdminInput label="Keywords" value={metaEnKeywordsString} onChange={(e) => setMetaEnKeywordsString(e.target.value)} /></div></div>
          <div><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">Arabic</h3>{metaArHasChanges && <AdminButton onClick={handleSaveMetaAr} loading={saving} size="sm" variant="secondary">Save AR</AdminButton>}</div><div className="space-y-4 pl-4 border-l-2 border-border"><AdminInput label="Title" value={metaAr.title} onChange={(e) => setMetaAr({ ...metaAr, title: e.target.value })} /><AdminTextarea label="Description" value={metaAr.description} onChange={(e) => setMetaAr({ ...metaAr, description: e.target.value })} /><AdminInput label="Keywords" value={metaArKeywordsString} onChange={(e) => setMetaArKeywordsString(e.target.value)} /></div></div>
        </div>
      </AdminCard>

      {hasAnyChanges && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4 rounded-t-xl -mx-4 -mb-4 mt-6 flex flex-col items-center gap-2 z-50">
          {saveMessage && <div className="p-2 px-4 bg-success/10 border border-success/20 rounded-full text-success text-xs animate-fade-in">{saveMessage}</div>}
          <AdminButton onClick={handleSaveAll} disabled={saving} loading={saving} className="w-full max-w-md"><Save className="w-4 h-4 mr-2" />Save All Changes</AdminButton>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Unsaved changes detected</p>
        </div>
      )}
    </div>
  );
};

export default AdminProjectsEditor;
