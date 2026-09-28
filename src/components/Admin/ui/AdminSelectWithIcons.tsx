import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import SocialIcon from "@/components/social-icons/SocialIcon";

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface AdminSelectWithIconsProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  placeholder?: string;
}

export const AdminSelectWithIcons = ({
  value,
  onChange,
  options,
  label,
  error,
  helperText,
  className = "",
  placeholder = "Select an option",
}: AdminSelectWithIconsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.value.toLowerCase().includes(searchQuery.toLowerCase())
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
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
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
          {selectedOption && (
            <>
              {selectedOption.icon && (
                <SocialIcon
                  platform={selectedOption.icon}
                  className="w-4 h-4 text-foreground shrink-0"
                />
              )}
              <span className="truncate">{selectedOption.label}</span>
            </>
          )}
          {!selectedOption && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="relative z-50 mt-1">
          <div className="absolute w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
            {/* Search Input */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-auto max-h-48">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-secondary transition-colors ${value === option.value
                      ? "bg-secondary text-foreground"
                      : "text-foreground"
                      }`}
                  >
                    {option.icon && (
                      <SocialIcon
                        platform={option.icon}
                        className="w-4 h-4 text-foreground shrink-0"
                      />
                    )}
                    <span className="flex-1">{option.label}</span>
                  </button>
                ))
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

