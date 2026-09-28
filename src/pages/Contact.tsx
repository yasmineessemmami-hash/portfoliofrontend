import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/seo/SEO";
import ServerError from "@/pages/ServerError";
import { useContact } from "@/hooks/useContact";
import { useContactMeta } from "@/hooks/useContactMeta";
import ContactHero from "@/components/contact/ContactHero";
import ContactInfo from "@/components/contact/ContactInfo";
import SocialLinks from "@/components/contact/SocialLinks";
import ContactForm from "@/components/contact/ContactForm";
import ContactSkeleton from "@/components/skeletons/ContactSkeleton";

const Contact = () => {
    const { data, loading, error } = useContact();
    const { meta } = useContactMeta();

    if (loading) {
        return (
            <>
                <SEO meta={meta} />
                <MainLayout>
                    <ContactSkeleton />
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
                <ContactHero hero={data.hero} />

                <section className="py-8 pb-20">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="max-w-5xl mx-auto">
                            <div className="grid lg:grid-cols-5 gap-8">
                                {/* Contact Info & Social Links */}
                                <div className="lg:col-span-2 space-y-6">
                                    <ContactInfo items={data.contact_info} />
                                    <SocialLinks links={data.social_links} />
                                </div>

                                {/* Contact Form */}
                                <div className="lg:col-span-3">
                                    <ContactForm form={data.form} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </MainLayout>
        </>
    );
};

export default Contact;

