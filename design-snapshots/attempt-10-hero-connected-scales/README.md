# Attempt 10 - hero connected scales

Hero-only pass after the user's critique of attempt 09.

Main changes:
- Rebuilt the Three.js justice scales as a connected mechanical object.
- Removed floating particles and disconnected endpoint dots.
- Beam, hangers, chain lines, rings, and pans now live in one connected scale assembly.
- Mobile composition is no longer a cropped, one-sided detail; the full symbol reads behind the attorney.
- Raised the mobile beam so it does not visually cross the face/head.
- Kept the 3D layer behind the portrait and preserved the attorney-first hero flow.

Verification:
- `npm run build` passes.
- Browser QA at mobile and desktop widths showed no horizontal overflow.
- Hero still contains no old `.hlHero__identityCard` or `.hlHero__signal` elements.
