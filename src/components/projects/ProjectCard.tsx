import { useState } from "react";
import { motion } from "framer-motion";
import type { FeaturedProject } from "@/types/home.types";
import { resolveIcon } from "@/components/icons/IconResolver";

interface ProjectCardProps {
  project: FeaturedProject;
  index?: number;
}

/**
 * Renders project image based on image_type, with graceful fallback to
 * a letter card when URL images fail to load or are empty.
 */
const ProjectImage = ({ project }: { project: FeaturedProject }) => {
  const [hasError, setHasError] = useState(false);
  const { image, image_type, key, title } = project;
  const initialLetter =
    (title && title.trim().charAt(0).toUpperCase()) || "P";

  if (image_type === "key" && key) {
    const Icon = resolveIcon(key);

    if (Icon) {
      return (
        <div className="mb-4 flex items-center justify-center h-20">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface text-primary">
            <Icon className="w-8 h-8" />
          </span>
        </div>
      );
    }
  }

  if (image_type === "url") {
    const shouldShowImage = Boolean(image) && !hasError;

    if (shouldShowImage) {
      return (
        <div className="mb-4 rounded-lg overflow-hidden bg-surface aspect-video flex items-center justify-center">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        </div>
      );
    }

    // Fallback card with the first letter of the title
    return (
      <div className="mb-4 rounded-lg overflow-hidden bg-surface aspect-video flex items-center justify-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground">
          <span className="font-heading text-2xl font-semibold">
            {initialLetter}
          </span>
        </div>
      </div>
    );
  }

  switch (image_type) {
    case "emoji":
      return (
        <div className="text-5xl mb-4 flex items-center justify-center h-20">
          {image}
        </div>
      );

    case "svg":
      return (
        <div
          className="mb-4 rounded-lg overflow-hidden bg-surface aspect-video flex items-center justify-center p-4"
          dangerouslySetInnerHTML={{ __html: image }}
        />
      );

    default:
      // Fallback for unknown types
      return (
        <div className="text-5xl mb-4 flex items-center justify-center h-20 text-muted-foreground">
          {image || initialLetter}
        </div>
      );
  }
};

const ProjectCard = ({ project, index = 0 }: ProjectCardProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="glass rounded-2xl p-6 hover:bg-surface-hover/80 transition-all duration-300 group"
      variants={cardVariants}
      transition={{
        duration: 0.45,
        ease: [0.22, 0.61, 0.36, 1],
        delay: index * 0.08,
      }}
    >
      {/* Project Image */}
      <ProjectImage project={project} />

      {/* Project Title */}
      <h3 className="font-heading text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {project.title}
      </h3>

      {/* Project Description */}
      <p className="text-sm text-muted-foreground mb-4">{project.description}</p>

      {/* Tech Stack Tags */}
      <div className="flex flex-wrap gap-2">
        {project.tech_stack.map((tech) => (
          <span key={tech} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
            {tech}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default ProjectCard;
