import SocialIcon from "./SocialIcon";
import type { SocialLink } from "@/types/home.types";

interface SocialIconsProps {
  socialLinks: SocialLink[];
  className?: string;
}

const SocialIcons = ({ socialLinks, className = "" }: SocialIconsProps) => {
  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  return (
    <div className={`relative z-10 py-8 px-4 sm:px-6 bg-background ${className}`}>
      <div className="flex items-center justify-center gap-3">
        {socialLinks.map((link, index) => {
          // Determine if it's a mailto or tel link
          const isEmail = link.url.startsWith("mailto:");
          const isPhone = link.url.startsWith("tel:");
          const href = link.url;
          const target = isEmail || isPhone ? undefined : "_blank";
          const rel = isEmail || isPhone ? undefined : "noopener noreferrer";

          return (
            <a
              key={`${link.platform}-${index}`}
              href={href}
              target={target}
              rel={rel}
              className="p-3 glass rounded-xl hover:bg-surface-hover transition-all hover:text-primary hover:scale-110"
              aria-label={link.platform}
            >
              <SocialIcon platform={link.platform} className="w-5 h-5" />
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SocialIcons;

