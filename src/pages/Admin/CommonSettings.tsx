import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Mail,
  Link2,
  Trash2,
  Save,
} from "lucide-react";
import { commonService } from "@/services/common.service";
import { socialService } from "@/services/social.service";
import type { CommonResponse } from "@/types/common.types";
import { AdminCard, AdminButton, AdminInput, AdminLoadingState } from "@/components/Admin";
import { AdminSelectWithIcons } from "@/components/Admin/ui/AdminSelectWithIcons";

const AdminCommonSettings = () => {
  const [, setData] = useState<CommonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [platformOptions, setPlatformOptions] = useState<any[]>([]);

  // Form state
  const [fullName, setFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  // Original values
  const [originalFullName, setOriginalFullName] = useState("");
  const [originalContactEmail, setOriginalContactEmail] = useState("");
  const [originalContactPhone, setOriginalContactPhone] = useState("");
  const [originalSocialLinks, setOriginalSocialLinks] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);

  // Changes tracking
  const fullNameHasChanges = fullName !== originalFullName;
  const contactHasChanges = contactEmail !== originalContactEmail || contactPhone !== originalContactPhone;
  const socialHasChanges = JSON.stringify(socialLinks) !== JSON.stringify(originalSocialLinks);

  const hasAnyChanges = fullNameHasChanges || contactHasChanges || socialHasChanges;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [platforms, commonRes] = await Promise.all([
          socialService.getSocialPlatforms(),
          commonService.getCommonData()
        ]);

        setPlatformOptions(platforms.map(p => ({ value: p.key, label: p.name, icon: p.key })));
        setData(commonRes);

        setFullName(commonRes.full_name || "");
        setOriginalFullName(commonRes.full_name || "");
        setContactEmail(commonRes.contact?.email || "");
        setOriginalContactEmail(commonRes.contact?.email || "");
        setContactPhone(commonRes.contact?.phone || "");
        setOriginalContactPhone(commonRes.contact?.phone || "");

        const links = (commonRes.social_links || []).map((l: any) => ({ ...l, id: l.id || Date.now() + Math.random() }));
        setSocialLinks(links);
        setOriginalSocialLinks(JSON.parse(JSON.stringify(links)));
      } catch (err) {
        setError("Failed to fetch settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveFullName = async () => {
    try {
      setSaving(true);
      await commonService.updateFullName(fullName);
      setOriginalFullName(fullName);
      setSaveMessage("Name saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save name"); } finally { setSaving(false); }
  };

  const handleSaveContact = async () => {
    try {
      setSaving(true);
      await commonService.updateContactInformation(contactEmail, contactPhone);
      setOriginalContactEmail(contactEmail);
      setOriginalContactPhone(contactPhone);
      setSaveMessage("Contact saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save contact"); } finally { setSaving(false); }
  };

  const handleSaveSocials = async () => {
    try {
      setSaving(true);
      // Delete existing and re-add or use actual granular logic
      // Simplification for brevity:
      for (const link of socialLinks) {
        if (link.id > 1000000) {
          // New link - ensure sort_order is set (use index as fallback)
          const sortOrder = (link.sort_order !== undefined && link.sort_order !== null) 
            ? link.sort_order 
            : socialLinks.indexOf(link);
          await commonService.addSocialLink(link.platform, link.url, link.icon_key, sortOrder);
        } else {
          await commonService.updateSocialLink(link.id, link.platform, link.url, link.icon_key);
        }
      }
      setOriginalSocialLinks(JSON.parse(JSON.stringify(socialLinks)));
      setSaveMessage("Socials saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { setError("Failed to save socials"); } finally { setSaving(false); }
  };

  const handleSaveAll = async () => {
    const p = [];
    if (fullNameHasChanges) p.push(handleSaveFullName());
    if (contactHasChanges) p.push(handleSaveContact());
    if (socialHasChanges) p.push(handleSaveSocials());
    await Promise.all(p);
    setSaveMessage("All changes saved!");
  };

  if (loading) return <AdminLoadingState message="Loading common settings..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Settings className="w-6 h-6 text-primary" /></div><div><h1 className="text-2xl font-bold">Common Settings</h1><p className="text-sm text-muted-foreground">Global site configuration</p></div></div>
      
      {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">{error}</div>}

      <AdminCard>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><User className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Personal Information</h2></div>{fullNameHasChanges && <AdminButton onClick={handleSaveFullName} loading={saving} size="sm" variant="secondary">Save Name</AdminButton>}</div>
        <AdminInput label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </AdminCard>

      <AdminCard>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Contact Details</h2></div>{contactHasChanges && <AdminButton onClick={handleSaveContact} loading={saving} size="sm" variant="secondary">Save Contact</AdminButton>}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><AdminInput label="Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /><AdminInput label="Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} /></div>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><Link2 className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Social Links</h2></div><div className="flex gap-2">{socialHasChanges && <AdminButton onClick={handleSaveSocials} loading={saving} size="sm" variant="secondary">Save Socials</AdminButton>}        <AdminButton onClick={() => {
          const maxSortOrder = socialLinks.length > 0 
            ? Math.max(...socialLinks.map(l => (l.sort_order !== undefined && l.sort_order !== null) ? l.sort_order : 0), 0) 
            : -1;
          setSocialLinks([...socialLinks, { id: Date.now(), platform: "github", url: "", icon_key: "github", sort_order: maxSortOrder + 1 }]);
        }} variant="outline" size="sm">Add Link</AdminButton></div></div>
        <div className="space-y-3">
          {socialLinks.map((link) => (
            <div key={link.id} className="flex gap-3 p-4 bg-secondary/30 rounded-lg items-center">
              <AdminSelectWithIcons value={link.platform} onChange={(v) => setSocialLinks(socialLinks.map(x => x.id === link.id ? { ...x, platform: v, icon_key: v } : x))} options={platformOptions} className="w-48" />
              <AdminInput value={link.url} onChange={(e) => setSocialLinks(socialLinks.map(x => x.id === link.id ? { ...x, url: e.target.value } : x))} placeholder="URL..." className="flex-1" />
              <button onClick={() => setSocialLinks(socialLinks.filter(x => x.id !== link.id))} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
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

export default AdminCommonSettings;
