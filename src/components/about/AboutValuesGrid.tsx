import type { AboutValue } from "@/types/about.types";
import { resolveIcon } from "@/components/icons/IconResolver";
import { motion } from "framer-motion";

interface AboutValuesGridProps {
  values: AboutValue[];
}

const AboutValuesGrid = ({ values }: AboutValuesGridProps) => {
  if (!values || values.length === 0) {
    return null;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-12 sm:py-16 bg-surface-hover/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-10 sm:mb-12 text-center">
            What <span className="text-gradient">Drives</span> Me
          </h2>
          <motion.div
            className="grid sm:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            transition={{ staggerChildren: 0.12 }}
          >
            {values.map((value) => {
              const Icon = resolveIcon(value.key);

              return (
                <motion.div
                  key={value.title}
                  variants={cardVariants}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="glass rounded-xl p-6 hover:bg-surface-hover/80 transition-all duration-300"
                >
                  {Icon && (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                    </div>
                  )}
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutValuesGrid;


