import { motion } from "framer-motion";
import { resolveIcon } from "@/components/icons/IconResolver";
import type { SocialLink } from "@/types/contact.types";

interface SocialLinksProps {
    links: SocialLink[];
}

const SocialLinks = ({ links }: SocialLinksProps) => {
    if (!links || links.length === 0) {
        return null;
    }

    return (
        <motion.div
            className="glass rounded-2xl p-6 sm:p-8"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1], delay: 0.1 }}
        >
            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
                Connect With Me
            </h2>
            <div className="grid grid-cols-2 gap-3">
                {links.map((social) => {
                    const Icon = resolveIcon(social.icon_key || social.key);
                    return (
                        <a
                            key={social.label}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-surface-hover transition-colors"
                        >
                            {Icon && (
                                <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                            )}
                            <span className="text-sm font-medium text-foreground">
                                {social.label}
                            </span>
                        </a>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default SocialLinks;

