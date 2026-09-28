import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import type { FAQItem as FAQItemType } from "@/types/faq.types";

interface FAQItemProps {
    faq: FAQItemType;
    index: number;
    isOpen: boolean;
    onToggle: () => void;
}

const FAQItem = ({ faq, index, isOpen, onToggle }: FAQItemProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
                duration: 0.45,
                ease: [0.22, 0.61, 0.36, 1],
                delay: index * 0.05,
            }}
            className="glass rounded-xl overflow-hidden"
        >
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-hover/50 transition-colors"
                {...(isOpen ? { "aria-expanded": "true" } : { "aria-expanded": "false" })}
                aria-controls={`faq-answer-${faq.id}`}
            >
                <span className="font-heading text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                    aria-hidden="true"
                />
            </button>
            <div
                id={`faq-answer-${faq.id}`}
                className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"
                    }`}
            >
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                    {faq.answer}
                </div>
            </div>
        </motion.div>
    );
};

export default FAQItem;

