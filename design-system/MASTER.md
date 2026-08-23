# ARTAFIC — MASTER DESIGN SYSTEM

## 1. Classification
**Product/Category:** Creative Digital Agency / Design Studio
**Primary Style:** Editorial Grid / Magazine
**Secondary Influence:** Exaggerated Minimalism
**Supporting Influence:** Interactive Cursor Design
**Motion Influence:** Motion-Driven / Parallax Storytelling

## 2. Typography
**Display:** Cormorant Garamond (Elegant Editorial Serif)
**Body:** DM Sans (Clean Neutral Sans)

**Hierarchy Rules:**
- Micro Label: 11-13px (DM Sans, uppercase, tracking-wider)
- Section Label: 12-14px (DM Sans, uppercase, bold, high letter-spacing)
- Body: 16-18px (DM Sans, regular, 160% line-height)
- Display: 64-110px (Cormorant Garamond, italic/regular mix, tight tracking)
- Signature Display: 120px+ (For very short statements)

## 3. Color Palette
- **Base (Background):** `#080808` (Deep Dark)
- **Primary Text:** `#F1F0EA` (Warm Off-White)
- **Secondary Text:** `#B7B5AE` (Muted Warm Grey)
- **Muted Text:** `#777771` (Darker Grey)
- **Accent (Primary):** `#14B8A6` (Teal - use sparingly)
- **Accent (Editorial Sub-accent):** `#D9D1C7` (Warm Ivory - for subtle highlights, lines, or abstract geometry)

## 4. Textures & Depth
- **Grain:** Fine, low opacity (3-5%) SVG noise overlay on background.
- **Lighting:** Extremely subtle radial gradients attached to cursor or fixed in key sections (opacity 5-10%).
- **Surfaces:** No standard "cards". Use thin rules (1px `#ffffff1a`), layered typography, and overlapping grid alignment.

## 5. UI Elements
- **Containers:** Asymmetric wrappers, off-grid alignment but strictly constrained by an invisible 12-column foundation.
- **Borders:** 1px solid, ultra-low contrast (`rgba(241, 240, 234, 0.08)`).
- **Icons:** Minimal Lucide usage. No decorative icons unless functionally required (e.g. arrows for directional CTAs).
- **Buttons:** Magnetic interactions, oversized hit areas, no generic rounded rectangles.

## 6. Motion & Interaction
- **Target:** 70% still, 30% motion.
- **Interactions:** Scroll-driven typography reveals (masks), sticky editorial sidebars, magnetic buttons.
- **Performance:** Disable intensive animations off-screen. Respect `prefers-reduced-motion`.

## 7. Accessibility
- Maintain WCAG AA contrast (e.g., `#777771` on `#080808` is acceptable for micro-labels, but primary text must be `#F1F0EA`).
- Keyboard focus visible (using teal outline).
- Semantic HTML (`main`, `section`, `article`, `header`).
