import type { ComponentType } from "react";
import {
  Globe,
  Code2,
  Palette,
  Server,
  Smartphone,
  Database,
  Clock,
  MessageSquare,
  Shield,
  Zap,
  Target,
  CheckCircle,
  FileCode,
  Rocket,
  Package,
} from "lucide-react";

// Keys refer directly to the icon used, not the service meaning
export const SERVICES_ICON_KEYS = [
  "icon-globe",
  "icon-code2",
  "icon-palette",
  "icon-server",
  "icon-smartphone",
  "icon-database",
] as const;

export type ServiceIconKey = (typeof SERVICES_ICON_KEYS)[number];

export const serviceIconMap: Record<
  ServiceIconKey,
  ComponentType<{ className?: string }>
> = {
  "icon-globe": Globe,
  "icon-code2": Code2,
  "icon-palette": Palette,
  "icon-server": Server,
  "icon-smartphone": Smartphone,
  "icon-database": Database,
};

export const WHY_CHOOSE_ME_ICON_KEYS = [
  "icon-clock",
  "icon-message-square",
  "icon-shield",
  "icon-zap",
  "icon-target",
  "icon-check-circle",
] as const;

export type WhyChooseMeIconKey = (typeof WHY_CHOOSE_ME_ICON_KEYS)[number];

export const whyChooseMeIconMap: Record<
  WhyChooseMeIconKey,
  ComponentType<{ className?: string }>
> = {
  "icon-clock": Clock,
  "icon-message-square": MessageSquare,
  "icon-shield": Shield,
  "icon-zap": Zap,
  "icon-target": Target,
  "icon-check-circle": CheckCircle,
};

export const DELIVERABLE_ICON_KEYS = [
  "icon-file-code",
  "icon-rocket",
  "icon-package",
] as const;

export type DeliverableIconKey = (typeof DELIVERABLE_ICON_KEYS)[number];

export const deliverableIconMap: Record<
  DeliverableIconKey,
  ComponentType<{ className?: string }>
> = {
  "icon-file-code": FileCode,
  "icon-rocket": Rocket,
  "icon-package": Package,
};

