# Guts Implementation Plan - Phase 1 Core (Approved)

**Date:** 2026-07-13
**Role:** Guts (Implementation)
**Phase:** 1 Core Functionality
**Status:** Plan Ready → Executing

## Objectives
Implement the four core items for the Kawaii Daily task tracker:

1. Add due date support in the task model and UI.
2. Build the three filters.
3. Implement the launch summary banner.
4. Wire up the daily end-of-day notification trigger.

## Detailed Plan

### 1. Due Date Support
- **Model (types.ts):** Extend Task interface with optional `dueDate?: string;` (stored as 'YYYY-MM-DD').
- **Persistence (useTasks.ts):** 
  - Update validation/migration to include dueDate (preserve if present, optional).
  - Update `addTask` signature to accept optional dueDate param: `addTask(text: string, isDaily?: boolean, dueDate?: string)`.
  - Pass through in creation.
- **Input UI (TaskInput.tsx):** Add a compact date picker (`<input type="date">`) next to or below the daily checkbox. Default to empty (no due date). Allow clearing.
- **Display UI (TaskItem.tsx):** 
  - Show due date badge with smart labels: "Today", "Tomorrow", "Overdue", or formatted date (e.g. "Jul 20").
  - Color code: overdue (rose/red), today (accent pink), future (muted).
  - Only render if dueDate present.

### 2. The Three Filters
- **Filter Types:** Change from current All/Active/Completed to three due-date-centric filters for Phase 1 relevance:
  - `all` — Everything (default)
  - `today` — Tasks due today or overdue (actionable now)
  - `upcoming` — Tasks with future due dates (non-completed)
- **Rationale:** Due dates are the new core feature; filters must highlight time-sensitive work. Completed can still be viewed via "all" + visual distinction. Counts update dynamically.
- **Implementation (App.tsx):**
  - Update Filter type and state.
  - New filtering logic using dueDate + current date.
  - Update the three pill buttons with appropriate labels and counts (e.g. Today (n), Upcoming (n)).
  - Persist filter choice.
- **Helpers:** Add utility functions for `isOverdue(task)`, `isDueToday(task)`, `getDueLabel(task)` (can live in types or a utils, but keep simple in App for MVP).

### 3. Launch Summary Banner
- **Location:** Top of the kawaii-container, above the header/clock area. Gentle, non-intrusive pastel banner.
- **Content:** Dynamic summary e.g.
  - "🌸 Good [morning/afternoon]! 4 tasks need attention today • 1 overdue"
  - Or "You have 2 daily tasks left • Review before midnight"
- **Behavior:**
  - Shown on every launch (or once per calendar day).
  - Dismissible with × (stores dismissed date in localStorage).
  - Calculates from tasks + due dates + isDaily.
  - Uses time-of-day greeting.
- **No persistence of banner state beyond daily dismiss to keep it fresh.**

### 4. Daily End-of-Day Notification Trigger
- **Trigger:** Browser Notification API (request permission on first meaningful interaction, e.g. after adding 1st task or on load if supported).
- **Timing:** Check every minute (or on visibility/focus) between 19:00–21:00. If not yet triggered today and user has pending tasks, fire notification:
  - Title: "Kawaii Daily Wrap-up ✨"
  - Body: "Time to review your day. You have X tasks left. Great work today!"
- **State:** Track `lastEodNotified` (YYYY-MM-DD) in localStorage.
- **Graceful:** Silent fail if permission denied or not supported. Provide a manual "Enable reminders" toggle in future if needed.
- **Integration:** Add in App.tsx useEffect or a small hook, but keep in App for now.

## Files to Modify
- src/types.ts
- src/hooks/useTasks.ts
- src/components/TaskInput.tsx
- src/components/TaskItem.tsx
- src/App.tsx
- (optional) src/index.css for any new badge/banner styles

## Acceptance Criteria (from Phase 1)
- Due dates persist, display correctly, affect filters.
- Three filters work and show accurate counts.
- Banner appears with correct summary and can be dismissed.
- EOD notification requests permission and fires at appropriate time (testable via time manipulation or manual trigger in dev).
- No breaking changes to existing daily reset / isDaily.
- Mobile/PWA friendly (date picker native on iOS).

## Risks & Mitigations
- Date formatting across timezones: Use local date only (toISOString().split('T')[0] or Intl for display).
- Notification permission UX: Ask only after user has engaged (not on first load).
- Over-filtering: "all" always available as escape hatch.

## Next After Plan Approval
Execute edits using precise patches. Test in browser. Update README if scope changes.

**Plan Status: READY** 
Ready to begin implementation.