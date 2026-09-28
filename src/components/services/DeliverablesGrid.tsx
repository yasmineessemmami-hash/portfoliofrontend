import { motion } from "framer-motion";
import type { DeliverableItem } from "@/types/services.types";
import { resolveIcon } from "@/components/icons/IconResolver";

interface DeliverablesGridProps {
  items: DeliverableItem[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const DeliverablesGrid = ({ items }: DeliverablesGridProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              What You&apos;ll <span className="text-gradient">Receive</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every project comes with comprehensive deliverables to ensure your success
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
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
                  className="glass rounded-2xl p-8 text-center"
                >
                  {Icon && (
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-primary/50 flex items-center justify-center mx-auto mb-5">
                      <Icon
                        className="w-8 h-8 text-primary-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
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

export default DeliverablesGrid;


