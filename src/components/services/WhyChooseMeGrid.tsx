import { motion } from "framer-motion";
import type { WhyChooseMeItem } from "@/types/services.types";
import { resolveIcon } from "@/components/icons/IconResolver";

interface WhyChooseMeGridProps {
  items: WhyChooseMeItem[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const WhyChooseMeGrid = ({ items }: WhyChooseMeGridProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-surface-hover/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              Why Clients <span className="text-gradient">Choose Me</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              When you work with me, you get more than just code. You get a dedicated partner committed to your project&apos;s success.
            </p>
          </div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.08 }}
          >
            {items.map((item, index) => {
              const Icon = resolveIcon(item.icon_key);

              return (
                <motion.div
                  key={item.title}
                  variants={cardVariants}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 0.61, 0.36, 1],
                    delay: index * 0.06,
                  }}
                  className="glass rounded-xl p-6 hover:bg-surface-hover/80 transition-all duration-300 group"
                >
                  {Icon && (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                    </div>
                  )}
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
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

export default WhyChooseMeGrid;


