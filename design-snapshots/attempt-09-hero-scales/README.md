# Attempt 09 - hero scales

Hero-only pass.

Main changes:
- Replaced the abstract Three.js panel scene with a real 3D justice-scales composition.
- Added a metal column, balance beam, hanging chains, glass pans, halo rings, glow arc, and subtle animated particles.
- The scales animate with slow balance movement instead of random floating effects.
- Desktop composition places the legal symbol behind the portrait scene without covering the attorney's face.
- Mobile composition shifts the scales up/right so the symbol reads as a background legal presence, not a line through the person.

Verification:
- `npm run build` passes.
- Browser QA at mobile and desktop widths showed no horizontal overflow.
- Hero still contains no old `.hlHero__identityCard` or `.hlHero__signal` elements.
