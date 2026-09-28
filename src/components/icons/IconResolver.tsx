import type { ComponentType } from "react";
import * as LucideIcons from "lucide-react";
import * as Fa6Icons from "react-icons/fa6";
import * as SiIcons from "react-icons/si";
import {
  FaGithub,
  FaGitlab,
  FaBitbucket,
  FaStackOverflow,
  FaDev,
  FaMedium,
  FaLinkedin,
  FaXTwitter,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaTelegram,
  FaDiscord,
  FaSkype,
  FaGlobe,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa6";
import { SiSignal, SiUpwork, SiFiverr, SiFreelancer } from "react-icons/si";

type IconComponent = ComponentType<{ className?: string }>;

// Lucide React Icons (prefixed with "icon-")
const LUCIDE_ICON_MAP: Record<string, IconComponent> = {
  "icon-folder": LucideIcons.Folder,
  "icon-github": LucideIcons.Github,
  "icon-external-link": LucideIcons.ExternalLink,
  "icon-arrow-right": LucideIcons.ArrowRight,
  "icon-mail": LucideIcons.Mail,
  "icon-code": LucideIcons.Code,
  "icon-server": LucideIcons.Server,
  "icon-database": LucideIcons.Database,
  "icon-wrench": LucideIcons.Wrench,
  "icon-linkedin": LucideIcons.LinkedinIcon,
  "icon-download": LucideIcons.Download,
  "icon-share": LucideIcons.Share2,
  "icon-phone": LucideIcons.Phone,
  "icon-map-pin": LucideIcons.MapPin,
  "icon-message-circle": LucideIcons.MessageCircle,
  "icon-send": LucideIcons.Send,
  "icon-check-circle": LucideIcons.CheckCircle,
  "icon-chevron-down": LucideIcons.ChevronDown,
  "icon-copy": LucideIcons.Copy,
  "icon-heart": LucideIcons.Heart,
  "icon-rocket": LucideIcons.Rocket,
  "icon-lightbulb": LucideIcons.Lightbulb,
  "icon-users": LucideIcons.Users,
  "icon-briefcase": LucideIcons.Briefcase,
  "icon-coffee": LucideIcons.Coffee,
  "icon-award": LucideIcons.Award,
  "icon-git-branch": LucideIcons.GitBranch,
  "icon-code2": LucideIcons.Code2,
  "icon-palette": LucideIcons.Palette,
  "icon-bar-chart-3": LucideIcons.BarChart3,
  "icon-smartphone": LucideIcons.Smartphone,
  "icon-clock": LucideIcons.Clock,
  "icon-message-square": LucideIcons.MessageSquare,
  "icon-shield": LucideIcons.Shield,
  "icon-zap": LucideIcons.Zap,
  "icon-target": LucideIcons.Target,
  "icon-file-code": LucideIcons.FileCode,
  "icon-package": LucideIcons.Package,
  "icon-shopping-cart": LucideIcons.ShoppingCart,
  "icon-globe": LucideIcons.Globe,
  "icon-home": LucideIcons.Home,
  "icon-settings": LucideIcons.Settings,
  "icon-search": LucideIcons.Search,
  "icon-plus": LucideIcons.Plus,
  "icon-x": LucideIcons.X,
  "icon-trash-2": LucideIcons.Trash2,
  "icon-edit": LucideIcons.Edit,
  "icon-eye": LucideIcons.Eye,
  "icon-save": LucideIcons.Save,
  "icon-file-text": LucideIcons.FileText,
  "icon-folder-kanban": LucideIcons.FolderKanban,
  "icon-calendar": LucideIcons.Calendar,
  "icon-book-open": LucideIcons.BookOpen,
  "icon-layout-dashboard": LucideIcons.LayoutDashboard,
  "icon-link-2": LucideIcons.Link2,
  "icon-loader-2": LucideIcons.Loader2,
  "icon-star": LucideIcons.Star,
  "icon-tag": LucideIcons.Tag,
  "icon-terminal": LucideIcons.Terminal,
  "icon-undo-2": LucideIcons.Undo2,
  "icon-upload": LucideIcons.Upload,
  "icon-refresh-cw": LucideIcons.RefreshCw,
  "icon-rotate-ccw": LucideIcons.RotateCcw,
  "icon-power": LucideIcons.Power,
  "icon-snowflake": LucideIcons.Snowflake,
  "icon-sparkles": LucideIcons.Sparkles,
  "icon-help-circle": LucideIcons.HelpCircle,
  "icon-chevron-up": LucideIcons.ChevronUp,
  "icon-chevron-left": LucideIcons.ChevronLeft,
  "icon-arrow-left": LucideIcons.ArrowLeft,
  "icon-alert-triangle": LucideIcons.AlertTriangle,
  "icon-file-input": LucideIcons.FileInput,
  "icon-file-x": LucideIcons.FileX,
};

// React Icons (social media - no prefix or with specific keys)
const SOCIAL_ICON_MAP: Record<string, IconComponent> = {
  github: FaGithub,
  gitlab: FaGitlab,
  bitbucket: FaBitbucket,
  stackOverflow: FaStackOverflow,
  stackoverflow: FaStackOverflow,
  dev: FaDev,
  medium: FaMedium,
  linkedin: FaLinkedin,
  x: FaXTwitter,
  twitter: FaXTwitter,
  facebook: FaFacebook,
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  email: FaEnvelope,
  phone: FaPhone,
  whatsApp: FaWhatsapp,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  discord: FaDiscord,
  skype: FaSkype,
  signal: SiSignal,
  website: FaGlobe,
  upwork: SiUpwork,
  fiverr: SiFiverr,
  freelancer: SiFreelancer,
};

export const resolveIcon = (iconKey?: string): IconComponent | null => {
  if (!iconKey) return null;

  // 1. Try exact match from Lucide icon map (prefixed with "icon-")
  if (LUCIDE_ICON_MAP[iconKey]) {
    return LUCIDE_ICON_MAP[iconKey];
  }

  // 2. Try exact match from Social icon map (no prefix)
  if (SOCIAL_ICON_MAP[iconKey]) {
    return SOCIAL_ICON_MAP[iconKey];
  }

  // 3. Handle React Icons from react-icons/fa6 (keys like "fa-code", "fa-terminal")
  if (iconKey.startsWith("fa-")) {
    const iconName = iconKey
      .replace("fa-", "")
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
    const Fa6IconName = `Fa${iconName}`;
    const Fa6IconsRecord = Fa6Icons as Record<string, unknown>;
    const Fa6Icon = Fa6IconsRecord[Fa6IconName];
    if (Fa6Icon && (typeof Fa6Icon === "function" || typeof Fa6Icon === "object")) {
      return Fa6Icon as IconComponent;
    }
  }

  // 4. Handle React Icons from react-icons/si (keys like "si-react", "si-javascript")
  if (iconKey.startsWith("si-")) {
    const iconName = iconKey
      .replace("si-", "")
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
    const SiIconName = `Si${iconName}`;
    const SiIconsRecord = SiIcons as Record<string, unknown>;
    const SiIcon = SiIconsRecord[SiIconName];
    if (SiIcon && (typeof SiIcon === "function" || typeof SiIcon === "object")) {
      return SiIcon as IconComponent;
    }
  }

  // 5. Try to extract icon name from key (e.g., "icon-shopping-cart" -> "ShoppingCart")
  // and match directly from Lucide icons
  const cleanedKey = iconKey.replace("icon-", "");
  const keyParts = cleanedKey.split("-");
  const pascalCaseName = keyParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  // Check in the LucideIcons object
  const LucideIconsRecord = LucideIcons as Record<string, unknown>;
  const LucideIcon = LucideIconsRecord[pascalCaseName];
  if (LucideIcon && (typeof LucideIcon === "function" || typeof LucideIcon === "object")) {
    return LucideIcon as IconComponent;
  }

  // 6. Fallback: try the cleaned key directly in case it's already PascalCase
  const DirectIcon = LucideIconsRecord[cleanedKey];
  if (DirectIcon && (typeof DirectIcon === "function" || typeof DirectIcon === "object")) {
    return DirectIcon as IconComponent;
  }

  // 7. Try lowercase version for social icons
  const lowercaseKey = iconKey.toLowerCase();
  if (SOCIAL_ICON_MAP[lowercaseKey]) {
    return SOCIAL_ICON_MAP[lowercaseKey];
  }

  return null;
};
