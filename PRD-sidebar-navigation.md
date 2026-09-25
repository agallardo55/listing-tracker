# PRD: Casa Left Sidebar Navigation

| Field | Value |
|---|---|
| **Title** | Casa — Traphouse-inspired left sidebar navigation |
| **Status** | Draft |
| **Owner** | Casa / Adam G |
| **Date** | 2026-09-24 |
| **Repo** | `agallardo55/listing-tracker` |
| **Primary file** | `index.html` (single-file static MVP) |
| **Implementer** | Hermes agent → Codex |
| **Merge / deploy** | **Adam approval required** — Hermes/Codex may implement and open a PR; do **not** merge to `main` or trigger production GitHub Pages deploy without Adam’s explicit approval |

---

## 1. Problem / opportunity

Casa’s desktop navigation is a **top header** with decorative links that do **not** navigate. Real section switching only works on mobile via bottom tabs. Phase filtering for listings lives as pill tabs in the content area.

Adam wants Casa’s chrome to feel like Traphouse (Family Dashboard): a **left vertical sidebar** with brand + icon/label nav items, soft modern active states, and a calmer layout. This is a navigation/layout change only — not new product features.

**Visual reference:** Traphouse Family Dashboard screenshot (Adam-attached). Pattern: left sidebar, brand at top, vertical icon+label items, active = light accent fill + solid left edge bar, soft gray/off-white surfaces, rounded corners. Traphouse uses purple; Casa should keep its existing teal/mint accent (see §5).

---

## 2. Goals

- [ ] Replace desktop top `nav-links` with a **fixed/sticky left sidebar** matching Traphouse layout patterns.
- [ ] Wire sidebar items to **existing** screens already used by mobile bottom tabs.
- [ ] Keep listing **phase filter tabs** and listing **detail phase tabs** in the content area (do not promote phases into the sidebar).
- [ ] Responsive: sidebar collapses behind a hamburger/drawer on narrow widths; mobile bottom tabs may remain or be reconciled (see §7).
- [ ] Preserve `localStorage` data model (`listing-tracker-v1`) and all listing/checklist/timeline/settings behavior.
- [ ] Static HTML/CSS/JS only — no new framework, no backend, no auth.
- [ ] Accessible: keyboard focus, `aria-current="page"` (or equivalent) on active nav item.

## 3. Non-goals / out of scope

- Auth, sessions, log out, “Session active” footers (Traphouse has these; Casa has **no auth**).
- Multi-tenant / multi-user / avatar member rows (omit unless trivial and optional — **prefer omit**).
- Copying Traphouse features (meal plan, chores, shopping, budget, PIN auth, etc.).
- Backend, API, database, or new npm dependencies.
- Changing checklist templates, sample listings, or stage/phase business logic.
- Splitting into a multi-file build system (keep single `index.html` unless a tiny CSS extract is clearly cleaner — default: **stay single-file**).
- Merging PRs or deploying to GitHub Pages without Adam’s approval.

---

## 4. User

**Adam / real estate listing ops** — tracks listings through Prep → MLS Live → Showings/Offers → Pending/Close with per-listing checklists, timeline dates, vendors, and notes. Needs fast section switching and clear sense of “where I am” without losing phase filters inside Listings / Detail.

---

## 5. Current state (from `index.html` as of 2026-09-24)

### 5.1 App shape

- Static SPA: everything in `#app`, rendered by JS (`render()` → screen-specific `render*` + `bindEvents()`).
- Persistence: `localStorage` key `STORE_KEY = "listing-tracker-v1"`.
- State shape (relevant): `{ teamName, theme, view: { screen, listingId, dashboardPhase, detailPhase }, listings[] }`.
- Default brand name: `"Casa"`. Theme: `"light"` | `"dark"` via `data-theme` on `<html>`.

### 5.2 Screens (`state.view.screen`)

| Screen | Renderer | Notes |
|---|---|---|
| `dashboard` | `renderDashboard()` | List of listings filtered by `dashboardPhase` |
| `detail` | `renderDetail(listing)` | Property fields, stage stepper, detail phase tabs + checklist/notes |
| `checklist` | `renderChecklistScreen(listing)` | Full checklist for selected listing; empty prompt if none selected |
| `timeline` | `renderTimeline(listing)` | Date milestones for selected listing |
| `settings` | `renderSettings()` | Team name, theme toggle, listing-scoped vendors |

### 5.3 Navigation chrome today

**Desktop topbar** (`renderTopbar()` → `.topbar`):

- Brand: `.brand-emoji` 🏡 + editable `#teamNameInput` (`.brand-name-input`) + subtitle “Listing workflow dashboard”.
- Promo strip: `.promo-bar.desktop-only`.
- Nav: `.nav-links.desktop-only` with **non-clickable** `<span>`s: Listings, Checklist, Timeline, Settings.
- Theme: `#themeToggle` (`.theme-toggle`).

**Mobile** (`renderBottomTabs()` → `.mobile-bottom-tabs`, shown `@media (max-width: 640px)`):

- Functional buttons with `data-tab`: `dashboard` | `checklist` | `timeline` | `settings`.
- Checklist/Timeline require a selected listing; otherwise alert + bounce to dashboard.

**Important:** Desktop top nav labels are **visual only**. Mobile tabs are the only working section switcher today. Sidebar work should **wire desktop nav** to the same behavior as `[data-tab]`.

### 5.4 Phase vs section (do not conflate)

**Dashboard phase filter** (content, not app chrome):

```js
const PHASES = ["Prep", "MLS Live", "Showings/Offers", "Pending/Close"];
```

- UI: `.phase-tabs` / `.phase-tab` with `data-phase-tab`.
- State: `state.view.dashboardPhase`.
- Filters which listings appear on the dashboard via `listingPhase(listing)`.

**Detail phase tabs** (inside a listing):

```js
const DETAIL_TABS = ["Prep", "Scheduling", "MLS Live", "Showings/Offers", "Pending/Close", "Notes"];
```

- UI: same `.phase-tab` classes with `data-detail-phase-tab`.
- State: `state.view.detailPhase`.
- Filters checklist sections via `PHASE_SECTIONS` (or shows Notes textarea).

**Listing stages** (stepper on detail, different concept):

```js
const STAGES = ["Listing Signed", "Prep", "Photos", "MLS Live", "Pending", "Closed"];
```

### 5.5 Colors / tokens (keep Casa accent — do not switch to Traphouse purple)

Light theme (`:root`):

| Token | Value | Role |
|---|---|---|
| `--bg` | `#f7f9fb` | Page background |
| `--surface` | `#ffffff` | Cards / chrome |
| `--surface-2` | `#f3f6f9` | Subtle fills |
| `--text` | `#242832` | Body text |
| `--muted` | `#7a8290` | Secondary |
| `--border` | `#e8edf3` | Borders |
| `--accent` | `#73d2bd` | Primary accent (teal/mint) |
| `--accent-soft` | `#d8f4eb` | Soft accent fill (ideal for active nav) |
| `--brand` | `#2c8b78` | Brand title color |
| `--radius` | `22px` | Large radius aesthetic |
| `--shadow` | soft multi-layer | Card elevation |

Dark theme already defined under `:root[data-theme="dark"]` and prefers-color-scheme fallback. Sidebar must respect both themes.

Key existing classes to reuse/extend: `.topbar`, `.brand`, `.nav-links`, `.phase-tabs`, `.phase-tab`, `.mobile-bottom-tabs`, `.tab-btn`, `.card`, `.btn-primary`, `.theme-toggle`.

---

## 6. Proposed solution

Add a **Traphouse-style left sidebar** as Casa’s primary desktop navigation.

### 6.1 Recommended information architecture

**Sidebar = app sections. Phase tabs stay in content.**

| Sidebar item | Icon (suggested) | Maps to | Behavior |
|---|---|---|---|
| **Listings** | ▦ (or home/grid) | `screen: "dashboard"` | Clear `listingId` (or keep last — prefer clear to match today’s mobile `dashboard` tab). Preserve `dashboardPhase`. |
| **Checklist** | ✓ | `screen: "checklist"` | Requires selected listing; same alert/bounce as mobile today. |
| **Timeline** | ◷ | `screen: "timeline"` | Requires selected listing; same guard. |
| **Settings** | ⚙ | `screen: "settings"` | Always available. |

**Keep in content (not sidebar):**

- Dashboard `.phase-tabs` (Prep / MLS Live / Showings/Offers / Pending/Close) — listing **filters**.
- Detail `.phase-tabs` (Prep / Scheduling / MLS Live / Showings/Offers / Pending/Close / Notes) — listing **workflow sections**.
- Stage stepper on detail — listing lifecycle.

**Why this IA (not phases-in-sidebar):**

1. Matches existing mobile IA and `data-tab` handlers already in `bindEvents()`.
2. Phases are filters within Listings/Detail, not peer app destinations; putting them in the sidebar would duplicate/conflict with detail tabs and hide “Checklist / Timeline / Settings”.
3. Desktop top labels already name these four sections — they just need to become real navigation in sidebar form.
4. Keeps scope tight: layout + wiring, not a workflow redesign.

**Optional later (not in this PR):** “All listings” count badges, deep links to a phase via hash — only if trivial.

### 6.2 Layout sketch

```
┌────────────┬──────────────────────────────────────────────┐
│ Casa 🏡    │  [promo optional / slimmed]                  │
│            │  Listings                    [+ New Listing] │
│ ▦ Listings │  [Prep] [MLS Live] [Showings…] [Pending…]    │
│ ✓ Checklist│  ……………………………………………………………………… │
│ ◷ Timeline │  listing rows / detail / etc.                │
│ ⚙ Settings │                                              │
│            │                                              │
│ (theme?)   │                                              │
└────────────┴──────────────────────────────────────────────┘
```

- Brand **"Casa"** (or editable `teamName`) at top of sidebar — mirror Traphouse “Family Dashboard” placement.
- **No** member avatar row for MVP.
- **No** Session/Log out footer.
- Theme toggle: keep accessible — either bottom of sidebar or compact control in content header.
- Promo bar: may remain above content or be removed/slimmed if it fights the new chrome; do not invent new marketing copy.

### 6.3 Visual / UX requirements (Traphouse patterns → Casa tokens)

- Left vertical sidebar, full viewport height (or sticky within viewport), width ~220–260px desktop.
- Soft surface: `var(--surface)` / `var(--surface-2)` / light gray off-white; border with `var(--border)`.
- Nav items: vertical stack; line-art / simple glyph + label; comfortable tap targets (≥40px height).
- **Active item:** `var(--accent-soft)` background + **solid vertical bar** on left edge using `var(--accent)` (or `--brand`). Inactive: muted text.
- Rounded corners on nav items (~12–14px) consistent with Casa’s soft aesthetic (`--radius` is large for cards; nav pills can be slightly tighter).
- Do **not** adopt Traphouse purple; use Casa `--accent` / `--brand`.
- Content area shifts right on desktop (`margin-left` / flex/`grid` shell). Update `#app` max-width layout accordingly (full-bleed shell + constrained content is fine).
- Dark theme: sidebar uses existing dark tokens; active state still readable.

### 6.4 Responsive

| Breakpoint (suggested) | Behavior |
|---|---|
| ≥ ~900px (or ≥780px) | Sidebar visible/persistent. Hide obsolete desktop `.nav-links`. |
| < breakpoint | Sidebar hidden by default; **hamburger** opens overlay/drawer; backdrop click / Esc closes. |
| ≤640px | Existing `.mobile-bottom-tabs` may remain as primary mobile nav **or** be replaced by hamburger-only — **prefer keep bottom tabs** for parity with today’s mobile UX, and hide duplicate sidebar unless opened. Document choice in PR. |

### 6.5 Interaction requirements

- Clicking a sidebar item sets `state.view.screen` the same way as `[data-tab]` today (reuse handler logic; prefer shared `navigateTo(tab)` helper to avoid duplication).
- Active state reflects `state.view.screen` (`dashboard` → Listings active; `detail` → Listings active as parent context is acceptable, or leave Listings active when viewing a listing).
- Persist selection via existing `saveState()` / `localStorage` (already saves `state.view`).
- **Optional nice-to-have:** sync URL hash (`#/listings`, `#/checklist`, …) on navigate and restore on load — only if easy and does not break localStorage; not required for acceptance.
- Keyboard: tab to items, Enter/Space activate; `aria-current="page"` on active item; sidebar `<nav aria-label="Primary">`.
- Focus trap not required for always-visible sidebar; for mobile drawer, Esc closes and returns focus to hamburger.

---

## 7. Technical constraints

- **Static only:** edit `index.html` CSS + HTML templates in `render*` functions + `bindEvents()`. No React/Vite/npm.
- **No new dependencies** unless justified in PR (default: none; inline SVG or unicode glyphs OK).
- **Do not change** `STORE_KEY`, listing schema, checklist template, sample data migration, or phase/stage algorithms.
- **No auth.**
- Prefer extracting a `renderSidebar()` (and maybe `renderShell(content)`) so every screen gets the same chrome without four copy-pastes.
- `#app` currently `max-width: 1220px; margin: 0 auto` — shell should likely go full width with sidebar + main; constrain main content if needed.
- Keep GitHub Pages compatibility (plain static file).

### Implementation notes for Codex

1. Read current `renderTopbar`, `renderBottomTabs`, `render()`, and `[data-tab]` binding before editing.
2. Introduce layout shell:
   - `.app-shell` → `.sidebar` + `.main`
   - Move brand (+ optional theme) into sidebar.
   - Slim or relocate topbar (may become content-only toolbar: page title actions / theme if not in sidebar).
3. Replace non-functional `.nav-links` spans with real `<button>` or `<a role="button">` items sharing `data-tab` (or call shared navigate helper).
4. Active styles: e.g. `.sidebar-item.active { background: var(--accent-soft); box-shadow: inset 3px 0 0 var(--accent); }`.
5. Preserve phase tab markup/handlers untouched except for layout spacing.
6. Accessibility: labels, `aria-current`, visible focus rings.
7. Smoke locally: `python3 -m http.server 4173` — click all four sidebar items, open a listing, use phase tabs, toggle theme, resize to mobile.
8. Open a **draft PR** to `main`. Do not merge.

---

## 8. Acceptance criteria

- [ ] Desktop shows a left sidebar with brand **Casa** (or current `teamName`) at top.
- [ ] Sidebar items: **Listings**, **Checklist**, **Timeline**, **Settings** — each navigates correctly.
- [ ] Active item shows accent-soft background + left accent bar; uses Casa teal tokens, not purple.
- [ ] Dashboard phase tabs still filter listings; detail phase tabs still switch checklist/notes.
- [ ] Checklist/Timeline without a selected listing still guard (alert + dashboard) as today.
- [ ] Theme toggle still works (light/dark); sidebar readable in both.
- [ ] `localStorage` listings/checklist/notes/vendors unchanged across reload.
- [ ] Narrow viewport: hamburger/drawer **or** retained mobile bottom tabs — no broken double-nav; at least one clear mobile path to all four sections.
- [ ] Keyboard: can reach and activate sidebar items; active item has `aria-current`.
- [ ] No new backend, auth, or dependencies.
- [ ] Changes confined primarily to `index.html` (+ README touch only if needed).
- [ ] Draft PR opened with clear description; **not merged**; deploy waits for Adam.

---

## 9. Deploy / PR process

1. Hermes/Codex implements on a feature branch (e.g. `feat/sidebar-navigation`).
2. Open a **draft PR** into `main` (Casa agent rules: draft is fine).
3. **Adam reviews and approves merge.**
4. After merge to `main`, GitHub Pages serves the updated static site (existing Pages setup).
5. Hermes must **not** merge or force-push `main` without Adam’s approval.

### Suggested PR title

`feat: Traphouse-style left sidebar navigation for Casa`

### Suggested PR body outline

```markdown
## Summary
Adds a left sidebar (Traphouse-inspired) as primary desktop navigation for Casa.
Wires Listings / Checklist / Timeline / Settings to existing screens.
Keeps dashboard + detail phase tabs in content.

## Reference
PRD: PRD-sidebar-navigation.md

## Test plan
- [ ] Desktop: sidebar navigates all 4 sections
- [ ] Active state + theme light/dark
- [ ] Phase filters still work on Listings
- [ ] Detail phase tabs still work
- [ ] Mobile: bottom tabs and/or hamburger work
- [ ] localStorage data intact after reload

## Deploy
Draft PR — merge/deploy only after Adam approval.
```

---

## 10. Open questions for Adam

1. **Mobile chrome:** Keep bottom tabs **and** add hamburger drawer, or replace bottom tabs with hamburger-only?
2. **Promo bar:** Keep, slim, or remove once sidebar exists?
3. **Brand edit:** Keep inline-editable team name in sidebar, or move rename fully into Settings?
4. **URL hash routing:** Want `#/listings` etc. in this PR, or localStorage-only persistence (status quo)?
5. **Detail context:** When viewing a listing detail, should sidebar highlight **Listings** (recommended) or a separate “Detail” item (not recommended — invents a fifth destination)?

---

## 11. Handoff checklist for Hermes → Codex

- [ ] Implement per this PRD in `agallardo55/listing-tracker`.
- [ ] Do not invent features outside §2 / §6.
- [ ] Open draft PR; stop before merge/deploy.
- [ ] If blocked on an open question, default to: keep mobile bottom tabs, keep promo temporarily, keep editable brand, no hash routing, highlight Listings while in detail.
