# Repository Guidelines

## Project Structure & Module Organization
- Root docs: `README.md`, `specifications.md`, `PROGRESS.md`.
- App code in `app/` (Create React App + Tailwind):
  - `app/src/` React source; `app/src/components/` UI components.
  - `app/public/` static assets (e.g., `routines.json`, `sounds/`).
  - Config: `app/tailwind.config.js`, `app/postcss.config.js`.

## Build, Test, and Development Commands
- From `app/` directory:
  - `npm start`: Run dev server at `http://localhost:3000`.
  - `npm test`: Jest in watch mode with React Testing Library.
  - `npm run build`: Production build to `app/build/`.
- Install deps once: `cd app && npm install`.

## Coding Style & Naming Conventions
- Language: React (JS), functional components and hooks.
- Indentation: 2 spaces; prefer single quotes; trailing semicolons allowed by CRA ESLint.
- Linting: CRA ESLint presets (`react-app`, `react-app/jest`).
- Naming:
  - Components: PascalCase files and exports (e.g., `TimeIndicator.js`).
  - Functions/variables: camelCase; constants UPPER_SNAKE_CASE.
  - Tests: `*.test.js` colocated in `src/`.
- Styling: Tailwind utility classes in JSX; keep component CSS minimal (`app/src/*.css`).

## Testing Guidelines
- Frameworks: Jest + React Testing Library (`@testing-library/*`).
- Add tests next to code (e.g., `components/Timeline.test.js`).
- Write interaction-focused tests (queries by role/label, not implementation details).
- Run all tests locally with `npm test`; ensure no failing snapshots.

## Commit & Pull Request Guidelines
- Commits: imperative, concise subject (e.g., "Add Timeline progress bar").
- Scope changes logically; avoid unrelated diffs and generated files.
- PRs should include:
  - Summary, rationale, and scope.
  - Linked issue (if applicable).
  - Screenshots or short GIFs for UI changes.
  - Test notes: what was tested and how to reproduce.

## Security & Configuration Tips
- No secrets required; data persists in `localStorage` only.
- Keep large media in `app/public/`; do not commit build artifacts.
- Tailwind: add utilities/components in `tailwind.config.js` if extending design.

