import { createElement, useMemo } from "react";
import { motion } from "framer-motion";
import type { ServiceItem } from "@/types/services.types";
import { resolveIcon } from "@/components/icons/IconResolver";
import { CheckCircle } from "lucide-react";

interface ServiceCardProps {
  service: ServiceItem;
  index: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const ServiceCard = ({ service }: ServiceCardProps) => {
  const IconComponent = useMemo(
    () => resolveIcon(service.icon_key),
    [service.icon_key]
  );

  return (
    <motion.div
      variants={cardVariants}
      transition={{
        duration: 0.5,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      className="glass rounded-2xl p-6 sm:p-8 hover:bg-surface-hover/80 transition-all duration-300 group"
    >
      {IconComponent && (
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
          {createElement(IconComponent, {
            className: "w-7 h-7 text-primary",
          })}
        </div>
      )}
      <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
        {service.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        {service.description}
      </p>
      <ul className="space-y-2">
        {service.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <CheckCircle
              className="w-4 h-4 text-primary shrink-0"
              aria-hidden="true"
            />
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default ServiceCard;


