# Frontend README

This frontend is a React + Vite + TypeScript app that consumes the Laravel API and renders both the public portfolio site and an admin panel for content management.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Axios
- Framer Motion
- rrweb (session replay)

## Features

- Public portfolio pages: Home, About, Services, Projects, Skills, Blog, FAQ, Contact
- Admin panel for live content editing
- Theme palette system (colors editable by admin)
- Seasonal event themes (intro + overlay)
- Blog subscriptions and article pages
- Contact form with server-side delivery
- Session replay capture for admins

## Environment

Create a `.env` file (or use the existing one) with:

```
VITE_BACKEND_BASE_URL=https://app.joenassar.info
VITE_API_BASE_PATH=/api/v1
```

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - build for production
- `npm run preview` - preview production build
- `npm run lint` - lint

## Project structure (high level)

- `src/pages` - route-level pages (public and admin)
- `src/components` - UI building blocks
- `src/services` - API clients
- `src/hooks` - data fetching hooks
- `src/context` - global app state
- `src/styles` - global styles and theme tokens
- `src/theme` - palette theme logic
- `src/seasonal` - event themes (intro/overlay)
- `src/types` - TypeScript types
- `src/utils` - helpers

## Theme system overview

This project uses two theme systems:

1) Palette theme (colors):
- Defined in `src/styles/theme.css` and applied at runtime by `src/theme/applyTheme.ts`.
- Admin can update palette values from the admin panel, which updates CSS variables in `:root`.
- Tailwind v4 uses `@theme` tokens (e.g., `bg-background`, `text-foreground`, `border-border`).

2) Event themes (seasonal experiences):
- Driven by backend theme key (`site_configurations.themes.theme.key`).
- Registered in `src/seasonal/themeRegistry.tsx`.
- Each theme can have an Intro component and an Overlay (e.g., Christmas snow).

## Icons

Icons are managed in the backend and rendered in the frontend by key:
- Icons list comes from `POST /api/v1/ui/icons`.
- Social icons come from `POST /api/v1/ui/social-icons`.
- Keys are resolved in `src/components/icons/IconResolver.tsx`.

Recommended key formats:
- `icon-...` for Lucide (e.g., `icon-shopping-cart`)
- `fa-...` for react-icons/fa6 (e.g., `fa-code`)
- `si-...` for react-icons/si (e.g., `si-react`)
- Social keys like `github`, `linkedin`, `email`

If you add new icons in the backend, ensure the frontend resolver supports the key and library.

## Admin panel capabilities

- Site configuration (name, contact info, social links)
- Theme palette and event theme
- All page content (home/about/services/projects/skills/blog/faq/contact)
- Contact submissions
- Cache controls
- Session replays
- User/app keys

## Docs

- `docs/PROJECT_GUIDE.md` - how the frontend works and how themes/icons are handled
- `docs/ADDING_FEATURES.md` - how to add features and event themes
