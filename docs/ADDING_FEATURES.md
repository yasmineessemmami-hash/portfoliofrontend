# Adding Features (Frontend)

This guide shows the usual workflow for adding a new feature, plus special notes for themes and icons.

## Standard feature flow

1) Types
- Add or update types in `src/types`.

2) Service
- Add API calls in `src/services/{feature}.service.ts`.
- Use `apiClient` from `src/services/api.ts`.

3) Hook
- Add a hook in `src/hooks` to fetch and map data.
- Normalize backend fields and add fallbacks where needed.

4) UI
- Build reusable UI in `src/components`.
- Create a page in `src/pages`.

5) Routes
- Add the new route in `src/App.tsx`.

6) Admin (if needed)
- Add admin page under `src/pages/Admin`.
- Add it to the admin nav in `src/components/Admin/layout/AdminLayout.tsx`.

7) Docs
- Update `frontend/README.md` and `frontend/docs/PROJECT_GUIDE.md`.

## Adding a new event theme

Event themes are visual experiences (intro/overlay), separate from the color palette.

Frontend steps:

1) Create a theme folder
- `src/seasonal/{theme_name}/`

2) Add components
- `{ThemeName}Intro.tsx` (required if you want an intro)
- `{ThemeName}Overlay.tsx` (optional)
- Optional CSS file `{theme_name}.css`

3) Register the theme
- Update `src/seasonal/themeRegistry.tsx`:
  - Add the theme to `ThemeName`
  - Lazy-load components
  - Import CSS if needed
  - Add to `themeRegistry`

4) Update `useTheme()`
- Add the new theme key to the allowed list in `src/theme/useTheme.ts`.

Backend steps:

1) Add the theme key in the backend `themes` table (or seeder).
2) Ensure `site_configurations.themes.theme.key` can return your new key.
3) Use the admin toggle endpoint to activate it.

## Adding or updating palette variables

The admin can change palette values at runtime. If you need a new token:

1) Add a CSS variable to `:root` in `src/styles/theme.css`.
2) Add the same variable to the `@theme` block in `src/styles/theme.css`.
3) Make sure the backend palette can include the new key.

Tokens are HSL strings, without `hsl()` (the frontend wraps them at runtime).

## Adding new icons

Icons are backend-driven but resolved in the frontend.

Backend steps:
- Add icons to `backend/database/seeders/IconSeeder.php` or `SocialMediaIconSeeder.php`.
- Run the seeder and refresh icon caches.

Frontend steps:

1) If the icon uses Lucide:
- Use a key like `icon-your-icon` and make sure the Lucide icon exists.
- `IconResolver` can resolve many Lucide icons automatically, but add a direct map entry if needed.

2) If the icon uses React Icons:
- Use `fa-...` for `react-icons/fa6` or `si-...` for `react-icons/si`.
- `IconResolver` supports these prefixes dynamically.

3) If the icon is a social icon:
- Use keys like `github`, `linkedin`, or add a mapping in `SOCIAL_ICON_MAP` in `src/components/icons/IconResolver.tsx`.

4) Admin icon selector:
- Admin screens use `src/components/Admin/ui/AdminIconSelect.tsx`.
- If your icon key is new and not resolved, add it there or rely on the dynamic resolver.

## Common mistakes to avoid

- Forgetting to update the allowed theme list in `useTheme()`.
- Adding new palette keys without updating both `:root` and `@theme` in `theme.css`.
- Adding new backend icons without ensuring they can be resolved in `IconResolver`.
