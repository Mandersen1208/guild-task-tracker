# QA and Release Checklist

_Last reviewed: 2026-07-13_

Use this checklist before claiming the app is healthy on GitHub Pages or before accepting a feature slice as complete.

## Automated gates

Run locally before handoff:

```bash
npm ci
npm run build
```

Expected result:

- TypeScript project build passes.
- Vite production bundle builds successfully.
- No generated `dist/` or `*.tsbuildinfo` files are committed unless intentionally tracked.

GitHub Pages workflow must also run `npm run build` rather than `npm exec vite build` directly.

## Manual smoke test matrix

### 1. First launch / empty state

- [ ] Clear localStorage.
- [ ] Visit local dev URL or Pages URL.
- [ ] App loads without console errors.
- [ ] Empty state appears.
- [ ] Header copy correctly describes daily task behavior.

### 2. Task creation

- [ ] Empty/whitespace task is rejected.
- [ ] Normal task can be added.
- [ ] Daily task can be added.
- [ ] Task with due date only can be added.
- [ ] Task with due time only can be added.
- [ ] Task with due date + due time can be added.
- [ ] Due date/time can be cleared before adding.
- [ ] New task input remains usable after add.

### 3. Completion and deletion

- [ ] Task can be marked complete.
- [ ] Task can be marked incomplete.
- [ ] Task can be deleted.
- [ ] Deletion behavior is understood as permanent until undo/soft-delete exists.

### 4. Persistence and migration

- [ ] Reload preserves tasks.
- [ ] Reload preserves completion state.
- [ ] Reload preserves due dates.
- [ ] Reload preserves due times.
- [ ] Reload preserves reminder settings.
- [ ] Legacy tasks without `isDaily` still load.
- [ ] Legacy tasks without `dueDate` still load.
- [ ] Legacy tasks without `dueTime` still load.
- [ ] Corrupted localStorage fails gracefully.
- [ ] Invalid due-date/time strings do not break rendering/filtering.

### 5. Filters and counts

Use one task in each category:

- [ ] No due date.
- [ ] Due time only.
- [ ] Yesterday.
- [ ] Today.
- [ ] Tomorrow.
- [ ] Future.
- [ ] Completed.

Verify the final accepted filter set. Current implementation is:

- [ ] `All` shows every task.
- [ ] `Today` shows incomplete tasks due today or overdue.
- [ ] `Upcoming` shows incomplete future-dated tasks.

If product changes to include `Completed`, update this checklist before release.

### 6. Daily reset

- [ ] Daily completed task resets when `lastResetDate` is yesterday and app loads.
- [ ] Non-daily completed task does not reset.
- [ ] App behavior across midnight is verified or documented as load/focus-dependent.
- [ ] Local-date behavior is verified near timezone boundaries.

### 7. Reminder settings and notifications

Current limitation: reminders only run while the app page/PWA is open or active.

Settings:

- [ ] Reminder settings panel opens/closes.
- [ ] Task due date + time reminder toggle persists after reload.
- [ ] End-of-day reminder toggle persists after reload.
- [ ] Browser permission status is understandable.
- [ ] Disabled task reminders do not fire.
- [ ] Disabled EOD reminders do not fire.

Task due date + time reminders:

- [ ] No notification for task with no due date/time.
- [ ] No notification for date-only task.
- [ ] No notification for time-only task.
- [ ] Notification fires once for incomplete task with due date + time when due.
- [ ] Notification does not fire for completed task.
- [ ] Notification does not duplicate after firing once for same task/date/time.
- [ ] Changing due date/time in storage or future edit flow allows a new reminder key.

End-of-day reminders:

- [ ] Notification permission `default`.
- [ ] Notification permission `granted`.
- [ ] Notification permission `denied`.
- [ ] Time before 19:00.
- [ ] Time from 19:00 to 20:59.
- [ ] Time at/after 21:00.
- [ ] Pending daily/due tasks exist.
- [ ] No pending daily/due tasks exist.
- [ ] `lastEodNotified` prevents duplicate notification in same local day.

### 8. GitHub Pages / PWA smoke

Use the live URL:

```text
https://Mandersen1208.github.io/guild-task-tracker/
```

Verify:

- [ ] `index.html` returns 200.
- [ ] Hashed JS asset returns 200.
- [ ] Hashed CSS asset returns 200.
- [ ] `manifest.json` returns 200.
- [ ] Icons return 200.
- [ ] `service-worker.js` returns 200.
- [ ] Manifest `start_url` is `/guild-task-tracker/`.
- [ ] Manifest `scope` is `/guild-task-tracker/`.
- [ ] Service worker scope is `/guild-task-tracker/`.
- [ ] Reload once online, then go offline and reload.
- [ ] Installed PWA launches from home screen.
- [ ] iOS A2HS title/icon look correct.

Known caveat: hashed assets are not explicitly precached yet, so first-visit offline reliability is not guaranteed.

### 9. Accessibility and mobile checks

- [ ] Keyboard tab order reaches input, date, time, add, settings, filters, task checkboxes, and delete controls.
- [ ] Screen reader announces text input purpose.
- [ ] Screen reader announces due-date input purpose.
- [ ] Screen reader announces due-time input purpose.
- [ ] Screen reader announces task checkbox with task text.
- [ ] Delete button has a clear accessible name.
- [ ] Clear-date/time button has a clear accessible name.
- [ ] Filter buttons communicate active state.
- [ ] Touch targets are at least 44px where practical.
- [ ] Layout works at 320px, 375px, 390px, and 440px widths.
- [ ] Long task text wraps without crowding badges/actions.
- [ ] Reduced-motion preference is respected once implemented.

## Release sign-off template

```text
Build: pass/fail
Pages smoke: pass/fail
PWA smoke: pass/fail/limited
Storage migration: pass/fail/not applicable
Accessibility spot check: pass/fail/limited
Known limitations accepted:
- ...
Release decision: ship / hold
Owner:
Date:
```
