import { useState, useEffect } from "react";
import {
  Mail,
  Save,
  Trash2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  FileText,
  Globe,
} from "lucide-react";
import { contactService } from "@/services/contact.service";
import { iconService } from "@/services/icon.service";
import { socialService } from "@/services/social.service";
import type { Icon } from "@/services/icon.service";
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminLoadingState } from "@/components/Admin";
import { AdminIconSelect } from "@/components/Admin/ui/AdminIconSelect";
import { AdminSelectWithIcons } from "@/components/Admin/ui/AdminSelectWithIcons";
import { resolveIcon } from "@/components/icons/IconResolver";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";

const AdminContactEditor = () => {
  const [iconOptions, setIconOptions] = useState<Icon[]>([]);
  const [platformOptions, setPlatformOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  // Form state
  const [heroData, setHeroData] = useState({ title: "", subtitle: "", description: "" });
  const [contactInfos, setContactInfos] = useState<any[]>([]);
  const [contactSocialLinks, setContactSocialLinks] = useState<any[]>([]);
  const [metaEn, setMetaEn] = useState({ title: "", description: "", keywords: "" });
  const [metaAr, setMetaAr] = useState({ title: "", description: "", keywords: "" });

  const [saving, setSaving] = useState(false);
  
  // Original states
  const [originalHero, setOriginalHero] = useState<any>(null);
  const [originalInfos, setOriginalInfos] = useState<any>(null);
  const [originalSocialLinks, setOriginalSocialLinks] = useState<any>(null);
  const [originalMetaEn, setOriginalMetaEn] = useState<any>(null);
  const [originalMetaAr, setOriginalMetaAr] = useState<any>(null);

  // Changes detection
  const heroHasChanges = originalHero !== null && JSON.stringify(heroData) !== JSON.stringify(originalHero);
  const infosHasChanges = originalInfos !== null && JSON.stringify(contactInfos) !== JSON.stringify(originalInfos);
  const socialLinksHasChanges = originalSocialLinks !== null && JSON.stringify(contactSocialLinks) !== JSON.stringify(originalSocialLinks);
  const metaEnHasChanges = originalMetaEn !== null && JSON.stringify(metaEn) !== JSON.stringify(originalMetaEn);
  const metaArHasChanges = originalMetaAr !== null && JSON.stringify(metaAr) !== JSON.stringify(originalMetaAr);

  const hasAnyChanges = heroHasChanges || infosHasChanges || socialLinksHasChanges || metaEnHasChanges || metaArHasChanges;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [res, icons, platforms] = await Promise.all([
          contactService.getContactData(),
          iconService.getIcons(),
          socialService.getSocialPlatforms(),
        ]);

        setIconOptions(icons || []);
        setPlatformOptions(platforms.map(p => ({ value: p.key, label: p.name, icon: p.key })));

        const hero = { title: res.hero?.title || "", subtitle: res.hero?.subtitle || "", description: res.hero?.description || "" };
        setHeroData(hero);
        setOriginalHero(JSON.parse(JSON.stringify(hero)));

        const infos = ((res as any).contact_info || (res as any).infos || []).map((i: any) => ({ ...i, id: i.id || Date.now() + Math.random(), icon_type: i.icon_type || "general" }));
        setContactInfos(infos);
        setOriginalInfos(JSON.parse(JSON.stringify(infos)));

        const socialLinks = (res.social_links || []).map((l: any) => ({ ...l, id: l.id || Date.now() + Math.random() }));
        setContactSocialLinks(socialLinks);
        setOriginalSocialLinks(JSON.parse(JSON.stringify(socialLinks)));

        // Fetch meta data for both locales
        try {
          const [mEn, mAr] = await Promise.all([
            contactService.getContactMeta("en"),
            contactService.getContactMeta("ar")
          ]);
          
          if (mEn) {
            const data = { title: mEn.title || "", description: mEn.description || "", keywords: (mEn.keywords || []).join(", ") };
            setMetaEn(data);
            setOriginalMetaEn(JSON.parse(JSON.stringify(data)));
          } else {
            const defaultMetaEn = { title: "", description: "", keywords: "" };
            setMetaEn(defaultMetaEn);
            setOriginalMetaEn(JSON.parse(JSON.stringify(defaultMetaEn)));
          }
          
          if (mAr) {
            const data = { title: mAr.title || "", description: mAr.description || "", keywords: (mAr.keywords || []).join(", ") };
            setMetaAr(data);
            setOriginalMetaAr(JSON.parse(JSON.stringify(data)));
          } else {
            const defaultMetaAr = { title: "", description: "", keywords: "" };
            setMetaAr(defaultMetaAr);
            setOriginalMetaAr(JSON.parse(JSON.stringify(defaultMetaAr)));
          }
        } catch (e) {
          // If meta fetch fails, set defaults
          const defaultMetaEn = { title: "", description: "", keywords: "" };
          const defaultMetaAr = { title: "", description: "", keywords: "" };
          setMetaEn(defaultMetaEn);
          setOriginalMetaEn(JSON.parse(JSON.stringify(defaultMetaEn)));
          setMetaAr(defaultMetaAr);
          setOriginalMetaAr(JSON.parse(JSON.stringify(defaultMetaAr)));
        }
      } catch (err) { setError("Failed to fetch contact data"); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Save Handlers
  const handleSaveHero = async () => {
    try { setSaving(true); await contactService.updateContactHero(heroData); setOriginalHero(JSON.parse(JSON.stringify(heroData))); setSaveMessage("Hero saved!"); } catch (e) { setError("Failed to save hero"); } finally { setSaving(false); }
  };
  const handleSaveInfos = async () => {
    try { setSaving(true); await contactService.updateContactInfos({ infos: contactInfos }); setOriginalInfos(JSON.parse(JSON.stringify(contactInfos))); setSaveMessage("Infos saved!"); } catch (e) { setError("Failed to save infos"); } finally { setSaving(false); }
  };
  const handleSaveSocialLinks = async () => {
    try { setSaving(true); await contactService.updateContactSocialLinks({ links: contactSocialLinks }); setOriginalSocialLinks(JSON.parse(JSON.stringify(contactSocialLinks))); setSaveMessage("Social links saved!"); } catch (e) { setError("Failed to save social links"); } finally { setSaving(false); }
  };
  const handleSaveMetaEn = async () => {
    try { setSaving(true); await contactService.updateContactMeta({ ...metaEn, keywords: metaEn.keywords.split(",").map(k => k.trim()).filter(k => k !== ""), locale: "en" }); setOriginalMetaEn(JSON.parse(JSON.stringify(metaEn))); setSaveMessage("Meta (EN) saved!"); } catch (e) { setError("Failed to save meta (EN)"); } finally { setSaving(false); }
  };
  const handleSaveMetaAr = async () => {
    try { setSaving(true); await contactService.updateContactMeta({ ...metaAr, keywords: metaAr.keywords.split(",").map(k => k.trim()).filter(k => k !== ""), locale: "ar" }); setOriginalMetaAr(JSON.parse(JSON.stringify(metaAr))); setSaveMessage("Meta (AR) saved!"); } catch (e) { setError("Failed to save meta (AR)"); } finally { setSaving(false); }
  };

  const handleSaveAll = async () => {
    const p = [];
    if (heroHasChanges) p.push(handleSaveHero());
    if (infosHasChanges) p.push(handleSaveInfos());
    if (socialLinksHasChanges) p.push(handleSaveSocialLinks());
    if (metaEnHasChanges) p.push(handleSaveMetaEn());
    if (metaArHasChanges) p.push(handleSaveMetaAr());
    await Promise.all(p);
    setSaveMessage("All changes saved!");
  };

  // UI Handlers
  const addInfo = () => setContactInfos([...contactInfos, { id: Date.now(), label: "", value: "", icon_key: "", icon_type: "general", type: "text" }]);
  const updateInfo = (id: number, f: string, v: any) => setContactInfos(contactInfos.map(i => i.id === id ? { ...i, [f]: v } : i));
  const moveInfo = (idx: number, dir: "up" | "down") => { const nIdx = dir === "up" ? idx - 1 : idx + 1; if (nIdx < 0 || nIdx >= contactInfos.length) return; const nI = [...contactInfos]; [nI[idx], nI[nIdx]] = [nI[nIdx], nI[idx]]; setContactInfos(nI); };
  const addSocialLink = () => setContactSocialLinks([...contactSocialLinks, { id: Date.now(), label: "", url: "", icon_key: "" }]);
  const updateSocialLink = (id: number, f: string, v: any) => setContactSocialLinks(contactSocialLinks.map(l => l.id === id ? { ...l, [f]: v } : l));
  const moveSocialLink = (idx: number, dir: "up" | "down") => { const nIdx = dir === "up" ? idx - 1 : idx + 1; if (nIdx < 0 || nIdx >= contactSocialLinks.length) return; const nL = [...contactSocialLinks]; [nL[idx], nL[nIdx]] = [nL[nIdx], nL[idx]]; setContactSocialLinks(nL); };

  if (loading) return <AdminLoadingState message="Loading contact page data..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Mail className="w-6 h-6 text-primary" /></div><div><h1 className="text-2xl font-bold">Contact Page Editor</h1><p className="text-sm text-muted-foreground">Manage contact information</p></div></div>
        <Link to="/admin/contact/submissions" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <MailCheck className="w-4 h-4" />
          View Submissions
        </Link>
      </div>
      {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">{error}</div>}

      <AdminCard>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Hero</h2></div>{heroHasChanges && <AdminButton onClick={handleSaveHero} loading={saving} size="sm" variant="secondary">Save Hero</AdminButton>}</div>
        <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><AdminInput label="Title" value={heroData.title} onChange={(e) => setHeroData({ ...heroData, title: e.target.value })} /><AdminInput label="Subtitle" value={heroData.subtitle} onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })} /></div><AdminTextarea label="Description" value={heroData.description} onChange={(e) => setHeroData({ ...heroData, description: e.target.value })} rows={2} /></div>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><Globe className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Contact Items</h2></div><div className="flex gap-2">{infosHasChanges && <AdminButton onClick={handleSaveInfos} loading={saving} size="sm" variant="secondary">Save Infos</AdminButton>}<AdminButton onClick={addInfo} variant="outline" size="sm">Add Info</AdminButton></div></div>
        <div className="space-y-4">
          {contactInfos.map((info, i) => {
            const IconComponent = info.icon_key ? resolveIcon(info.icon_key) : null;
            return (
              <div key={info.id} className="p-4 bg-secondary/30 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Item #{i + 1}</span>
                    {IconComponent && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    {info.label && (
                      <span className="text-sm font-medium text-foreground">{info.label}</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => moveInfo(i, "up")} disabled={i === 0}><ChevronUp className="w-4 h-4" /></button>
                    <button onClick={() => moveInfo(i, "down")} disabled={i === contactInfos.length - 1}><ChevronDown className="w-4 h-4" /></button>
                    <button onClick={() => setContactInfos(contactInfos.filter(x => x.id !== info.id))} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><AdminInput label="Label" value={info.label} onChange={(e) => updateInfo(info.id, "label", e.target.value)} /><select value={info.type} onChange={(e) => updateInfo(info.id, "type", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mt-6"><option value="text">Text</option><option value="email">Email</option><option value="phone">Phone</option><option value="url">URL</option></select></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><AdminInput label="Value" value={info.value} onChange={(e) => updateInfo(info.id, "value", e.target.value)} /><select value={info.icon_type || "general"} onChange={(e) => updateInfo(info.id, "icon_type", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mt-6"><option value="general">General Icon</option><option value="social">Social Icon</option></select></div>
                {(info.icon_type || "general") === "social" ? (
                  <AdminSelectWithIcons label="Social Icon" value={info.icon_key || ""} onChange={(v) => updateInfo(info.id, "icon_key", v)} options={platformOptions} />
                ) : (
                  <AdminIconSelect label="General Icon" value={info.icon_key || ""} onChange={(v) => updateInfo(info.id, "icon_key", v)} options={iconOptions} />
                )}
              </div>
            );
          })}
        </div>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Connect With Me (Social Links)</h2></div><div className="flex gap-2">{socialLinksHasChanges && <AdminButton onClick={handleSaveSocialLinks} loading={saving} size="sm" variant="secondary">Save Links</AdminButton>}<AdminButton onClick={addSocialLink} variant="outline" size="sm">Add Link</AdminButton></div></div>
        <div className="space-y-4">
          {contactSocialLinks.map((link, i) => (
            <div key={link.id} className="p-4 bg-secondary/30 rounded-lg space-y-4">
              <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">Link #{i + 1}</span><div className="flex gap-1"><button onClick={() => moveSocialLink(i, "up")} disabled={i === 0}><ChevronUp className="w-4 h-4" /></button><button onClick={() => moveSocialLink(i, "down")} disabled={i === contactSocialLinks.length - 1}><ChevronDown className="w-4 h-4" /></button><button onClick={() => setContactSocialLinks(contactSocialLinks.filter(x => x.id !== link.id))} className="text-destructive"><Trash2 className="w-4 h-4" /></button></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><AdminInput label="Label" value={link.label} onChange={(e) => updateSocialLink(link.id, "label", e.target.value)} /><AdminInput label="URL" value={link.url} onChange={(e) => updateSocialLink(link.id, "url", e.target.value)} /></div>
              <AdminSelectWithIcons label="Icon" value={link.icon_key || ""} onChange={(v) => updateSocialLink(link.id, "icon_key", v)} options={platformOptions} />
            </div>
          ))}
          {contactSocialLinks.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4 bg-secondary/20 rounded-lg">
              No social links yet. Click "Add Link" to add one.
            </p>
          )}
        </div>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center gap-3 mb-6"><FileText className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">SEO Meta</h2></div>
        <div className="space-y-6">
          <div><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">English (EN)</h3>{metaEnHasChanges && <AdminButton onClick={handleSaveMetaEn} loading={saving} size="sm" variant="secondary">Save EN</AdminButton>}</div><div className="space-y-4 pl-4 border-l-2 border-border"><AdminInput label="Title" value={metaEn.title} onChange={(e) => setMetaEn({ ...metaEn, title: e.target.value })} /><AdminTextarea label="Description" value={metaEn.description} onChange={(e) => setMetaEn({ ...metaEn, description: e.target.value })} /><AdminInput label="Keywords" value={metaEn.keywords} onChange={(e) => setMetaEn({ ...metaEn, keywords: e.target.value })} /></div></div>
          <div><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">Arabic (AR)</h3>{metaArHasChanges && <AdminButton onClick={handleSaveMetaAr} loading={saving} size="sm" variant="secondary">Save AR</AdminButton>}</div><div className="space-y-4 pl-4 border-l-2 border-border"><AdminInput label="Title" value={metaAr.title} onChange={(e) => setMetaAr({ ...metaAr, title: e.target.value })} /><AdminTextarea label="Description" value={metaAr.description} onChange={(e) => setMetaAr({ ...metaAr, description: e.target.value })} /><AdminInput label="Keywords" value={metaAr.keywords} onChange={(e) => setMetaAr({ ...metaAr, keywords: e.target.value })} /></div></div>
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

export default AdminContactEditor;
