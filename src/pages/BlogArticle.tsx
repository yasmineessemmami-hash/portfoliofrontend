import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, Tag, BookOpen, Share2, LinkedinIcon, Check } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/seo/SEO";
import ServerError from "@/pages/ServerError";
import { useBlogArticle } from "@/hooks/useBlogArticle";
import { useBlogAuthor } from "@/hooks/useBlogAuthor";
import { useBlogArticleMeta } from "@/hooks/useBlogArticleMeta";
import BlogContentRenderer, { parseMixedContent } from "@/components/blog/BlogContentRenderer";
import BlogAuthorSection from "@/components/blog/BlogAuthorSection";
import BlogArticleSkeleton from "@/components/skeletons/BlogArticleSkeleton";
import { motion, type Variants } from "framer-motion";
import { resolveIcon } from "@/components/icons/IconResolver";

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: [0.22, 0.61, 0.36, 1],
            staggerChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
    },
};

const BlogArticle = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: articleData, loading: articleLoading, error: articleError } =
        useBlogArticle(slug || "");
    const { data: authorData, loading: authorLoading } = useBlogAuthor();
    const { meta } = useBlogArticleMeta(slug || "");
    const [copySuccess, setCopySuccess] = useState(false);

    if (articleLoading || authorLoading) {
        return (
            <>
                <SEO meta={meta} />
                <MainLayout>
                    <BlogArticleSkeleton />
                </MainLayout>
            </>
        );
    }

    if (articleError || !articleData) {
        // Check if it's a 404 (article not found)
        if (articleError?.includes("404") || articleError?.includes("not found")) {
            // Default meta for 404 page
            const notFoundMeta = {
                title: "Article Not Found",
                description: "The article you're looking for doesn't exist.",
                keywords: [],
            };
            return (
                <>
                    <SEO meta={notFoundMeta} />
                    <MainLayout>
                        <section className="relative flex items-center justify-center p-4 min-h-[60vh]">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📄</div>
                                <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                                    Article Not Found
                                </h1>
                                <p className="text-muted-foreground mb-6">
                                    The article you&apos;re looking for doesn&apos;t exist.
                                </p>
                                <Link
                                    to="/blog"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Blog
                                </Link>
                            </div>
                        </section>
                    </MainLayout>
                </>
            );
        }

        return (
            <>
                <SEO meta={meta} />
                <ServerError />
            </>
        );
    }

    // Ensure article exists before accessing properties
    if (!articleData?.article) {
        return (
            <>
                <SEO meta={meta || { title: "Article Not Found", description: "", keywords: [] }} />
                <MainLayout>
                    <section className="relative flex items-center justify-center p-4 min-h-[60vh]">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📄</div>
                            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                                Article Not Found
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                The article data is invalid or missing.
                            </p>
                            <Link
                                to="/blog"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Blog
                            </Link>
                        </div>
                    </section>
                </MainLayout>
            </>
        );
    }

    const { article } = articleData;
    const author = authorData?.author;

    // Use backend meta if available, otherwise create default from article
    const seoMeta = meta || {
        title: article.title,
        description: article.excerpt,
        keywords: article.tags || [],
    };

    // Build share URLs
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(article.title);
    const encodedSummary = encodeURIComponent(article.excerpt || "");

    // LinkedIn post creation URL
    const linkedinPostUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}`;

    // Copy link to clipboard handler
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopySuccess(true);
            setTimeout(() => {
                setCopySuccess(false);
            }, 3000);
        } catch (error) {
            console.error("Failed to copy link:", error);
            alert("Failed to copy link. Please copy it manually.");
        }
    };

    // LinkedIn share handler - opens LinkedIn post creation, or falls back to copy link
    const handleLinkedInShare = (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            // Try to open LinkedIn post creation window
            const linkedinWindow = window.open(linkedinPostUrl, '_blank', 'width=600,height=400');
            // If popup was blocked, fallback to copy link
            if (!linkedinWindow || linkedinWindow.closed || typeof linkedinWindow.closed === 'undefined') {
                handleCopyLink();
            }
        } catch (error) {
            // If any error, just copy the link
            handleCopyLink();
        }
    };

    return (
        <>
            <SEO meta={seoMeta} />
            <MainLayout>
                {/* Article Header */}
                <motion.section
                    className="pt-16 sm:pt-20 pb-8 sm:pb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.7 }}
                    variants={containerVariants}
                >
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="max-w-3xl mx-auto">
                            {/* Back Link */}
                            <motion.div variants={itemVariants}>
                                <Link
                                    to="/blog"
                                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
                                >
                                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                                    Back to Blog
                                </Link>
                            </motion.div>

                            {/* Article Media (Image/Emoji/Icon) */}
                            <motion.div
                                variants={itemVariants}
                                className="mb-6"
                            >
                                {(() => {
                                    const mediaType = article.media_type || "image";
                                    const mediaValue = article.image; // Backend stores all media types in image field
                                    const IconComponent = mediaType === "icon" && mediaValue 
                                        ? resolveIcon(mediaValue) 
                                        : null;

                                    if (mediaType === "emoji") {
                                        return (
                                            <div className="text-6xl flex items-center justify-center">
                                                {mediaValue || "📝"}
                                            </div>
                                        );
                                    }
                                    if (mediaType === "icon" && IconComponent) {
                                        return (
                                            <div className="flex items-center justify-center text-primary">
                                                <IconComponent className="w-16 h-16 sm:w-20 sm:h-20" />
                                            </div>
                                        );
                                    }
                                    // Default: image
                                    return (
                                        <div className="aspect-video rounded-xl overflow-hidden bg-secondary/50">
                                            {mediaValue ? (
                                                <img 
                                                    src={mediaValue} 
                                                    alt={article.title}
                                                    className="w-full h-full object-cover"
                                                    loading="eager"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-6xl">
                                                    📝
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </motion.div>

                            {/* Title */}
                            <motion.h1
                                variants={itemVariants}
                                className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
                            >
                                {article.title}
                            </motion.h1>

                            {/* Meta Info */}
                            <motion.div
                                variants={itemVariants}
                                className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6"
                            >
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4" aria-hidden="true" />
                                    {article.date}
                                </span>
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" aria-hidden="true" />
                                    {article.read_time}
                                </span>
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                                    Article
                                </span>
                            </motion.div>

                            {/* Tags */}
                            {article.tags && article.tags.length > 0 && (
                                <motion.div
                                    variants={itemVariants}
                                    className="flex flex-wrap gap-2 mb-8"
                                >
                                    {article.tags.map((tag, index) => (
                                        <span
                                            key={`${tag}-${index}`}
                                            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center gap-1"
                                        >
                                            <Tag className="w-3 h-3" aria-hidden="true" />
                                            {tag}
                                        </span>
                                    ))}
                                </motion.div>
                            )}

                            {/* Excerpt - Display full first paragraph from content with mixed content support */}
                            <motion.div
                                variants={itemVariants}
                                className="text-lg text-muted-foreground border-l-4 border-primary pl-4"
                            >
                                {(() => {
                                    // Get the first content block if available
                                    const firstBlockRaw = article.content && article.content.length > 0 
                                        ? article.content[0] 
                                        : null;
                                    
                                    const firstBlock = typeof firstBlockRaw === 'object' && firstBlockRaw !== null && 'content' in firstBlockRaw 
                                        ? firstBlockRaw.content 
                                        : firstBlockRaw;
                                    
                                    if (typeof firstBlock === 'string') {
                                        // If it's a heading (starts with "## "), remove prefix and render
                                        if (firstBlock.startsWith("## ")) {
                                            return (
                                                <h2 className="font-heading text-xl sm:text-2xl font-semibold text-foreground">
                                                    {firstBlock.replace("## ", "")}
                                                </h2>
                                            );
                                        }
                                        // If it's a code block (starts with ```), extract and render
                                        if (firstBlock.startsWith("```")) {
                                            const code = firstBlock
                                                .replace(/```\w*\n?/, "")
                                                .replace(/```$/, "")
                                                .trim();
                                            return (
                                                <pre className="bg-surface border border-border rounded-lg p-4 overflow-x-auto my-4">
                                                    <code className="text-sm text-muted-foreground font-mono whitespace-pre">
                                                        {code || article.excerpt}
                                                    </code>
                                                </pre>
                                            );
                                        }
                                        // Otherwise, parse mixed content (##text## for bold, ```code``` for code)
                                        return parseMixedContent(firstBlock);
                                    }
                                    // Fallback to excerpt if no content
                                    return <span>{article.excerpt}</span>;
                                })()}
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* Article Content */}
                <section className="py-8 pb-16">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="max-w-3xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                            >
                                <BlogContentRenderer content={article.content} />
                            </motion.div>

                            {/* Share Section */}
                            <motion.div
                                className="mt-12 pt-8 border-t border-border/50"
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                            >
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <span className="text-sm text-muted-foreground">
                                        Share this article
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={handleCopyLink}
                                                className="p-2 glass rounded-lg hover:bg-surface-hover transition-colors"
                                                aria-label="Copy link"
                                            >
                                                <Share2 className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                            {copySuccess && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap flex items-center gap-1.5 shadow-lg z-10"
                                                    style={{ 
                                                        color: 'var(--color-success)',
                                                        backgroundColor: 'hsl(var(--color-success) / 0.1)',
                                                        border: '1px solid hsl(var(--color-success) / 0.2)'
                                                    }}
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Link copied to clipboard
                                                </motion.div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleLinkedInShare}
                                            className="p-2 glass rounded-lg hover:bg-surface-hover transition-colors"
                                            aria-label="Share on LinkedIn"
                                        >
                                            <LinkedinIcon className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Author Section */}
                            {author && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                                >
                                    <BlogAuthorSection author={author} />
                                </motion.div>
                            )}
                        </div>
                    </div>
                </section>
            </MainLayout>
        </>
    );
};

export default BlogArticle;

