# Tempo — Roadmap

A small personal task-board web app: one-thing-at-a-time focus, time estimates,
and a private GitHub-synced backlog. This is the running list of planned and
possible improvements. Pull the highest-value item here before starting anything new.

## Planned

1. **Active-task reminders (system notifications).**
   Optional OS-level notification while a focus session is running, to resurface the
   current task even when the tab is hidden. Requires notification permission.
   v9 ships an in-app, tab-title-only version of this (off by default); a true
   system-notification version is the next step up. Small–moderate.

2. **Auto-pause timer on tab blur.**
   Pause the focus clock when the tab loses focus so background time isn't counted.
   Held: pausing immediately undercounts when referencing material in another app —
   which is a normal heads-down workflow here — so this stays parked until there's a
   reliable "actually away" vs. "looking something up" signal.

## Decisions

- **Categories are a filter (Work / Fun / Growth)** — not separate boards, and not
  free-form tags. Status/colour stays orthogonal to category.
- **Multi-device sync without GitHub** would require a hosted backend. Out of scope
  unless the app outgrows personal use.
- **Arbitrary re-parenting** of tasks: not planned.

## Backlog hygiene

- Keep the active "next" list capped (~5).
- Periodic prune: drop dead items, defer not-now ones, re-pick the short list.

## Shipped

- **v6** — Work / Fun / Growth category filter.
- **v6.1** — Sync-token expiry awareness (failure banner + expiry countdown).
- **v6.2** — Tab-title timer (active task + elapsed in the browser tab) and a
  pop-out Picture-in-Picture mini timer that floats over other apps (Chromium).
- **v6.3–v6.6** — Per-task focus action; completion chime with work-safe mute;
  visual countdown disk in the focus card and pop-out; adjustable check-ins.
- **v7** — Local mode: first-run chooser, in-browser storage, autosave-to-file
  (point it at a cloud-drive folder), backup download/restore, starter board
  generator, restore path from the welcome screen.
- **v8** — Focus shows exactly one task: progress bar, pending steps
  only (done ones clear), obvious Start button. All view grouped by life area;
  filter chips removed (color = status only). New-day "still the ONE?" ritual.
  Open-loops nudge when too much is in progress.
- **v9 (final cut)** — *Protect the clock, stop losing things.*
  - **Clock continuity across sittings** — a task accumulates total focused time
    across reopens instead of resetting, so estimate-accuracy stays honest.
  - **Park-in-focus** — capture a stray thought to the parking lot mid-session
    without stopping the clock or leaving the task.
  - **Guided backlog review** — a one-sweep pass over items untouched for 2+ weeks:
    keep / demote / park / delete each, with a "next" list cap reminder. Surfaces
    proactively when items go stale; also in the menu. (Staleness clock starts at
    v9 adoption — it won't retroactively flag the whole backlog.)
  - **Blocked / Waiting-on status** — a real bucket for can't-act-yet work.
  - **Lighter All view** — empty resume prompts hidden until a card is expanded;
    completed sub-tasks collapse behind a "N done · show" toggle.
  - **Opt-in drift nudge** — off by default; if a focus session sits idle with the
    clock stopped, the browser-tab title gives a quiet nudge.
  - **Estimate framing** — calibration is now a neutral planning factor, not an
    "% OVER" grade; the focus disk fills toward the target instead of draining,
    and passing the estimate reads calm, not alarming.

## Status: FROZEN

v10 is the stable build. The board's job now is to be used, not improved.
New ideas land here as one-liners and wait for a scheduled review.

## Shipped (most recent first)

- **v10 (course-correction)** — *Unbreak the focus model.* v8/v9 had wrongly assumed
  one global "in-progress" task and a clock that raced the project estimate. Reverted
  to: a **Work / Fun / Growth filter** (multiple things in progress at once, switch lanes
  with one tap, no status resets); a **Now** view that simply lists your in-progress
  projects in the active lane; and a **check-in / time-timer** focus clock (cycles per
  interval, default 25 min) decoupled from estimates. Added **rename-in-place** and
  **promote-sub-task-to-project** (one level of nesting going forward). Removed the
  forced "the one" pin + daily ritual, the on-ramp note, and the drift nudge.
