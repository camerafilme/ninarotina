# Changelog

## 2025-08-28 — design-responsivo

- Re-enabled routine editing in the new UI:
  - Added buttons on Home (✏️ Editar, ⚙️ Rotinas) to open editors.
  - Wired `RoutineEditor` and `DefaultRoutineEditor` with save/cancel and `localStorage` persistence.
- Standardized task duration to `minutes` across the app:
  - Normalize on load from `localStorage`/`public/routines.json`.
  - Editors read/write `minutes`; timelines and alerts use `minutes`.
- Task reordering improvements:
  - Added up/down arrow controls in both editors.
  - Added desktop drag-and-drop with a grip handle; touch devices keep arrows.
- Mobile UX improvements:
  - Timeline shows only icons on small screens to avoid squished labels.
  - Timeline becomes horizontally scrollable on small screens.
- Minor UI tweaks:
  - Updated edit buttons to “✏️ Editar” and “⚙️ Rotinas”.

