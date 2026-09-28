import { useState, useEffect, useRef, useCallback } from "react";
import {
    Award,
    Save,
    Plus,
    Trash2,
    Sparkles,
    FileText,
    BookOpen,
    ChevronUp,
    ChevronDown,
    GripVertical,
    Upload,
    Link as LinkIcon,
    Download,
} from "lucide-react";
import { skillsService } from "@/services/skills.service";
import { iconService } from "@/services/icon.service";
import type { LearningFocus, ProfileActionSocial } from "@/types/skills.types";
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

const AdminSkillsEditor = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [iconOptions, setIconOptions] = useState<Icon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState("");
    const hasFetchedRef = useRef(false);

    // Form state
    const [heroData, setHeroData] = useState({ 
        title: "", 
        subtitle: "", 
        description: "",
        cv_label: "Download CV",
        cv_file_url: null as string | null
    });
    const [cvFileBase64, setCvFileBase64] = useState<string | null>(null);
    const [cvFileName, setCvFileName] = useState<string>("");

    const [skillCategories, setSkillCategories] = useState<any[]>([]);
    const [socialLinks, setSocialLinks] = useState<ProfileActionSocial[]>([]);
    const [learningFocus, setLearningFocus] = useState<LearningFocus>({ title: "", description: "", topics: [] });
    const [metaEn, setMetaEn] = useState({ title: "", description: "" });
    const [metaAr, setMetaAr] = useState({ title: "", description: "" });
    const [metaEnKeywordsString, setMetaEnKeywordsString] = useState("");
    const [metaArKeywordsString, setMetaArKeywordsString] = useState("");
    const [skillInputValues, setSkillInputValues] = useState<Record<number, string>>({});
    const [topicInputValue, setTopicInputValue] = useState("");

    const [saving, setSaving] = useState(false);
    
    // Original states
    const [originalHero, setOriginalHero] = useState<string>("");
    const [originalSocials, setOriginalSocials] = useState<string>("");
    const [originalCategories, setOriginalCategories] = useState<string>("");
    const [originalLearning, setOriginalLearning] = useState<string>("");
    const [originalMetaEn, setOriginalMetaEn] = useState<string>("");
    const [originalMetaAr, setOriginalMetaAr] = useState<string>("");

    // Cleaners for comparison
    const cleanHero = useCallback((data: any) => normalize({
        title: data?.title || "",
        subtitle: data?.subtitle || "",
        description: data?.description || "",
        cv_label: data?.cv_label || "Download CV",
        cv_file_url: data?.cv_file_url || null
    }), []);

    const cleanSocials = useCallback((data: any[]) => normalize((data || []).map(s => ({
        platform: s?.platform || "",
        url: s?.url || "",
        icon_key: s?.icon_key || ""
    }))), []);

    const cleanCategories = useCallback((data: any[]) => normalize((data || []).map(cat => ({
        key: cat?.key || "",
        icon_key: cat?.icon_key || "",
        title: cat?.title || "",
        description: cat?.description || "",
        skills: cat?.skills || []
    }))), []);

    const cleanLearning = useCallback((data: any) => normalize({
        title: data?.title || "",
        description: data?.description || "",
        topics: data?.topics || []
    }), []);

    const cleanMeta = useCallback((meta: any, kwString: string) => normalize({
        title: meta?.title || "",
        description: meta?.description || "",
        keywords: (kwString || "").split(",").map(k => k.trim()).filter(Boolean)
    }), []);

    // Change detection flags
    const heroHasChanges = originalHero !== cleanHero(heroData) || !!cvFileBase64;
    const socialsHasChanges = originalSocials !== cleanSocials(socialLinks);
    const categoriesHasChanges = originalCategories !== cleanCategories(skillCategories);
    const learningHasChanges = originalLearning !== cleanLearning(learningFocus);
    const metaEnHasChanges = originalMetaEn !== cleanMeta(metaEn, metaEnKeywordsString);
    const metaArHasChanges = originalMetaAr !== cleanMeta(metaAr, metaArKeywordsString);

    const hasAnyChanges = heroHasChanges || socialsHasChanges || categoriesHasChanges || learningHasChanges || metaEnHasChanges || metaArHasChanges;

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
                const [skillsResponse, iconsResponse] = await Promise.all([
                    skillsService.getSkillsData(),
                    iconService.getIcons(),
                ]);

                setIconOptions(iconsResponse);

                if (skillsResponse) {
                    const hero = {
                        title: skillsResponse.hero?.title || "",
                        subtitle: skillsResponse.hero?.subtitle || "",
                        description: skillsResponse.hero?.description || "",
                        cv_label: skillsResponse.hero?.cv_label || "Download CV",
                        cv_file_url: skillsResponse.hero?.cv_file_url || null,
                    };
                    setHeroData(hero);
                    setOriginalHero(cleanHero(hero));

                    const initialSocials = skillsResponse.social_links || [];
                    setSocialLinks(initialSocials);
                    setOriginalSocials(cleanSocials(initialSocials));

                    const initialCategories = (skillsResponse.skill_categories || []).map((cat: any, index: number) => ({
                        ...cat,
                        id: index + 1,
                    }));
                    setSkillCategories(initialCategories);
                    setOriginalCategories(cleanCategories(initialCategories));

                    const initialLearning = skillsResponse.learning_focus || { title: "", description: "", topics: [] };
                    setLearningFocus(initialLearning);
                    setOriginalLearning(cleanLearning(initialLearning));
                }

                // Fetch Meta separately
                try {
                    const [mEn, mAr] = await Promise.all([
                        skillsService.getSkillsMeta("en"),
                        skillsService.getSkillsMeta("ar")
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
                } catch (e) { /* ignore meta errors */ }

                hasFetchedRef.current = true;
            } catch (err) {
                setError("Failed to fetch skills data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [cleanHero, cleanCategories, cleanLearning, cleanMeta, cleanSocials]);

    const handleSaveHero = async () => {
        try { 
            setSaving(true); 
            const payload = {
                ...heroData,
                cv_file: cvFileBase64
            };
            const res = await skillsService.updateSkillsHero(payload); 
            const updatedHero = {
                title: res.title,
                subtitle: res.subtitle,
                description: res.description,
                cv_label: res.cv_label,
                cv_file_url: res.cv_file_url
            };
            setHeroData(updatedHero);
            setCvFileBase64(null);
            setCvFileName("");
            setOriginalHero(cleanHero(updatedHero)); 
            setSaveMessage("Hero saved!"); 
            setTimeout(() => setSaveMessage(""), 3000);
        } catch (err) { setError("Failed to save hero"); } finally { setSaving(false); }
    };

    const handleSaveSocials = async () => {
        try { 
            setSaving(true); 
            await skillsService.updateSkillsSocialLinks({ socials: socialLinks }); 
            setOriginalSocials(cleanSocials(socialLinks)); 
            setSaveMessage("Social links saved!"); 
            setTimeout(() => setSaveMessage(""), 3000);
        } catch (err) { setError("Failed to save socials"); } finally { setSaving(false); }
    };

    const handleSaveCategories = async () => {
        try { 
            setSaving(true); 
            await skillsService.updateSkillsCategories({ skill_categories: skillCategories }); 
            setOriginalCategories(cleanCategories(skillCategories)); 
            setSaveMessage("Categories saved!"); 
            setTimeout(() => setSaveMessage(""), 3000);
        } catch (err) { setError("Failed to save categories"); } finally { setSaving(false); }
    };

    const handleSaveLearning = async () => {
        try { 
            setSaving(true); 
            await skillsService.updateLearningFocus(learningFocus); 
            setOriginalLearning(cleanLearning(learningFocus)); 
            setSaveMessage("Learning focus saved!"); 
            setTimeout(() => setSaveMessage(""), 3000);
        } catch (err) { setError("Failed to save learning focus"); } finally { setSaving(false); }
    };

    const handleSaveMetaEn = async () => {
        try { 
            setSaving(true); 
            const kw = metaEnKeywordsString.split(",").map(k => k.trim()).filter(Boolean);
            await skillsService.updateSkillsMeta({ title: metaEn.title, description: metaEn.description, keywords: kw, locale: "en" }); 
            setOriginalMetaEn(cleanMeta(metaEn, metaEnKeywordsString)); 
            setSaveMessage("Meta (EN) saved!"); 
            setTimeout(() => setSaveMessage(""), 3000);
        } catch (err) { setError("Failed to save meta (EN)"); } finally { setSaving(false); }
    };

    const handleSaveMetaAr = async () => {
        try { 
            setSaving(true); 
            const kw = metaArKeywordsString.split(",").map(k => k.trim()).filter(Boolean);
            await skillsService.updateSkillsMeta({ title: metaAr.title, description: metaAr.description, keywords: kw, locale: "ar" }); 
            setOriginalMetaAr(cleanMeta(metaAr, metaArKeywordsString)); 
            setSaveMessage("Meta (AR) saved!"); 
            setTimeout(() => setSaveMessage(""), 3000);
        } catch (err) { setError("Failed to save meta (AR)"); } finally { setSaving(false); }
    };

    const handleSaveAll = async () => {
        const promises = [];
        if (heroHasChanges) promises.push(handleSaveHero());
        if (socialsHasChanges) promises.push(handleSaveSocials());
        if (categoriesHasChanges) promises.push(handleSaveCategories());
        if (learningHasChanges) promises.push(handleSaveLearning());
        if (metaEnHasChanges) promises.push(handleSaveMetaEn());
        if (metaArHasChanges) promises.push(handleSaveMetaAr());
        await Promise.all(promises);
        setSaveMessage("All changes saved!");
        setTimeout(() => setSaveMessage(""), 3000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCvFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCvFileBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addSocial = () => setSocialLinks([...socialLinks, { platform: "", url: "", icon_key: "icon-github" }]);
    const addCategory = () => setSkillCategories([...skillCategories, { id: Date.now(), key: "cat-" + Date.now(), icon_key: "icon-award", title: "", description: "", skills: [] }]);
    const updateCategory = (id: number, field: string, value: any) => setSkillCategories(skillCategories.map(c => c.id === id ? { ...c, [field]: value } : c));
    const addSkillToCat = (catId: number, skill: string) => { if (!skill.trim()) return; setSkillCategories(skillCategories.map(c => c.id === catId ? { ...c, skills: [...c.skills, skill.trim()] } : c)); };
    const removeSkillFromCat = (catId: number, idx: number) => setSkillCategories(skillCategories.map(c => c.id === catId ? { ...c, skills: c.skills.filter((_: any, i: number) => i !== idx) } : c));
    const moveCat = (idx: number, dir: "up" | "down") => { const nIdx = dir === "up" ? idx - 1 : idx + 1; if (nIdx < 0 || nIdx >= skillCategories.length) return; const nC = [...skillCategories]; [nC[idx], nC[nIdx]] = [nC[nIdx], nC[idx]]; setSkillCategories(nC); };

    if (loading) return <AdminLoadingState message="Loading skills settings..." />;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Skills Page Editor</h1>
                    <p className="text-sm text-muted-foreground">Manage skills and learning focus</p>
                </div>
            </div>
            {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">{error}</div>}

            {/* Hero & CV */}
            <AdminCard>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">Hero & CV</h2>
                    </div>
                    {heroHasChanges && <AdminButton onClick={handleSaveHero} loading={saving} size="sm" variant="secondary"><Save className="w-4 h-4 mr-2" />Save Hero</AdminButton>}
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdminInput label="Title" value={heroData.title} onChange={(e) => setHeroData({ ...heroData, title: e.target.value })} />
                        <AdminInput label="Subtitle" value={heroData.subtitle} onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })} />
                    </div>
                    <AdminTextarea label="Hero Description" value={heroData.description} onChange={(e) => setHeroData({ ...heroData, description: e.target.value })} rows={2} />
                    
                    <div className="p-4 bg-secondary/20 rounded-xl border border-border/50">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">CV Management</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <AdminInput label="Button Label" value={heroData.cv_label} onChange={(e) => setHeroData({ ...heroData, cv_label: e.target.value })} placeholder="e.g. Download CV" />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CV File (.pdf, .docx)</label>
                                <div className="flex gap-2">
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.doc,.docx" className="hidden" />
                                    <AdminButton variant="outline" size="sm" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        {cvFileName || (heroData.cv_file_url ? "Change File" : "Upload CV")}
                                    </AdminButton>
                                    {heroData.cv_file_url && (
                                        <a href={heroData.cv_file_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary rounded-lg hover:bg-secondary/80">
                                            <Download className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                                {cvFileName && <p className="text-xs text-success font-medium">New file selected: {cvFileName}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </AdminCard>

            {/* Custom Social Links */}
            <AdminCard>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">Custom Social Links</h2>
                    </div>
                    <div className="flex gap-2">
                        {socialsHasChanges && <AdminButton onClick={handleSaveSocials} loading={saving} size="sm" variant="secondary">Save Socials</AdminButton>}
                        <AdminButton onClick={addSocial} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add Link</AdminButton>
                    </div>
                </div>
                <div className="space-y-4">
                    {socialLinks.length === 0 && (
                        <p className="text-sm text-muted-foreground italic text-center py-4">No custom social links added for this page yet.</p>
                    )}
                    {socialLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-secondary/30 rounded-lg items-end border border-border/50">
                            <div className="w-48"><AdminIconSelect label="Icon" value={link.icon_key} onChange={(val) => setSocialLinks(socialLinks.map((s, i) => i === idx ? { ...s, icon_key: val } : s))} options={iconOptions} /></div>
                            <div className="w-48"><AdminInput label="Platform" value={link.platform} onChange={(e) => setSocialLinks(socialLinks.map((s, i) => i === idx ? { ...s, platform: e.target.value } : s))} placeholder="e.g. GitHub" /></div>
                            <div className="flex-1"><AdminInput label="URL" value={link.url} onChange={(e) => setSocialLinks(socialLinks.map((s, i) => i === idx ? { ...s, url: e.target.value } : s))} placeholder="https://..." /></div>
                            <button onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== idx))} className="p-2.5 text-destructive hover:bg-destructive/10 rounded h-10"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </AdminCard>

            {/* Skill Categories */}
            <AdminCard>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">Skill Categories</h2>
                    </div>
                    <div className="flex gap-2">
                        {categoriesHasChanges && <AdminButton onClick={handleSaveCategories} loading={saving} size="sm" variant="secondary">Save Categories</AdminButton>}
                        <AdminButton onClick={addCategory} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add Category</AdminButton>
                    </div>
                </div>
                <div className="space-y-6">
                    {skillCategories.map((cat, idx) => (
                        <div key={cat.id} className="p-4 bg-secondary/30 rounded-xl space-y-4 border border-border/50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Category #{idx + 1}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => moveCat(idx, "up")} disabled={idx === 0} className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                                    <button onClick={() => moveCat(idx, "down")} disabled={idx === skillCategories.length - 1} className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                                    <button onClick={() => setSkillCategories(skillCategories.filter(x => x.id !== cat.id))} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AdminInput label="Key (Internal)" value={cat.key} onChange={(e) => updateCategory(cat.id, "key", e.target.value)} />
                                <AdminIconSelect label="Icon" value={cat.icon_key} onChange={(val) => updateCategory(cat.id, "icon_key", val)} options={iconOptions} />
                            </div>
                            <AdminInput label="Display Title" value={cat.title} onChange={(e) => updateCategory(cat.id, "title", e.target.value)} />
                            <AdminTextarea label="Description" value={cat.description} onChange={(e) => updateCategory(cat.id, "description", e.target.value)} rows={2} />
                            <div>
                                <label className="text-sm font-medium mb-2 block">Skills</label>
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {cat.skills.map((s: string, sIdx: number) => (
                                        <span key={sIdx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg flex items-center gap-1 border border-primary/20">
                                            {s}
                                            <button onClick={() => removeSkillFromCat(cat.id, sIdx)} className="hover:text-destructive transition-colors text-lg line-height-0 font-bold">&times;</button>
                                        </span>
                                    ))}
                                </div>
                                <AdminInput 
                                    placeholder="Add skill (Press Enter)..." 
                                    value={skillInputValues[cat.id] || ""}
                                    onChange={(e) => setSkillInputValues({ ...skillInputValues, [cat.id]: e.target.value })}
                                    onKeyDown={(e) => { 
                                        if (e.key === "Enter") { 
                                            e.preventDefault(); 
                                            const val = skillInputValues[cat.id]?.trim();
                                            if (val) {
                                                addSkillToCat(cat.id, val);
                                                setSkillInputValues({ ...skillInputValues, [cat.id]: "" });
                                            }
                                        } 
                                    }} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </AdminCard>

            {/* Learning Focus */}
            <AdminCard>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">Learning Focus</h2>
                    </div>
                    {learningHasChanges && <AdminButton onClick={handleSaveLearning} loading={saving} size="sm" variant="secondary">Save Learning</AdminButton>}
                </div>
                <div className="space-y-4">
                    <AdminInput label="Title" value={learningFocus.title} onChange={(e) => setLearningFocus({ ...learningFocus, title: e.target.value })} />
                    <AdminTextarea label="Description" value={learningFocus.description} onChange={(e) => setLearningFocus({ ...learningFocus, description: e.target.value })} rows={2} />
                    <div>
                        <label className="text-sm font-medium mb-2 block">Topics</label>
                        <div className="flex flex-wrap gap-3 mb-3">
                            {learningFocus.topics.map((t, i) => (
                                <span key={i} className="px-2 py-1 bg-accent/20 text-accent-foreground text-xs rounded-lg flex items-center gap-1 border border-accent/20">
                                    {t}
                                    <button onClick={() => setLearningFocus({...learningFocus, topics: learningFocus.topics.filter((_, idx) => idx !== i)})} className="hover:text-destructive transition-colors text-lg line-height-0 font-bold">&times;</button>
                                </span>
                            ))}
                        </div>
                        <AdminInput 
                            placeholder="Add topic (Press Enter)..." 
                            value={topicInputValue}
                            onChange={(e) => setTopicInputValue(e.target.value)}
                            onKeyDown={(e) => { 
                                if (e.key === "Enter") { 
                                    e.preventDefault(); 
                                    const val = topicInputValue.trim();
                                    if (val) {
                                        setLearningFocus({...learningFocus, topics: [...learningFocus.topics, val]});
                                        setTopicInputValue("");
                                    }
                                } 
                            }} 
                        />
                    </div>
                </div>
            </AdminCard>

            {/* Meta */}
            <AdminCard>
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">SEO Meta</h2>
                </div>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold">English</h3>
                            {metaEnHasChanges && <AdminButton onClick={handleSaveMetaEn} loading={saving} size="sm" variant="secondary">Save EN</AdminButton>}
                        </div>
                        <div className="space-y-4 pl-4 border-l-2 border-border">
                            <AdminInput label="Title" value={metaEn.title} onChange={(e) => setMetaEn({ ...metaEn, title: e.target.value })} />
                            <AdminTextarea label="Description" value={metaEn.description} onChange={(e) => setMetaEn({ ...metaEn, description: e.target.value })} />
                            <AdminInput label="Keywords" value={metaEnKeywordsString} onChange={(e) => setMetaEnKeywordsString(e.target.value)} placeholder="react, typescript, ui/ux" />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold">Arabic</h3>
                            {metaArHasChanges && <AdminButton onClick={handleSaveMetaAr} loading={saving} size="sm" variant="secondary">Save AR</AdminButton>}
                        </div>
                        <div className="space-y-4 pl-4 border-l-2 border-border">
                            <AdminInput label="Title" value={metaAr.title} onChange={(e) => setMetaAr({ ...metaAr, title: e.target.value })} />
                            <AdminTextarea label="Description" value={metaAr.description} onChange={(e) => setMetaAr({ ...metaAr, description: e.target.value })} />
                            <AdminInput label="Keywords" value={metaArKeywordsString} onChange={(e) => setMetaArKeywordsString(e.target.value)} placeholder="كلمات دلالية..." />
                        </div>
                    </div>
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

export default AdminSkillsEditor;
