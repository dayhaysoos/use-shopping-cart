# New Landing Page Plan (use-shopping-cart.com)

## 1. Objectives
- Refresh the marketing site so it communicates the 2025 roadmap (React 19 readiness, playground-first storytelling, promotion codes, etc.) while staying recognizable to returning visitors.
- Introduce a hands-on “Cart Interaction Playground” that lets people feel the ergonomics of the API before opening docs.
- Answer the three core questions faster than the current site: *What is it?*, *Why trust it?*, *How quickly can I ship a cart?*
- Maintain performance and accessibility parity with the current static experience while pushing a richer visual language.

---

## 2. What Works on the Current Landing Page
- **Hero clarity:** “Shopping cart state and logic for Stripe checkout” plus inline install snippet is easy to grok.
- **Feature icons:** Six-tile grid (“Security first”, “Serverless ready”, etc.) communicates breadth, but feels visually flat on large screens.
- **Developer journey:** The sequential code samples (wrap app → products → frontend → serverless) teach the workflow effectively.
- **Credibility cues:** GitHub/Docs/Discord links and footer credits establish trust.

Gaps to close:
- Page ends before highlighting modern DX improvements (React 19 upgrade guide, custom cart controls, live metrics).
- No interactive surface to demonstrate API feel.
- Visual hierarchy feels dated (full-width cards, limited typography scale).

---

## 3. Proposed Information Architecture & Layout

| Section | Purpose | Key Content | Layout & Style Notes |
| --- | --- | --- | --- |
| **Sticky nav + announcement bar** | Surface release/channel links and keep CTA in view. | Logo, Docs, GitHub, Discord, “Get started” button, optional “v4 alpha” pill, announcement bar linking to the React 19 upgrade guide. | Frosted glass nav (backdrop blur + 80% opacity). Add announcement bar for launch notes (dismissible). |
| **Hero (“Build delightful carts with Stripe in minutes”)** | Introduce product, value, and CTA. | Headline, 1–2 sentence sub-copy, install snippet, dual CTAs (Primary: “Get started”, Secondary: “Play with the cart”). | Split layout: left copy, right shows animated cards (floating cart summary + gradient background). Use background gradient from `#0E0F1C → #1B1F3B` with subtle noise texture. |
| **Cart Interaction Playground** | Let visitors try core cart actions inline. | Button panel (Add Sample Product, Increment, Decrement, Apply Promotion, Toggle Shipping, Clear Cart), live mini cart, discount + totals readout. | Two-column panel with card shadow. Buttons arranged in responsive grid. Provide keyboard skip + instructions at top. |
| **Feature highlights (Modern cart toolkit)** | Show differentiators beyond “shopping cart”. | 3-up cards: “Optimistic cart UX”, “Promotion code ready”, “Serverless utilities”. Followed by secondary 3-up for “Fully tested”, “Jamstack friendly”, “Community-driven support”. | Rebuild as staggered cards with icons inside circular gradients. Use CSS grid with masonry offset to add depth. |
| **Developer workflow steps** | Teach the quickstart path. | Four steps (Wrap → Products → Frontend → Server). Keep code but modernize with tabs (React / Next / Remix). | Use timeline layout with numbered pills and background stripes. Each code block sits inside scrollable container with copy button + language tag. |
| **Social proof / Community** | Establish trust. | Live GitHub star count, live npm download stats (fetched at build-time/server-side), quotes or logos (Stripe, Netlify, Astro). | Horizontal carousel on desktop, stacked cards on mobile. |
| **Call-to-action footer** | Drive conversions. | “Ready to launch?” copy, CTA pair, support mention. | Gradient section with subtle stripe pattern, mirrored top spacing to hero for balance. |

---

## 4. Visual Direction
- **Color palette:** Deep indigo foundation (`#0E0F1C`, `#151933`) with accent gradients (`#6C63FF → #4AD7F5`) for CTAs and focus states. Neutral card backgrounds (`rgba(255,255,255,0.05)`), off-white text (#F6F8FF).
- **Typography:** Maintain Inter but add size scale (Hero 64/72 desktop, 42/48 tablet, 32/36 mobile). Use tighter leading and letterspacing for uppercase labels.
- **Cards & panels:** Rounded corners (16px), 1px inner border using `border-color: rgba(255,255,255,0.1)`. Drop shadow defined via `box-shadow: 0 30px 60px rgba(7,8,20,0.45)`.
- **Iconography:** Reuse existing SVG assets but recolor with gradient masks. Extend library with simple outlined glyphs for new features (promotion codes, cart insights).
- **Motion:** Micro-interactions on hover (translateY(-4px), 150ms). Hero background uses subtle parallax (CSS transform on scroll, behind `prefers-reduced-motion` guard).
- **Spacing:** Global vertical rhythm via CSS custom property `--section-spacing` (clamp(4rem, 8vw, 8rem)). Keep max-width at 1200px for body copy, 1440px for hero.

---

## 5. Cart Interaction Playground Specification

### Goals
- Preview the ergonomics of `useShoppingCart` without writing code.
- Highlight optimistic updates and Stripe-ready flows (promo codes, shipping tiers).

### Layout
- **Container:** Full-width section with background split (left gradient for buttons, right neutral for cart).
- **Button panel:** 2-column grid on desktop, single column on mobile. Buttons include icon + label + helper text (e.g., “Add Sample Product (Bananas)”).
- **Cart preview:** Stack showing line items, quantity steppers, subtotal/discount/shipping/total rows, CTA button (`Checkout with Stripe`).
- **State summary chips:** Show derived state (`cartCount`, `formattedTotalPrice`) as badges above the cart.

### Interaction Set
1. `Add Sample Product` – seeds cart with one product (calls `addItem`).
2. `Increment Quantity` / `Decrement Quantity` – uses `incrementItem`/`decrementItem`.
3. `Apply Promotion` – toggles a mocked `discount` value to demonstrate price updates.
4. `Toggle Shipping` – switches between free and paid shipping tiers.
5. `Clear Cart` – resets state.

All buttons should respond instantly (state stored in component, optionally backed by `useShoppingCart` with a mocked provider). Provide inline helper text describing what each action is doing (“Calls `incrementItem('banana_001')`”).

### Accessibility Strategy
- **Skip control:** Precede the playground with `Skip interactive cart demo` button/link that jumps focus to the section following the playground for keyboard/screen reader users who don’t want to tab through all controls.
- **Grouped buttons:** Wrap buttons inside a `<fieldset>` with legend “Cart interaction controls” so screen readers announce the group. Treat each button as a simple `<button>` (not `<a>`), ensure focus outline contrast ≥ 3:1.
- **Instructions:** Provide short text (visually and via `aria-describedby`) explaining that all actions operate on mock data and are optional.
- **Live region:** Totals area should announce changes via `aria-live="polite"` so screen reader users hear price updates after pressing a button.
- **Keyboard order:** Focus flows left-to-right, top-to-bottom; keep tab index natural.
- **Motion guard:** If the cart preview uses sliding transitions, wrap them in `prefers-reduced-motion` media queries and offer instant updates when reduction is requested.

### Technical Notes
- Build as a self-contained React component (usable both on marketing site and docs). Use `CartProvider` with a mock inventory object to keep logic real.
- Add Storybook (or docs) story for automated visual regression later.
- Provide hook for instrumentation (log button usage to analytics for learning which interactions resonate).
- Keep all data mocked—no real or test Stripe keys shipped in the client bundle.

---

## 6. Accessibility & Content Guidelines
- **Skip links:** Retain site-wide “Skip to main content” and add per-section skip where interaction density is high (playground). Ensure they are keyboard visible.
- **Color/contrast:** Test gradient CTAs against WCAG 2.1 AA (use `#FFFFFF` text with drop shadow). Provide alternative theme tokens for light mode if needed.
- **Responsive behavior:** On ≤768px, collapse hero to stacked layout, convert button grid to single column, reduce code block padding while keeping copy accessible.
- **Content tone:** Use confident yet playful tone (“Shipping logic, without shipping a single reducer”). Keep paragraphs under ~80 characters per line.
- **Product positioning:** Message the library as React-first for now—skip “framework agnostic” claims until adapters/examples exist.
- **Illustrations:** Replace current static icons with vector scenes showing cart states; keep file sizes small (SVG).
- **Performance:** Lazy-load heavier assets (illustrations, interactive component) with intersection observer so hero paints fast.

---

## 7. Implementation Sequence
This initiative fully replaces the existing marketing site, so the new layout must ship only when feature-complete (no parallel legacy route).

1. **Design exploration:** Produce wireframes + high-fidelity comps for hero, playground, feature cards.
2. **Component scaffolding:** Build layout primitives (Section, Container, FeatureCard, CodeTabs).
3. **Interactive playground:** Implement component, write tests for button interactions, ensure hydration-safe data (mocked Stripe data only).
4. **Dynamic metrics integration:** Server-side fetch GitHub stars + npm downloads, cache at build time, and render within Social proof section.
5. **Content migration:** Rewrite copy per section, add new feature descriptions, update CTA targets.
6. **Accessibility review:** Keyboard testing, screen reader smoke test, color contrast audit.
7. **Launch checklist:** Performance budget, analytics tagging, cross-browser QA, and cutover to replace the current root landing page (no dual-serve period). Include announcement linking to the React 19 upgrade guide.

---

## 8. Decisions from Stakeholder Feedback
- **Deployment:** Ship this as a full replacement for the current landing page (same domain, no transitional route).
- **Playground data:** Keep everything mocked—no real or test Stripe API keys embedded.
- **Usage metrics:** Fetch GitHub star count + npm download numbers dynamically (build-time/serverless) so the page is always current.
- **Announcement CTA:** Point the announcement bar to the React 19 upgrade guide until a new launch post exists.

No outstanding questions at this stage; flag new blockers as they emerge during plan-mode execution.

