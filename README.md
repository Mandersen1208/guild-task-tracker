# guild-task-tracker

Small responsive React task tracker with local browser persistence.

**Legitimate React application** — Vite + TypeScript + Tailwind.

Live site:

<https://Mandersen1208.github.io/guild-task-tracker/>

## Current shipped features

- Create tasks
- Mark tasks complete/incomplete
- Delete tasks
- Optional daily tasks
- Optional due date using `YYYY-MM-DD` local dates
- Optional due time using `HH:mm` local time
- Task-specific reminders when an incomplete task has **both** a due date and due time
- End-of-day wrap-up reminders from 7–9pm local time
- Reminder settings panel with independent toggles for:
  - task due date + time reminders
  - end-of-day wrap-up reminders
- Filter tasks by:
  - `All`
  - `Today` — incomplete tasks due today or overdue
  - `Upcoming` — incomplete future-dated tasks
- Persists tasks/settings in this browser/device via `localStorage`
- PWA metadata and service worker foundation

## Known limits

- Data is local to this browser/device; there is no account, sync, server backup, or cross-device persistence.
- Task reminders require both `dueDate` and `dueTime`; date-only tasks do not create exact-time notifications.
- Reminder notifications are best-effort while the app page/PWA is open or active. They are not guaranteed background scheduled notifications.
- Daily tasks currently reset when the app loads and detects a new local day, not via a guaranteed live midnight timer.
- First-visit offline behavior is limited because hashed build assets are not explicitly precached yet.
- Launch summary banner, task editing, due-date editing, and install education are tracked follow-ups, not shipped behavior.

## Guild delivery tracking

Coordinated by Roy with the guild lenses:

- **Shiroe** — Architecture and boundaries
- **Marin** — UX and accessibility
- **Guts** — Implementation
- **Maomao** — QA and release confidence
- **Frieren** — Persistence and data integrity
- **Kisuke Urahara** — Platform, PWA, and deployment

Current tracking docs:

- [`docs/GUILD_REVIEW_TRACKER.md`](docs/GUILD_REVIEW_TRACKER.md) — consolidated review findings, open decisions, and follow-up backlog
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — storage contract, localStorage risks, due-date/time format, reminder settings, and migration policy
- [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md) — local/build/manual/PWA/accessibility validation checklist
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — accepted decisions and unresolved product/engineering choices

## Development

```bash
git clone https://github.com/Mandersen1208/guild-task-tracker.git
cd guild-task-tracker
npm ci
npm run dev
```

Open <http://localhost:5173>.

## Build

```bash
npm run build
```

The build runs TypeScript project checks and then creates the Vite production bundle.

## Deploy

GitHub Pages deploys from `.github/workflows/deploy.yml` on pushes to `main`. The workflow must run the same project build gate as local development:

```bash
npm ci
npm run build
```

## Release smoke

Before claiming a release is healthy, use [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md), especially the GitHub Pages/PWA smoke checklist.
