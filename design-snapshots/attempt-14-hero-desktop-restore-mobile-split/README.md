# Attempt 14 - Hero Desktop Restore + Mobile Split

Date: 2026-06-05

Scope:
- Corrected attempt 13 after desktop was changed too much.
- Restored the desktop hero concept: large sans headline, old trust strip, old glass portrait stage, old split composition.
- Kept only a small desktop correction: raised the attorney figure on shorter desktop viewports so the full body is visible earlier.
- Added a separate mobile/tablet hero scene under `hlHeroMobile`, inspired by the first minimal reference.
- Kept the video hero, cases, contact, navbar, cookies, chat, and other homepage sections untouched.

Verification:
- `npm run build` passed.
- Desktop browser screenshot saved in `screenshots/desktop-hero.png`.
- Desktop DOM check showed `hlHeroMobile` is hidden on desktop and the restored desktop scene is visible.
