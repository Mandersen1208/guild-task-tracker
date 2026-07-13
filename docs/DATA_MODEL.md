# Data Model and Persistence Contract

_Last reviewed: 2026-07-13_

This app is local-first. It currently stores task data and reminder settings in browser `localStorage` only. There is no server sync, cross-device sync, account, or cloud backup.

## Current shipped model

```ts
interface Task {
  id: string;
  text: string;
  completed: boolean;
  isDaily?: boolean;
  dueDate?: string; // YYYY-MM-DD local date; optional
  dueTime?: string; // HH:mm local time; optional
}
```

`dueDate` and `dueTime` are both optional and independent at the data-model level:

- no due date + no due time is valid
- due date only is valid
- due time only is valid as display metadata
- due date + due time is valid and enables exact task reminder checks

Task reminder notifications require both `dueDate` and `dueTime` because browsers need a concrete local date/time target.

## Current settings model

```ts
interface ReminderSettings {
  taskRemindersEnabled: boolean;
  eodRemindersEnabled: boolean;
}
```

Default:

```json
{
  "taskRemindersEnabled": true,
  "eodRemindersEnabled": true
}
```

Settings are stored in localStorage under `reminderSettings`.

## Current storage behavior

- Tasks are loaded from localStorage on app mount.
- Invalid task-like records are filtered out during load.
- Missing `isDaily` values are migrated to `false` in memory.
- Missing or non-string `dueDate` values are treated as `undefined`.
- Missing or invalid `dueTime` values are treated as `undefined`.
- Save failures are currently swallowed; the UI may continue working even if persistence failed.
- Corrupted JSON currently results in an empty in-memory task list for that session.
- Task reminder notification receipts are stored by task id + due date/time key so each due date/time combination notifies once.

## Current known limitations

- Storage keys are not yet namespaced/versioned.
- No schema version is persisted.
- No backup/quarantine file is created before migration/filtering.
- No export/import exists.
- Deletion is immediate; there is no undo or soft-delete.
- Daily reset writes task state and reset date separately, so partial persistence failure is possible.
- GitHub Pages localStorage is origin-scoped; generic keys can collide with other apps on the same owner domain.
- Reminder notification receipts are best-effort browser-local state.

## V1 decisions to lock

| Decision | Current recommendation | Reason |
| --- | --- | --- |
| Due-date format | `YYYY-MM-DD` local date only | Matches native `<input type="date">`, current filtering, and user-visible daily task behavior. |
| Due-time format | `HH:mm` local time only | Matches native `<input type="time">` and browser local-time reminders. |
| Time zones | Local browser date/time | This is a personal task tracker, not a server-scheduled calendar. |
| Task reminder eligibility | Requires both due date and due time | Avoids guessing when date-only tasks should notify. |
| Persistence | Browser-local only | Simple MVP and no account/server dependency. |
| Sync | Out of scope | Avoid false promise of cross-device consistency. |
| Backup/export | Follow-up | Needed before users rely on long-term data. |

## Proposed namespaced storage contract

Future hardening should migrate from generic keys to namespaced keys or a single envelope.

### Option A: namespaced keys

```text
guild-task-tracker:v1:tasks
guild-task-tracker:v1:filter
guild-task-tracker:v1:reminderSettings
guild-task-tracker:v1:lastResetDate
guild-task-tracker:v1:lastEodNotified
guild-task-tracker:v1:taskReminderNotified
```

### Option B: single envelope

```json
{
  "schemaVersion": 1,
  "tasks": [
    {
      "id": "uuid",
      "text": "Follow up with Maomao",
      "completed": false,
      "isDaily": false,
      "dueDate": "2026-07-14",
      "dueTime": "14:30"
    }
  ],
  "settings": {
    "filter": "today",
    "taskRemindersEnabled": true,
    "eodRemindersEnabled": true,
    "lastResetDate": "2026-07-13",
    "lastEodNotified": "2026-07-13",
    "taskReminderNotified": {
      "uuid": "2026-07-14T14:30"
    }
  },
  "migratedAt": "2026-07-13T20:30:00.000Z"
}
```

The guild recommendation is **Option A for minimal migration** or **Option B if export/import is implemented at the same time**.

## Migration policy

Before changing the stored shape:

1. Read legacy keys without deleting them.
2. Validate records.
3. Normalize `dueDate` to `YYYY-MM-DD` only.
4. Normalize `dueTime` to `HH:mm` only.
5. Preserve invalid records in a backup/quarantine key if possible.
6. Write the new schema.
7. Verify the new schema can be parsed.
8. Only then mark migration complete.
9. Surface a user-visible warning if data was partially ignored or storage failed.

## Date/time validation rules

A valid V1 due date must match:

```regex
^\d{4}-\d{2}-\d{2}$
```

A valid V1 due time must match:

```regex
^\d{2}:\d{2}$
```

Additional validation should ensure the strings represent real local calendar and clock values. ISO datetime strings like `2026-07-14T15:00:00Z` should be normalized or rejected during migration; they should not be used directly in filters.

## Data safety backlog

- [ ] Namespace storage keys.
- [ ] Add schema version.
- [ ] Add visible persistence error state.
- [ ] Add export/import JSON.
- [ ] Add migration tests for legacy records, invalid due dates/times, and corrupted JSON.
- [ ] Add undo/soft-delete for task deletion.
- [ ] Only mark daily reset complete after task persistence succeeds.
