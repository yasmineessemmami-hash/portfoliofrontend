import { motion, type Variants } from "framer-motion";
import type { SkillCategory } from "@/types/skills.types";
import { resolveIcon } from "@/components/icons/IconResolver";
import SkillTag from "@/components/skills/SkillTag";

interface SkillCategoryCardProps {
    category: SkillCategory;
    index?: number;
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
    },
};

const SkillCategoryCard = ({ category, index = 0 }: SkillCategoryCardProps) => {
    const Icon = resolveIcon(category.icon_key);

    return (
        <motion.div
            className="glass rounded-2xl p-6 sm:p-8"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{
                duration: 0.45,
                ease: [0.22, 0.61, 0.36, 1],
                delay: index * 0.05,
            }}
        >
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    {Icon && <Icon className="w-6 h-6 text-primary" aria-hidden="true" />}
                </div>
                <div>
                    <h2 className="font-heading text-xl font-semibold text-foreground">
                        {category.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
            </div>

            {/* Skills as Tags */}
            <div className="flex flex-wrap gap-3">
                {category.skills.map((skill) => (
                    <SkillTag key={skill} label={skill} />
                ))}
            </div>
        </motion.div>
    );
};

export default SkillCategoryCard;


