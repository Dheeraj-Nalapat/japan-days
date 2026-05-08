# Japan Days — Quick Win Tasks

> Pure client-side enhancements. No backend, no external services.
> Priority: P0 = do first, P1 = nice to have, P2 = when bored

---

## localStorage & Persistence

- [x] **JD-101** — Persist checklist state in localStorage `P0`
  Save checked/unchecked state to `localStorage` so it survives page refreshes. Currently the `onclick` handler just toggles a CSS class with no persistence.

- [x] **JD-102** — Personal notes per day via localStorage `P1`
  Add a small textarea per day-entry in the itinerary, saving content to `localStorage`. Useful for booking refs, restaurant names, etc.

- [x] **JD-103** — Dark/light mode toggle with localStorage preference `P1`
  Swap `--ink`/`--paper` CSS variable values with a toggle button. Store preference in `localStorage`.

---

## Detail Modals (Expandable Cards)

- [x] **JD-110** — Place detail modals in itinerary `P0`
  Clicking a place item in the itinerary opens a modal with extended info: full description, tips, opening hours, Google Maps link, nearest station, expected time to spend. Add an `extended` field to itinerary YAML entries.

- [x] **JD-111** — Food detail modals `P0`
  Clicking a food item opens a modal showing: description, where to try it, price range, photo placeholder, dietary notes. Add extended food fields to `food.yaml`.

- [x] **JD-112** — Hidden gem detail modals `P1`
  Clicking a hidden gem card opens a modal with: full description, best time to visit, how to get there, nearby spots, crowd tips. Expand `hidden-gems.yaml` with these fields.

- [x] **JD-113** — Activity detail modals `P1`
  For activity-tagged places, modal shows: booking info, estimated cost, duration, reservation links, what to bring. Add activity-specific fields to YAML.

- [x] **JD-114** — Reusable modal component `P0` (dependency for JD-110 through JD-113)
  Build a single reusable modal system in `index.html` — overlay, close button, escape-to-close, scroll lock on body, slide-up animation. All detail modals use this component.

---

## Navigation & Deep Linking

- [x] **JD-120** — Deep-link sections via URL hash `P1`
  Enable `#city-name` hash routing so clicking a route city scrolls to its itinerary block. Extend to per-city anchors beyond the existing section `id` attributes.

- [x] **JD-121** — Google Maps deep links for every place `P1`
  Auto-generate `https://www.google.com/maps/search/?api=1&query=...` links for every place in the itinerary. Tap-to-navigate on mobile.

---

## Visual & UX

- [x] **JD-130** — Countdown timer to departure `P1`
  Pull trip dates from `trip.yaml` and render a live "X days, Y hours until Japan" countdown in the hero section.

- [x] **JD-131** — Print stylesheet `P2`
  Add `@media print` CSS rules for a clean, paper-friendly itinerary. Hide nav, loading screen, animations; re-layout for A4.

- [x] **JD-132** — Unsplash image placeholders `P2`
  Use Unsplash Source URLs for free, no-auth city/gem images in YAML `image` fields. Fallback gradient if image fails to load.

---

## Sharing & Export

- [x] **JD-140** — Web Share API `P2`
  Add a share button that uses `navigator.share()` on mobile for native sharing to WhatsApp, Telegram, etc.

- [x] **JD-141** — Export itinerary to .ics `P2`
  Generate an iCal file from YAML dates for import into Google Calendar / Apple Calendar.

- [x] **JD-142** — QR code for sharing `P2`
  Generate a scannable QR code linking to the deployed page using a lightweight QR library from CDN.

---

## Progressive Web App — Full Widget Experience

> Turn Japan Days into a native-feeling app on mobile home screens with quick-glance widgets, shortcuts, and offline-first design.

### Foundation

- [x] **JD-150** — PWA manifest & Service Worker `P1`
  Add `manifest.json` with app name, icons (192px, 512px), theme color (`#1a1208`), background color (`#f5f0e8`), `display: standalone`. Register a Service Worker that caches the app shell, YAML files, fonts, and CDN scripts on first load. Serve stale-while-revalidate for data files.

- [x] **JD-151** — App splash screen & install prompt `P1`
  Custom install banner that appears after 2 visits. Styled to match the Japanese aesthetic — not the browser default. On iOS, show "Add to Home Screen" instructions since there's no native install prompt.

- [x] **JD-152** — App icons & Apple touch icons `P1`
  Generate PWA icons at all required sizes (72, 96, 128, 144, 152, 192, 384, 512). Add `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` meta tags. Use a torii gate or 日本 glyph as the icon.

### Widget Views (Compact Quick-Glance Screens)

- [x] **JD-153** — "Today" widget view `P0`
  A compact, single-screen view showing only today's itinerary: city, places, food recommendations, and checklist items for the day. Auto-detects current date from trip YAML dates. Shows "Day 4 — Kyoto" style heading. Accessible via a `/today` route or a nav shortcut.

- [x] **JD-154** — Trip countdown widget `P1`
  A standalone mini-view showing: days/hours/minutes until departure, next upcoming flight, current city (during trip), and trip progress bar. Designed for quick home screen glance — large typography, minimal layout.

- [x] **JD-155** — Quick checklist widget `P1`
  A focused checklist-only view — no itinerary, no budget, just the checklist with completion percentage. Optimized for one-handed mobile use. Shows "7/12 done" progress ring at the top.

- [x] **JD-156** — Budget tracker widget `P2`
  Compact budget view with spent-vs-remaining bar. If Supabase is connected (JD-210+), shows live spending. Otherwise, static budget summary from YAML with a manual "mark as spent" toggle per item.

### Shortcuts & Navigation

- [x] **JD-157** — PWA shortcuts (manifest) `P1`
  Add `shortcuts` array to `manifest.json` so long-pressing the app icon on Android shows quick actions: "Today's Plan", "Checklist", "Budget", "Map". Each shortcut opens the app scrolled to / filtered to that section.

- [x] **JD-158** — Bottom tab bar for mobile `P1`
  When running as installed PWA (`display-mode: standalone`), show a fixed bottom tab bar with: Today, Itinerary, Map, Checklist, Budget. Replaces the top nav on mobile for thumb-friendly navigation.

### Offline & Background

- [x] **JD-159** — Offline indicator & cached data badge `P2`
  Show a subtle "offline" pill in the nav when `navigator.onLine` is false. Badge cached sections with a checkmark so the user knows what's available offline. Show "last synced: 2 hours ago" timestamp.

- [x] **JD-15A** — Background sync for notes & checklist `P2`
  When offline, queue localStorage writes. When back online, sync to Supabase (if connected). Uses the Background Sync API where supported, falls back to `online` event listener.

- [x] **JD-15B** — Push notifications for trip reminders `P2`
  Register for push notifications via the Push API. Send reminders like "Pack your JR Pass — departure in 2 days" or "Don't forget: Fushimi Inari is best before 7am". Requires a simple push server (Supabase Edge Function or free service like ntfy.sh).

---

## External APIs (CDN Libraries, Free Tiers)

- [x] **JD-160** — Interactive map with Leaflet `P2`
  Plot hidden gems and itinerary places on a map. Add `lat`/`lng` fields to YAML data. Use Leaflet from CDN.

- [x] **JD-161** — Live currency converter `P2`
  Hit a free exchange rate API to show live JPY equivalents next to INR budget items.

- [x] **JD-162** — Weather forecast overlay `P2`
  Use Open-Meteo free API to show forecasts per city/day on the itinerary (activates within 16-day forecast window).

---

## Task Summary

| ID | Task | Priority | Status |
|---|---|---|---|
| JD-101 | Persist checklist in localStorage | P0 | Done |
| JD-102 | Personal notes per day | P1 | Done |
| JD-103 | Dark/light mode toggle | P1 | Done |
| JD-110 | Place detail modals | P0 | Done |
| JD-111 | Food detail modals | P0 | Done |
| JD-112 | Hidden gem detail modals | P1 | Done |
| JD-113 | Activity detail modals | P1 | Done |
| JD-114 | Reusable modal component | P0 | Done |
| JD-120 | Deep-link via URL hash | P1 | Done |
| JD-121 | Google Maps deep links | P1 | Done |
| JD-130 | Countdown timer | P1 | Done |
| JD-131 | Print stylesheet | P2 | Done |
| JD-132 | Unsplash image placeholders | P2 | Done |
| JD-140 | Web Share API | P2 | Done |
| JD-141 | Export to .ics | P2 | Done |
| JD-142 | QR code sharing | P2 | Done |
| JD-150 | PWA manifest & Service Worker | P1 | Done |
| JD-151 | App splash screen & install prompt | P1 | Done |
| JD-152 | App icons & Apple touch icons | P1 | Done |
| JD-153 | "Today" widget view | P0 | Done |
| JD-154 | Trip countdown widget | P1 | Done |
| JD-155 | Quick checklist widget | P1 | Done |
| JD-156 | Budget tracker widget | P2 | Done |
| JD-157 | PWA shortcuts (manifest) | P1 | Done |
| JD-158 | Bottom tab bar for mobile | P1 | Done |
| JD-159 | Offline indicator & cached data badge | P2 | Done |
| JD-15A | Background sync for notes | P2 | Done |
| JD-15B | Push notifications | P2 | Done |
| JD-160 | Leaflet map | P2 | Done |
| JD-161 | Currency converter | P2 | Done |
| JD-162 | Weather overlay | P2 | Done |
