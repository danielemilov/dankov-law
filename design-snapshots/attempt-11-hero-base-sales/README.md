# Attempt 11 - hero base sales

Hero-only pass after the critique of attempt 10.

Main changes:
- Extended the justice-scale column so the object reaches the floor/feet instead of floating.
- Added a lower base, foot, glow ring, and floor shadow so the attorney visually stands on the scene.
- Increased the material density slightly for a more premium metal/glass feel.
- Reduced the mobile portrait-stage height so the headline appears in the first viewport.
- Kept the scale as one connected object and preserved the no-face-cover rule.

Verification:
- `npm run build` passes.
- Browser QA at mobile and desktop widths showed no horizontal overflow.
- Hero still contains no old `.hlHero__identityCard` or `.hlHero__signal` elements.
