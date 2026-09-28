import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import type { BlogPost } from "@/types/blog.types";
import { resolveIcon } from "@/components/icons/IconResolver";

interface BlogPostCardProps {
    post: BlogPost;
    index?: number;
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: [0.22, 0.61, 0.36, 1],
        },
    },
};

const BlogPostCard = ({ post, index = 0 }: BlogPostCardProps) => {
    const mediaType = post.media_type || "image";
    const mediaValue = post.image; // Backend stores all media types in image field
    const IconComponent = mediaType === "icon" && mediaValue ? resolveIcon(mediaValue) : null;

    const renderMedia = () => {
        if (mediaType === "emoji") {
            return (
                <div className="text-4xl shrink-0 w-16 h-16 flex items-center justify-center">
                    {mediaValue || "📝"}
                </div>
            );
        }
        if (mediaType === "icon" && IconComponent) {
            return (
                <div className="shrink-0 w-16 h-16 flex items-center justify-center text-primary">
                    <IconComponent className="w-8 h-8" />
                </div>
            );
        }
        // Default: image
        return (
            <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-secondary/50">
                {mediaValue ? (
                    <img
                        src={mediaValue}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
                        📝
                    </div>
                )}
            </div>
        );
    };

    return (
        <motion.article
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{
                duration: 0.45,
                ease: [0.22, 0.61, 0.36, 1],
                delay: index * 0.1,
            }}
            className="h-full"
        >
            <Link
                to={`/blog/${post.slug}`}
                className="glass rounded-2xl p-6 hover:bg-surface-hover/80 transition-all duration-300 group cursor-pointer  h-full flex flex-col"
            >
                <div className="flex items-start gap-4 flex-1">
                    {renderMedia()}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <h2 className="font-heading text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                            {post.excerpt}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" aria-hidden="true" />
                                {post.date}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" aria-hidden="true" />
                                {post.read_time}
                            </span>
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag, index) => (
                                    <span
                                        key={`${tag}-${index}`}
                                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Read More Link */}
                <div className="mt-4 pt-4 border-t border-border/50 shrink-0">
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                        Read Article
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                </div>
            </Link>
        </motion.article>
    );
};

export default BlogPostCard;

