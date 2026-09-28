import type { BlogPost } from "@/types/blog.types";
import BlogPostCard from "@/components/blog/BlogPostCard";

interface BlogPostsGridProps {
    posts: BlogPost[];
}

const BlogPostsGrid = ({ posts }: BlogPostsGridProps) => {
    if (!posts || posts.length === 0) {
        return (
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-2xl mx-auto text-center text-muted-foreground">
                        <p className="text-base sm:text-lg">
                            No blog posts available yet. Please check back soon.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 pb-20">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6">
                        {posts.map((post, index) => (
                            <BlogPostCard key={post.id} post={post} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BlogPostsGrid;

