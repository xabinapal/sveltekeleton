# DESIGN.md

The UI design contract for this project. **Read this before any UI change** — it
is mandatory, and `AGENTS.md` treats it as a required check for UI work.

This file describes stable rules and intent. It is deliberately not a pixel map
or a component catalogue — those change often. Update it only when the design
principles themselves change.

## Foundation

- **daisyUI on Tailwind CSS v4.** Themes are configured in `src/app.css` via the
  daisyUI plugin. The active theme(s) and tokens live there.
- Tailwind utilities for layout, spacing, and typography.
- daisyUI for every component and for theming.

## Mandatory rules

### Always

- **Use a daisyUI component when one exists.** Before writing any element, check
  daisyUI first: `btn`, `card`, `badge`, `alert`, `table`, `modal`, `tabs`,
  `input`, `select`, `checkbox`, `dropdown`, `tooltip`, `stats`, `menu`,
  `navbar`, `drawer`, `collapse`, `join`, `kbd`, `loading`, `progress`, `range`,
  `radial-progress`, `divider`, `hero`, `stack`, `avatar`, `mask`, `artboard`,
  etc. If the thing you are building matches a daisyUI component, use it.
- Use daisyUI's **semantic color classes** (`text-primary`, `bg-base-200`,
  `text-error`, `badge-success`, …). They resolve against the active theme and
  keep dark mode working.
- Keep markup accessible — daisyUI primitives ship with sensible ARIA and
  keyboard behavior; preserve it (don't replace them with raw divs).

### Never

- **Never reinvent a component daisyUI already provides.** No hand-rolled
  buttons, cards, alerts, modals, or form controls built from raw `<div>`/`<button>`.
- **Never hardcode hex colors** in markup or component styles. Use semantic
  tokens so themes keep working.
- Never break theme switching — avoid styles that only read correctly in one
  theme.

## Layout and composition

- Compose with Tailwind utilities (flex, grid, gap, max-w, responsive prefixes).
- Use daisyUI container/group components where they fit (`join`, `stack`,
  `card`, `stats`, `navbar`, `drawer`).
- Keep pages responsive by default; test narrow and wide viewports.

## When there is no fitting daisyUI component

- Build the smallest possible composition of utilities + daisyUI primitives.
- If a truly new reusable pattern is needed, add it as a Svelte component under
  `src/lib/components/` built from daisyUI primitives — not from raw elements.

## Adding or changing a theme

- Edit the daisyUI plugin block in `src/app.css` (themes, colors).
- Keep `src/lib/site.ts` `themeColor` in sync if it represents the brand color
  used in meta tags / manifest.
