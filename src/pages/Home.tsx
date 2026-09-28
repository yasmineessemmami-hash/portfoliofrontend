import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useHome } from "@/hooks/useHome";
import { useHomeMeta } from "@/hooks/useHomeMeta";
import { useIntroContext } from "@/context/IntroContext";
import HeroSection from "@/components/hero/HeroSection";
import SocialIcons from "@/components/social-icons/SocialIcons";
import FeaturedProjectsSection from "@/components/projects/FeaturedProjectsSection";
import HeroSkeleton from "@/components/skeletons/HeroSkeleton";
import SocialIconsSkeleton from "@/components/skeletons/SocialIconsSkeleton";
import FeaturedProjectsSkeleton from "@/components/skeletons/FeaturedProjectsSkeleton";
import SEO from "@/components/seo/SEO";
import MainLayout from "@/layouts/MainLayout";
import ServerError from "@/pages/ServerError";

const Home = () => {
  const { introCompleted } = useIntroContext();
  const { data, loading, error } = useHome();
  const { meta } = useHomeMeta(); // Fetch SEO metadata (non-blocking)

  // Don't render anything if intro is not completed yet (intro overlay will show)
  if (!introCompleted) {
    return null;
  }

  // Show skeletons while loading (hook now properly handles initial state)
  if (loading) {
    return (
      <>
        <SEO meta={meta} />
        <div className="min-h-screen bg-background">
          <HeroSkeleton />
          <SocialIconsSkeleton />
          <FeaturedProjectsSkeleton />
        </div>
      </>
    );
  }

  // Only show error if there's an actual error (hook ensures loading is false when error is set)
  if (error) {
    return (
      <>
        <SEO meta={meta} />
        <ServerError />
      </>
    );
  }

  // Safety check: if no data after loading completes, show error
  // This should only happen if error wasn't set but data is null (edge case)
  if (!data || !data.hero) {
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
        {/* Hero Section */}
        <HeroSection hero={data.hero} contact={data.contact} />

        {/* Social Links Section */}
        <SocialIcons socialLinks={data.social_links} />

        {/* Featured Projects Section */}
        <FeaturedProjectsSection projects={data.featured_projects} />

        {/* Have a Project CTA Section */}
        <section className="py-20" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="glass rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h2 id="cta-heading" className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    Have a Project or Opportunity?
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                    Whether you need a new website, web application, or looking to hire a developer, I'd love to hear from
                    you. Let's create something amazing together.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:shadow-glow"
                    aria-label="Get in touch for project inquiries"
                  >
                    Get in Touch
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default Home;
