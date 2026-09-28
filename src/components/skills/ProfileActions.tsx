import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, Download } from "lucide-react";
import type { ProfileActions as ProfileActionsType } from "@/types/skills.types";
import { resolveIcon } from "@/components/icons/IconResolver";
import { getApiBaseUrl } from "@/services/api";

interface ProfileActionsProps {
  actions: ProfileActionsType;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
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
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
  },
};

const ProfileActions = ({ actions }: ProfileActionsProps) => {
  // Construct the backend download URL using centralized API base URL
  const downloadUrl = `${getApiBaseUrl()}/skills/cv/download`;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.div
            variants={itemVariants}
            className="glass rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
                  Want to know more?
                </h2>
                <p className="text-muted-foreground">
                  Get a copy of my resume or connect with me on social platforms.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {actions.cv?.file_url && (
                  <div className="flex items-center gap-2 group/cv">
                    {/* Integrated Download & View Button */}
                    <a
                      href={downloadUrl}
                      className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:shadow-glow text-sm relative overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span>{actions.cv.label}</span>
                      </div>
                      <div className="w-px h-4 bg-primary-foreground/30 mx-1" />
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(actions.cv.file_url, '_blank');
                        }}
                        className="p-1 hover:bg-white/20 rounded-md transition-colors"
                        title="View in new tab"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </a>
                  </div>
                )}

                {actions.socials?.map((social) => {
                  const SocialIcon = resolveIcon(social.icon_key);
                  return (
                    <a
                      key={`${social.platform}-${social.url}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 glass rounded-lg font-medium text-foreground hover:bg-surface-hover transition-colors text-sm"
                    >
                      {SocialIcon && (
                        <SocialIcon className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>{social.platform}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfileActions;
