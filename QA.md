# DOGLOVR launch validation

Validated November 2, 2026.

## Automated checks

`npm run check` passes syntax checks for the content, state, UI and local server. `npm test` passes **26 tests**:

- Empty and legacy profiles; malformed JSON and malformed fields.
- Removal of unknown/duplicate IDs and invalid quiz choices.
- Name trimming and length limits.
- Blocked/quota-limited storage; successful storage round-trips.
- Save/completion toggles and undo.
- Search normalization, full lesson text search, combined topic filtering and no results.
- Direct lesson links, return destinations and recoverable not-found routes.
- Lesson IDs, quiz choices, local image paths and asset integrity.
- No inline scripts/event handlers; restrictive Content Security Policy.
- HTTP serving, media types, 404 handling, directory traversal rejection, HEAD and method handling.

## Browser checks

Tested in the available Chromium-based browser:

- Home, library, breed explorer and learning-plan navigation.
- All six lessons render as dedicated pages with four illustrated steps and three quiz choices each.
- Wrong and correct quiz feedback.
- Save and complete a lesson; reload and verify persisted progress.
- Undo completion and remove a saved lesson; return to the plan with updated totals.
- Trimmed, case-insensitive search; combined topic/search filtering; reset from no results.
- Breed name/group search, full breed detail pages, life-stage advice and no-results recovery.
- Lesson and breed links navigate to real nested HTML pages; refresh and direct entry retain the correct page.
- Mobile profile access; names containing `<` are displayed as text; clearing a name is supported.
- A maximum-length, unbroken dog name does not cause horizontal overflow.
- Bundled images load; browser console shows no runtime errors or CSP warnings during tested flows.
- Responsive overflow checks at 320px, 390px, 768px and 1280px. Visual checks on phone, tablet and desktop layouts.

## Fixes included

Mobile profile editing, state validation and legacy migration, session-only storage feedback, undoable completion, persisted quiz choices, safer HTML rendering, predictable return routes, page scroll/focus management, not-found recovery, selected-state semantics, dialog labels, readable text sizes, reduced-motion support, keyboard focus indicators and local assets.

## Scope and remaining limits

The shipped release is a static educational app: six lessons and six breed guides, with data saved only in the current browser/origin. It has no backend, account system or cross-device synchronization. Images are illustrative. It has been browser-tested in Chromium; Safari, Firefox and a real screen reader have not been independently tested. Automated state/server checks are included; the browser scenarios above were performed interactively rather than through a bundled end-to-end browser runner.

The Pages launch workflow deploys `dist/` on app and launch-configuration changes to `main`, and can also run manually. A root HTML entry point supports branch-based Pages hosting as a fallback. Deployment success must be verified at the public URL. The existing Sites preview has its own private access policy.

## Full-page learning release

Each lesson now has four detailed steps with original SVG illustrations, a saved practice checklist, a short practice timer, a quiz, troubleshooting and a next-lesson link. Breed guides have background, care, enrichment, training, fit and life-stage sections. Only the small profile editor remains a dialog. Generated pages and artwork are maintained by `npm run build` and verified by `npm run check`.

Browser checks covered step-checklist persistence after reload, timer start/pause/reset, quiz feedback, save/complete/undo, return-to-plan navigation, life-stage advice, all six lesson pages and responsive widths of 320, 390, 768 and 1280 pixels. No runtime or CSP errors were observed.

GitHub Pages publishes a staged package containing the root launcher and the app in `dist/`, matching branch-based hosting. Direct lesson and breed URLs therefore remain stable under `/Doglovr/dist/`. The launcher preserves old hash links.
