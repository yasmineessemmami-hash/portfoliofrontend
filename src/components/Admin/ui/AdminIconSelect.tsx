import { createElement, useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import * as LucideIcons from "lucide-react";
import * as Fa6Icons from "react-icons/fa6";
import * as SiIcons from "react-icons/si";
import { resolveIcon } from "@/components/icons/IconResolver";
import { aboutStatIconMap } from "@/components/icons/aboutIcons";
import { aboutValueIconMap } from "@/components/icons/aboutIcons";
import { projectIconMap } from "@/components/icons/projectIcons";

interface IconOption {
  key: string;
  icon: string;
  library?: string;
}

interface AdminIconSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: IconOption[];
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  placeholder?: string;
}

// Comprehensive icon mapping for all available icons
const getAllIconComponents = (): Record<string, React.ComponentType<{ className?: string }>> => {
  const allIcons: Record<string, React.ComponentType<{ className?: string }>> = {};

  // Add icons from IconResolver
  const iconResolverMap = {
    "icon-folder": LucideIcons.Folder,
    "icon-github": LucideIcons.Github,
    "icon-external-link": LucideIcons.ExternalLink,
    "icon-arrow-right": LucideIcons.ArrowRight,
    "icon-mail": LucideIcons.Mail,
    "icon-code": LucideIcons.Code,
    "icon-server": LucideIcons.Server,
    "icon-database": LucideIcons.Database,
    "icon-wrench": LucideIcons.Wrench,
    "icon-linkedin": LucideIcons.Linkedin,
    "icon-download": LucideIcons.Download,
    "icon-phone": LucideIcons.Phone,
    "icon-map-pin": LucideIcons.MapPin,
    "icon-message-circle": LucideIcons.MessageCircle,
    "icon-send": LucideIcons.Send,
    "icon-check-circle": LucideIcons.CheckCircle,
    "icon-chevron-down": LucideIcons.ChevronDown,
  };

  // Add icons from aboutIcons
  const aboutIcons = {
    ...aboutStatIconMap,
    ...aboutValueIconMap,
  };

  // Add icons from projectIcons
  const projectIcons = projectIconMap;

  // Add service icons
  const serviceIcons = {
    "icon-globe": LucideIcons.Globe,
    "icon-code2": LucideIcons.Code2,
    "icon-palette": LucideIcons.Palette,
    "icon-smartphone": LucideIcons.Smartphone,
    "icon-clock": LucideIcons.Clock,
    "icon-message-square": LucideIcons.MessageSquare,
    "icon-shield": LucideIcons.Shield,
    "icon-zap": LucideIcons.Zap,
    "icon-target": LucideIcons.Target,
    "icon-file-code": LucideIcons.FileCode,
    "icon-rocket": LucideIcons.Rocket,
    "icon-package": LucideIcons.Package,
  };

  // Merge all icon maps
  Object.assign(allIcons, iconResolverMap, aboutIcons, projectIcons, serviceIcons);

  return allIcons;
};

const iconComponentsCache = getAllIconComponents();

// Get icon component from icon name or key
const getIconComponent = (iconKey: string, iconName?: string, library?: string): React.ComponentType<{ className?: string }> | null => {
  // First try to get from cached map using key
  if (iconComponentsCache[iconKey]) {
    return iconComponentsCache[iconKey];
  }

  // Try to resolve using IconResolver
  const resolved = resolveIcon(iconKey);
  if (resolved) return resolved;

  // Handle React Icons based on library
  if (library) {
    if (library === "react-icons/fa6" && iconName) {
      const Fa6IconsRecord = Fa6Icons as Record<string, unknown>;
      const IconComponent = Fa6IconsRecord[iconName];
      if (IconComponent && (typeof IconComponent === "function" || typeof IconComponent === "object")) {
        return IconComponent as React.ComponentType<{ className?: string }>;
      }
    } else if (library === "react-icons/si" && iconName) {
      const SiIconsRecord = SiIcons as Record<string, unknown>;
      const IconComponent = SiIconsRecord[iconName];
      if (IconComponent && (typeof IconComponent === "function" || typeof IconComponent === "object")) {
        return IconComponent as React.ComponentType<{ className?: string }>;
      }
    }
  }

  // Try to get from Lucide using icon name (from backend)
  if (iconName && (!library || library === "lucide-react")) {
    const LucideIconsRecord = LucideIcons as Record<string, unknown>;
    const IconComponent = LucideIconsRecord[iconName];
    if (IconComponent && (typeof IconComponent === "function" || typeof IconComponent === "object")) {
      return IconComponent as React.ComponentType<{ className?: string }>;
    }
  }

  // Fallback: try to extract icon name from key (e.g., "icon-shopping-cart" -> "ShoppingCart")
  const keyParts = iconKey.replace("icon-", "").split("-");
  const pascalCaseName = keyParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const LucideIconsRecord = LucideIcons as Record<string, unknown>;
  const IconComponent = LucideIconsRecord[pascalCaseName];
  if (IconComponent && (typeof IconComponent === "function" || typeof IconComponent === "object")) {
    return IconComponent as React.ComponentType<{ className?: string }>;
  }

  return null;
};

export const AdminIconSelect = ({
  value,
  onChange,
  options,
  label,
  error,
  helperText,
  className = "",
  placeholder = "Select an icon",
}: AdminIconSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.key === value),
    [options, value]
  );
  const IconComponent = useMemo(
    () => (selectedOption ? getIconComponent(selectedOption.key, selectedOption.icon, selectedOption.library) : null),
    [selectedOption]
  );

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.icon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionKey: string) => {
    onChange(optionKey);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}

      {/* Selected Value Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between ${error ? "border-destructive focus:ring-destructive" : "border-input"
          }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {IconComponent &&
            createElement(IconComponent, {
              className: "w-4 h-4 text-foreground shrink-0",
            })}
          <span className="truncate">
            {selectedOption ? selectedOption.key : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="relative z-50 mt-1">
          <div className="absolute w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-border sticky top-0 bg-card z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search icons..."
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const OptionIcon = getIconComponent(option.key, option.icon, option.library);
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleSelect(option.key)}
                      className={`w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-secondary transition-colors ${value === option.key
                        ? "bg-secondary text-foreground"
                        : "text-foreground"
                        }`}
                    >
                      {OptionIcon &&
                        createElement(OptionIcon, {
                          className: "w-4 h-4 text-foreground shrink-0",
                        })}
                      <span className="flex-1">{option.key}</span>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No icons found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};

