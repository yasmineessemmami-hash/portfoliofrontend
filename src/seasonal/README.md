# Seasonal/Event Theme System

This directory contains all seasonal and event-themed experiences for the application.

## Architecture

The theme system is centralized and scalable:

- **`themeRegistry.tsx`** - Central registry mapping theme names to components
- **`{theme_name}/`** - Individual theme folders containing theme-specific components
- **Dynamic Loading** - Themes are lazy-loaded for better performance

## Current Themes

- ✅ **christmas** - Christmas intro and snow overlay
- ⏳ **easter** - (Not yet implemented)
- ⏳ **ramadan** - (Not yet implemented)
- ⏳ **new_year** - (Not yet implemented)

## How to Add a New Theme

### Step 1: Create Theme Folder

Create a new folder: `src/seasonal/{theme_name}/`

Example:
```
src/seasonal/easter/
```

### Step 2: Create Intro Component

Create `{ThemeName}Intro.tsx` in your theme folder:

```tsx
// src/seasonal/easter/EasterIntro.tsx
interface EasterIntroProps {
  onComplete?: () => void;
}

export const EasterIntro = ({ onComplete }: EasterIntroProps = {}) => {
  // Your intro component logic
  // Must call onComplete?.() when intro finishes
  return (
    <div>
      {/* Your intro UI */}
    </div>
  );
};
```

**Requirements:**
- Must accept `onComplete?: () => void` prop
- Must call `onComplete?.()` when intro animation completes
- Should use fixed styles (not Tailwind theme variables)
- Should have z-index 99999 to block all UI

### Step 3: Create Overlay Component (Optional)

If your theme needs a global overlay effect (like snow), create `{ThemeName}Overlay.tsx`:

```tsx
// src/seasonal/easter/EasterOverlay.tsx
export const EasterOverlay = () => {
  // Your overlay component
  return <div>...</div>;
};
```

**Requirements:**
- Should be fixed-position
- Should have `pointer-events-none`
- Should have z-index 9998 (below intro)

### Step 4: Create CSS File (Optional)

If your theme needs custom CSS, create `{theme_name}.css`:

```css
/* src/seasonal/easter/easter.css */
.easter-effect {
  /* Your styles */
}
```

### Step 5: Register Theme in Registry

Update `src/seasonal/themeRegistry.tsx`:

1. Add theme name to `ThemeName` type:
```tsx
export type ThemeName = "christmas" | "easter" | "ramadan" | "new_year" | "normal";
```

2. Lazy load your components:
```tsx
const EasterIntro = lazy(() => 
  import("./easter/EasterIntro").then(module => ({ default: module.EasterIntro }))
);
const EasterOverlay = lazy(() => 
  import("./easter/EasterOverlay").then(module => ({ default: module.EasterOverlay }))
);
```

3. Import CSS (if needed):
```tsx
import "@/seasonal/easter/easter.css";
```

4. Add to registry:
```tsx
export const themeRegistry: Record<ThemeName, ThemeComponents | null> = {
  christmas: { ... },
  easter: {
    Intro: EasterIntro,
    Overlay: EasterOverlay, // Optional
  },
  // ...
};
```

### Step 6: Update Backend

Ensure your backend `/api/v1/theme` endpoint can return your new theme:

```json
{
  "name": "Theme Name",
  "theme": "easter"
}
```

## Render Priority

The system follows this render order:

1. **Loading State** - While theme is loading
2. **Intro Component** - If theme has intro (blocks all UI)
3. **App Content** - After intro completes or if no intro
4. **Overlay Component** - After intro completes (if theme has overlay)

## Example: Adding Easter Theme

```tsx
// 1. Create src/seasonal/easter/EasterIntro.tsx
export const EasterIntro = ({ onComplete }: { onComplete?: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return <div>Happy Easter!</div>;
};

// 2. Update themeRegistry.tsx
const EasterIntro = lazy(() => 
  import("./easter/EasterIntro").then(m => ({ default: m.EasterIntro }))
);

export const themeRegistry = {
  // ...
  easter: {
    Intro: EasterIntro,
  },
};
```

## Notes

- Themes are **event modes**, not configurable
- Visual styles are **FIXED** (not using Tailwind theme variables)
- Intro components must **block all UI** visually
- Overlays should **not interfere** with user interactions
- All themes are **lazy-loaded** for performance

