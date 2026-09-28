# Project Guide (Frontend)

This document explains how the frontend works, how data flows through the app, and how the theme and icon systems are wired.

## App boot flow

1) `src/main.tsx` loads global CSS and mounts `<App />`.
2) `src/App.tsx` sets up routing, providers, and theme logic.
3) `SiteConfigProvider` fetches site configuration once.
4) `useCommon()` fetches common data for all public pages.
5) `useTheme()` reads the seasonal event theme from the site config.
6) `applyTheme()` applies the active palette to CSS variables.
7) Routes render public pages and admin pages based on URL.

## Data flow

- All API calls are made through `src/services/api.ts` (axios instance).
- Services in `src/services` call specific endpoints.
- Hooks in `src/hooks` wrap the services and map API data into page-ready shapes.
- Page components consume hooks and render UI.

## Routes

Routes live in `src/App.tsx` using React Router.

Public routes:
- `/`, `/about`, `/services`, `/projects`, `/skills`, `/blog`, `/blog/:slug`, `/faq`, `/contact`, `/maintenance`

Admin routes:
- `/admin/login`
- `/admin` (dashboard)
- `/admin/common`, `/admin/theme`, `/admin/home`, `/admin/about`, `/admin/services`, `/admin/projects`, `/admin/skills`, `/admin/blog`, `/admin/faq`, `/admin/contact`, `/admin/contact/submissions`, `/admin/cache`, `/admin/replays`, `/admin/replays/:sessionId`, `/admin/keys`

## Admin capabilities

The admin panel can:
- Update site name, contact info, and social links
- Change theme palette colors and activate event themes
- Edit all page content
- Manage blog posts and author info
- View contact submissions
- Clear/refresh backend cache
- Review session replays
- Manage user/app keys

## Theme system

### Palette theme (colors)

- Default theme variables are defined in `src/styles/theme.css`.
- The backend sends palette values (HSL strings) in `site_configurations.themes.theme_palette.palette`.
- `src/theme/applyTheme.ts` writes those values to `:root` CSS variables at runtime.
- Tailwind v4 tokens are declared in `@theme` and mapped to the same variables.

Common utility classes used in the UI:
- `bg-background`, `text-foreground`, `border-border`
- `text-muted-foreground`, `bg-card`, `bg-surface`

If you add new CSS variables, add them to `:root` and `@theme` in `src/styles/theme.css`.

### Event themes (seasonal)

- Event themes are chosen by backend theme key.
- `useTheme()` maps backend theme keys to `ThemeName`.
- `src/seasonal/themeRegistry.tsx` defines theme components (Intro/Overlay).
- Intros block UI until they complete.

## Icons

Icons are backend-driven but rendered in the frontend.

- Backend exposes icon lists via `POST /api/v1/ui/icons` and `POST /api/v1/ui/social-icons`.
- Admin screens use these lists to populate icon selects.
- Rendering happens via `src/components/icons/IconResolver.tsx`.

Key formats supported by the resolver:
- `icon-...` for Lucide icons
- `fa-...` for FontAwesome icons in `react-icons/fa6`
- `si-...` for Simple Icons in `react-icons/si`
- Social keys (e.g., `github`, `linkedin`, `email`)

If you add a new icon key in the backend, make sure the frontend resolver can map it.

## Tailwind and global CSS

Tailwind v4 is configured through CSS layers in `src/index.css`:
- `theme.css` defines tokens and CSS variables
- `base.css` sets global typography and base styles
- `components.css`, `utilities.css`, and `animations.css` add shared styles

## Session replay

The frontend uses rrweb to record session events for guests. The admin panel can view replays. Recording is skipped for admin routes.

## Files you will likely touch

- `src/services/*` for API calls
- `src/hooks/*` for data shaping
- `src/pages/*` for route pages
- `src/components/*` for UI
- `src/styles/theme.css` for theme tokens
- `src/seasonal/*` for event themes
