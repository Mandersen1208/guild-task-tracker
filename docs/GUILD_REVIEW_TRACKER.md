# Guild Review Tracker

_Last reviewed: 2026-07-13_

This document is the working tracker for the guild code review of `guild-task-tracker`. It separates **what is currently true** from **what the docs/specs previously implied**, so future changes do not rely on memory or commit messages alone.

## Current baseline

- App: Vite + React + TypeScript task tracker deployed under `/guild-task-tracker/` on GitHub Pages.
- Persistence: browser `localStorage`, local to the current origin/browser/device.
- Current filters in code: `All / Today / Upcoming`.
- Due date and due time are both optional fields.
- Task-specific reminders fire once when an incomplete task has both due date and due time and the app/PWA is open or active around that time.
- End-of-day reminder remains as a 7–9pm best-effort wrap-up while the app/PWA is open or active.
- Reminder settings now include independent toggles for task due date + time reminders and end-of-day reminders.
- Daily reset: daily tasks reset when the app loads and detects a new local date; it is not a guaranteed live midnight timer yet.
- Build gate: `npm run build` must pass locally and in GitHub Pages CI.

## Review synthesis

| Priority | Finding | Owner lens | Status | Tracking decision |
| --- | --- | --- | --- | --- |
| P0 | GitHub Pages CI skipped TypeScript by running `npm exec vite build` directly. | Urahara, Maomao, Guts, Shiroe | Fixed in workflow | CI now uses `npm ci` + `npm run build`. |
| P0 | Local build failed because launch banner state existed but was not rendered/read. | Guts, Maomao | Fixed minimally | Removed dead banner state; banner is tracked as deferred, not complete. |
| P1 | User requested optional due date + optional due time, task reminders at due date/time, existing EOD reminders retained, and settings toggles. | User, Guts, Urahara, Frieren, Maomao | Implemented | `Task.dueTime` added; settings panel added; task reminders and EOD reminders independently toggleable. |
| P1 | Repository hygiene is poor: tracked `node_modules`, tracked IDE files, missing `.gitignore`, untracked generated build files can appear locally. | Urahara, Shiroe, Maomao | Partially fixed | `.gitignore` added; remove tracked vendor/generated files in a dedicated cleanup PR. |
| P1 | Product docs disagreed on filters: README said `All / Active / Completed`, UX wanted `All / Due Today / Completed`, code has `All / Today / Upcoming`. | Marin, Maomao, Guts, Shiroe, Frieren | Open decision | Current source of truth is code: `All / Today / Upcoming`. Product decision needed before changing UX. |
| P1 | Launch summary banner was described as implemented/accepted but absent from the app. | Marin, Maomao, Guts, Frieren | Deferred | Do not claim complete. Either implement or remove from acceptance criteria. |
| P1 | Due-date/time schema is implicit and needs validation/migration. | Frieren, Guts, Shiroe, Maomao | Open | Adopt `YYYY-MM-DD` date and `HH:mm` time for V1; add validation/migration. See `docs/DATA_MODEL.md`. |
| P1 | PWA offline support is incomplete: service worker does not precache hashed JS/CSS assets and may serve stale HTML. | Urahara, Maomao, Shiroe, Marin, Frieren | Open | Track Workbox/`vite-plugin-pwa` or generated asset precache. Add offline smoke tests. |
| P1 | Notification behavior is best-effort, not true background scheduling. | Marin, Maomao, Guts, Urahara | Partially improved | Explicit settings added and README/docs now label limitation; true reliable scheduling remains future platform work. |
| P2 | Daily reset copy said “Resets at midnight,” but behavior is load/focus-dependent today. | Frieren, Shiroe, Maomao, Marin | Fixed copy | Header now says daily tasks reset when you return each day. |
| P2 | Accessibility gaps: input/date controls lack labels, icon buttons lack accessible names, filter active state lacks ARIA. | Marin, Maomao, Guts | Partially fixed | Added labels/ARIA for task input, due date/time, delete, clear due, task checkbox, and filter active state; full audit still needed. |
| P2 | Due-date tone may conflict with gentle UX: explicit `Overdue` badges and completed tasks can still show due labels. | Marin, Maomao | Open decision | Decide whether V1 is an actionable due-date tracker or soft-awareness tracker. |
| P2 | Existing tasks cannot be edited or have due dates/times changed. | Marin | Open | Track edit/update flow if due date/time becomes a core feature. |
| P2 | Data loss risks are silent: localStorage parse/save failures are swallowed; no export/import/undo. | Frieren | Open | Add visible persistence error state; add export/import; consider undo/soft delete. |
| P3 | PWA icon declarations do not match actual image dimensions; all checked JPGs appear to be 1024x1024. | Urahara, Marin | Open | Generate true-size PNG/WebP icons and maskable assets. |
| P3 | Motion does not respect reduced-motion preferences. | Marin | Open | Add `prefers-reduced-motion` CSS overrides. |

## Follow-up backlog

### P0 / before claiming stable deploy

- [x] Fix local build gate.
- [x] Change GitHub Pages workflow to run the real build script.
- [x] Add `.gitignore` for `node_modules/`, `dist/`, `*.tsbuildinfo`, `.vite/`, `.idea/`.
- [ ] Remove tracked `node_modules` and IDE files from git in a dedicated cleanup change.

### P1 / reminders and due date/time

- [x] Add optional `dueTime` field.
- [x] Allow due date and due time to be null/present independently.
- [x] Add task-specific reminder checks for tasks with both due date and due time.
- [x] Keep end-of-day reminders.
- [x] Add independent settings toggles for task reminders and EOD reminders.
- [ ] Add automated/manual time simulation tests for task reminder firing.
- [ ] Move reminder notification logic out of `App.tsx` into a hook.
- [ ] Decide if reliable background reminders require Push API/backend support.

### P1 / product contract alignment

- [ ] Decide final V1 filter set:
  - Option A: keep code as-is: `All / Today / Upcoming`.
  - Option B: match Marin UX: `All / Due Today / Completed`.
  - Option C: expand to `All / Today / Upcoming / Completed`.
- [ ] Decide launch summary banner status: implement now vs formally defer.
- [ ] Decide due-date tone: explicit overdue badges vs softer awareness copy.
- [ ] Decide notification consent policy: settings-driven permission request vs explicit button only.

### P1 / engineering hardening

- [ ] Add namespaced/versioned localStorage keys and migration from legacy keys.
- [ ] Validate/canonicalize `dueDate` as `YYYY-MM-DD`.
- [ ] Validate/canonicalize `dueTime` as `HH:mm`.
- [ ] Centralize date/time helpers in a typed domain module.
- [ ] Add PWA generated asset precaching or Workbox/`vite-plugin-pwa`.
- [ ] Scope service-worker cache cleanup to this app’s cache prefix only.

### P2 / user confidence

- [x] Add accessible labels for task input, date input, task checkbox, clear-date/time, delete, and filter buttons.
- [x] Add `aria-pressed` to filter buttons.
- [ ] Add manual keyboard and screen-reader checks to release checklist.
- [ ] Add visible storage/save failure messaging.
- [ ] Add JSON export/import or backup instructions.
- [ ] Add undo or soft-delete for accidental task deletion.

### P3 / polish

- [ ] Generate actual 180/192/512/1024 icons and maskable-safe PWA assets.
- [ ] Add reduced-motion CSS fallback.
- [ ] Add standalone/install education component for iOS A2HS.
- [ ] Add task edit/due-date/time edit flow.

## Source-of-truth rules going forward

1. README describes only shipped behavior plus clearly labeled limitations.
2. `docs/DATA_MODEL.md` owns storage/date/time/migration contracts.
3. `docs/QA_CHECKLIST.md` owns release validation.
4. This tracker owns unresolved decisions and follow-up work.
5. Design docs may propose future behavior, but acceptance status must be reflected here before anyone claims completion.
