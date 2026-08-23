# KisahKita — Our Space

A relationship app for couples in a long-distance relationship: chat, a shared
photo gallery, a food journal, a synced calendar with timezone-aware
countdowns, memories, love notes, live location, and more — built as a
faithful implementation of the approved KisahKita Claude Design.

This is Phase 1: the app runs entirely on realistic in-memory mock data.
It is architected so Supabase can be dropped in later without rewriting any
screen — see [Supabase migration plan](#supabase-migration-plan) below.

## Running it

```bash
npm install
npm run dev       # start the dev server
npm run build     # typecheck + production build
npm run lint       # oxlint
npm run preview    # preview the production build

# Visual + interaction QA (needs `npm run dev` running in another shell).
# Drives headless Chromium over every route at 5 viewport widths, exercises
# the main flows, and fails on any console error. Screenshots land in
# .qa-screenshots/ for comparison against the approved design.
npm run qa:visual
```

No environment variables are required for Phase 1. `.env.example` documents
the two variables Phase 2 will need.

## Project structure

```
src/
  types/           domain models (User, Memory, FoodEntry, Message, ...)
  data/mockData.ts single source of truth for dummy content
  services/        DataService interface + mock implementation (the seam
                    a future Supabase-backed implementation plugs into)
  state/AppState.tsx  app-wide UI state: theme, sheets, toasts, chat draft,
                       food/mood status, filters, privacy toggles, etc.
  lib/             design tokens, the pcss() CSS-string→React-style helper,
                    nav config, and the live in-story clock (appClock.ts)
  components/
    layout/        Sidebar, Topbar, BottomTabBar, RightRail, AppShell
    shared/         reusable atoms: cards, chips, photo viewer, bottom
                    sheet, toast, empty states, progress bars
  sheets/          the six bottom-sheet flows (more, PAP capture, mood,
                    new event, delete confirm, love-note reveal) plus the
                    food-entry creation sheet
  pages/           the 22 routed screens
scripts/
  visual-qa.mjs    headless-browser QA sweep (npm run qa:visual)
supabase/
  schema.sql       target Postgres schema + Row Level Security policies
```

### Why `pcss()`?

The approved design is authored as literal CSS declaration strings
(`"display:flex;gap:8px;..."`). `src/lib/pcss.ts` parses those strings into
React style objects at render time, so screen code can carry the *exact*
values from the design source instead of a hand-translated (and
easy-to-drift) object literal per element. This is the main lever for pixel
fidelity to the approved design.

## Design fidelity

- **Design tokens** (`src/lib/theme.ts`): four accent themes (Sakura Bloom,
  Midnight Call, Matcha Latte, Taipei Night) × light/dark, each resolving to
  the same token set (`bg`, `sf`, `sf2`, `ink`, `ink2`, `mut`, `ln`,
  `shadow`, `pk`, `pki`, `lav`) applied as CSS custom properties at the app
  root — matching the design's `THEMES`/`tok` objects exactly.
- **Typography**: Quicksand (headings), Nunito (UI text/labels), Caveat
  (handwritten captions) — the three families the design specifies,
  **self-hosted** from `public/fonts/` rather than linked from Google's CDN.
  Linking the CDN made first paint wait on a third-party round-trip (~12s
  when that host is unreachable, silently falling back to system-ui and
  losing the design's typography entirely); self-hosting makes the type
  render identically everywhere and cut measured first paint from ~12.6s to
  ~0.3s in a sandboxed environment.
- **Responsive shell**: the layout reproduces the design's four viewport
  classes (mobile <768, tablet <1024, laptop <1440, desktop ≥1440) with the
  same structural changes — sidebar width/collapse, right rail visibility,
  bottom tab bar vs. sidebar nav — rather than scaling one layout down.
- **The in-canvas viewport switcher** (📱📗💻🖥️) from the original design
  is preserved as a real feature (forces a viewport + phone/tablet device
  frame), since it's part of the exported UI, not just a design-tool
  artifact.
- **Real date math**: the mock data is written relative to one in-story
  "now" — 20 Mei 2026, 15:42 WIB. `src/lib/appClock.ts` anchors a live clock
  to that instant and derives every countdown and day-difference via actual
  `Date` arithmetic instead of hardcoding numbers. `daysUntil` rounds up and
  `daysSince` counts inclusively, which is both the natural human reading
  ("7 hari lagi", "hari ke-127") and what reproduces the design's own
  figures exactly.

  One deliberate divergence: the design's static copy labels that date
  "Selasa" (Tuesday), but 20 May 2026 is really a **Wednesday**. Since the
  brief calls for genuine date calculations, weekday labels are derived from
  the real calendar and therefore read "Rabu" — consistently, on Home, the
  chat day divider, and the right rail. The date itself is unchanged.

## Data model & mock data

`src/types/index.ts` defines the domain models; `src/data/mockData.ts`
seeds them with realistic content matching the design's own narrative
(Joshua in Jakarta, Partner in Taipei, 127 days into an LDR that started
14 Jan 2026). `src/services/dataService.ts` wraps that data behind a
`DataService` interface — screens that need to read/write (Chat, Food
Journal, Schedule, Memories, Places) go through it rather than importing
mock arrays directly, so swapping the implementation is a one-line change.

## Supabase migration plan

| Phase | What changes |
|---|---|
| **1. Mock data** *(current)* | `dataService = mockDataService` in `src/services/dataService.ts`. No backend. |
| **2. Supabase Auth** | Add `@supabase/supabase-js`, create a Supabase project, set `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (see `.env.example`), replace the onboarding screen's static login/verify steps with real Supabase Auth calls (email/password + magic link or OTP). |
| **3. PostgreSQL** | Run `supabase/schema.sql` against the project. Implement `supabaseDataService: DataService` alongside `mockDataService` in `src/services/dataService.ts`, backed by `@supabase/supabase-js` queries against the tables in the schema. Flip the `dataService` export once it covers every method. |
| **4. Storage** | Create the `media` and `files` private Storage buckets (see the comment at the bottom of `schema.sql`). Replace the `PhotoPlaceholder`/repeating-pattern thumbnails with real images loaded from signed Storage URLs; wire the PAP-capture sheet and file uploader to actually upload. |
| **5. Realtime** | Subscribe `ChatPage` to `messages` inserts via Supabase Realtime for live delivery/typing state instead of the client-only mock; same pattern for `location_pings` on the Live Location screen. |
| **6. RLS/security hardening** | `schema.sql` already ships Row Level Security policies scoping every couple-private table to its two members via `current_couple_id()`. Before going live: review policies for the "large ask" flows (deleting a couple, transferring a media asset), add storage-object policies keyed by the `couple_id` folder prefix, and confirm no `service_role` key is ever shipped to the client. |

The UI never needs to change shape across these phases — every screen reads
through `DataService`/`AppState`, never through a hardcoded fetch — only the
implementations behind those seams do.

## Accessibility

Semantic roles/labels on interactive `div`s that stand in for buttons
(the design uses styled `div`s throughout, not native `<button>`, to hit its
exact visual spec), keyboard activation on the photo viewer's open targets,
visible focus rings (`:focus-visible` in `src/index.css`) layered on top of
the design's own visual language, and `prefers-reduced-motion` is honored
both at the OS level and via the in-app "Hemat daya" animation-level toggle
on the Tema screen.
