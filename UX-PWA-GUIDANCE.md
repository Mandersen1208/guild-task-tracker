# Marin’s UX Guidance: PWA "Add to Home Screen" Flow for iPhone
**Kawaii Daily — Gentle Daily Tasks**  
**Date:** 2026-07-13  
**Owner:** Marin (UX)  
**Audience:** Kisuke (Platform), Guts (Impl), Roy (Coordination), Guild

## Mission Alignment
PWA is the approved primary path for offline iPhone usage. This guidance ensures the install experience feels intentional, gentle, and native — never pushy or technical. The installed app must feel like a beloved companion, not "a website."

## 1. Ideal "Add to Home Screen" Experience on iPhone

### Philosophy
- **Gentle invitation, not aggressive prompt.** Kawaii Daily is a daily ritual, so the install prompt should feel like an extension of that warmth.
- No auto-prompt (iOS limitation). Education + delight > coercion.
- Low friction, high visual polish. Use soft animations, pastel illustrations, and reassuring copy.

### Trigger Strategy (Recommended)
- **First visit / Onboarding:** After user creates their *first task* and marks it complete (or on 2nd session), show a soft, dismissible card at the bottom or as a centered gentle modal.
  - Visual: Soft pink card with a cute phone illustration (heart on home screen icon).
  - Headline: “Keep your gentle daily companion close 💕”
  - Body: “Add to your Home Screen for instant access — even when you’re offline or in airplane mode.”
  - Primary CTA: “Show me how (takes 10 seconds)”
  - Secondary: “Maybe later” (snooze 7 days, stored in localStorage)

- **Persistent but respectful:** If dismissed, show a tiny floating “Install” chip in the header (only in browser context) that can be tapped later. Never more than once per session.

### Installation Flow UI (3 Gentle Steps)
When user taps “Show me how”, replace the card with an illustrated stepper (use simple SVG or emoji-enhanced divs for performance):

1. **Tap Share**  
   Show iPhone Share button icon (or annotated screenshot).  
   Copy: “In Safari, tap the Share button at the bottom of the screen.”

2. **Find “Add to Home Screen”**  
   Scroll hint + icon.  
   Copy: “Scroll down and tap **Add to Home Screen**.”

3. **Confirm & Add**  
   Preview of the beautiful kawaii icon + name.  
   Copy: “Tap **Add**. Your gentle space is now on your Home Screen.”

After completion (or if already installed), show celebration:  
“✨ Welcome to your home screen sanctuary. Your tasks will feel even gentler here.”

### Detection & Hiding
- Use `window.matchMedia('(display-mode: standalone)').matches` **or** `(navigator as any).standalone` (WebKit).
- Once detected as standalone, permanently hide all install UI and any “open in browser” messaging.
- Store install state in localStorage so returning users never see the prompt again.

**Success Metric (for later measurement):** % of active users who complete A2HS within first 3 sessions.

## 2. Ensuring the Installed App Feels Native

### Core Requirements
- **Zero browser UI** on launch from Home Screen.
- Beautiful, recognizable icon that feels like a native app icon.
- Launch experience that matches the app’s aesthetic instantly.
- Status bar and safe areas handled elegantly.

### Icon & Branding Recommendations
- **Primary Icon:** High-quality kawaii-style illustration (pastel, rounded, gentle). Source at 1024×1024.
  - Generate: 180×180 (apple-touch-icon), 192×192, 512×512, 1024×1024.
  - One icon should be **maskable** (with safe zone) for Android harmony.
- Current manifest references `/icon-*.png` — these assets **must exist** in `/public/` before launch. Visual asset creation is now a priority.
- `apple-touch-icon` in `index.html` should point to the 180×180 or 512×512 variant for best iOS Share sheet preview.

### Splash / Launch Screen
- Rely on `background_color: "#FFF8F5"` + large icon for iOS-generated splash.
- For premium feel (recommended for v1 polish): Add targeted `<link rel="apple-touch-startup-image">` tags for common iPhone sizes (optional but delightful).
- Goal: User sees the familiar gentle pink + logo immediately, no white flash or browser chrome.

### Status Bar
- `theme_color: "#F8B4C4"` (already good — matches kawaii palette).
- `apple-mobile-web-app-status-bar-style: "default"` or `"black-translucent"` (test both; translucent can look more immersive on light themes).

## 3. UI Adjustments Needed for Standalone Mode

### Viewport Meta (Update Required)
Change in `index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

### CSS / Tailwind Adjustments (Guts + Marin collab)
Add a `standalone` context class or use media queries:

```css
/* Safe area handling — critical for notch / Dynamic Island */
.safe-top { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
.safe-left { padding-left: env(safe-area-inset-left); }
.safe-right { padding-right: env(safe-area-inset-right); }

/* Standalone-specific polish */
@media (display-mode: standalone) {
  /* Hide any browser-only chrome or install hints */
  .install-prompt { display: none !important; }

  /* Ensure header feels like native app bar */
  .app-header {
    padding-top: env(safe-area-inset-top);
    /* Maybe subtle shadow or blur for depth */
  }

  /* FAB positioning */
  .fab-new-task {
    bottom: calc(16px + env(safe-area-inset-bottom));
    /* Larger touch target on iPhone */
    min-height: 56px;
    min-width: 56px;
  }

  /* Content breathing room */
  .task-list {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}

/* When running in browser (show install affordance) */
@media not (display-mode: standalone) {
  .standalone-only { display: none; }
}
```

### Additional UX Polish for Standalone
- **No external link breakage:** Any “help” or external resources should open in new context or be in-app if possible.
- **Navigation:** Self-contained. The task list + composer should feel like the entire app. Use bottom sheet or modal patterns that feel native (Tailwind + framer-motion or Radix).
- **Touch targets:** Minimum 44×44px everywhere. Gentle haptics via Web Vibration API on task complete (nice-to-have).
- **Empty states & microcopy:** Even more loving in standalone (“Your gentle list awaits…”).
- **Offline awareness:** Once service worker is live, show a tiny “Offline ready” badge or toast on first standalone launch (subtle, not alarming).
- **Orientation:** Primarily portrait. If landscape used, ensure layout doesn’t break (but optimize for portrait).

### Testing Checklist (for Maomao + real devices)
- iPhone 14/15/16 (notch vs Dynamic Island)
- iOS 18.x and latest 26 betas
- Both light and (if added) dark mode
- Fresh install vs update flow
- After A2HS, verify no URL bar ever appears
- Safe-area insets on all screens (especially composer at bottom)

## 4. Manifest Details — Recommendations for Kisuke

Current `public/manifest.json` is a strong starting point. Proposed enhancements:

```json
{
  "name": "Kawaii Daily",
  "short_name": "Kawaii Daily",
  "description": "My gentle daily tasks",
  "id": "kawaii-daily-v1",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": ["standalone", "minimal-ui"],
  "background_color": "#FFF8F5",
  "theme_color": "#F8B4C4",
  "lang": "en-US",
  "categories": ["productivity", "lifestyle"],
  "icons": [
    {
      "src": "/icon-180.png",
      "sizes": "180x180",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-1024.png",
      "sizes": "1024x1024",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "shortcuts": [
    {
      "name": "New Task",
      "short_name": "New",
      "description": "Create a gentle new task",
      "url": "/?action=new",
      "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }]
    }
  ]
}
```

**Additional HTML meta (index.html) already mostly good** — keep:
- `apple-mobile-web-app-capable: yes`
- `apple-mobile-web-app-status-bar-style`
- `apple-mobile-web-app-title`
- `apple-touch-icon` (update href to best size, e.g. `/icon-180.png` or 512)

**MIME type note:** Ensure the server/Vite serves `manifest.json` (or `.webmanifest`) with `Content-Type: application/manifest+json`.

**Asset Priority:** Icons + any startup images are blocking for a polished native feel. Recommend creating/optimizing kawaii icons this sprint.

## 5. Open Questions & Handoff to Kisuke
- Confirm icon asset pipeline (who creates the final kawaii PNGs?).
- Service Worker + offline caching strategy (required for “offline usage” promise) — coordinate with Guts/Frieren.
- Any analytics or A/B on install prompt wording?
- Future: Shortcuts API deeper integration? Badging for pending tasks?

## Acceptance Criteria for This Guidance
- [ ] Prompt feels on-brand and non-intrusive
- [ ] Installed app has zero browser UI on iPhone
- [ ] Safe areas respected; no content clipped by notch/Dynamic Island
- [ ] Manifest + meta tags reviewed and updated by Kisuke
- [ ] Visual assets (icons) exist and are referenced correctly
- [ ] Standalone detection logic implemented so install UI disappears

This guidance keeps the experience **gentle, delightful, and trustworthy** — exactly what Kawaii Daily promises.

Ready for implementation review.  
— Marin

---

**Related Files**
- `public/manifest.json`
- `index.html`
- (Future) `src/components/InstallPrompt.tsx` or equivalent

**Guild Note:** This is the UX spec. Technical ownership remains with the assigned specialists. Let’s keep delivery sustainable.