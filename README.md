# guild-task-tracker

Small responsive React task tracker with local persistence. Features limited to create, complete, filter, and delete tasks. Intentionally minimal.

## Features
- Create tasks
- Mark tasks complete
- Filter (All / Active / Completed)
- Delete tasks
- Persists via browser localStorage

## The App

Open `index.html` in any modern browser. No build step required — it is a self-contained React application using CDN resources for maximum simplicity.

## Guild Coordination

This delivery was coordinated by Roy with contributions from the full guild:

- **Shiroe** — Architecture: Single source of truth state, 4 clean components, useState + useEffect only.
- **Marin** — UX: Calm, intuitive, mobile-first design with Tailwind.
- **Guts** — Implementation: Ready to own the React build.
- **Maomao** — Quality: Defined 5 precise Playwright test scenarios covering every required flow.
- **Frieren** — Memory: Robust localStorage layer with integrity checks and safe serialization.
- **Kisuke Urahara** — Platform: Repo hygiene and minimal documentation.

## Notes
- Scope strictly limited to the four operations.
- No extra features, no external dependencies beyond the CDNs.
- Ready for Playwright testing against the defined scenarios.
