import { motion } from "framer-motion";
import type { ServiceItem } from "@/types/services.types";
import ServiceCard from "@/components/services/ServiceCard";

interface ServicesGridProps {
  services: ServiceItem[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const ServicesGrid = ({ services }: ServicesGridProps) => {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <section className="pt-2 sm:pt-4 pb-12 sm:pb-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {services.map((service, index) => (
              <ServiceCard
                key={service.title}
                service={service}
                index={index}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;


