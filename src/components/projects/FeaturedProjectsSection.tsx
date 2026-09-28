import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import ProjectCard from "./ProjectCard";
import type { FeaturedProject } from "@/types/home.types";

interface FeaturedProjectsSectionProps {
  projects: FeaturedProject[];
}

const headerContainerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 0.61, 0.36, 1],
      staggerChildren: 0.12,
    },
  },
};

const headerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
  },
};

const FeaturedProjectsSection = ({ projects }: FeaturedProjectsSectionProps) => {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-surface-hover/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.4 }}
            variants={headerContainerVariants}
          >
            <motion.div
              variants={headerItemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Featured Work</span>
            </motion.div>
            <motion.h2
              variants={headerItemVariants}
              className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4"
            >
              Recent <span className="text-gradient">Projects</span>
            </motion.h2>
            <motion.p
              variants={headerItemVariants}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              A selection of my latest work showcasing full-stack development capabilities
            </motion.p>
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            transition={{ staggerChildren: 0.12 }}
          >
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </motion.div>

          {/* View All Link */}
          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1], delay: 0.2 }}
          >
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              View All Projects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjectsSection;
