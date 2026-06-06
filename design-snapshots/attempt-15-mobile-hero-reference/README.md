Attempt 15 - Mobile hero reference pass

Scope:
- Mobile hero only.
- Desktop hero scene intentionally left untouched.
- Mobile JSX now uses the reference structure: title, lead, portrait/scales card, three glass action chips, and one text-only consultation CTA.
- Mobile 3D scale positioning is adjusted only for `mode="mobileCard"`.

Verification:
- `npm run build` in `client` passed.
- Browser viewport checked at 393x852.
- No horizontal overflow on body, hero title, or first action chip.

Screenshot:
- `screenshots/mobile-hero-393x852.png`
