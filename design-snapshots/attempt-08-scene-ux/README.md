# Attempt 08 - scene UX

Baseline created after the user's local updates from `attempt-07-current-user-updates`.

Main changes:
- Attorney-first hero on mobile, with the portrait scene before the headline.
- Removed the visible hero identity/signal cards from JSX so nothing covers the face.
- Replaced the cheap hero 3D idea with a quieter Three.js strategy-corridor layer.
- Shortened and sharpened the hero reveal so the first viewport does not stay blank/blurred.
- Moved cookie management to the footer legal area and removed the persistent cookie button.
- Added footer links for privacy and cookie settings.
- Reordered the mobile contact section so the booking form appears before address/map.
- Stabilized the global background palette away from the saturated green page base.
- Updated chat FAB/icon and mobile chat window sizing so it stays inside the viewport.

Verification:
- `npm run build` passes.
- Mobile and desktop browser QA showed no horizontal overflow.
- Hero DOM contains no `.hlHero__identityCard` / `.hlHero__signal` elements.
- Cookie settings can be opened from the footer.
