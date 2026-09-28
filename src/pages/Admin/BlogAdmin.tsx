import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  User,
  Upload,
  X,
  Search,
  Info,
  Eye,
  Edit as EditIcon,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { blogService } from "@/services/blog.service";
import { iconService } from "@/services/icon.service";
import type { Icon } from "@/services/icon.service";
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminLoadingState, AdminSelect } from "@/components/Admin";
import { AdminIconSelect } from "@/components/Admin/ui/AdminIconSelect";
import { resolveIcon } from "@/components/icons/IconResolver";

// Helper: Normalize data for comparison
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

const AdminBlogEditor = () => {
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [iconOptions, setIconOptions] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const hasFetchedRef = useRef(false);

  // Form state
  const [heroData, setHeroData] = useState({ title: "", subtitle: "", description: "" });
  const [authorData, setAuthorData] = useState({ name: "", avatar: "", bio: "", social_links: [] as any[] });
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [metaEn, setMetaEn] = useState({ title: "", description: "", keywords: "" });
  const [metaAr, setMetaAr] = useState({ title: "", description: "", keywords: "" });
  const [tagInputValues, setTagInputValues] = useState<Record<number, string>>({});

  const [saving, setSaving] = useState(false);
  
  // Original states
  const [originalHero, setOriginalHero] = useState<string>("");
  const [originalAuthor, setOriginalAuthor] = useState<string>("");
  const [originalPosts, setOriginalPosts] = useState<string>("");
  const [originalMetaEn, setOriginalMetaEn] = useState<string>("");
  const [originalMetaAr, setOriginalMetaAr] = useState<string>("");

  // Cleaners for comparison
  const cleanHero = useCallback((data: any) => normalize({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    description: data?.description || ""
  }), []);

  const cleanAuthor = useCallback((data: any) => normalize({
    name: data?.name || "",
    avatar: data?.avatar || "",
    bio: data?.bio || "",
    social_links: Array.isArray(data?.social_links) ? data.social_links : []
  }), []);

  const cleanPosts = useCallback((data: any[]) => normalize((data || []).map(p => ({
    title: p?.title || "",
    image: p?.image || "",
    media_type: p?.media_type || "image",
    category: p?.category || "",
    tags: Array.isArray(p.tags) ? p.tags : [],
    content: Array.isArray(p.content) ? p.content : [],
    published_at: p?.published_at || null
  }))), []);

  const cleanMeta = useCallback((meta: any) => normalize({
    title: meta?.title || "",
    description: meta?.description || "",
    keywords: (meta?.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean).join(", ")
  }), []);

  // Changes detection
  const heroHasChanges = originalHero !== cleanHero(heroData);
  const authorHasChanges = originalAuthor !== cleanAuthor(authorData);
  const postsHasChanges = originalPosts !== cleanPosts(blogPosts);
  const metaEnHasChanges = originalMetaEn !== cleanMeta(metaEn);
  const metaArHasChanges = originalMetaAr !== cleanMeta(metaAr);

  const hasAnyChanges = heroHasChanges || authorHasChanges || postsHasChanges || metaEnHasChanges || metaArHasChanges;

  useEffect(() => {
    if (hasFetchedRef.current) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [res, icons] = await Promise.all([
          blogService.getBlogData(),
          iconService.getIcons(),
        ]);

        setIconOptions(icons);

        const hero = { 
          title: res.hero?.title || "", 
          subtitle: res.hero?.subtitle || "",
          description: res.hero?.description || ""
        };
        setHeroData(hero);
        setOriginalHero(cleanHero(hero));

        const author = { 
          name: res?.author?.name || "", 
          avatar: res?.author?.avatar || "", 
          bio: res?.author?.bio || "", 
          social_links: Array.isArray(res?.author?.social_links) ? res.author.social_links : [] 
        };
        setAuthorData(author);
        setOriginalAuthor(cleanAuthor(author));

        const posts = (res?.posts || []).map((p: any) => ({ 
          ...p, 
          tags: Array.isArray(p.tags) ? p.tags : [],
          content: Array.isArray(p.content) ? p.content : (p.content ? [p.content] : []), // Handle content field
          media_type: p.media_type || "image"
        }));
        setBlogPosts(posts);
        setOriginalPosts(cleanPosts(posts));

        try {
          const [mEn, mAr] = await Promise.all([
            blogService.getBlogMeta("en"),
            blogService.getBlogMeta("ar")
          ]);
          if (mEn) {
            const d = { title: mEn.title || "", description: mEn.description || "", keywords: (mEn.keywords || []).join(", ") };
            setMetaEn(d);
            setOriginalMetaEn(cleanMeta(d));
          }
          if (mAr) {
            const d = { title: mAr.title || "", description: mAr.description || "", keywords: (mAr.keywords || []).join(", ") };
            setMetaAr(d);
            setOriginalMetaAr(cleanMeta(d));
          }
        } catch (e) { /* ignore */ }

      } catch (err) { 
        setError("Failed to fetch blog data"); 
      } finally { 
        setLoading(false);
        hasFetchedRef.current = true;
      }
    };
    fetchData();
  }, [cleanHero, cleanAuthor, cleanPosts, cleanMeta]);

  const handleSaveHero = async () => {
    try { 
      setSaving(true); 
      await blogService.updateBlogHero(heroData); 
      setOriginalHero(cleanHero(heroData)); 
      setSaveMessage("Hero saved!"); 
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { 
      setError("Failed to save hero"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAuthorData({ ...authorData, avatar: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAuthor = async () => {
    try { 
      setSaving(true);
      // Ensure social_links is always an array
      const authorPayload = {
        ...authorData,
        social_links: Array.isArray(authorData.social_links) ? authorData.social_links : []
      };
      await blogService.updateBlogAuthor(authorPayload); 
      setOriginalAuthor(cleanAuthor(authorData)); 
      setSaveMessage("Author saved!"); 
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { 
      setError("Failed to save author"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleAddPost = () => {
    // Create a temporary new post object for editing (not saved yet)
    const tempId = Date.now(); // Temporary ID until saved
    const newPost = {
      id: tempId,
      title: "",
      content: [],
      image: "",
      media_type: "image" as const,
      category: "",
      tags: [] as string[],
      slug: "",
      published_at: new Date().toISOString()
    };
    
    // Add to posts list and set as editing
    setBlogPosts([newPost, ...blogPosts]);
    setEditingPostId(tempId);
  };

  const handleSavePost = async (post: any) => {
    try {
      setSaving(true);
      
      // Check if this is a new post (temp ID) or existing post
      const isNewPost = typeof post.id === 'number' && post.id > 1000000000000; // Temp IDs are timestamps
      
      if (isNewPost) {
        // Create new post
        const response = await blogService.addBlogPost({
          title: post.title,
          content: post.content || [],
          image: post.image || "",
          media_type: post.media_type || "image",
          category: post.category || "",
          tags: post.tags || [],
          published_at: post.published_at || new Date().toISOString()
        });
        const createdPost = response.data;
        
        // Replace temp post with created post
        setBlogPosts(blogPosts.map(p => p.id === post.id ? createdPost : p));
        setOriginalPosts(cleanPosts(blogPosts.map(p => p.id === post.id ? createdPost : p)));
        setEditingPostId(null);
        setSaveMessage("Blog post created successfully!");
      } else {
        // Update existing post
        const response = await blogService.updateBlogPost({
          ...post,
          content: post.content || [],
          tags: post.tags || []
        });
        const updatedPost = response.data || post;
        // Ensure content is an array
        const postWithContent = {
          ...updatedPost,
          content: Array.isArray(updatedPost.content) ? updatedPost.content : []
        };
        const updatedPosts = blogPosts.map(p => p.id === post.id ? postWithContent : p);
        setBlogPosts(updatedPosts);
        setOriginalPosts(cleanPosts(updatedPosts));
        setEditingPostId(null);
        setSaveMessage("Blog post updated!");
      }
      
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { 
      setError("Failed to save blog post"); 
    } finally { 
      setSaving(false); 
    }
  };
  
  const handleCancelEdit = (post: any) => {
    // Check if this is a new post (temp ID) - if so, remove it
    const isNewPost = typeof post.id === 'number' && post.id > 1000000000000;
    if (isNewPost) {
      setBlogPosts(blogPosts.filter(p => p.id !== post.id));
    }
    setEditingPostId(null);
  };

  const handleDeletePost = async (id: number) => {
    // Check if this is a temp post (not saved yet)
    const isTempPost = typeof id === 'number' && id > 1000000000000;
    
    if (isTempPost) {
      // Just remove from list without API call
      setBlogPosts(blogPosts.filter(p => p.id !== id));
      if (editingPostId === id) {
        setEditingPostId(null);
      }
      return;
    }
    
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    
    try {
      setSaving(true);
      await blogService.deleteBlogPost(id);
      setBlogPosts(blogPosts.filter(p => p.id !== id));
      setOriginalPosts(cleanPosts(blogPosts.filter(p => p.id !== id)));
      if (editingPostId === id) {
        setEditingPostId(null);
      }
      setSaveMessage("Blog post deleted!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { 
      setError("Failed to delete blog post"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleSaveMetaEn = async () => {
    try { 
      setSaving(true); 
      await blogService.updateBlogMeta({ 
        ...metaEn, 
        keywords: metaEn.keywords.split(",").map(k => k.trim()).filter(k => k !== ""), 
        locale: "en" 
      }); 
      setOriginalMetaEn(cleanMeta(metaEn)); 
      setSaveMessage("Meta (EN) saved!"); 
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { 
      setError("Failed to save meta (EN)"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleSaveMetaAr = async () => {
    try { 
      setSaving(true); 
      await blogService.updateBlogMeta({ 
        ...metaAr, 
        keywords: metaAr.keywords.split(",").map(k => k.trim()).filter(k => k !== ""), 
        locale: "ar" 
      }); 
      setOriginalMetaAr(cleanMeta(metaAr)); 
      setSaveMessage("Meta (AR) saved!"); 
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) { 
      setError("Failed to save meta (AR)"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleImageUpload = (postId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setBlogPosts(blogPosts.map(p => 
        p.id === postId 
          ? { ...p, image: base64String, media_type: "image" }
          : p
      ));
    };
    reader.readAsDataURL(file);
  };

  // Render media preview matching guest view
  const renderMediaPreview = (post: any) => {
    const mediaType = post.media_type || "image";
    const IconComponent = mediaType === "icon" && post.image ? resolveIcon(post.image) : null;

    if (mediaType === "emoji") {
      return (
        <div className="text-4xl flex-shrink-0 w-16 h-16 flex items-center justify-center">
          {post.image || "😀"}
        </div>
      );
    }
    if (mediaType === "icon" && IconComponent) {
      return (
        <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center text-primary">
          <IconComponent className="w-8 h-8" />
        </div>
      );
    }
    // Default: image (same style as BlogPostCard)
    return (
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-secondary/50">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
            📝
          </div>
        )}
      </div>
    );
  };

  if (loading) return <AdminLoadingState message="Loading blog settings..." />;

  const filteredPosts = blogPosts.filter((post) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) ||
      post.category?.toLowerCase().includes(query) ||
      post.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-['Sora']">Blog Page Editor</h1>
          <p className="text-sm text-muted-foreground">Manage articles and profile</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {/* Hero Section */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground font-['Sora']">Hero</h2>
          </div>
          {heroHasChanges && (
            <AdminButton onClick={handleSaveHero} loading={saving} size="sm" variant="secondary">
              Save Hero
            </AdminButton>
          )}
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput 
              label="Title" 
              value={heroData.title} 
              onChange={(e) => setHeroData({ ...heroData, title: e.target.value })} 
            />
            <AdminInput 
              label="Subtitle" 
              value={heroData.subtitle} 
              onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })} 
            />
          </div>
          <AdminTextarea 
            label="Description" 
            value={heroData.description} 
            onChange={(e) => setHeroData({ ...heroData, description: e.target.value })} 
            rows={3}
          />
        </div>
      </AdminCard>

      {/* Author Section */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground font-['Sora']">Author</h2>
          </div>
          {authorHasChanges && (
            <AdminButton onClick={handleSaveAuthor} loading={saving} size="sm" variant="secondary">
              Save Author
            </AdminButton>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-6">
            {/* Avatar Preview (matching guest view: w-16 h-16 rounded-full) */}
            <div className="flex-shrink-0">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-secondary/50 border-2 border-border">
                {authorData.avatar ? (
                  <img 
                    src={authorData.avatar} 
                    alt="Author avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
                    {authorData.name.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1 italic">Preview</p>
            </div>

            {/* Avatar Upload */}
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Avatar</label>
              <input
                type="file"
                ref={avatarFileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => avatarFileInputRef.current?.click()}
                className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {authorData.avatar ? "Change" : "Upload"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput 
              label="Name" 
              value={authorData.name} 
              onChange={(e) => setAuthorData({ ...authorData, name: e.target.value })} 
            />
          </div>
          <AdminTextarea 
            label="Bio" 
            value={authorData.bio} 
            onChange={(e) => setAuthorData({ ...authorData, bio: e.target.value })} 
            rows={2} 
          />
        </div>
      </AdminCard>

      {/* Blog Posts Section */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground font-['Sora']">Blog Posts</h2>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {blogPosts.length} {blogPosts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
          <AdminButton onClick={handleAddPost} variant="outline" size="sm" loading={saving}>
            <Plus className="w-4 h-4 mr-2" />
            Add Post
          </AdminButton>
        </div>

        {/* Search Bar */}
        {blogPosts.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <AdminInput
                placeholder="Search posts by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Blog Posts List */}
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isEditing = editingPostId === post.id;
            
            return (
              <div key={post.id} className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                {!isEditing ? (
                  // List View
                  <div className="flex items-center gap-4">
                    {renderMediaPreview(post)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground line-clamp-2">{post.title || "Untitled"}</h3>
                      <p className="text-sm text-muted-foreground truncate">{post.category || "No category"}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {post.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {post.slug && (
                        <Link
                          to={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          title="View Article"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => setEditingPostId(post.id)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        title="Edit Post"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Edit View
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Edit Post</h3>
                      <div className="flex gap-2">
                        <AdminButton
                          onClick={() => handleSavePost(post)}
                          size="sm"
                          variant="secondary"
                          loading={saving}
                        >
                          {typeof post.id === 'number' && post.id > 1000000000000 ? "Create Post" : "Save Changes"}
                        </AdminButton>
                        <AdminButton
                          onClick={() => handleCancelEdit(post)}
                          size="sm"
                          variant="ghost"
                          disabled={saving}
                        >
                          Cancel
                        </AdminButton>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {/* Media Preview */}
                      <div className="flex-shrink-0">
                        {renderMediaPreview(post)}
                        <p className="text-[10px] text-muted-foreground text-center mt-1 italic">Preview</p>
                      </div>

                      {/* Edit Form */}
                      <div className="flex-1 space-y-4">
                        <AdminInput
                          label="Title"
                          value={post.title || ""}
                          onChange={(e) => setBlogPosts(blogPosts.map(p => p.id === post.id ? { ...p, title: e.target.value } : p))}
                        />

                        <AdminSelect
                          label="Media Type"
                          value={post.media_type || "image"}
                          onChange={(e) => {
                            const newType = e.target.value as 'image' | 'emoji' | 'icon';
                            setBlogPosts(blogPosts.map(p => 
                              p.id === post.id 
                                ? { ...p, media_type: newType, image: "" }
                                : p
                            ));
                          }}
                          options={[
                            { value: "image", label: "Image" },
                            { value: "emoji", label: "Emoji" },
                            { value: "icon", label: "Icon" },
                          ]}
                        />

                        {/* Conditional Media Input */}
                        {post.media_type === "image" && (
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Upload Image</label>
                            <input
                              type="file"
                              id={`post-img-${post.id}`}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(post.id, e)}
                            />
                            <button
                              onClick={() => document.getElementById(`post-img-${post.id}`)?.click()}
                              className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              {post.image ? "Change" : "Upload"}
                            </button>
                          </div>
                        )}

                        {post.media_type === "emoji" && (
                          <AdminInput
                            label="Emoji"
                            value={post.image || ""}
                            onChange={(e) => setBlogPosts(blogPosts.map(p => p.id === post.id ? { ...p, image: e.target.value } : p))}
                            placeholder="😀 🚀 💡 ..."
                          />
                        )}

                        {post.media_type === "icon" && (
                          <AdminIconSelect
                            label="Icon"
                            value={post.image || ""}
                            onChange={(value) => setBlogPosts(blogPosts.map(p => p.id === post.id ? { ...p, image: value } : p))}
                            options={iconOptions.map(icon => ({
                              key: icon.key,
                              icon: icon.icon,
                              library: icon.library
                            }))}
                          />
                        )}

                        <AdminInput
                          label="Category"
                          value={post.category || ""}
                          onChange={(e) => setBlogPosts(blogPosts.map(p => p.id === post.id ? { ...p, category: e.target.value } : p))}
                        />

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Tags</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {Array.isArray(post.tags) && post.tags.map((tag: string, tagIndex: number) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                              >
                                {tag}
                                <button
                                  onClick={() => {
                                    const newTags = [...(post.tags || [])];
                                    newTags.splice(tagIndex, 1);
                                    setBlogPosts(blogPosts.map(p => p.id === post.id ? { ...p, tags: newTags } : p));
                                  }}
                                  className="hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <AdminInput
                            placeholder="Add tag and press Enter"
                            value={tagInputValues[post.id] || ""}
                            onChange={(e) => setTagInputValues({ ...tagInputValues, [post.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const tagValue = tagInputValues[post.id]?.trim();
                                if (tagValue) {
                                  const newTags = [...(post.tags || []), tagValue];
                                  setBlogPosts(blogPosts.map(p => p.id === post.id ? { ...p, tags: newTags } : p));
                                  setTagInputValues({ ...tagInputValues, [post.id]: "" });
                                }
                              }
                            }}
                          />
                        </div>

                        <div className="pt-4 border-t border-border/50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-foreground">Article Content</h4>
                            <AdminButton
                              onClick={() => setEditingArticleId(editingArticleId === post.id ? null : post.id)}
                              size="sm"
                              variant="outline"
                            >
                              {editingArticleId === post.id ? "Close Editor" : "Edit Content"}
                            </AdminButton>
                          </div>
                          
                          {editingArticleId === post.id && (
                            <div className="space-y-3 mt-4">
                              <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                                <div className="flex items-center gap-2 mb-3">
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    <strong>Paragraph:</strong> Type normally | 
                                    <strong> Heading:</strong> Start with ## Heading Text | 
                                    <strong> Code:</strong> Start and end with ```
                                  </p>
                                </div>
                              
                                <div className="space-y-4">
                                  {(post.content || []).map((block: string, blockIndex: number) => (
                                    <div key={blockIndex} className="p-3 bg-background rounded-lg border border-border/50">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                          Block {blockIndex + 1}
                                          {block.startsWith("## ") && " (Heading)"}
                                          {block.startsWith("```") && " (Code)"}
                                          {!block.startsWith("## ") && !block.startsWith("```") && block.trim() && " (Paragraph)"}
                                        </span>
                                        <button
                                          onClick={() => {
                                            const newContent = (post.content || []).filter((_: string, idx: number) => idx !== blockIndex);
                                            setBlogPosts(blogPosts.map(p => p.id === post.id ? { ...p, content: newContent } : p));
                                          }}
                                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                          title="Remove block"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      <AdminTextarea
                                        value={block}
                                        onChange={(e) => {
                                          const newContent = [...(post.content || [])];
                                          newContent[blockIndex] = e.target.value;
                                          setBlogPosts(blogPosts.map(p => p.id === post.id ? { ...p, content: newContent } : p));
                                        }}
                                        placeholder={block.startsWith("## ") ? "## Your Heading Text" : block.startsWith("```") ? "```\nYour code here\n```" : "Enter paragraph text..."}
                                        rows={block.startsWith("```") ? 6 : block.startsWith("## ") ? 2 : 3}
                                        className="font-mono text-sm"
                                      />
                                    </div>
                                  ))}
                                </div>
                              
                                <div className="flex gap-2 mt-4">
                                  <AdminButton
                                    onClick={() => {
                                      const newContent = [...(post.content || []), ""];
                                      setBlogPosts(blogPosts.map(p => p.id === post.id ? { ...p, content: newContent } : p));
                                    }}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Paragraph
                                  </AdminButton>
                                  <AdminButton
                                    onClick={() => {
                                      const newContent = [...(post.content || []), "## "];
                                      setBlogPosts(blogPosts.map(p => p.id === post.id ? { ...p, content: newContent } : p));
                                    }}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Heading
                                  </AdminButton>
                                  <AdminButton
                                    onClick={() => {
                                      const newContent = [...(post.content || []), "```\n\n```"];
                                      setBlogPosts(blogPosts.map(p => p.id === post.id ? { ...p, content: newContent } : p));
                                    }}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Code
                                  </AdminButton>
                                </div>
                              
                                {(!post.content || post.content.length === 0) && (
                                  <p className="text-sm text-muted-foreground italic text-center py-4 bg-secondary/20 rounded-lg mt-3">
                                    No content blocks yet. Click "Add Block" to start writing.
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {editingArticleId !== post.id && post.slug && (
                            <Link
                              to={`/blog/${post.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Preview Article
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? (
                <>
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No posts found matching "{searchQuery}"</p>
                </>
              ) : (
                <>
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No blog posts yet. Click "Add Post" to create your first post.</p>
                </>
              )}
            </div>
          )}
        </div>
      </AdminCard>

      {/* SEO Meta Section */}
      <AdminCard>
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground font-['Sora']">SEO Meta</h2>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-foreground">English</h3>
              {metaEnHasChanges && (
                <AdminButton onClick={handleSaveMetaEn} loading={saving} size="sm" variant="secondary">
                  Save EN
                </AdminButton>
              )}
            </div>
            <div className="space-y-4 pl-4 border-l-2 border-border">
              <AdminInput 
                label="Title" 
                value={metaEn.title} 
                onChange={(e) => setMetaEn({ ...metaEn, title: e.target.value })} 
              />
              <AdminTextarea 
                label="Description" 
                value={metaEn.description} 
                onChange={(e) => setMetaEn({ ...metaEn, description: e.target.value })} 
              />
              <AdminInput 
                label="Keywords (comma-separated)" 
                value={metaEn.keywords} 
                onChange={(e) => setMetaEn({ ...metaEn, keywords: e.target.value })} 
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-foreground">Arabic</h3>
              {metaArHasChanges && (
                <AdminButton onClick={handleSaveMetaAr} loading={saving} size="sm" variant="secondary">
                  Save AR
                </AdminButton>
              )}
            </div>
            <div className="space-y-4 pl-4 border-l-2 border-border">
              <AdminInput 
                label="Title" 
                value={metaAr.title} 
                onChange={(e) => setMetaAr({ ...metaAr, title: e.target.value })} 
              />
              <AdminTextarea 
                label="Description" 
                value={metaAr.description} 
                onChange={(e) => setMetaAr({ ...metaAr, description: e.target.value })} 
              />
              <AdminInput 
                label="Keywords (comma-separated)" 
                value={metaAr.keywords} 
                onChange={(e) => setMetaAr({ ...metaAr, keywords: e.target.value })} 
              />
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Save All Button */}
      {hasAnyChanges && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4 rounded-t-xl -mx-4 -mb-4 mt-6 flex flex-col items-center gap-2">
          {saveMessage && (
            <div className="p-2 px-4 bg-success/10 border border-success/20 rounded-full text-success text-xs">
              {saveMessage}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Unsaved changes detected</p>
        </div>
      )}
    </div>
  );
};

export default AdminBlogEditor;
