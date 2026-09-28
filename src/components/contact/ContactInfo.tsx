import { motion } from "framer-motion";
import { resolveIcon } from "@/components/icons/IconResolver";
import type { ContactInfoItem } from "@/types/contact.types";

interface ContactInfoProps {
    items: ContactInfoItem[];
}

const ContactInfo = ({ items }: ContactInfoProps) => {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <motion.div
            className="glass rounded-2xl p-6 sm:p-8"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
        >
            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
                Contact Information
            </h2>
            <div className="space-y-4">
                {items.map((item) => {
                    const Icon = resolveIcon(item.icon_key || item.key);
                    return (
                        <div key={item.label} className="flex items-center gap-4">
                            {Icon && (
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground">{item.label}</p>
                                {item.type === "link" && item.href ? (
                                    <a
                                        href={item.href}
                                        className="text-foreground hover:text-primary transition-colors"
                                    >
                                        {item.value}
                                    </a>
                                ) : (
                                    <p className="text-foreground">{item.value}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default ContactInfo;

