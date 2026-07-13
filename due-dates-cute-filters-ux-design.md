# Kawaii Daily — Due Dates + Cute Filters UX Design (Phase Two)

**Role:** Marin (UX Guardian)  
**Date:** 2026-07-13  
**Status:** Design Complete — Ready for Guild Review  
**Phase:** Feature Slice (Due Dates + Filters)  
**Audience:** Kisuke (Visual Polish), Guts (Implementation), Roy (Coordination)

---

## Mission Alignment
Phase 1 (core daily reset + PWA guidance) is approved. Now we layer in **due dates** and **cute filters** while preserving the app's soul: a soft, caring companion that makes tasks feel like gentle petals rather than obligations. Everything must stay kawaii, non-pressuring, and emotionally safe.

## Core Kawaii UX Principles (Reinforced)
- **Softness first**: Rounded corners (≥20px), pastel palette (#FFF8F5 cream, #F8E8E8 blush, #E8E0F0 lavender, #D4E8D4 sage), subtle shadows, never bold or urgent.
- **Delight over duty**: Emojis are emotional anchors (🌸 for today, ✨ for completed). Language is affectionate ("blooming today", "sparkled").
- **Optional everything**: Due dates are loving suggestions, never required. Users can ignore them completely.
- **Mobile-thumb friendly**: 48px+ tap targets, generous spacing.
- **Emotional safety**: No guilt language. Overdue is "a gentle pause" or simply shown softly.

---

## 1. Due Date / Time Picker Design

### Philosophy
Due dates should feel like choosing a cozy time to water a plant — intentional, never stressful. The picker is an invitation, not a deadline setter.

### Entry Points
1. **TaskInput component** (primary):
   - After the text input, a soft secondary pill button: `📅 Add a due date` (outline style, blush border, cream bg).
   - Tapping it opens the picker **before** or **after** adding the task (flow: type → optional date → add).
   - If date chosen, task is created with dueDate attached.

2. **TaskItem component** (for existing tasks):
   - Small, elegant due-date badge or icon button next to the task text.
   - Empty state: `🌸 set date` (tiny, soft).
   - When set: `Due Jul 13 🌸` (formatted nicely, color-coded softly: today=blush, future=lavender, past=very soft rose).
   - Tapping the badge re-opens the picker for editing. Long-press or dedicated edit icon for clarity.

### Picker Modal (Kawaii Modal Pattern)
- **Container**: Centered on screen, `max-w-[340px]`, `rounded-[28px]`, `bg-[#FFF8F5]`, `shadow-[0_15px_40px_rgba(0,0,0,0.06)]`, soft border `#F5EDE6`.
- **Close**: Tiny `×` in top-right, very gentle opacity.
- **Header**: 
  - "When feels right? 🌸"
  - Subtext: "Pick a cozy time — or skip for now"
- **Body Sections** (stacked, generous padding):

  **A. Quick Presets** (most important — horizontal scrollable or 2x2 grid of soft pills)
  - `Today 🌸`
  - `Tomorrow 🌷`
  - `This Weekend 🦋`
  - `Next Week 🌼`
  - `Someday (no date)` — clears any date

  Each pill: rounded-full, blush/lavender bg, active state with inner glow + scale(1.03), tap feedback.

  **B. Custom Calendar**
  - Wrapped native `<input type="date">` or lightweight custom calendar if we want extra kawaii.
  - Styled container: soft focus ring `#F8C8D8`, calendar icon prefix.
  - "Today" auto-highlights in the date input.

  **C. Gentle Time (optional, appears after date selected)**
  - Label: "At what time? ☀️"
  - Options as cute segmented control or time input:
    - Morning (9am) ☀️
    - Midday (12pm) 🌞
    - Afternoon (3pm) 🌼
    - Evening (6pm) 🌙
    - Custom time (native time input)
  - Or simply a `<input type="time">` with soft styling.

- **Footer**:
  - Primary: `Save this gently` (blush pink button, rounded-2xl, soft shadow)
  - Secondary: `Skip for now` (text link, no bg)

- **Micro-interactions**:
  - Modal enters with gentle fade + scale from 0.96
  - Save triggers tiny sakura petal animation (CSS confetti or emoji burst that fades)
  - Haptic feedback on mobile if possible (navigator.vibrate)

### Data Model Extension
```ts
interface Task {
  id: string;
  text: string;
  completed: boolean;
  isDaily?: boolean;
  dueDate?: string; // ISO 8601 e.g. "2026-07-14T15:00:00"
}
```

- Use `new Date().toISOString()` on save.
- Comparison helpers: `isDueToday(dueDate)`, `isOverdue(dueDate)` — pure functions, no side effects.

### Display in TaskItem
- Due date badge appears below or inline with text.
- Today: blush bg + 🌸
- Future: lavender bg
- Past (but not completed): soft rose + gentle note "a quiet pause"
- Completed tasks hide the due badge or show "sparkled on [date] ✨"

---

## 2. Three Cute Filters

### New Filter Set (replaces current All / Active / Done)
Exactly as specified:

- **All** — shows every task (current default behavior)
- **Due Today 🌸** — shows only pending tasks where `isDueToday(dueDate) && !completed`
- **Completed ✨** — shows only completed tasks (same as before)

### Visual & Interaction Design
- **Container**: Same flex gap-2 as current, but enhanced.
- **Each pill** (`filter-pill` class, already exists — we evolve it):
  - Base: `bg-white text-[#8C6F5C]`, rounded-2xl or full, py-3, text-sm, flex-1
  - Hover: `hover:bg-[#FFF8F5] hover:scale-[1.015]`
  - Active: `active` state → `bg-[#F8E8E8] text-[#C98B8B] shadow-soft` + tiny underline or dot accent in blush
  - Count in parentheses, slightly smaller, always visible.
- **Due Today pill** gets the 🌸 emoji baked into label permanently.
- **Completed pill** gets the ✨ emoji.
- **All pill**: keep clean or add 📋 emoji for consistency.

### Behavior
- Filter state persisted in localStorage (already done for old filters — extend).
- When "Due Today 🌸" is active:
  - List header can softly say "Today's gentle blooms 🌸" (optional, above TaskList)
  - Counts update live as tasks are completed or dates change.
- Smooth transition: list fades slightly on filter change (200ms).

### Logic (for Guts)
```ts
const filteredTasks = tasks.filter(task => {
  if (filter === 'due-today') {
    return isDueToday(task.dueDate) && !task.completed;
  }
  if (filter === 'completed') return task.completed;
  return true; // all
});
```

Add live counts:
- Due Today count = pending due today
- Completed count = all completed

---

## 3. Gentle Launch Summary Banner

### Purpose
A warm "good morning" hug when the user opens the app. It orients them without pressure and celebrates small wins. Feels like a caring note from a friend.

### Design Specs
- **Placement**: Directly under the main header (below clock + "my tasks ✨"), above TaskInput. Full-bleed within the kawaii-container.
- **Visual Style**:
  - `rounded-[22px]`, soft gradient `from-[#FFF0F5] to-[#F5F0FF]` (blush → lavender)
  - Subtle border `#F5E6EB`
  - Inner padding generous (p-5)
  - Left icon area: large 🌸 or hand-drawn-style flower (emoji or tiny SVG)
  - Text area (flex-1):
    - Greeting line: "Good morning, love 🌸" (or time-aware: "Afternoon sparkle ✨")
    - Summary line: 
      - If due today > 0: "You have **{n}** tasks blooming today. One petal at a time."
      - If due today === 0: "A peaceful day ahead. Rest is productive too 💤"
      - Always include completed sparkle count if >0: "✨ {m} already completed"
  - Optional tiny progress hint: soft horizontal bar showing % of today's tasks done (very gentle, low saturation).
- **Dismissal**:
  - Soft `×` in corner.
  - Dismissal stored with today's date key in localStorage → reappears tomorrow.
  - If no due tasks and user has dismissed before, maybe don't show at all that day.

### Behavior & Variants
- Appears after `resetDailyTasks()` completes.
- Auto-calculates on mount using current date.
- **Special states**:
  - Zero tasks at all: "Your garden is ready for new seeds 🌱"
  - Many due today: "You've got this — gentle steps only 🌸"
- Animation: fade-in + gentle upward slide (prefers-reduced-motion safe).
- Never blocks interaction. Purely informational and loving.

### Technical Notes
- Compute `dueTodayCount`, `completedTodayCount` (filter completed + due today or just completed count).
- Keep it lightweight — no new deps.

---

## Overall Integration & Polish

### Updated Component Responsibilities
- **App.tsx**: Manage new filter type, render banner, pass filter to TaskList.
- **TaskInput.tsx**: Add due date entry point + pass dueDate to addTask.
- **TaskItem.tsx**: Render due badge, open picker on tap, show due info.
- **New**: `DueDatePicker.tsx` (modal component, reusable).
- **useTasks.ts**: Handle dueDate in add/edit, persistence.
- **types.ts**: Extend Task interface.
- **Clock.tsx**: Maybe expose current date for "isToday" checks (or keep simple Date utils).

### Accessibility & Inclusive Design
- All interactive elements have clear labels.
- Date/time inputs inherit native a11y.
- High contrast text on pastels.
- Keyboard accessible (Escape closes modal, arrows in presets if custom).

### Animation & Motion
- Respect `prefers-reduced-motion`.
- All motion is soft, spring-like, never bouncy or startling.

### Success Criteria (for QA & Review)
- [ ] Picker feels delightful and optional on first try.
- [ ] Filters switch instantly with correct counts and cute labels.
- [ ] Launch banner appears gently, feels caring, and respects dismissal.
- [ ] No task feels "punished" for missing a date.
- [ ] Works beautifully offline (PWA).
- [ ] Mobile Safari / iOS install experience remains pristine.

---

## Visual Reference Palette (for Kisuke)
- Primary blush: #F8E8E8 / #E8B8C8
- Accent lavender: #E8E0F0
- Cream bg: #FFF8F5
- Text warm: #8C6F5C
- Soft shadow: rgba(140, 111, 92, 0.08)

---

This design keeps the app a true gentle daily ritual. Due dates support focus without creating anxiety. The filters and banner make the experience feel alive and cared for.

Ready for implementation review. Let's make it bloom. 🌸

— Marin

---

**Related Files**
- UX-PWA-GUIDANCE.md (Phase 1)
- guild-task-tracker/src/App.tsx (current filter implementation)
- PHASE_ONE_MVP_CRITERIA.md (context)