import { useState, useEffect } from "react";
import {
  HelpCircle,
  Save,
  Trash2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  FileText,
} from "lucide-react";
import { faqService } from "@/services/faq.service";
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminLoadingState } from "@/components/Admin";

const AdminFAQEditor = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  // Form state
  const [heroData, setHeroData] = useState({ title: "", subtitle: "", description: "" });
  const [faqItems, setFaqItems] = useState<any[]>([]);
  const [metaEn, setMetaEn] = useState({ title: "", description: "", keywords: "" });
  const [metaAr, setMetaAr] = useState({ title: "", description: "", keywords: "" });

  const [saving, setSaving] = useState(false);
  
  // Original states
  const [originalHero, setOriginalHero] = useState<any>(null);
  const [originalItems, setOriginalItems] = useState<any>(null);
  const [originalMetaEn, setOriginalMetaEn] = useState<any>(null);
  const [originalMetaAr, setOriginalMetaAr] = useState<any>(null);

  // Changes detection
  const heroHasChanges = originalHero !== null && JSON.stringify(heroData) !== JSON.stringify(originalHero);
  const itemsHasChanges = originalItems !== null && JSON.stringify(faqItems) !== JSON.stringify(originalItems);
  const metaEnHasChanges = originalMetaEn !== null && JSON.stringify(metaEn) !== JSON.stringify(originalMetaEn);
  const metaArHasChanges = originalMetaAr !== null && JSON.stringify(metaAr) !== JSON.stringify(originalMetaAr);

  const hasAnyChanges = heroHasChanges || itemsHasChanges || metaEnHasChanges || metaArHasChanges;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [res] = await Promise.all([
          faqService.getFAQData(),
        ]);

        const hero = { title: res.hero?.title || "", subtitle: res.hero?.subtitle || "", description: res.hero?.description || "" };
        setHeroData(hero);
        setOriginalHero(JSON.parse(JSON.stringify(hero)));

        const items = (res.items || []).map((i: any) => ({ ...i, id: i.id || Date.now() + Math.random() }));
        setFaqItems(items);
        setOriginalItems(JSON.parse(JSON.stringify(items)));

        try {
          const [mEn, mAr] = await Promise.all([
            faqService.getFAQMeta("en"),
            faqService.getFAQMeta("ar")
          ]);
          if (mEn) {
            const data = { title: mEn.title || "", description: mEn.description || "", keywords: (mEn.keywords || []).join(", ") };
            setMetaEn(data);
            setOriginalMetaEn(JSON.parse(JSON.stringify(data)));
          }
          if (mAr) {
            const data = { title: mAr.title || "", description: mAr.description || "", keywords: (mAr.keywords || []).join(", ") };
            setMetaAr(data);
            setOriginalMetaAr(JSON.parse(JSON.stringify(data)));
          }
        } catch (e) { /* ignore */ }

      } catch (err) { setError("Failed to fetch FAQ data"); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleSaveHero = async () => {
    try { setSaving(true); await faqService.updateFAQHero(heroData); setOriginalHero(JSON.parse(JSON.stringify(heroData))); setSaveMessage("Hero saved!"); } catch (e) { setError("Failed to save hero"); } finally { setSaving(false); }
  };
  const handleSaveItems = async () => {
    try { setSaving(true); await faqService.updateFAQItems({ items: faqItems }); setOriginalItems(JSON.parse(JSON.stringify(faqItems))); setSaveMessage("FAQ items saved!"); } catch (e) { setError("Failed to save items"); } finally { setSaving(false); }
  };
  const handleSaveMetaEn = async () => {
    try { setSaving(true); await faqService.updateFAQMeta({ ...metaEn, keywords: metaEn.keywords.split(",").map(k => k.trim()).filter(k => k !== ""), locale: "en" }); setOriginalMetaEn(JSON.parse(JSON.stringify(metaEn))); setSaveMessage("Meta (EN) saved!"); } catch (e) { setError("Failed to save meta (EN)"); } finally { setSaving(false); }
  };
  const handleSaveMetaAr = async () => {
    try { setSaving(true); await faqService.updateFAQMeta({ ...metaAr, keywords: metaAr.keywords.split(",").map(k => k.trim()).filter(k => k !== ""), locale: "ar" }); setOriginalMetaAr(JSON.parse(JSON.stringify(metaAr))); setSaveMessage("Meta (AR) saved!"); } catch (e) { setError("Failed to save meta (AR)"); } finally { setSaving(false); }
  };

  const handleSaveAll = async () => {
    const p = [];
    if (heroHasChanges) p.push(handleSaveHero());
    if (itemsHasChanges) p.push(handleSaveItems());
    if (metaEnHasChanges) p.push(handleSaveMetaEn());
    if (metaArHasChanges) p.push(handleSaveMetaAr());
    await Promise.all(p);
    setSaveMessage("All changes saved!");
  };

  const addItem = () => setFaqItems([...faqItems, { id: Date.now(), question: "", answer: "" }]);
  const moveItem = (idx: number, dir: "up" | "down") => { const nIdx = dir === "up" ? idx - 1 : idx + 1; if (nIdx < 0 || nIdx >= faqItems.length) return; const nI = [...faqItems]; [nI[idx], nI[nIdx]] = [nI[nIdx], nI[idx]]; setFaqItems(nI); };

  if (loading) return <AdminLoadingState message="Loading FAQ settings..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><HelpCircle className="w-6 h-6 text-primary" /></div><div><h1 className="text-2xl font-bold">FAQ Page Editor</h1><p className="text-sm text-muted-foreground">Manage frequently asked questions</p></div></div>
      {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">{error}</div>}

      <AdminCard>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Hero</h2></div>{heroHasChanges && <AdminButton onClick={handleSaveHero} loading={saving} size="sm" variant="secondary">Save Hero</AdminButton>}</div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput label="Title" value={heroData.title} onChange={(e) => setHeroData({ ...heroData, title: e.target.value })} />
            <AdminInput label="Subtitle" value={heroData.subtitle} onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })} />
          </div>
          <AdminTextarea label="Description" value={heroData.description} onChange={(e) => setHeroData({ ...heroData, description: e.target.value })} rows={3} />
        </div>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><HelpCircle className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">FAQ Items</h2></div><div className="flex gap-2">{itemsHasChanges && <AdminButton onClick={handleSaveItems} loading={saving} size="sm" variant="secondary">Save Items</AdminButton>}<AdminButton onClick={addItem} variant="outline" size="sm">Add Item</AdminButton></div></div>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div key={item.id} className="p-4 bg-secondary/30 rounded-lg space-y-4">
              <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">Item #{i + 1}</span><div className="flex gap-1"><button onClick={() => moveItem(i, "up")} disabled={i === 0}><ChevronUp className="w-4 h-4" /></button><button onClick={() => moveItem(i, "down")} disabled={i === faqItems.length - 1}><ChevronDown className="w-4 h-4" /></button><button onClick={() => setFaqItems(faqItems.filter(x => x.id !== item.id))} className="text-destructive"><Trash2 className="w-4 h-4" /></button></div></div>
              <AdminInput label="Question" value={item.question} onChange={(e) => setFaqItems(faqItems.map(x => x.id === item.id ? { ...x, question: e.target.value } : x))} />
              <AdminTextarea label="Answer" value={item.answer} onChange={(e) => setFaqItems(faqItems.map(x => x.id === item.id ? { ...x, answer: e.target.value } : x))} rows={3} />
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center gap-3 mb-6"><FileText className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">SEO Meta</h2></div>
        <div className="space-y-6">
          <div><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">English</h3>{metaEnHasChanges && <AdminButton onClick={handleSaveMetaEn} loading={saving} size="sm" variant="secondary">Save EN</AdminButton>}</div><div className="space-y-4 pl-4 border-l-2 border-border"><AdminInput label="Title" value={metaEn.title} onChange={(e) => setMetaEn({ ...metaEn, title: e.target.value })} /><AdminTextarea label="Desc" value={metaEn.description} onChange={(e) => setMetaEn({ ...metaEn, description: e.target.value })} /><AdminInput label="Keywords" value={metaEn.keywords} onChange={(e) => setMetaEn({ ...metaEn, keywords: e.target.value })} /></div></div>
          <div><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">Arabic</h3>{metaArHasChanges && <AdminButton onClick={handleSaveMetaAr} loading={saving} size="sm" variant="secondary">Save AR</AdminButton>}</div><div className="space-y-4 pl-4 border-l-2 border-border"><AdminInput label="Title" value={metaAr.title} onChange={(e) => setMetaAr({ ...metaAr, title: e.target.value })} /><AdminTextarea label="Desc" value={metaAr.description} onChange={(e) => setMetaAr({ ...metaAr, description: e.target.value })} /><AdminInput label="Keywords" value={metaAr.keywords} onChange={(e) => setMetaAr({ ...metaAr, keywords: e.target.value })} /></div></div>
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

export default AdminFAQEditor;
