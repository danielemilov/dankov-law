# Attempt 12 - Video Hero Insert

Date: 2026-06-05

Scope:
- Added the old video-based hero section back as a separate `VideoHero` component.
- Inserted it between the current `Hero` and the `Cases` section.
- Kept the existing current hero design untouched.
- Renamed old hero CSS classes to `hlVideoHero*` to avoid style collisions with the current hero.

Verification:
- `npm run build` passed.
- Browser DOM check confirmed order: `Hero` -> `VideoHero` -> `Cases`.
- Browser DOM check confirmed there is only one `#video` anchor.
