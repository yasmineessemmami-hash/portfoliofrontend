import { CheckCircle } from "lucide-react";
import type { AboutService } from "@/types/about.types";
import { motion } from "framer-motion";

interface AboutServicesGridProps {
  services: AboutService[];
}

const AboutServicesGrid = ({ services }: AboutServicesGridProps) => {
  if (!services || services.length === 0) {
    return null;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-12 sm:py-16 bg-surface-hover/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              What I <span className="text-gradient">Offer</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive web development services tailored to your needs
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            transition={{ staggerChildren: 0.12 }}
          >
            {services.map((service) => (
              <motion.div
                key={service.title}
                variants={cardVariants}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="glass rounded-2xl p-6 sm:p-8 hover:bg-surface-hover/80 transition-all duration-300"
              >
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutServicesGrid;


