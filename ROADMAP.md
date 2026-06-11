# Tempo — Roadmap

A small personal task-board web app: one-thing-at-a-time focus, time estimates,
and a private GitHub-synced backlog. This is the running list of planned and
possible improvements. Pull the highest-value item here before starting anything new.

## Planned

1. **Clock continuity across sessions.**
   A task worked across several sittings should accumulate total time rather than
   only the most recent sitting, so the time-estimate accuracy stats stay correct.
   Small change.

2. **Local-only mode + export / import.**
   Make GitHub sync optional so the app can run with no account on a single device
   (state persisted to `localStorage`). Add board export/import for backup and for
   moving between devices. Also closes a durability gap where unsynced edits are
   currently lost on refresh. Moderate.

3. **Active-task reminders.**
   Optional periodic notification while a focus session is running, to resurface the
   current task. Requires notification permission. Small–moderate.

4. **Auto-pause timer on tab blur.**
   Pause the focus clock when the tab loses focus so background time isn't counted.
   Open decision: pause immediately vs. after a short delay (immediate can undercount
   when referencing material in another tab).

5. **Review mode.**
   A guided pass over older items — keep / defer / remove — in one sweep. Polish;
   the manual habit works fine in the meantime.

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
- **v8 (final cut)** — Focus shows exactly one task: progress bar, pending steps
  only (done ones clear), obvious Start button. All view grouped by life area;
  filter chips removed (color = status only). New-day "still the ONE?" ritual.
  Open-loops nudge when too much is in progress.

## Status: FROZEN

v8 is the stable build. The board's job now is to be used, not improved.
New ideas land here as one-liners and wait for a scheduled review.
