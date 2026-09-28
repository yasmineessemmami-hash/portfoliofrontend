import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/seo/SEO";
import ServerError from "@/pages/ServerError";
import { useServices } from "@/hooks/useServices";
import { useServicesMeta } from "@/hooks/useServicesMeta";
import ServicesHero from "@/components/services/ServicesHero";
import ServicesGrid from "@/components/services/ServicesGrid";
import WhyChooseMeGrid from "@/components/services/WhyChooseMeGrid";
import DeliverablesGrid from "@/components/services/DeliverablesGrid";
import ServicesHeroSkeleton from "@/components/skeletons/ServicesHeroSkeleton";
import ServicesGridSkeleton from "@/components/skeletons/ServicesGridSkeleton";
import WhyChooseMeSkeleton from "@/components/skeletons/WhyChooseMeSkeleton";
import DeliverablesSkeleton from "@/components/skeletons/DeliverablesSkeleton";

const Services = () => {
  const { data, loading, error } = useServices();
  const { meta } = useServicesMeta();

  if (loading) {
    return (
      <>
        <SEO meta={meta} />
        <MainLayout>
          <ServicesHeroSkeleton />
          <ServicesGridSkeleton />
          <WhyChooseMeSkeleton />
          <DeliverablesSkeleton />
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
        {/* Hero */}
        <ServicesHero hero={data.hero} />

        {/* Services Grid */}
        <ServicesGrid services={data.services} />

        {/* Why Choose Me */}
        <WhyChooseMeGrid items={data.why_choose_me} />

        {/* Deliverables */}
        <DeliverablesGrid items={data.deliverables} />

        {/* CTA Section */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="glass rounded-2xl p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                    Ready to Start Your <span className="text-gradient">Project</span>?
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                    Let&apos;s discuss your requirements and find the best solution for your needs.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      to="/projects"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 glass rounded-lg font-medium text-foreground hover:bg-surface-hover transition-colors"
                    >
                      View My Projects
                    </Link>
                    <Link
                      to="/contact"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:shadow-glow"
                    >
                      Get in Touch
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
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

export default Services;


