# DOGLOVR launch validation

Validated November 2, 2026.

## Automated checks

`npm run check` passes syntax checks for the content, state, UI and local server. `npm test` passes **20 tests**:

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
- All six lesson dialogs render three answer options each.
- Wrong and correct quiz feedback.
- Save and complete a lesson; reload and verify persisted progress.
- Undo completion and remove a saved lesson; return to the plan with updated totals.
- Trimmed, case-insensitive search; combined topic/search filtering; reset from no results.
- Breed name/group search, detail dialog and no-results recovery.
- Escape closes a lesson and restores focus to its originating card.
- Mobile profile access; names containing `<` are displayed as text; clearing a name is supported.
- A maximum-length, unbroken dog name does not cause horizontal overflow.
- Bundled images load; browser console shows no runtime errors or CSP warnings during tested flows.
- Responsive overflow checks at 320px, 390px, 768px and 1280px. Visual checks on phone, tablet and desktop layouts.

## Fixes included

Mobile profile editing, state validation and legacy migration, session-only storage feedback, undoable completion, persisted quiz choices, safer HTML rendering, predictable return routes, page scroll/focus management, not-found recovery, selected-state semantics, dialog labels, readable text sizes, reduced-motion support, keyboard focus indicators and local assets.

## Scope and remaining limits

The shipped release is a static educational app: six lessons and six breed guides, with data saved only in the current browser/origin. It has no backend, account system or cross-device synchronization. Images are illustrative. It has been browser-tested in Chromium; Safari, Firefox and a real screen reader have not been independently tested. Automated state/server checks are included; the browser scenarios above were performed interactively rather than through a bundled end-to-end browser runner.

The Pages launch workflow is manual and requires selecting GitHub Actions in repository Pages settings. A code push alone does not prove that a public deployment exists. The existing Sites preview has its own private access policy.
