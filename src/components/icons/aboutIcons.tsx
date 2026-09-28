import type { ComponentType } from "react";
import {
  Briefcase,
  Coffee,
  Award,
  GitBranch,
  Code2,
  Lightbulb,
  Rocket,
  Users,
} from "lucide-react";

// Keys refer directly to the icon name, not the statistic meaning
export const ABOUT_STAT_ICON_KEYS = [
  "icon-briefcase",
  "icon-coffee",
  "icon-award",
  "icon-git-branch",
] as const;

export type AboutStatIconKey = (typeof ABOUT_STAT_ICON_KEYS)[number];

export const aboutStatIconMap: Record<
  AboutStatIconKey,
  ComponentType<{ className?: string }>
> = {
  "icon-briefcase": Briefcase,
  "icon-coffee": Coffee,
  "icon-award": Award,
  "icon-git-branch": GitBranch,
};

export const ABOUT_VALUE_ICON_KEYS = [
  "icon-code2",
  "icon-lightbulb",
  "icon-rocket",
  "icon-users",
] as const;

export type AboutValueIconKey = (typeof ABOUT_VALUE_ICON_KEYS)[number];

export const aboutValueIconMap: Record<
  AboutValueIconKey,
  ComponentType<{ className?: string }>
> = {
  "icon-code2": Code2,
  "icon-lightbulb": Lightbulb,
  "icon-rocket": Rocket,
  "icon-users": Users,
};

