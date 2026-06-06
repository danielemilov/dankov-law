Attempt 16 - Mobile scale positioning

Scope:
- Mobile hero scale composition only.
- Desktop hero scene intentionally left untouched.
- `HeroScene3D` changes are limited to `mode="mobileCard"`.

What changed:
- Lifted the mobile 3D scale higher inside the portrait card.
- Increased the mobile scale slightly so the beam and both pans read like the reference composition.
- Reduced the mobile 3D rotation so the scale feels less crooked and more intentional.

Verification:
- `npm run build` in `client` passed.
- Browser viewport checked at 393x852.
- No horizontal overflow on body, hero title, or first action chip.

Screenshot:
- `screenshots/mobile-scale-393x852.png`
