import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/seo/SEO";
import ServerError from "@/pages/ServerError";
import { useAbout } from "@/hooks/useAbout";
import { useAboutMeta } from "@/hooks/useAboutMeta";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import AboutStatsGrid from "@/components/about/AboutStatsGrid";
import AboutIntroductionSection from "@/components/about/AboutIntroductionSection";
import AboutServicesGrid from "@/components/about/AboutServicesGrid";
import AboutWorkProcessSection from "@/components/about/AboutWorkProcessSection";
import AboutValuesGrid from "@/components/about/AboutValuesGrid";
import AboutHeroSkeleton from "@/components/skeletons/AboutHeroSkeleton";
import AboutStatsSkeleton from "@/components/skeletons/AboutStatsSkeleton";
import AboutIntroductionSkeleton from "@/components/skeletons/AboutIntroductionSkeleton";
import AboutServicesSkeleton from "@/components/skeletons/AboutServicesSkeleton";
import AboutWorkProcessSkeleton from "@/components/skeletons/AboutWorkProcessSkeleton";
import AboutValuesSkeleton from "@/components/skeletons/AboutValuesSkeleton";
import ScrollIndicator from "@/components/hero/ScrollIndicator";

const About = () => {
  const { data, loading, error } = useAbout();
  const { meta } = useAboutMeta();

  if (loading) {
    return (
      <>
        <SEO meta={meta} />
        <MainLayout>
          <AboutHeroSkeleton />
          <AboutStatsSkeleton />
          <AboutIntroductionSkeleton />
          <AboutServicesSkeleton />
          <AboutWorkProcessSkeleton />
          <AboutValuesSkeleton />
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
        {/* Hero + Stats + Scroll Indicator (full viewport height) */}
        <section className="relative min-h-[calc(100vh-5rem)] flex flex-col">
          <div>
            <AboutHeroSection hero={data.hero} />
            <AboutStatsGrid stats={data.stats} />
          </div>
          <ScrollIndicator className="pointer-events-none" />
        </section>

        {/* Introduction */}
        <AboutIntroductionSection introduction={data.introduction} />

        {/* Services */}
        <AboutServicesGrid services={data.services} />

        {/* Work Process */}
        <AboutWorkProcessSection steps={data.work_process} />

        {/* Values */}
        <AboutValuesGrid values={data.values} />

        {/* CTA Section */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="glass rounded-2xl p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                    Let&apos;s Build Something <span className="text-gradient">Amazing</span>
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                    I’m always looking for opportunities to learn, build meaningful projects and grow as a software developer.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      to="/contact"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:shadow-glow"
                    >
                      Get In Touch
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/projects"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 glass rounded-lg font-medium text-foreground hover:bg-surface-hover transition-colors"
                    >
                      View My Projects
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default About;


