import { motion, type Variants } from "framer-motion";
import type { LearningFocus } from "@/types/skills.types";

interface LearningFocusSectionProps {
  learningFocus: LearningFocus;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 0.61, 0.36, 1],
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
  },
};

const LearningFocusSection = ({ learningFocus }: LearningFocusSectionProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.div
            variants={itemVariants}
            className="glass rounded-2xl p-8 sm:p-12 text-center"
          >
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              {learningFocus.title}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {learningFocus.description}
            </p>

            {learningFocus.topics?.length ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {learningFocus.topics.map((topic, idx) => (
                  <span
                    key={`${topic}-${idx}`}
                    className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LearningFocusSection;


