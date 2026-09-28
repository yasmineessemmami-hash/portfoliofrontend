import { iconMap } from "./socialIconConfig";

interface SocialIconProps {
  platform: string;
  className?: string;
  size?: number | string;
}

const SocialIcon = ({ platform, className = "", size = 20 }: SocialIconProps) => {
  const normalizedPlatform = platform.toLowerCase().trim();
  const IconComponent = iconMap[normalizedPlatform];

  if (!IconComponent) {
    // Return nothing for unknown platforms
    return null;
  }

  return <IconComponent className={className} size={size} />;
};

export default SocialIcon;
