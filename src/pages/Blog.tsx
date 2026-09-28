import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/seo/SEO";
import ServerError from "@/pages/ServerError";
import { useBlogList } from "@/hooks/useBlogList";
import BlogHero from "@/components/blog/BlogHero";
import BlogPostsGrid from "@/components/blog/BlogPostsGrid";
import BlogListSkeleton from "@/components/skeletons/BlogListSkeleton";
import { motion } from "framer-motion";
import { blogService } from "@/services/blog.service";
import { Check, X } from "lucide-react";

const Blog = () => {
    const { data, loading, error } = useBlogList();
    const [email, setEmail] = useState("");
    const [subscribing, setSubscribing] = useState(false);
    const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (loading) {
        return (
            <MainLayout>
                <BlogListSkeleton />
            </MainLayout>
        );
    }

    if (error || !data) {
        return (
            <>
                <SEO meta={null} />
                <ServerError />
            </>
        );
    }

    return (
        <>
            <SEO meta={null} />
            <MainLayout>
                <BlogHero hero={data.hero} />
                <BlogPostsGrid posts={data.posts} />

                {/* Newsletter Subscription Section */}
                <motion.section
                    className="py-16"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.7 }}
                    transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                >
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="max-w-2xl mx-auto">
                            <div className="glass rounded-2xl p-8 sm:p-12 text-center">
                                <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                                    Stay <span className="text-gradient">Updated</span>
                                </h2>
                                <p className="text-muted-foreground mb-8">
                                    Subscribe to get notified when I publish new articles about
                                    web development and technology.
                                </p>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!email.trim()) return;
                                        
                                        setSubscribing(true);
                                        setSubscribeMessage(null);
                                        
                                        try {
                                            await blogService.subscribe(email.trim());
                                            setSubscribeMessage({ type: 'success', text: 'Successfully subscribed!' });
                                            setEmail("");
                                        } catch (err: any) {
                                            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to subscribe. Please try again.';
                                            setSubscribeMessage({ type: 'error', text: errorMessage });
                                        } finally {
                                            setSubscribing(false);
                                            setTimeout(() => setSubscribeMessage(null), 5000);
                                        }
                                    }}
                                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                                >
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={subscribing}
                                        required
                                        className="flex-1 px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={subscribing || !email.trim()}
                                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {subscribing ? "Subscribing..." : "Subscribe"}
                                    </button>
                                </form>
                                
                                {subscribeMessage && (
                                    <div
                                        className={`mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                                            subscribeMessage.type === 'success'
                                                ? 'bg-success/10 text-success border border-success/20'
                                                : 'bg-destructive/10 text-destructive border border-destructive/20'
                                        }`}
                                    >
                                        {subscribeMessage.type === 'success' ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <X className="w-4 h-4" />
                                        )}
                                        <span className="text-sm">{subscribeMessage.text}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>
            </MainLayout>
        </>
    );
};

export default Blog;

