import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/seo/SEO";
import ServerError from "@/pages/ServerError";
import { useSkills } from "@/hooks/useSkills";
import { useSkillsMeta } from "@/hooks/useSkillsMeta";
import SkillsHero from "@/components/skills/SkillsHero";
import ProfileActions from "@/components/skills/ProfileActions";
import SkillCategoryCard from "@/components/skills/SkillCategoryCard";
import LearningFocusSection from "@/components/skills/LearningFocusSection";
import SkillsSkeleton from "@/components/skeletons/SkillsSkeleton";
import type { SkillCategory } from "@/types/skills.types";
import { Link } from "react-router-dom";

const Skills = () => {
  const { data, loading, error } = useSkills();
  const { meta } = useSkillsMeta();

  if (loading) {
    return (
      <>
        <SEO meta={meta} />
        <MainLayout>
          <SkillsSkeleton />
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

  const skillCategories: SkillCategory[] = data.skill_categories ?? [];

  return (
    <>
      <SEO meta={meta} />
      <MainLayout>
        <SkillsHero hero={data.hero} />
        {data.profile_actions && <ProfileActions actions={data.profile_actions} />}

        {/* Skill categories */}
        <section className="py-8 pb-16 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6">
            {skillCategories.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center text-muted-foreground">
                <p className="text-base sm:text-lg">
                  There are no skill categories to display yet. Please check back
                  soon.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {skillCategories.map((category, index) => (
                  <SkillCategoryCard
                    key={category.key}
                    category={category}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <LearningFocusSection learningFocus={data.learning_focus} />

        {/* Static CTA section (frontend-only) */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="glass rounded-2xl p-8 sm:p-12">
                <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                  Ready to See These Skills in Action?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Check out my projects to see how I apply these technologies to
                  solve real problems.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/projects"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:shadow-glow"
                  >
                    View Projects
                  </Link>
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 glass rounded-lg font-medium text-foreground hover:bg-surface-hover transition-colors"
                  >
                    Get in Touch
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

export default Skills;


