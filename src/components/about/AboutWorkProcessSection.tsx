import type { AboutWorkProcessStep } from "@/types/about.types";
import { motion } from "framer-motion";

interface AboutWorkProcessSectionProps {
  steps: AboutWorkProcessStep[];
}

const AboutWorkProcessSection = ({ steps }: AboutWorkProcessSectionProps) => {
  if (!steps || steps.length === 0) {
    return null;
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              How I <span className="text-gradient">Work</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A structured approach to ensure your project's success from start to finish
            </p>
          </div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            transition={{ staggerChildren: 0.12 }}
          >
            {steps.map((step) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative"
              >
                <div className="glass rounded-xl p-6 h-full">
                  <div className="font-heading text-3xl sm:text-4xl font-bold text-primary/20 mb-2">
                    {step.step}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {/* Connector line between steps on large screens */}
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border last:hidden" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutWorkProcessSection;


