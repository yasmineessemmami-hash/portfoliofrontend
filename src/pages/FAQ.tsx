import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/seo/SEO";
import ServerError from "@/pages/ServerError";
import { useFAQ } from "@/hooks/useFAQ";
import { useFAQMeta } from "@/hooks/useFAQMeta";
import FAQHero from "@/components/faq/FAQHero";
import FAQAccordion from "@/components/faq/FAQAccordion";
import FAQSkeleton from "@/components/skeletons/FAQSkeleton";
import { motion } from "framer-motion";

const FAQ = () => {
    const { data, loading, error } = useFAQ();
    const { meta } = useFAQMeta();

    if (loading) {
        return (
            <>
                <SEO meta={meta} />
                <MainLayout>
                    <FAQSkeleton />
                </MainLayout>
            </>
        );
    }

    if (error || !data) {
        return (
            <>
                <SEO meta={meta} />
                <ServerError />
            </>
        );
    }

    return (
        <>
            <SEO meta={meta} />
            <MainLayout>
                <FAQHero hero={data.hero} />
                <FAQAccordion faqs={data.faqs || data.items || []} />

                {/* Static CTA Section */}
                <motion.section
                    className="py-16"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.7 }}
                    transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                >
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="glass rounded-2xl p-8 sm:p-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10">
                                    <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                                        Still Have <span className="text-gradient">Questions</span>?
                                    </h2>
                                    <p className="text-muted-foreground mb-8">
                                        Can&apos;t find what you&apos;re looking for? Feel free to reach
                                        out and I&apos;ll be happy to help.
                                    </p>
                                    <Link
                                        to="/contact"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:shadow-glow"
                                    >
                                        Contact Me
                                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </MainLayout>
        </>
    );
};

export default FAQ;

