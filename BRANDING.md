# Operation Obedience — Branding

## Status
- **Logo: approved.** See `operation-obedience-logo.svg` in this same folder — use it as-is as the site's logo asset (nav bar, header, etc.).
- **Color palette: approved**, see below.
- **Emblem/favicon/app icon: not yet finalized.** Don't build a custom favicon or app icon yet — use a generic placeholder or the platform default for now. This will come as a separate, later task.

## Color Palette

| Name | Hex | Use |
|---|---|---|
| Charcoal (background) | `#1C1F23` | Primary background |
| Panel Gray | `#2B2F34` | Cards, panels, borders, secondary surfaces |
| Ember Orange (accent) | `#E2691F` | Primary accent — buttons, links, highlights, icons |
| Off-White (text) | `#F2F0EB` | Primary text on dark backgrounds |
| Muted Gray (secondary text) | `#9AA0A6` | Secondary/muted text, captions, timestamps |

Notes on usage:
- This is a dark-theme-first palette. Charcoal is the base background, not a "dark mode" alternate — the app should look like this by default.
- Ember Orange is the *only* accent color — don't introduce additional accent colors (no blues, greens, etc.) without checking in first. Consistency here matters more than variety.
- Panel Gray is for anything that needs to sit visually "above" the charcoal background (cards, modals, nav bar) without competing with the orange accent.

Suggested implementation: add these as Tailwind theme colors (e.g. in `tailwind.config` under `theme.extend.colors`) so they're referenced by name (`bg-charcoal`, `text-ember`, etc.) rather than hardcoded hex values scattered through the codebase.

## Logo

`operation-obedience-logo.svg` — a two-line stacked wordmark ("OPERATION" over "OBEDIENCE") where:
- The first O in "Operation" is a rifle-scope reticle with mil-dot ranging ticks
- The T in "Operation" and the I in "Obedience" are formed by one continuous sword (pommel, wrapped grip, and crossguard sit in the "Operation" line; the blade continues down through "Obedience")

Known limitation: the lettering currently uses a bold monospace font as a placeholder for a true military stencil typeface. This is acceptable to ship with for now — swapping the font later won't require changing the sword or reticle artwork, since those are separate vector elements layered over the text.

Use this SVG directly as the logo wherever the app currently has a placeholder/text-only logo (nav bar, footer, etc.). It should scale cleanly since it's vector.
