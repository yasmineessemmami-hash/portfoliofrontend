import type { ServicesHero as ServicesHeroType } from "@/types/services.types";
import { motion, type Variants } from "framer-motion";

interface ServicesHeroProps {
  hero: ServicesHeroType;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 0.61, 0.36, 1],
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
  },
};

const ServicesHero = ({ hero }: ServicesHeroProps) => {
  return (
    <motion.section
      className="pt-6 sm:pt-8 pb-4 sm:pb-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={containerVariants}
        >
          <motion.h1
            variants={itemVariants}
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 sm:mb-4"
          >
            {hero.title}{" "}
            <span className="text-primary">{hero.subtitle}</span>
          </motion.h1>
          {hero.description && (
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              {hero.description}
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ServicesHero;


