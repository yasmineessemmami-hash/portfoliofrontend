import type { ComponentType } from "react";
import { ShoppingCart, Palette, BarChart3 } from "lucide-react";

// Keys refer directly to the icon used, not the content meaning
export const PROJECT_ICON_KEYS = [
  "icon-shopping-cart",
  "icon-palette",
  "icon-bar-chart-3",
] as const;

export type ProjectIconKey = (typeof PROJECT_ICON_KEYS)[number];

export const projectIconMap: Record<
  ProjectIconKey,
  ComponentType<{ className?: string }>
> = {
  "icon-shopping-cart": ShoppingCart,
  "icon-palette": Palette,
  "icon-bar-chart-3": BarChart3,
};

