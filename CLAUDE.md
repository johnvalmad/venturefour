# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Serve the production build locally
```

No linter or test runner is configured.

## Architecture

React 18 + Vite SPA with a Supabase PostgreSQL backend. No TypeScript — plain JSX throughout.

**Data flow:** `App.jsx` fetches all data on mount from Supabase and passes it down as props. Mutations happen inline inside child components via direct Supabase calls with 600 ms debounce to avoid excessive writes.

**Two database tables:**
- `ideas` — venture ideas with fields: `title`, `concept`, `description`, `market`, `revenue`, `effort`, `deadline`, `tags`, `progress`, `sort_order`
- `tasks` — team tasks with fields: `text`, `owner`, `due`, `done`, `sort_order`

**Supabase client** is initialized once in [src/lib/supabase.js](src/lib/supabase.js) with hardcoded credentials (no env vars in use — the `.env.example` is a leftover from an earlier approach).

**Team members** are hardcoded in [src/data/constants.js](src/data/constants.js): Joao (CEO), Felipe (CPO), Marlon (COO), Leandro (CTO).

## Design System

Custom Tailwind tokens defined in [tailwind.config.js](tailwind.config.js):

| Token | Value | Usage |
|---|---|---|
| `ink` | `#0A0A0A` | Primary text |
| `paper` | `#F5F2EB` | Page background |
| `accent` | `#FF4D1C` | Orange CTAs, highlights |
| `muted` | `#8A8680` | Secondary text |
| `surface` | `#EDEAE2` | Card backgrounds |
| `border` | `#D8D4CC` | Dividers, borders |

Fonts: `font-display` → Syne (headings), `font-body` → DM Sans (body). Both loaded from Google Fonts in [index.html](index.html).

Animations available as Tailwind classes: `animate-fade-in`, `animate-slide-up`.

## Key Patterns

- **Inline editing** uses `contentEditable` wrapped in the reusable [EditableField.jsx](src/components/EditableField.jsx) component.
- **Debounced writes** — all field-level updates debounce 600 ms before calling Supabase to avoid per-keystroke requests.
- **`sort_order`** column on both tables controls display order; drag-to-reorder is not implemented but the field is maintained.
- The Vite base is set to `'./'` for GitHub Pages compatibility (`dist/` deploys to `gh-pages` branch).
