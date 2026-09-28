import type { SkillsHero as SkillsHeroType } from "@/types/skills.types";
import { motion, type Variants } from "framer-motion";

interface SkillsHeroProps {
  hero: SkillsHeroType;
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

const SkillsHero = ({ hero }: SkillsHeroProps) => {
  return (
    <motion.section
      className="pt-16 sm:pt-20 pb-10 sm:pb-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.7 }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={containerVariants}
        >
          <motion.h1
            variants={itemVariants}
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
          >
            {hero.title}{" "}
            <span className="text-primary">{hero.subtitle}</span>
          </motion.h1>
          {hero.description && (
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              {hero.description}
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default SkillsHero;


