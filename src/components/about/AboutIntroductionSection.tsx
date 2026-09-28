import type { AboutIntroduction } from "@/types/about.types";
import Avatar from "@/components/about/Avatar";
import AvailabilityBadge from "@/components/about/AvailabilityBadge";
import { motion } from "framer-motion";

interface AboutIntroductionSectionProps {
  introduction: AboutIntroduction;
}

const AboutIntroductionSection = ({
  introduction,
}: AboutIntroductionSectionProps) => {
  return (
    <motion.section
      className="py-12 sm:py-16"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="glass rounded-2xl p-6 sm:p-8 md:p-10">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left - Avatar & Availability */}
              <div className="shrink-0 w-full lg:w-auto">
                <div className="flex flex-col items-center lg:items-start gap-4">
                  <Avatar avatar={introduction.avatar} />
                  <AvailabilityBadge availability={introduction.availability} />
                </div>
              </div>

              {/* Right - Content */}
              <div className="flex-1">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Hello, I&apos;m <span className="text-primary">{introduction.full_name}</span>
                </h2>
                <p className="text-primary font-medium mb-6">
                  {introduction.role_title}
                </p>

                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  {introduction.paragraphs.map((paragraph, index) => {
                    // Handle paragraphs starting with "##" as bold text
                    if (paragraph.startsWith("##")) {
                      const boldText = paragraph.substring(2).trim();
                      return (
                        <p key={index} className="font-semibold text-foreground">
                          {boldText}
                        </p>
                      );
                    }
                    return (
                      <p key={index}>{paragraph}</p>
                    );
                  })}
                </div>

                {/* Tech Stack Pills */}
                {introduction.tech_stack.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-4">
                      Technologies I work with:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {introduction.tech_stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AboutIntroductionSection;


