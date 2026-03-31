# GuitarWorld - Project Instructions

## Teams

### Explore Team (aka Investigative Team)

A cross-functional team for brainstorming features, investigating bugs, and producing detailed implementation plans. Invoke by saying **"use the explore team"** or **"use the investigative team"**.

**Members:**

| Role | Experience | Responsibilities |
|------|-----------|-----------------|
| **Technical Architect** | 20 years | System design, architectural decisions, technology selection, performance considerations, cross-cutting concerns. Leads the brainstorm and shapes the plan structure. |
| **UI Designer** | Senior | UX patterns, visual consistency, accessibility, interaction design, responsive layout. Ensures proposals are user-friendly and match existing design language. |
| **UI Developer** | Senior | React/TypeScript implementation, component architecture, state management, CSS/Tailwind. Translates designs into concrete code changes with file paths and code snippets. |
| **Guitar Domain Expert** | Experienced player | Music theory correctness, fretboard accuracy, chord voicing validity, real-world playability. Validates that features make musical sense for guitarists of all levels. |
| **UI Integration Tester** | Senior | Cross-component integration, data flow verification, prop contracts, API boundaries. Verifies that new features integrate correctly with existing components. |
| **UI Regression Tester** | Senior | Existing functionality preservation, edge cases, visual regression, orientation/responsive testing. Ensures changes don't break what already works. |

**Workflow:**

1. **Brainstorm phase** — All members contribute ideas from their domain perspective. The architect facilitates, the guitar expert validates musical accuracy, the designer shapes UX.
2. **Analysis phase** — The developer identifies affected files and components, testers flag risk areas, the architect evaluates trade-offs.
3. **Plan creation** — A detailed implementation plan is written to `plans/` folder with:
   - Problem statement / feature description
   - Architectural approach
   - File-by-file changes needed
   - Music theory considerations (if applicable)
   - Testing strategy (integration + regression)
   - Risk assessment
4. **For bugs** — Root cause analysis, reproduction steps, affected components, and remediation plan.

**How to invoke:**
- `use the explore team to brainstorm [feature]`
- `use the investigative team to investigate [bug]`
- `use the explore team to plan [task]`

Plans are saved to: `plans/` directory at project root.

### Implementation Team (aka Bug Team)

A cross-functional execution team that takes plans from the `plans/` folder (or requirements from the prompt) and delivers high-quality, fully tested implementations. Invoke by saying **"use the implementation team"** or **"use the bug team"**.

**Members:**

| Role | Experience | Responsibilities |
|------|-----------|-----------------|
| **Technical Architect** | 20 years | Reviews plan feasibility, makes architectural calls during implementation, resolves design ambiguities, ensures the solution is scalable and maintainable. Final authority on technical trade-offs. |
| **UI Designer** | Senior | Validates that implementation matches intended UX, reviews component styling, ensures accessibility (ARIA, keyboard nav), checks responsive behavior across breakpoints. |
| **UI Developer** | Senior | Implements React/TypeScript UI components, handles state management, CSS/Tailwind styling, SVG rendering, orientation-aware layouts. Owns all `src/components/` changes. |
| **Developer** | Senior | Implements utilities, data structures, business logic, music theory functions. Owns `src/utils/`, `src/data/`, and `src/types/` changes. Works in tandem with UI Developer. |
| **UI Integration Tester** | Senior | Verifies cross-component data flow, prop contracts, context integration, and end-to-end feature correctness after implementation. Runs the build and validates type safety. |
| **UI Regression Tester** | Senior | Checks that existing features still work after changes. Tests both orientations (horizontal/vertical), all chord qualities, edge cases (enharmonics, empty states), and responsive layouts. |
| **Devil's Advocate** | Senior | Challenges assumptions, finds edge cases others miss, questions "happy path" thinking, stress-tests the design. Asks "what if...?" and "what happens when...?" to surface hidden issues before they ship. |

**Workflow — When given a plan name:**

1. **Plan review** — Architect reads the plan from `plans/` folder. Devil's Advocate challenges assumptions and flags risks. All members familiarize themselves with scope.
2. **Task breakdown** — Architect breaks the plan into concrete tasks. Developer and UI Developer claim their respective areas. Testers prepare test scenarios.
3. **Implementation** — Developer and UI Developer implement in parallel where possible. Designer reviews visual output. Architect resolves blockers.
4. **Devil's Advocate review** — Before testing, the Devil's Advocate reviews all changes looking for missed edge cases, incorrect assumptions, potential regressions, and musical inaccuracies.
5. **Integration testing** — Integration Tester verifies the feature works end-to-end, components communicate correctly, and types compile cleanly.
6. **Regression testing** — Regression Tester verifies existing functionality is preserved across all chord types, orientations, and responsive breakpoints.
7. **Completion** — Build passes, all tests pass, Devil's Advocate signs off, plan is marked complete.

**Workflow — When given requirements directly (no plan):**

1. **Requirements analysis** — Architect and Devil's Advocate analyze the prompt requirements. Devil's Advocate identifies ambiguities and missing details.
2. **Quick design** — Architect outlines the approach, Designer validates UX, Devil's Advocate challenges it.
3. **Implementation + Testing** — Same as steps 3-7 above.

**How to invoke:**
- `use the implementation team to execute [plan-name]` — reads plan from `plans/` folder
- `use the bug team to fix [bug description]` — implements the fix directly
- `use the implementation team to build [feature description]` — implements from prompt requirements

## Project Conventions

- Frontend: React + TypeScript + Tailwind CSS
- State: React Context + useReducer for global state, local useState for component state
- Components: `src/components/` — functional components with TypeScript interfaces
- Data: `src/data/` — chord voicing databases
- Utils: `src/utils/` — music theory, layout calculations, chord tone analysis
- Types: `src/types/index.ts` — central type definitions
