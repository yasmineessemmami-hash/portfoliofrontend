import { resolveIcon } from "@/components/icons/IconResolver";
import type { AuthorInfo } from "@/types/blog.types";

interface BlogAuthorSectionProps {
    author: AuthorInfo;
}

const BlogAuthorSection = ({ author }: BlogAuthorSectionProps) => {
    return (
        <div className="mt-8 glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
                {author.avatar?.image_url ? (
                    <img
                        src={author.avatar.image_url}
                        alt={author.avatar.alt || author.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                        {author.full_name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <h3 className="font-heading font-semibold text-foreground">
                        {author.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{author.role}</p>
                </div>
            </div>
            {author.bio && (
                <p className="mt-4 text-sm text-muted-foreground">{author.bio}</p>
            )}
            {author.social_links && author.social_links.length > 0 && (
                <div className="mt-4 flex items-center gap-3">
                    {author.social_links.map((social) => {
                        const Icon = resolveIcon(social.icon_key);
                        if (!Icon) return null;
                        return (
                            <a
                                key={social.platform}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 glass rounded-lg hover:bg-surface-hover transition-colors"
                                aria-label={`${author.full_name} on ${social.platform}`}
                            >
                                <Icon className="w-4 h-4 text-muted-foreground" />
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BlogAuthorSection;

