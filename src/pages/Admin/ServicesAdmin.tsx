import { useState, useEffect, useRef, useCallback } from "react";
import {
  Briefcase,
  Save,
  Plus,
  Trash2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Star,
  Package,
  FileCode,
} from "lucide-react";
import { servicesService } from "@/services/services.service";
import { iconService } from "@/services/icon.service";
import type { Icon } from "@/services/icon.service";
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminLoadingState } from "@/components/Admin";
import { AdminIconSelect } from "@/components/Admin/ui/AdminIconSelect";

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

const AdminServicesEditor = () => {
  const [iconOptions, setIconOptions] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const hasFetchedRef = useRef(false);

  // Form state
  const [heroData, setHeroData] = useState({ title: "", subtitle: "", description: "" });
  const [services, setServices] = useState<any[]>([]);
  const [whyChooseMe, setWhyChooseMe] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [metaEn, setMetaEn] = useState({ title: "", description: "" });
  const [metaAr, setMetaAr] = useState({ title: "", description: "" });
  const [metaEnKeywordsString, setMetaEnKeywordsString] = useState("");
  const [metaArKeywordsString, setMetaArKeywordsString] = useState("");
  const [featureInputs, setFeatureInputs] = useState<Record<number, string>>({});

  const [saving, setSaving] = useState(false);

  // Original states
  const [originalHero, setOriginalHero] = useState<string>("");
  const [originalServices, setOriginalServices] = useState<string>("");
  const [originalWhy, setOriginalWhy] = useState<string>("");
  const [originalDeliverables, setOriginalDeliverables] = useState<string>("");
  const [originalMetaEn, setOriginalMetaEn] = useState<string>("");
  const [originalMetaAr, setOriginalMetaAr] = useState<string>("");

  // Cleaners for comparison
  const cleanHero = useCallback((data: any) => normalize({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    description: data?.description || ""
  }), []);

  const cleanServices = useCallback((data: any[]) => normalize((data || []).map(s => ({
    title: s?.title || "",
    description: s?.description || "",
    icon_key: s?.icon_key || s?.key || "",
    color: s?.color || null,
    features: s?.features || []
  }))), []);

  const cleanWhy = useCallback((data: any[]) => normalize((data || []).map(w => ({
    title: w?.title || "",
    description: w?.description || "",
    icon_key: w?.icon_key || w?.key || ""
  }))), []);

  const cleanDeliverables = useCallback((data: any[]) => normalize((data || []).map(d => ({
    title: d?.title || "",
    description: d?.description || "",
    icon_key: d?.icon_key || d?.key || ""
  }))), []);

  const cleanMeta = useCallback((meta: any, kwString: string) => normalize({
    title: meta?.title || "",
    description: meta?.description || "",
    keywords: (kwString || "").split(",").map(k => k.trim()).filter(Boolean)
  }), []);

  // Changes detection
  const heroHasChanges = originalHero !== cleanHero(heroData);
  const servicesHasChanges = originalServices !== cleanServices(services);
  const whyHasChanges = originalWhy !== cleanWhy(whyChooseMe);
  const deliverablesHasChanges = originalDeliverables !== cleanDeliverables(deliverables);
  const metaEnHasChanges = originalMetaEn !== cleanMeta(metaEn, metaEnKeywordsString);
  const metaArHasChanges = originalMetaAr !== cleanMeta(metaAr, metaArKeywordsString);

  const hasAnyChanges = heroHasChanges || servicesHasChanges || whyHasChanges || deliverablesHasChanges || metaEnHasChanges || metaArHasChanges;

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
        setError(null);

        const [res, icons] = await Promise.all([
          servicesService.getServicesData(),
          iconService.getIcons(),
        ]);

        setIconOptions(icons);

        if (res) {
          // Hero mapping
          const h = {
            title: res.hero?.title || "",
            subtitle: res.hero?.subtitle || "",
            description: res.hero?.description || ""
          };
          setHeroData(h);
          setOriginalHero(cleanHero(h));

          // Services items mapping
          const srvs = (res.services || []).map((s: any, i: number) => ({
            ...s,
            id: s.id || i + 1,
            icon_key: s.icon_key || s.key || "icon-globe"
          }));
          setServices(srvs);
          setOriginalServices(cleanServices(srvs));

          // Why choose me mapping
          const whyItems = (res.why_choose_me || []).map((w: any, i: number) => ({
            ...w,
            id: w.id || i + 1000,
            icon_key: w.icon_key || w.key || "icon-zap"
          }));
          setWhyChooseMe(whyItems);
          setOriginalWhy(cleanWhy(whyItems));

          // Deliverables mapping
          const delivs = (res.deliverables || []).map((d: any, i: number) => ({
            ...d,
            id: d.id || i + 2000,
            icon_key: d.icon_key || d.key || "icon-package"
          }));
          setDeliverables(delivs);
          setOriginalDeliverables(cleanDeliverables(delivs));
        }

        // Fetch Meta
        try {
          const [mEn, mAr] = await Promise.all([
            servicesService.getServicesMeta("en"),
            servicesService.getServicesMeta("ar")
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
      } catch (err) {
        console.error("Fetch data error:", err);
        setError("Failed to load services data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cleanHero, cleanServices, cleanWhy, cleanDeliverables, cleanMeta]);

  // Save Handlers
  const handleSaveHero = async () => {
    try {
      setSaving(true);
      await servicesService.updateServicesHero(heroData);
      setOriginalHero(cleanHero(heroData));
      setSaveMessage("Hero saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save hero"); } finally { setSaving(false); }
  };

  const handleSaveItems = async () => {
    try {
      setSaving(true);
      await servicesService.updateServicesItems({
        services: services.map(({ title, description, icon_key, color, features }) => ({
          title, description, icon_key, color, features
        }))
      });
      setOriginalServices(cleanServices(services));
      setSaveMessage("Services saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save services"); } finally { setSaving(false); }
  };

  const handleSaveWhy = async () => {
    try {
      setSaving(true);
      await servicesService.updateWhyChooseMe({
        why_choose_me: whyChooseMe.map(({ title, description, icon_key }) => ({
          title, description, icon_key
        }))
      });
      setOriginalWhy(cleanWhy(whyChooseMe));
      setSaveMessage("Why Choose Me saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save why choose me"); } finally { setSaving(false); }
  };

  const handleSaveDelivs = async () => {
    try {
      setSaving(true);
      await servicesService.updateDeliverables({
        deliverables: deliverables.map(({ title, description, icon_key }) => ({
          title, description, icon_key
        }))
      });
      setOriginalDeliverables(cleanDeliverables(deliverables));
      setSaveMessage("Deliverables saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save deliverables"); } finally { setSaving(false); }
  };

  const handleSaveMetaEn = async () => {
    try {
      setSaving(true);
      const kw = metaEnKeywordsString.split(",").map(k => k.trim()).filter(Boolean);
      await servicesService.updateServicesMeta({ ...metaEn, keywords: kw, locale: "en" });
      setOriginalMetaEn(cleanMeta(metaEn, metaEnKeywordsString));
      setSaveMessage("Meta (EN) saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save meta (EN)"); } finally { setSaving(false); }
  };

  const handleSaveMetaAr = async () => {
    try {
      setSaving(true);
      const kw = metaArKeywordsString.split(",").map(k => k.trim()).filter(Boolean);
      await servicesService.updateServicesMeta({ ...metaAr, keywords: kw, locale: "ar" });
      setOriginalMetaAr(cleanMeta(metaAr, metaArKeywordsString));
      setSaveMessage("Meta (AR) saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save meta (AR)"); } finally { setSaving(false); }
  };

  const handleSaveAll = async () => {
    const p = [];
    if (heroHasChanges) p.push(handleSaveHero());
    if (servicesHasChanges) p.push(handleSaveItems());
    if (whyHasChanges) p.push(handleSaveWhy());
    if (deliverablesHasChanges) p.push(handleSaveDelivs());
    if (metaEnHasChanges) p.push(handleSaveMetaEn());
    if (metaArHasChanges) p.push(handleSaveMetaAr());
    await Promise.all(p);
    setSaveMessage("All changes saved!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const addService = () => {
    const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
    setServices([...services, { id: newId, icon_key: "icon-globe", title: "", description: "", features: [] }]);
  };

  const addWhyItem = () => {
    const newId = whyChooseMe.length > 0 ? Math.max(...whyChooseMe.map(w => w.id)) + 1 : 1000;
    setWhyChooseMe([...whyChooseMe, { id: newId, icon_key: "icon-zap", title: "", description: "" }]);
  };

  const addDeliverable = () => {
    const newId = deliverables.length > 0 ? Math.max(...deliverables.map(d => d.id)) + 1 : 2000;
    setDeliverables([...deliverables, { id: newId, icon_key: "icon-package", title: "", description: "" }]);
  };

  if (loading) return <AdminLoadingState message="Loading services settings..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Briefcase className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Services Page Editor</h1>
          <p className="text-sm text-muted-foreground">Manage services and deliverables</p>
        </div>
      </div>

      {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">{error}</div>}

      {/* Hero */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Hero Section</h2>
          </div>
          {heroHasChanges && <AdminButton onClick={handleSaveHero} loading={saving} size="sm" variant="secondary"><Save className="w-4 h-4 mr-2" />Save Hero</AdminButton>}
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput label="Title" value={heroData.title} onChange={(e) => setHeroData({ ...heroData, title: e.target.value })} />
            <AdminInput label="Subtitle" value={heroData.subtitle} onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })} />
          </div>
          <AdminTextarea label="Description" value={heroData.description} onChange={(e) => setHeroData({ ...heroData, description: e.target.value })} rows={2} />
        </div>
      </AdminCard>

      {/* Services */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Services Offered</h2>
          </div>
          <div className="flex gap-2">
            {servicesHasChanges && <AdminButton onClick={handleSaveItems} loading={saving} size="sm" variant="secondary">Save Services</AdminButton>}
            <AdminButton onClick={addService} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add Service</AdminButton>
          </div>
        </div>
        <div className="space-y-4">
          {services.map((s, i) => (
            <div key={s.id} className="p-4 bg-secondary/30 rounded-lg space-y-4 border border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Service #{i + 1}</span>
                <div className="flex gap-1">
                  <button onClick={() => { const ns = [...services];[ns[i], ns[i - 1]] = [ns[i - 1], ns[i]]; setServices(ns); }} disabled={i === 0} className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                  <button onClick={() => { const ns = [...services];[ns[i], ns[i + 1]] = [ns[i + 1], ns[i]]; setServices(ns); }} disabled={i === services.length - 1} className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                  <button onClick={() => setServices(services.filter(x => x.id !== s.id))} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminIconSelect label="Icon" value={s.icon_key} onChange={(v) => setServices(services.map(x => x.id === s.id ? { ...x, icon_key: v } : x))} options={iconOptions} />
                <AdminInput label="Service Title" value={s.title} onChange={(e) => setServices(services.map(x => x.id === s.id ? { ...x, title: e.target.value } : x))} />
              </div>
              <AdminTextarea label="Description" value={s.description} onChange={(e) => setServices(services.map(x => x.id === s.id ? { ...x, description: e.target.value } : x))} rows={2} />
              <div>
                <label className="text-sm font-medium mb-2 block">Key Features</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {s.features.map((f: string, fIdx: number) => (
                    <span key={fIdx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg flex items-center gap-1 border border-primary/20">
                      {f}
                      <button onClick={() => setServices(services.map(x => x.id === s.id ? { ...x, features: x.features.filter((_: any, k: number) => k !== fIdx) } : x))} className="hover:text-destructive transition-colors text-lg line-height-0">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <AdminInput
                    placeholder="Add a feature..."
                    className="flex-1"
                    value={featureInputs[s.id] || ""}
                    onChange={(e) => {
                      setFeatureInputs({ ...featureInputs, [s.id]: e.target.value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (featureInputs[s.id] || "").trim();
                        if (val) {
                          setServices(services.map(x => x.id === s.id ? { ...x, features: [...(x.features || []), val] } : x));
                          setFeatureInputs({ ...featureInputs, [s.id]: "" });
                        }
                      }
                    }}
                  />
                  <AdminButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const val = (featureInputs[s.id] || "").trim();
                      if (val) {
                        setServices(services.map(x => x.id === s.id ? { ...x, features: [...(x.features || []), val] } : x));
                        setFeatureInputs({ ...featureInputs, [s.id]: "" });
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

      {/* Why Choose Me */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Why Choose Me</h2>
          </div>
          <div className="flex gap-2">
            {whyHasChanges && <AdminButton onClick={handleSaveWhy} loading={saving} size="sm" variant="secondary">Save Why</AdminButton>}
            <AdminButton onClick={addWhyItem} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add Item</AdminButton>
          </div>
        </div>
        <div className="space-y-4">
          {whyChooseMe.map((w, i) => (
            <div key={w.id} className="p-4 bg-secondary/30 rounded-lg space-y-4 border border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Reason #{i + 1}</span>
                <div className="flex gap-1">
                  <button onClick={() => { const nW = [...whyChooseMe];[nW[i], nW[i - 1]] = [nW[i - 1], nW[i]]; setWhyChooseMe(nW); }} disabled={i === 0} className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                  <button onClick={() => { const nW = [...whyChooseMe];[nW[i], nW[i + 1]] = [nW[i + 1], nW[i]]; setWhyChooseMe(nW); }} disabled={i === whyChooseMe.length - 1} className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                  <button onClick={() => setWhyChooseMe(whyChooseMe.filter(x => x.id !== w.id))} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminIconSelect label="Icon" value={w.icon_key} onChange={(v) => setWhyChooseMe(whyChooseMe.map(x => x.id === w.id ? { ...x, icon_key: v } : x))} options={iconOptions} />
                <AdminInput label="Title" value={w.title} onChange={(e) => setWhyChooseMe(whyChooseMe.map(x => x.id === w.id ? { ...x, title: e.target.value } : x))} />
              </div>
              <AdminTextarea label="Description" value={w.description} onChange={(e) => setWhyChooseMe(whyChooseMe.map(x => x.id === w.id ? { ...x, description: e.target.value } : x))} rows={2} />
            </div>
          ))}
        </div>
      </AdminCard>

      {/* Deliverables */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Deliverables</h2>
          </div>
          <div className="flex gap-2">
            {deliverablesHasChanges && <AdminButton onClick={handleSaveDelivs} loading={saving} size="sm" variant="secondary">Save Deliverables</AdminButton>}
            <AdminButton onClick={addDeliverable} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add Item</AdminButton>
          </div>
        </div>
        <div className="space-y-4">
          {deliverables.map((d, i) => (
            <div key={d.id} className="p-4 bg-secondary/30 rounded-lg space-y-4 border border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Deliverable #{i + 1}</span>
                <div className="flex gap-1">
                  <button onClick={() => { const nD = [...deliverables];[nD[i], nD[i - 1]] = [nD[i - 1], nD[i]]; setDeliverables(nD); }} disabled={i === 0} className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                  <button onClick={() => { const nD = [...deliverables];[nD[i], nD[i + 1]] = [nD[i + 1], nD[i]]; setDeliverables(nD); }} disabled={i === deliverables.length - 1} className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                  <button onClick={() => setDeliverables(deliverables.filter(x => x.id !== d.id))} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminIconSelect label="Icon" value={d.icon_key} onChange={(v) => setDeliverables(deliverables.map(x => x.id === d.id ? { ...x, icon_key: v } : x))} options={iconOptions} />
                <AdminInput label="Title" value={d.title} onChange={(e) => setDeliverables(deliverables.map(x => x.id === d.id ? { ...x, title: e.target.value } : x))} />
              </div>
              <AdminTextarea label="Description" value={d.description} onChange={(e) => setDeliverables(deliverables.map(x => x.id === d.id ? { ...x, description: e.target.value } : x))} rows={2} />
            </div>
          ))}
        </div>
      </AdminCard>

      {/* SEO Meta */}
      <AdminCard>
        <div className="flex items-center gap-3 mb-6">
          <FileCode className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">SEO Meta</h2>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">English (EN)</h3>
              {metaEnHasChanges && <AdminButton onClick={handleSaveMetaEn} loading={saving} size="sm" variant="secondary">Save EN</AdminButton>}
            </div>
            <div className="space-y-4 pl-4 border-l-2 border-border">
              <AdminInput label="Title" value={metaEn.title} onChange={(e) => setMetaEn({ ...metaEn, title: e.target.value })} />
              <AdminTextarea label="Description" value={metaEn.description} onChange={(e) => setMetaEn({ ...metaEn, description: e.target.value })} rows={2} />
              <AdminInput label="Keywords" value={metaEnKeywordsString} onChange={(e) => setMetaEnKeywordsString(e.target.value)} placeholder="comma separated" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Arabic (AR)</h3>
              {metaArHasChanges && <AdminButton onClick={handleSaveMetaAr} loading={saving} size="sm" variant="secondary">Save AR</AdminButton>}
            </div>
            <div className="space-y-4 pl-4 border-l-2 border-border">
              <AdminInput label="Title" value={metaAr.title} onChange={(e) => setMetaAr({ ...metaAr, title: e.target.value })} />
              <AdminTextarea label="Description" value={metaAr.description} onChange={(e) => setMetaAr({ ...metaAr, description: e.target.value })} rows={2} />
              <AdminInput label="Keywords" value={metaArKeywordsString} onChange={(e) => setMetaArKeywordsString(e.target.value)} placeholder="comma separated" />
            </div>
          </div>
        </div>
      </AdminCard>

      {hasAnyChanges && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4 rounded-t-xl -mx-4 -mb-4 mt-6 flex flex-col items-center gap-2 z-50">
          {saveMessage && <div className="p-2 px-4 bg-success/10 border border-success/20 rounded-full text-success text-xs animate-fade-in">{saveMessage}</div>}
          <AdminButton onClick={handleSaveAll} disabled={saving} loading={saving} className="w-full max-w-md"><Save className="w-4 h-4 mr-2" />Save All Changes</AdminButton>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Unsaved changes detected</p>
        </div>
      )}
    </div>
  );
};

export default AdminServicesEditor;
