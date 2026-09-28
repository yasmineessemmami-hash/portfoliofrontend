import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/seo/SEO";
import ServerError from "@/pages/ServerError";
import { useProjects } from "@/hooks/useProjects";
import { useProjectsMeta } from "@/hooks/useProjectsMeta";
import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import ProjectsSkeleton from "@/components/skeletons/ProjectsSkeleton";
import { Link } from "react-router-dom";

const Projects = () => {
    const { data, loading, error } = useProjects();
    const { meta } = useProjectsMeta();

    if (loading) {
        return (
            <>
                <SEO meta={meta} />
                <MainLayout>
                    <ProjectsSkeleton />
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
                <ProjectsHero hero={data.hero} />
                <ProjectsGrid projects={data.projects} />

                {/* Static CTA section as requested */}
                <section className="py-16">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="glass rounded-2xl p-8 sm:p-12">
                                <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                                    Interested in Working Together?
                                </h2>
                                <p className="text-muted-foreground mb-8">
                                    I'm always looking for new opportunities to create impactful projects.
                                </p>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:shadow-glow"
                                >
                                    Let's Talk
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </MainLayout>
        </>
    );
};

export default Projects;


