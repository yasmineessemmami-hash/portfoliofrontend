import { useState, useEffect, useRef, useCallback } from "react";
import {
    User,
    Save,
    Plus,
    Trash2,
    Sparkles,
    BarChart3,
    FileText,
    Heart,
    ChevronUp,
    ChevronDown,
    Briefcase,
    Workflow,
    Upload,
    Maximize,
    Minimize,
} from "lucide-react";
import { motion } from "framer-motion";
import { aboutService } from "@/services/about.service";
import { iconService } from "@/services/icon.service";
import type { Icon } from "@/services/icon.service";
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminToggle, AdminLoadingState } from "@/components/Admin";
import { AdminIconSelect } from "@/components/Admin/ui/AdminIconSelect";
import apiClient from "@/services/api"; // Added for CORS-safe image fetching
import type { AboutHero, AboutStat, AboutService, AboutWorkProcessStep, AboutValue } from "@/types/about.types";

// Helper: Normalize data for comparison by sorting object keys
const normalize = (val: unknown): string => {
    if (Array.isArray(val)) {
        return "[" + val.map(normalize).join(",") + "]";
    }
    if (val && typeof val === 'object') {
        return "{" + Object.keys(val).sort().map(k =>
            `"${k}":${normalize((val as Record<string, unknown>)[k])}`
        ).join(",") + "}";
    }
    return JSON.stringify(val === undefined ? null : val);
};

const AdminAboutEditor = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [iconOptions, setIconOptions] = useState<Icon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState("");

    // Form state
    const [heroData, setHeroData] = useState({ title: "", subtitle: "", description: "" });
    const [stats, setStats] = useState<(AboutStat & { id: number })[]>([]);
    const [introduction, setIntroduction] = useState({
        avatarImage: "",
        availabilityActive: false,
        availabilityText: "",
        fullName: "",
        roleTitle: "",
        paragraphs: [] as string[],
        techStack: [] as string[],
    });
    const [services, setServices] = useState<(AboutService & { id: number })[]>([]);
    const [workProcess, setWorkProcess] = useState<(AboutWorkProcessStep & { id: number })[]>([]);
    const [values, setValues] = useState<(AboutValue & { id: number })[]>([]);
    const [metaEn, setMetaEn] = useState({ title: "", description: "" });
    const [metaAr, setMetaAr] = useState({ title: "", description: "" });
    const [metaEnKeywordsString, setMetaEnKeywordsString] = useState("");
    const [metaArKeywordsString, setMetaArKeywordsString] = useState("");

    // Local inputs
    const [newTechInput, setNewTechInput] = useState("");
    const [newFeatureInputs, setNewFeatureInputs] = useState<Record<string, string>>({});

    // UI state for image editing
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isEditingImage, setIsEditingImage] = useState(false);

    const [saving, setSaving] = useState(false);

    // Original states
    const [originalHero, setOriginalHero] = useState<string>("");
    const [originalStats, setOriginalStats] = useState<string>("");
    const [originalIntro, setOriginalIntro] = useState<string>("");
    const [originalServices, setOriginalServices] = useState<string>("");
    const [originalWorkProcess, setOriginalWorkProcess] = useState<string>("");
    const [originalValues, setOriginalValues] = useState<string>("");
    const [originalMetaEn, setOriginalMetaEn] = useState<string>("");
    const [originalMetaAr, setOriginalMetaAr] = useState<string>("");

    // Cleaners for comparison
    const cleanHero = useCallback((data: Partial<AboutHero>) => normalize({
        title: data?.title || "",
        subtitle: data?.subtitle || "",
        description: data?.description || ""
    }), []);

    const cleanStats = useCallback((data: Partial<AboutStat>[]) => normalize((data || []).map(s => ({
        key: s?.key || "",
        value: s?.value || "",
        label: s?.label || ""
    }))), []);

    interface IntroductionState {
        avatarImage?: string;
        availabilityActive?: boolean;
        availabilityText?: string;
        fullName?: string;
        roleTitle?: string;
        paragraphs?: string[];
        techStack?: string[];
    }
    const cleanIntro = useCallback((data: IntroductionState) => normalize({
        avatarImage: data?.avatarImage || "",
        availabilityActive: !!data?.availabilityActive,
        availabilityText: data?.availabilityText || "",
        fullName: data?.fullName || "",
        roleTitle: data?.roleTitle || "",
        paragraphs: data?.paragraphs || [],
        techStack: data?.techStack || []
    }), []);

    const cleanServices = useCallback((data: Partial<AboutService>[]) => normalize((data || []).map(s => ({
        title: s?.title || "",
        description: s?.description || "",
        features: s?.features || []
    }))), []);

    const cleanWorkProcess = useCallback((data: Partial<AboutWorkProcessStep>[]) => normalize((data || []).map(w => ({
        step: w?.step || "",
        title: w?.title || "",
        description: w?.description || ""
    }))), []);

    const cleanValues = useCallback((data: Partial<AboutValue>[]) => normalize((data || []).map(v => ({
        key: v?.key || "",
        title: v?.title || "",
        description: v?.description || ""
    }))), []);

    interface MetaData {
        title?: string;
        description?: string;
    }
    const cleanMeta = useCallback((meta: MetaData, kwString: string) => normalize({
        title: meta?.title || "",
        description: meta?.description || "",
        keywords: (kwString || "").split(",").map(k => k.trim()).filter(Boolean)
    }), []);

    // Change detection flags
    const heroHasChanges = originalHero !== cleanHero(heroData);
    const statsHasChanges = originalStats !== cleanStats(stats);
    const introHasChanges = originalIntro !== cleanIntro(introduction) || isEditingImage;
    const servicesHasChanges = originalServices !== cleanServices(services);
    const workProcessHasChanges = originalWorkProcess !== cleanWorkProcess(workProcess);
    const valuesHasChanges = originalValues !== cleanValues(values);
    const metaEnHasChanges = originalMetaEn !== cleanMeta(metaEn, metaEnKeywordsString);
    const metaArHasChanges = originalMetaAr !== cleanMeta(metaAr, metaArKeywordsString);

    const hasAnyChanges = heroHasChanges || statsHasChanges || introHasChanges || servicesHasChanges || workProcessHasChanges || valuesHasChanges || metaEnHasChanges || metaArHasChanges;

    // Keywords parser
    const parseKeywords = (kw: unknown): string[] => {
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

    // Add functions
    const addStat = () => {
        const newId = stats.length > 0 ? Math.max(...stats.map((s) => s.id)) + 1 : 1;
        setStats([...stats, { id: newId, key: "icon-folder", value: "", label: "" }]);
    };

    const addTech = () => {
        if (!newTechInput.trim()) return;
        if (!introduction.techStack.includes(newTechInput.trim())) {
            setIntroduction({
                ...introduction,
                techStack: [...introduction.techStack, newTechInput.trim()]
            });
        }
        setNewTechInput("");
    };

    const addService = () => {
        const newId = services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;
        setServices([...services, { id: newId, title: "", description: "", features: [] }]);
    };

    const addFeature = (serviceId: number) => {
        const input = newFeatureInputs[serviceId];
        if (!input?.trim()) return;
        setServices(services.map((s) => {
            if (s.id === serviceId) {
                return { ...s, features: [...(s.features || []), input.trim()] };
            }
            return s;
        }));
        setNewFeatureInputs({ ...newFeatureInputs, [serviceId]: "" });
    };

    const addWorkStep = () => {
        const newId = workProcess.length > 0 ? Math.max(...workProcess.map((w) => w.id)) + 1 : 1;
        setWorkProcess([...workProcess, { id: newId, step: `0${workProcess.length + 1}`, title: "", description: "" }]);
    };

    const addValue = () => {
        const newId = values.length > 0 ? Math.max(...values.map((v) => v.id)) + 1 : 1;
        setValues([...values, { id: newId, key: "icon-heart", title: "", description: "" }]);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIntroduction({ ...introduction, avatarImage: reader.result as string });
                setIsEditingImage(true);
                setZoom(1);
                setPosition({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
        }
    };

    // Fetch
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [res, icons] = await Promise.all([
                    aboutService.getAboutData(),
                    iconService.getIcons(),
                ]);
                setIconOptions(icons);

                if (res) {
                    const h = {
                        title: res.hero?.title || "",
                        subtitle: res.hero?.subtitle || "",
                        description: res.hero?.description || ""
                    };
                    setHeroData(h);
                    setOriginalHero(cleanHero(h));

                    const s = (res.stats || []).map((x: AboutStat, i: number) => ({ ...x, id: i + 1 }));
                    setStats(s);
                    setOriginalStats(cleanStats(s));

                    const intro = {
                        avatarImage: res.introduction?.avatar?.image || "",
                        availabilityActive: !!res.introduction?.availability?.is_active,
                        availabilityText: res.introduction?.availability?.text || "",
                        fullName: res.introduction?.full_name || "",
                        roleTitle: res.introduction?.role_title || "",
                        paragraphs: res.introduction?.paragraphs || [],
                        techStack: res.introduction?.tech_stack || [],
                    };
                    setIntroduction(intro);
                    setOriginalIntro(cleanIntro(intro));

                    const srvs = (res.services || []).map((x: AboutService, i: number) => ({ ...x, id: i + 1 }));
                    setServices(srvs);
                    setOriginalServices(cleanServices(srvs));

                    const wp = (res.work_process || []).map((x: AboutWorkProcessStep, i: number) => ({ ...x, id: i + 1 }));
                    setWorkProcess(wp);
                    setOriginalWorkProcess(cleanWorkProcess(wp));

                    const v = (res.values || []).map((x: AboutValue, i: number) => ({ ...x, id: i + 1 }));
                    setValues(v);
                    setOriginalValues(cleanValues(v));
                }

                try {
                    const [mEn, mAr] = await Promise.all([aboutService.getAboutMeta("en"), aboutService.getAboutMeta("ar")]);
                    if (mEn) {
                        const kw = parseKeywords(mEn.keywords);
                        const d = { title: mEn.title || "", description: mEn.description || "" };
                        const kwString = kw.join(", ");
                        setMetaEn(d);
                        setMetaEnKeywordsString(kwString);
                        setOriginalMetaEn(cleanMeta(d, kwString));
                    }
                    if (mAr) {
                        const kw = parseKeywords(mAr.keywords);
                        const d = { title: mAr.title || "", description: mAr.description || "" };
                        const kwString = kw.join(", ");
                        setMetaAr(d);
                        setMetaArKeywordsString(kwString);
                        setOriginalMetaAr(cleanMeta(d, kwString));
                    }
                } catch (e) { console.error("Failed to fetch meta data", e); }
            } catch (err) { console.error("Failed to fetch data", err); setError("Failed to fetch data"); } finally { setLoading(false); }
        };
        load();
    }, [cleanHero, cleanStats, cleanIntro, cleanServices, cleanWorkProcess, cleanValues, cleanMeta]);

    // Bake Image Helper - Captures exactly what is in the viewport
    const bakeImage = async (): Promise<string> => {
        let imgSource = introduction.avatarImage;

        // Use the API client to fetch the image as a blob to bypass CORS for canvas
        if (imgSource.startsWith('http')) {
            try {
                // Use the configured apiClient which already handles CORS for the backend
                const response = await apiClient.get(imgSource, {
                    responseType: 'blob',
                    baseURL: '', // Use absolute URL
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    }
                });
                imgSource = URL.createObjectURL(response.data);
            } catch (e) {
                console.error("CORS proxy fetch failed", e);
            }
        }

        return new Promise((resolve) => {
            const img = new Image();
            if (imgSource.startsWith('http') || imgSource.startsWith('blob:')) {
                img.crossOrigin = "anonymous";
            }
            img.src = imgSource;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 400;
                canvas.height = 400;
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(introduction.avatarImage);

                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, 400, 400);

                const imgAspect = img.width / img.height;
                let dw, dh;
                if (imgAspect > 1) {
                    dh = 400 * zoom;
                    dw = dh * imgAspect;
                } else {
                    dw = 400 * zoom;
                    dh = dw / imgAspect;
                }

                const scaleFactor = 400 / 128;
                const ox = (position.x * scaleFactor) + (400 - dw) / 2;
                const oy = (position.y * scaleFactor) + (400 - dh) / 2;

                ctx.drawImage(img, ox, oy, dw, dh);

                if (imgSource.startsWith('blob:')) {
                    URL.revokeObjectURL(imgSource);
                }

                resolve(canvas.toDataURL("image/jpeg", 0.9));
            };
            img.onerror = () => {
                console.error("Failed to load image for baking");
                resolve(introduction.avatarImage);
            };
        });
    };

    // Save Logic
    const handleSaveHero = async () => {
        try { setSaving(true); await aboutService.updateAboutHero(heroData); setOriginalHero(cleanHero(heroData)); setSaveMessage("Hero saved!"); } catch (e) { setError("Save failed"); } finally { setSaving(false); }
    };
    const handleSaveStats = async () => {
        try { setSaving(true); await aboutService.updateAboutStats({ stats: stats.map(({ key, value, label }) => ({ key, value, label })) }); setOriginalStats(cleanStats(stats)); setSaveMessage("Stats saved!"); } catch (e) { setError("Save failed"); } finally { setSaving(false); }
    };
    const handleSaveIntro = async () => {
        try {
            setSaving(true);
            const payload: IntroductionState & { avatarImage?: string } = { ...introduction };
            if (isEditingImage && introduction.avatarImage) {
                payload.avatarImage = await bakeImage();
            }
            const res = await aboutService.updateAboutIntroduction(payload);
            const final = {
                ...introduction,
                avatarImage: res.introduction.avatar.image,
                availabilityActive: !!res.introduction.availability?.is_active,
                availabilityText: res.introduction.availability?.text || ""
            };
            setIntroduction(final);
            setOriginalIntro(cleanIntro(final));
            setIsEditingImage(false);
            setSaveMessage("Intro saved!");
        } catch (e) { setError("Save failed"); } finally { setSaving(false); }
    };
    const handleSaveServices = async () => {
        try { setSaving(true); await aboutService.updateAboutServices({ services: services.map(({ title, description, features }) => ({ title, description, features })) }); setOriginalServices(cleanServices(services)); setSaveMessage("Services saved!"); } catch (e) { setError("Save failed"); } finally { setSaving(false); }
    };
    const handleSaveWorkProcess = async () => {
        try { setSaving(true); await aboutService.updateAboutWorkProcess({ steps: workProcess.map(({ step, title, description }) => ({ step, title, description })) }); setOriginalWorkProcess(cleanWorkProcess(workProcess)); setSaveMessage("Process saved!"); } catch (e) { setError("Save failed"); } finally { setSaving(false); }
    };
    const handleSaveValues = async () => {
        try { setSaving(true); await aboutService.updateAboutValues({ values: values.map(({ key, title, description }) => ({ key, title, description })) }); setOriginalValues(cleanValues(values)); setSaveMessage("Values saved!"); } catch (e) { setError("Save failed"); } finally { setSaving(false); }
    };
    const handleSaveMetaEn = async () => {
        try { setSaving(true); const d = { ...metaEn, keywords: metaEnKeywordsString.split(",").map(k => k.trim()).filter(Boolean), locale: "en" }; await aboutService.updateAboutMeta(d); setOriginalMetaEn(cleanMeta(metaEn, metaEnKeywordsString)); setSaveMessage("Meta EN saved!"); } catch (e) { setError("Save failed"); } finally { setSaving(false); }
    };
    const handleSaveMetaAr = async () => {
        try { setSaving(true); const d = { ...metaAr, keywords: metaArKeywordsString.split(",").map(k => k.trim()).filter(Boolean), locale: "ar" }; await aboutService.updateAboutMeta(d); setOriginalMetaAr(cleanMeta(metaAr, metaArKeywordsString)); setSaveMessage("Meta AR saved!"); } catch (e) { setError("Save failed"); } finally { setSaving(false); }
    };

    const handleSaveAll = async () => {
        const p = [];
        if (heroHasChanges) p.push(handleSaveHero());
        if (statsHasChanges) p.push(handleSaveStats());
        if (introHasChanges) p.push(handleSaveIntro());
        if (servicesHasChanges) p.push(handleSaveServices());
        if (workProcessHasChanges) p.push(handleSaveWorkProcess());
        if (valuesHasChanges) p.push(handleSaveValues());
        if (metaEnHasChanges) p.push(handleSaveMetaEn());
        if (metaArHasChanges) p.push(handleSaveMetaAr());
        await Promise.all(p);
        setSaveMessage("All changes saved!");
        setTimeout(() => setSaveMessage(""), 3000);
    };

    if (loading) return <AdminLoadingState message="Loading..." />;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><User className="w-6 h-6 text-primary" /></div><div><h1 className="text-2xl font-bold">About Page Editor</h1><p className="text-sm text-muted-foreground">Manage sections</p></div></div>
            {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">{error}</div>}

            {/* Hero */}
            <AdminCard>
                <div className="flex justify-between mb-6">
                    <div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Hero</h2></div>
                    {heroHasChanges && <AdminButton onClick={handleSaveHero} loading={saving} size="sm" variant="secondary"><Save className="w-4 h-4 mr-2" />Save Hero</AdminButton>}
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdminInput label="Title" value={heroData.title} onChange={e => setHeroData({ ...heroData, title: e.target.value })} />
                        <AdminInput label="Subtitle" value={heroData.subtitle} onChange={e => setHeroData({ ...heroData, subtitle: e.target.value })} />
                    </div>
                    <AdminTextarea label="Description" value={heroData.description} onChange={e => setHeroData({ ...heroData, description: e.target.value })} rows={2} />
                </div>
            </AdminCard>

            {/* Stats */}
            <AdminCard>
                <div className="flex justify-between mb-6">
                    <div className="flex items-center gap-3"><BarChart3 className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Stats</h2></div>
                    <div className="flex gap-2">
                        {statsHasChanges && <AdminButton onClick={handleSaveStats} loading={saving} size="sm" variant="secondary">Save Stats</AdminButton>}
                        <AdminButton onClick={addStat} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add</AdminButton>
                    </div>
                </div>
                <div className="space-y-3">
                    {stats.map(s => (
                        <div key={s.id} className="flex gap-3 p-4 bg-secondary/30 rounded-lg items-end">
                            <div className="sm:w-48"><AdminIconSelect label="Icon" value={s.key} onChange={v => setStats(stats.map(x => x.id === s.id ? { ...x, key: v } : x))} options={iconOptions} /></div>
                            <div className="sm:w-32"><AdminInput label="Value" value={s.value} onChange={e => setStats(stats.map(x => x.id === s.id ? { ...x, value: e.target.value } : x))} /></div>
                            <div className="flex-1"><AdminInput label="Label" value={s.label} onChange={e => setStats(stats.map(x => x.id === s.id ? { ...x, label: e.target.value } : x))} /></div>
                            <button onClick={() => setStats(stats.filter(x => x.id !== s.id))} className="p-2.5 text-destructive hover:bg-destructive/10 rounded h-10"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </AdminCard>

            {/* Intro & Avatar */}
            <AdminCard>
                <div className="flex justify-between mb-6">
                    <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Introduction</h2></div>
                    {introHasChanges && <AdminButton onClick={handleSaveIntro} loading={saving} size="sm" variant="secondary">Save Intro</AdminButton>}
                </div>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-8 p-4 bg-secondary/20 rounded-xl">
                        <div className="shrink-0 flex flex-col items-center">
                            <div className={`w-32 h-32 rounded-2xl overflow-hidden shadow-glow bg-surface border-2 border-dashed transition-all relative ${introduction.avatarImage ? 'border-primary/30 group cursor-grab active:cursor-grabbing' : 'border-primary/20'}`}>
                                {introduction.avatarImage ? (
                                    <div className="w-full h-full relative overflow-hidden bg-black/5">
                                        <motion.img
                                            drag
                                            dragMomentum={false}
                                            onDrag={(_e, info) => {
                                                setPosition({ x: position.x + info.delta.x, y: position.y + info.delta.y });
                                                setIsEditingImage(true);
                                            }}
                                            style={{
                                                scale: zoom,
                                                x: position.x,
                                                y: position.y,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                            src={introduction.avatarImage}
                                            className="pointer-events-none"
                                        />
                                        {/* Circular Crop Guide - dims the area that will be cropped out */}
                                        <div className="absolute inset-0 pointer-events-none shadow-[0_0_0_999px_rgba(0,0,0,0.4)] rounded-full border-2 border-primary/50" />

                                        {/* Corner markings for the square frame */}
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-xl" />
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-xl" />
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-xl" />
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-xl" />
                                    </div>
                                ) : (
                                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:text-primary cursor-pointer transition-colors bg-linear-to-br from-primary/20 to-primary/5">
                                        <Upload className="w-6 h-6 mb-1" /><span className="text-[10px] font-medium px-2">Upload</span>
                                    </div>
                                )}
                                {introduction.avatarImage && (
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-20">
                                        <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors" title="Change photo"><Upload className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { setIntroduction({ ...introduction, avatarImage: "" }); setIsEditingImage(false); setPosition({ x: 0, y: 0 }); setZoom(1); }} className="p-1.5 bg-destructive/80 text-white rounded-lg hover:bg-destructive transition-colors" title="Remove photo"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                            {introduction.avatarImage && (
                                <div className="mt-4 w-full px-2 space-y-2">
                                    <div className="flex justify-between text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                                        <span>Zoom</span>
                                        <span>{Math.round(zoom * 100)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Minimize className="w-3 h-3 text-muted-foreground" />
                                        <input
                                            type="range"
                                            min="1"
                                            max="4"
                                            step="0.01"
                                            value={zoom}
                                            onChange={e => { setZoom(parseFloat(e.target.value)); setIsEditingImage(true); }}
                                            className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <Maximize className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                    <button
                                        onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); setIsEditingImage(true); }}
                                        className="w-full py-1 text-[10px] text-primary hover:text-primary/80 uppercase font-bold transition-colors border border-primary/20 rounded mt-1"
                                    >
                                        Reset Position
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 pt-6"><label className="text-sm font-medium">Available</label><AdminToggle checked={introduction.availabilityActive} onChange={e => setIntroduction({ ...introduction, availabilityActive: e.target.checked })} /></div>
                                <AdminInput label="Availability Msg" value={introduction.availabilityText} onChange={e => setIntroduction({ ...introduction, availabilityText: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdminInput label="Name" value={introduction.fullName} onChange={e => setIntroduction({ ...introduction, fullName: e.target.value })} />
                        <AdminInput label="Role" value={introduction.roleTitle} onChange={e => setIntroduction({ ...introduction, roleTitle: e.target.value })} />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2"><label className="text-sm font-medium">Paragraphs</label><button onClick={() => setIntroduction({ ...introduction, paragraphs: [...introduction.paragraphs, ""] })} className="text-sm text-primary">+ Add</button></div>
                        <div className="space-y-2">{introduction.paragraphs.map((p, i) => (
                            <div key={i} className="flex gap-2"><AdminTextarea value={p} onChange={e => { const np = [...introduction.paragraphs]; np[i] = e.target.value; setIntroduction({ ...introduction, paragraphs: np }); }} className="flex-1" /><button onClick={() => setIntroduction({ ...introduction, paragraphs: introduction.paragraphs.filter((_, idx) => idx !== i) })} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button></div>
                        ))}</div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Tech Stack</label>
                        <div className="flex flex-wrap gap-2 my-2">{introduction.techStack.map((t, i) => <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded flex items-center">{t}<button onClick={() => setIntroduction({ ...introduction, techStack: introduction.techStack.filter((_, idx) => idx !== i) })} className="ml-1 hover:text-destructive">×</button></span>)}</div>
                        <div className="flex gap-2"><AdminInput value={newTechInput} onChange={e => setNewTechInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTech()} placeholder="Add tech..." className="flex-1" /><AdminButton onClick={addTech} variant="secondary" size="sm">Add</AdminButton></div>
                    </div>
                </div>
            </AdminCard>

            {/* Services */}
            <AdminCard>
                <div className="flex justify-between mb-6">
                    <div className="flex items-center gap-3"><Briefcase className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Services</h2></div>
                    <div className="flex gap-2">{servicesHasChanges && <AdminButton onClick={handleSaveServices} loading={saving} size="sm" variant="secondary">Save Services</AdminButton>}<AdminButton onClick={addService} variant="outline" size="sm">Add</AdminButton></div>
                </div>
                <div className="space-y-4">{services.map((s, i) => (
                    <div key={s.id} className="p-4 bg-secondary/30 rounded-lg space-y-4">
                        <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">Service #{i + 1}</span><div className="flex gap-1"><button onClick={() => { const ns = [...services];[ns[i], ns[i - 1]] = [ns[i - 1], ns[i]]; setServices(ns); }} disabled={i === 0}><ChevronUp className="w-4 h-4" /></button><button onClick={() => { const ns = [...services];[ns[i], ns[i + 1]] = [ns[i + 1], ns[i]]; setServices(ns); }} disabled={i === services.length - 1}><ChevronDown className="w-4 h-4" /></button><button onClick={() => setServices(services.filter(x => x.id !== s.id))} className="text-destructive"><Trash2 className="w-4 h-4" /></button></div></div>
                        <AdminInput label="Title" value={s.title} onChange={e => setServices(services.map(x => x.id === s.id ? { ...x, title: e.target.value } : x))} /><AdminTextarea label="Desc" value={s.description} onChange={e => setServices(services.map(x => x.id === s.id ? { ...x, description: e.target.value } : x))} rows={2} />
                        <div><label className="text-sm font-medium">Features</label><div className="flex flex-wrap gap-2 my-2">{s.features.map((f: string, fi: number) => <span key={fi} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded flex items-center">{f}<button onClick={() => setServices(services.map(x => x.id === s.id ? { ...x, features: x.features.filter((_f: string, k: number) => k !== fi) } : x))} className="ml-1 hover:text-destructive">×</button></span>)}</div><div className="flex gap-2"><AdminInput value={newFeatureInputs[s.id] || ""} onChange={e => setNewFeatureInputs({ ...newFeatureInputs, [s.id]: e.target.value })} onKeyDown={e => e.key === "Enter" && addFeature(s.id)} placeholder="Add feature..." className="flex-1" /><AdminButton onClick={() => addFeature(s.id)} variant="secondary" size="sm">Add</AdminButton></div></div>
                    </div>
                ))}</div>
            </AdminCard>

            {/* Work Process */}
            <AdminCard>
                <div className="flex justify-between mb-6">
                    <div className="flex items-center gap-3"><Workflow className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">Process</h2></div>
                    <div className="flex gap-2">{workProcessHasChanges && <AdminButton onClick={handleSaveWorkProcess} loading={saving} size="sm" variant="secondary">Save Process</AdminButton>}<AdminButton onClick={addWorkStep} variant="outline" size="sm">Add</AdminButton></div>
                </div>
                <div className="space-y-4">{workProcess.map((wp, i) => (
                    <div key={wp.id} className="p-4 bg-secondary/30 rounded-lg space-y-4">
                        <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">Step #{i + 1}</span><div className="flex gap-1"><button onClick={() => { const nw = [...workProcess];[nw[i], nw[i - 1]] = [nw[i - 1], nw[i]]; setWorkProcess(nw); }} disabled={i === 0}><ChevronUp className="w-4 h-4" /></button><button onClick={() => { const nw = [...workProcess];[nw[i], nw[i + 1]] = [nw[i + 1], nw[i]]; setWorkProcess(nw); }} disabled={i === workProcess.length - 1}><ChevronDown className="w-4 h-4" /></button><button onClick={() => setWorkProcess(workProcess.filter(x => x.id !== wp.id))} className="text-destructive"><Trash2 className="w-4 h-4" /></button></div></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4"><AdminInput label="Step" value={wp.step} onChange={e => setWorkProcess(workProcess.map(x => x.id === wp.id ? { ...x, step: e.target.value } : x))} /><div className="md:col-span-3"><AdminInput label="Title" value={wp.title} onChange={e => setWorkProcess(workProcess.map(x => x.id === wp.id ? { ...x, title: e.target.value } : x))} /></div></div>
                        <AdminTextarea label="Desc" value={wp.description} onChange={e => setWorkProcess(workProcess.map(x => x.id === wp.id ? { ...x, description: e.target.value } : x))} rows={2} />
                    </div>
                ))}</div>
            </AdminCard>

            {/* What Drives Me (Values) */}
            <AdminCard>
                <div className="flex justify-between mb-6">
                    <div className="flex items-center gap-3"><Heart className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">What Drives Me</h2></div>
                    <div className="flex gap-2">
                        {valuesHasChanges && <AdminButton onClick={handleSaveValues} loading={saving} size="sm" variant="secondary">Save Values</AdminButton>}
                        <AdminButton onClick={addValue} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add</AdminButton>
                    </div>
                </div>
                <div className="space-y-4">
                    {values.map((v, i) => (
                        <div key={v.id} className="p-4 bg-secondary/30 rounded-lg space-y-3 border border-border/50">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-primary uppercase tracking-widest">Core Value #{i + 1}</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            const nv = [...values];
                                            [nv[i], nv[i - 1]] = [nv[i - 1], nv[i]];
                                            setValues(nv);
                                        }}
                                        disabled={i === 0}
                                        className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const nv = [...values];
                                            [nv[i], nv[i + 1]] = [nv[i + 1], nv[i]];
                                            setValues(nv);
                                        }}
                                        disabled={i === values.length - 1}
                                        className="p-1 hover:bg-primary/10 rounded disabled:opacity-30"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setValues(values.filter(x => x.id !== v.id))}
                                        className="p-1 text-destructive hover:bg-destructive/10 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <AdminIconSelect
                                    label="Visual Icon"
                                    value={v.key}
                                    onChange={val => setValues(values.map(x => x.id === v.id ? { ...x, key: val } : x))}
                                    options={iconOptions}
                                    helperText="This icon will represent this value on your site"
                                />
                                <AdminInput
                                    label="Value Title"
                                    value={v.title}
                                    onChange={e => setValues(values.map(x => x.id === v.id ? { ...x, title: e.target.value } : x))}
                                    placeholder="e.g. Innovation"
                                />
                            </div>
                            <AdminTextarea
                                label="Detailed Description"
                                value={v.description}
                                onChange={e => setValues(values.map(x => x.id === v.id ? { ...x, description: e.target.value } : x))}
                                rows={2}
                                placeholder="Explain why this value matters to your work..."
                            />
                        </div>
                    ))}
                </div>
            </AdminCard>

            {/* Meta */}
            <AdminCard>
                <div className="flex items-center gap-3 mb-6"><FileText className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold">SEO Meta</h2></div>
                <div className="space-y-6">
                    <div><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">English</h3>{metaEnHasChanges && <AdminButton onClick={handleSaveMetaEn} loading={saving} size="sm" variant="secondary">Save EN</AdminButton>}</div><div className="space-y-4 pl-4 border-l-2 border-border"><AdminInput label="Title" value={metaEn.title} onChange={e => setMetaEn({ ...metaEn, title: e.target.value })} /><AdminTextarea label="Desc" value={metaEn.description} onChange={e => setMetaEn({ ...metaEn, description: e.target.value })} /><AdminInput label="Keywords" value={metaEnKeywordsString} onChange={e => setMetaEnKeywordsString(e.target.value)} /></div></div>
                    <div><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">Arabic</h3>{metaArHasChanges && <AdminButton onClick={handleSaveMetaAr} loading={saving} size="sm" variant="secondary">Save AR</AdminButton>}</div><div className="space-y-4 pl-4 border-l-2 border-border"><AdminInput label="Title" value={metaAr.title} onChange={e => setMetaAr({ ...metaAr, title: e.target.value })} /><AdminTextarea label="Desc" value={metaAr.description} onChange={e => setMetaAr({ ...metaAr, description: e.target.value })} /><AdminInput label="Keywords" value={metaArKeywordsString} onChange={e => setMetaArKeywordsString(e.target.value)} /></div></div>
                </div>
            </AdminCard>

            {hasAnyChanges && (
                <div className="sticky bottom-0 bg-card border-t border-border p-4 rounded-t-xl -mx-4 -mb-4 mt-6 flex flex-col items-center gap-2">
                    {saveMessage && <div className="p-2 px-4 bg-success/10 border border-success/20 rounded-full text-success text-xs">{saveMessage}</div>}
                    <AdminButton onClick={handleSaveAll} disabled={saving} loading={saving} className="w-full max-w-md"><Save className="w-4 h-4 mr-2" />Save All Changes</AdminButton>
                    <p className="text-[10px] text-muted-foreground uppercase">Unsaved changes detected</p>
                </div>
            )}
        </div>
    );
};

export default AdminAboutEditor;
