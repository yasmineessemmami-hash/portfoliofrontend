import { motion } from "framer-motion";
import { memo, useMemo } from "react";
import type { ProjectItem } from "@/types/projects.types";
import TechBadge from "@/components/projects/TechBadge";
import { resolveIcon } from "@/components/icons/IconResolver";

interface ProjectsGridProps {
    projects: ProjectItem[];
}

const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
};

// Helper to ensure URLs are absolute
const ensureAbsoluteUrl = (url: string | null | undefined): string => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:") || url.startsWith("tel:")) {
        return url;
    }
    return `https://${url}`;
};

// Extracted ProjectCard for performance (React.memo prevents re-renders)
const ProjectCard = memo(({ project, index }: { project: ProjectItem; index: number }) => {
    const icons = useMemo(() => ({
        FolderIcon: resolveIcon("icon-folder"),
        LiveIcon: resolveIcon("icon-external-link"),
        GithubIcon: resolveIcon("icon-github"),
        MailIcon: resolveIcon("icon-mail")
    }), []);

    const { FolderIcon, LiveIcon, GithubIcon, MailIcon } = icons;

    return (
        <motion.article
            variants={cardVariants}
            transition={{
                duration: 0.45,
                ease: [0.22, 0.61, 0.36, 1],
                delay: index * 0.05,
            }}
            className="group glass rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-500"
        >
            {/* Project Image */}
            <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    // Give priority to the first project to improve LCP
                    fetchPriority={index === 0 ? "high" : "auto"}
                />
                <div className="absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent" />

                {/* Overlay icons */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {project.live_url && LiveIcon && (
                        <a
                            href={ensureAbsoluteUrl(project.live_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 glass rounded-lg hover:bg-surface-hover transition-colors"
                            aria-label="View live project"
                        >
                            <LiveIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                        </a>
                    )}
                    {project.github_url && GithubIcon && (
                        <a
                            href={ensureAbsoluteUrl(project.github_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 glass rounded-lg hover:bg-surface-hover transition-colors"
                            aria-label="View source code"
                        >
                            <GithubIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                        </a>
                    )}
                    {project.contact_email && MailIcon && (
                        <a
                            href={ensureAbsoluteUrl(project.contact_email.startsWith('mailto:') ? project.contact_email : `mailto:${project.contact_email}`)}
                            className="p-2 glass rounded-lg hover:bg-surface-hover transition-colors"
                            aria-label="Contact for project demo"
                        >
                            <MailIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                        </a>
                    )}
                </div>
            </div>

            {/* Project Content */}
            <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        {FolderIcon && (
                            <FolderIcon
                                className="w-5 h-5 text-primary"
                                aria-hidden="true"
                            />
                        )}
                    </div>
                    <h2 className="font-heading text-xl font-semibold text-foreground pt-1 line-clamp-1">
                        {project.title}
                    </h2>
                </div>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2 min-h-10]">
                    {project.description}
                </p>

                {/* Tech Stack */}
                {project.tech_stack?.length ? (
                    <div className="flex flex-wrap gap-2 mb-6 h-18 overflow-hidden content-start">
                        {project.tech_stack.slice(0, 6).map((tech) => (
                            <TechBadge key={tech} label={tech} />
                        ))}
                        {project.tech_stack.length > 6 && (
                            <span className="text-[10px] text-muted-foreground pt-1">
                                +{project.tech_stack.length - 6} more
                            </span>
                        )}
                    </div>
                ) : <div className="mb-6 h-10" />}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                    {project.live_url && (
                        <a
                            href={ensureAbsoluteUrl(project.live_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            {LiveIcon && <LiveIcon className="w-4 h-4" aria-hidden="true" />}
                            <span>Live Demo</span>
                        </a>
                    )}
                    {project.github_url && (
                        <a
                            href={ensureAbsoluteUrl(project.github_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 glass rounded-lg text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
                        >
                            {GithubIcon && <GithubIcon className="w-4 h-4" aria-hidden="true" />}
                            <span>Source Code</span>
                        </a>
                    )}
                    {project.contact_email && (
                        <a
                            href={ensureAbsoluteUrl(project.contact_email.startsWith('mailto:') ? project.contact_email : `mailto:${project.contact_email}`)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 glass rounded-lg text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
                        >
                            {MailIcon && <MailIcon className="w-4 h-4" aria-hidden="true" />}
                            <span>Contact</span>
                        </a>
                    )}
                </div>
            </div>
        </motion.article>
    );
});

ProjectCard.displayName = "ProjectCard";

const ProjectsGrid = ({ projects }: ProjectsGridProps) => {
    if (!projects || projects.length === 0) {
        return (
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-2xl mx-auto text-center text-muted-foreground">
                        <p className="text-base sm:text-lg">
                            There are no projects to display yet. Please check back soon.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 pb-16 sm:pb-20">
            <div className="container mx-auto px-4 sm:px-6">
                <motion.div
                    className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ staggerChildren: 0.05 }}
                >
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            index={index}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ProjectsGrid;


