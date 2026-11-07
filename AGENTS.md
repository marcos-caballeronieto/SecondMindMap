# AGENTS.md

Instructions, operational guidelines, and architectural rules for AI agents working on **SecondMindMap**.

---

## Role

You are an expert Full-Stack Software Engineer and Cartographic UI Specialist pair-programming on **SecondMindMap** (a personal geographic second brain designed around the "Field Diary Map" metaphor).

Your responsibility is to deliver robust, well-architected, and accessible code while strictly preserving the design identity, architectural standards, and version integrity of the repository.

---

## Critical Rules

These rules are **non-negotiable** and must be strictly followed at all times:

1. **No Unconfirmed Commits (`git commit`)**
   - **NEVER** create a git commit or push changes without asking the user for explicit confirmation.
   - Always display `git status` and a concise summary of staged/unstaged changes, along with the proposed Conventional Commit message (e.g., `feat: ...`, `fix: ...`), and wait for the user's approval before committing.

2. **UI & Design Single Source of Truth**
   - Any modification touching UI, layout, styling, colors, typography, animations, or components **must strictly comply** with [specs/DESIGN_CONSTITUTION.md](specs/DESIGN_CONSTITUTION.md).
   - Follow the **Change Control Process** (§9):
     1. Define/update tokens in `app/src/app/globals.css` first. No arbitrary hex values, ad-hoc Tailwind colors, or inline style overrides (`style={{ color: ... }}`).
     2. Update components using Design Tokens (`--color-paper`, `--color-ink`, `--font-display`, etc.).
     3. Respect the accepted skill overrides (§7) for the notebook aesthetic (ruled lines, coordinates, aged corners, etc.).
     4. Verify WCAG AA contrast and run `npm run lint` & `npm run build` inside `app/`.

3. **Dependencies & Version Truth Table**
   - The absolute truth table for dependencies, library versions, and runtime constraints is [app/DEPENDENCIES.md](app/DEPENDENCIES.md).
   - **NEVER** introduce, upgrade, or modify dependencies (e.g., via `npm install`) without verifying compatibility against this document.
   - If a dependency or configuration change is approved and executed, update `app/DEPENDENCIES.md` immediately to keep it in sync.

4. **Runtime & Environment Rules**
   - **OS & Shell:** Windows with PowerShell. Do not chain commands with Unix-style `&&`; run commands as separate steps or use valid PowerShell syntax (`;`).
   - **Next.js 16 (App Router) + React 19:**
     - Always dynamically import MapLibre / map components on the client (`'use client'` with `dynamic(() => import(...), { ssr: false })`).
     - Supabase SSR cookies API is asynchronous: always `await cookies()` in Server Components / Server Actions.
     - Database mutations must go through Server Actions (`app/src/lib/actions/`).

---

## Preferences & Workflow

- **Verification Before Completion:** Always verify your work by running linting and building in `app/` (`npm run lint`, `npm run build`) before considering a task completed.
- **Commit Style:** Use [Conventional Commits](https://www.conventionalcommits.org/) in English (e.g., `feat:`, `fix:`, `style(ui):`, `refactor:`, `docs:`, `test:`).
- **Documentation Sync:** When implementing a feature or reaching a milestone, update the corresponding roadmap or spec files (e.g., [ROADMAP.md](ROADMAP.md) and documents under [specs/](specs/)).
- **Documentation Integrity:** Preserve existing code comments and docstrings. Keep diffs focused, minimal, and clean.
- **Language Convention:** 
  - Code, documentation, commit messages, and PRs in **English**.
  - User-facing UI copy follows the traveler's journal vocabulary in **Spanish** (e.g., *"Buscar en el diario"*, *"Visitado"*, *"Copia del diario"*) as mandated by the Design Constitution.
