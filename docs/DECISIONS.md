# Decisions

_Last reviewed: 2026-07-13_

This file records current decisions and open product/engineering choices so the guild can track intent without rereading every design document.

## Accepted current behavior

### DEC-001: GitHub Pages base path

- **Decision:** The app is deployed under `/guild-task-tracker/`.
- **Current implementation:** `vite.config.ts` sets `base: '/guild-task-tracker/'`; manifest `start_url` and `scope` also use `/guild-task-tracker/`.
- **Risk:** The path is duplicated in multiple places.
- **Follow-up:** Centralize or generate PWA paths from one config.

### DEC-002: V1 due dates are local dates

- **Decision:** V1 due dates use optional `YYYY-MM-DD` local date strings.
- **Reason:** The UI uses native `<input type="date">`; users are managing daily personal tasks, not exact calendar time zones.
- **Rejected for V1:** ISO datetime due dates as the stored source of truth.
- **Follow-up:** Add validation and migration so legacy/invalid strings cannot silently misclassify tasks.

### DEC-003: V1 due times are local times

- **Decision:** V1 due times use optional `HH:mm` local time strings.
- **Reason:** The UI uses native `<input type="time">`; task reminders should fire against the user's local browser clock.
- **Relationship to due date:** `dueDate` and `dueTime` are both optional. Task reminder notifications require both.
- **Follow-up:** Add validation and migration for invalid time strings.

### DEC-004: Persistence is local-only

- **Decision:** Tasks and reminder settings live in browser localStorage for now.
- **Reason:** Simple MVP with no backend/account dependency.
- **Limit:** No cross-device sync or cloud backup.
- **Follow-up:** Namespace keys, add schema version, and add export/import before relying on long-term storage.

### DEC-005: End-of-day reminders stay

- **Decision:** Keep the existing 7–9pm end-of-day wrap-up reminder behavior.
- **New behavior:** EOD reminders can be enabled/disabled in Reminder settings.
- **Limit:** Current reminders are best-effort while the app page/PWA is open and active.
- **Follow-up:** Update UX copy and docs so users are not promised reliable background scheduling.

### DEC-006: Task-specific reminders are enabled by due date + time

- **Decision:** Add task-specific reminders when an incomplete task has both due date and due time.
- **New behavior:** Task reminders can be enabled/disabled independently from EOD reminders.
- **Notification receipt:** A task notifies once per `task.id + dueDate + dueTime` combination.
- **Limit:** Best-effort in-app polling; not a true background scheduler.

### DEC-007: CI must run the project build script

- **Decision:** GitHub Pages CI must run `npm run build`.
- **Reason:** The project build script includes TypeScript checks; `vite build` alone can publish type-broken code.
- **Current implementation:** `.github/workflows/deploy.yml` uses `npm ci` and `npm run build`.

## Open decisions

### OPEN-001: Final V1 filter model

Current code ships:

- `All`
- `Today`
- `Upcoming`

Prior docs/specs also mentioned:

- `All / Active / Completed`
- `All / Due Today / Completed`

Options:

1. Keep current `All / Today / Upcoming`.
2. Switch to Marin’s `All / Due Today / Completed`.
3. Expand to `All / Today / Upcoming / Completed`.

**Recommendation:** Decide before adding more task states or tests.

### OPEN-002: Launch summary banner

Docs described a dismissible launch/today summary banner, but the app currently does not render one.

Options:

1. Implement it and restore acceptance criteria.
2. Explicitly defer it and remove it from “done” claims.

**Current tracker status:** Deferred until product decision.

### OPEN-003: Overdue tone

The app currently shows an explicit `Overdue` badge. UX guidance asks for gentle, low-pressure awareness.

Options:

1. Keep explicit overdue state for utility.
2. Rename to softer copy.
3. Hide task-level overdue badges and surface a softer summary.

### OPEN-004: Reminder permission timing

The app now exposes explicit reminder settings and a manual browser permission button inside settings. Enabling either reminder toggle can also request permission if browser permission is still default.

Options:

1. Keep settings-driven permission request.
2. Require only the explicit “Allow browser notifications” button.
3. Gate browser permission behind first task with due date/time.

### OPEN-005: Repo cleanup scope

The repo currently tracks `node_modules` and IDE files. Cleanup will produce a large diff.

Options:

1. Dedicated cleanup PR/change: add `.gitignore`, remove tracked generated/vendor files.
2. Bundle cleanup with next implementation PR.

**Recommendation:** Dedicated cleanup so future reviews are readable.
