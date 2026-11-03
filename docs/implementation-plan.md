# Atlante Arcamis Implementation Plan

Goal: deliver the approved independent cartographer's atlas with six regional sheets.
Architecture: buildless static HTML/CSS/ES modules, local immutable cartographic data, pointer-based pan/zoom, hash navigation. Separate site repository, no changes to Mestieri application.
Spec: ../../../docs/superpowers/specs/2026-11-03-atlante-arcamis-design.md, with user-approved amendment: original Arcamis identity, travel-journal details, not a Riot interface copy.

## Constraints
Italian copy. No invented lore. Valgari in county, Vigilius in original Marchesato. Separate sheets rather than continuous geographic zoom. Responsive, keyboard accessible, reduced motion. Owner-private publication initially.

## Tasks
- [ ] Write and run failing behavior tests for regional data, search and viewport math.
- [ ] Implement data and pure viewport helpers; verify tests pass.
- [ ] Build atlas interface: world regions, index, location journal, search, URL history, controls, pointer drag and pinch.
- [ ] Run browser checks: every map loads, county/Marchesato naming, search result opens location, zoom/reset, touch sizing, narrow viewport and keyboard.
- [ ] Inspect rendered desktop/mobile, correct issues, package and publish with Sites.

## Review focus
Empty search, invalid hash, rapid map switches, two-pointer pinch with finger release, image failure/retry and narrow portrait screens. Tests exercise search and invalid IDs; browser checks cover map switches, mobile and navigation. Errors must offer retry.

## Reference lock
Runeterra only informs map exploration. Approved map art supplies the bronze and parchment colors. Dark green workspace surrounds the illustrated sheets, an index like an atlas contents page and parchment travel journal form Arcamis's own interface. Live Refero unavailable (NO_SUBSCRIPTION); bundled craft guidance used for focus and touch.
