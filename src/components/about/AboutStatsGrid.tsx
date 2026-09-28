import type { AboutStat } from "@/types/about.types";
import AboutStatItem from "@/components/about/AboutStatItem";

interface AboutStatsGridProps {
  stats: AboutStat[];
}

const AboutStatsGrid = ({ stats }: AboutStatsGridProps) => {
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <AboutStatItem key={stat.label} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStatsGrid;


