# Creative Ideas: Portfolio-v7 — 8.8 to 9.5+

**Date**: 2026-03-30
**Author**: Designer Agent

---

## Current State Assessment

The site has a solid foundation: Space Grotesk / Inter / JetBrains Mono type system, #86EFAC accent on near-black, parallax on project cards, motion/react animations, a particle field, FormationDemo, 4 games, a quiz, and 6 projects with SVG illustrations. What it lacks is a unifying visual narrative, one or two genuine "stop scrolling" moments, and small rewards that make the site feel handcrafted rather than assembled.

The ideas below are ranked by estimated impact on first-impression score. Each includes what it is, where it lives in the current component tree, how to implement it technically, and a realistic lines-of-code estimate.

---

## Idea 1 — Signal Waveform Section Dividers

**Impact: Very High**

**What it is.** Between every section, instead of a plain horizontal rule or whitespace gap, render an SVG oscilloscope trace — a sine wave, a step response, a damped sinusoid — that is thematically keyed to the section below it. Projects gets a clean sine (control output). Experience gets a step response climbing upward (progression). Quiz gets a noisy signal (uncertainty). The waveform is drawn on scroll using a `stroke-dashoffset` animation, so visitors watch the line trace itself as they approach.

**Where.** Replace or augment `SectionWrapper`. Add a `divider` prop accepting `"sine" | "step" | "damped" | "noise"`. Render an `<svg>` of fixed height (80–100px) between sections, using `viewBox="0 0 1200 80"` so it scales full-width.

**How to implement.**
- Pre-compute the path `d` attribute for each waveform type as a constant string — no runtime math needed.
- Use motion/react `useInView` to trigger a `pathLength` animation from 0 to 1, duration 1.2s ease-out.
- Stroke color: `var(--color-accent)`, opacity 0.4. Stroke width 1.5.
- The path traces left-to-right, so the draw direction reinforces reading direction.
- No external libraries required; pure SVG + motion/react.

```tsx
// Core concept — in SectionDivider.tsx
<motion.path
  d={WAVEFORMS[variant]}
  stroke="var(--color-accent)"
  strokeWidth="1.5"
  fill="none"
  initial={{ pathLength: 0, opacity: 0 }}
  whileInView={{ pathLength: 1, opacity: 0.4 }}
  viewport={{ once: true }}
  transition={{ duration: 1.4, ease: "easeOut" }}
/>
```

**Estimated LOC.** 60–80 lines (new `SectionDivider.tsx` component + 4 waveform path constants).

---

## Idea 2 — Animated Stats Bar in the Hero

**Impact: Very High**

**What it is.** A horizontal strip of three to four key achievements rendered as counting numbers that animate up on page load, placed directly below the hero tagline and above the CTA buttons — or inlined at the bottom of the hero column. The numbers:

- `17%` — Reliability improvement, F-35 program
- `A*A*A*A` — A-Levels (typed character-by-character)
- `3rd` — UoM Hackathon 2025 (counter counts up from 1)
- `20+` — Papers reviewed

Numbers count from zero to target using a simple easing function. The label beneath each number is small-caps mono. This turns buried highlights from the experience data into the first thing a recruiter sees at a glance.

**Where.** Inside `HeroSection.tsx`, below the CTA buttons. A new inline `<StatBar>` component.

**How.** Use motion/react `useMotionValue` + `useTransform` + `animate()` with a spring, not a linear counter, so numbers feel physical. Text variant `A*A*A*A` uses a character stagger instead.

```tsx
// Counter hook — ~20 lines
function useCounter(target: number, duration = 1.5) {
  const count = useMotionValue(0);
  useEffect(() => {
    const controls = animate(count, target, { duration, ease: "easeOut" });
    return controls.stop;
  }, [target]);
  return useTransform(count, Math.round);
}
```

Delay each stat by `index * 0.15s` to stagger entry. Trigger on `whileInView` with `once: true`.

**Estimated LOC.** 80–100 lines.

---

## Idea 3 — Custom Engineering Cursor (Desktop Only)

**Impact: High**

**What it is.** Replace the system cursor with a custom cursor: a small crosshair (10px arms, 1px stroke) in the accent color, with a larger outer ring (24px diameter, dashed stroke) that follows with a soft spring lag. The outer ring squishes to an ellipse when moving fast (velocity-dependent `scaleX`). Over links and buttons, the crosshair disappears and the ring expands to 40px and fills with `accent/20` — the standard "cursor grows on hover" pattern, but with a crosshair that reads immediately as engineering/precision.

**Where.** New `CustomCursor.tsx` client component mounted once in `app/layout.tsx` before other children, inside a `<div className="pointer-events-none fixed inset-0 z-[9999]">`. Hide native cursor globally via `html { cursor: none }` in `globals.css`, but only when the cursor component has mounted (to avoid flash on slow connections).

**How.** Track `mousemove` with `useMotionValue` for `x` and `y`. The crosshair follows at native speed (`x`, `y` directly). The ring uses `useSpring(x, { stiffness: 200, damping: 28 })` for lag. Detect hoverable elements with `mouseover` event delegation checking `e.target.closest('a, button, [role="button"]')`.

```tsx
const cursorX = useMotionValue(-100);
const cursorY = useMotionValue(-100);
const springX = useSpring(cursorX, { stiffness: 200, damping: 28 });
const springY = useSpring(cursorY, { stiffness: 200, damping: 28 });
```

Add `prefers-reduced-motion` check — if reduced motion is preferred, skip the component entirely.

**Estimated LOC.** 100–120 lines.

---

## Idea 4 — Scroll-Linked Blueprint Reveal on the Projects Section Heading

**Impact: High**

**What it is.** The Projects section heading currently scales and fades in. Replace this with a blueprint-style reveal: the heading starts covered by a scrim of blueprint-blue graph paper (a 20px grid, very faint), and as the user scrolls toward it, the grid wipes away column-by-column using a CSS clip-path animation, revealing the heading underneath as if a draftsman is erasing construction lines. Below the heading, a single horizontal dimension line (with tick marks and an annotation arrow) traces out, measuring the width of the heading text — a direct visual metaphor for engineering drawing.

**Where.** `ProjectsSection.tsx`, replacing the current `motion.div` wrapping the `SectionHeading`.

**How.**
- Clip-path wipe: `clipPath: "inset(0 100% 0 0)"` animating to `"inset(0 0% 0 0)"` using `useTransform(scrollYProgress, [0, 0.5], ...)`.
- Dimension annotation: SVG absolutely positioned, path draws in via `pathLength` on scroll (same technique as Idea 1).
- Blueprint grid overlay: CSS `background-image: linear-gradient(...)` with a fixed opacity that fades to zero as scrollYProgress approaches 0.5.

**Estimated LOC.** 70–90 lines (modifications to `ProjectsSection.tsx` + new inline SVG annotation).

---

## Idea 5 — Confetti Burst on Perfect Quiz Score

**Impact: High (surprise value)**

**What it is.** When a user scores 10/10, a confetti burst fires from the center of the quiz result card. The confetti particles are small rectangles and circles in `#86EFAC`, `#FCA5A5`, and white — matching the existing palette. If score is 7–9, a smaller shimmer effect (just a few particles arcing up and fading). Below 7, no effect — the emotional calibration matters.

**Where.** `QuizSection.tsx`, triggered inside the `finished && score >= 7` branch. A lightweight canvas-based confetti function — not a heavy library.

**How.** Use a small `<canvas>` absolutely positioned over the quiz card, rendered only when `finished` is true. Implement a minimal particle system in `useEffect` (~60 lines): emit N particles at `canvas.width/2, canvas.height/2`, each with random velocity, gravity, rotation, and a lifetime counter. Use `requestAnimationFrame` for the loop; stop after 3 seconds and remove the canvas. No external library needed — this is well within the "canvas demo" pattern already established in `FormationDemo.tsx`.

For the perfect score only, also animate the score number with a brief `scale: [1, 1.3, 1]` spring pulse and add a short shimmer sweep across the score text.

**Estimated LOC.** 90–110 lines (new `ConfettiCanvas.tsx` component + modifications to `QuizSection.tsx`).

---

## Idea 6 — Vertical "Journey" Timeline Thread Running Through Experience

**Impact: High**

**What it is.** The current `TimelineItem` uses a static 1px left border and a plain dot. Upgrade this to a continuous animated thread: the vertical line draws itself downward as the user scrolls through the Experience section, so the line is always just slightly ahead of the card the user is reading — it feels like the story is being written in real time. Each dot pulses once with a ring-expand animation as its card enters view.

**Where.** `TimelineItem.tsx` and `ExperienceSection.tsx`.

**How.**
- In `ExperienceSection.tsx`, wrap all timeline items in a `ref`ed container. Use `useScroll({ target: containerRef })` to get `scrollYProgress`.
- Use `useTransform(scrollYProgress, [0, 1], ["0%", "100%"])` to control the `height` of the vertical accent line via a `scaleY` transform (origin: top).
- Replace the static border in `TimelineItem` with a shared line rendered by the parent, avoiding multiple 1px borders stacking.
- Each dot: `whileInView` triggers `scale: [0, 1.8, 1]` with `opacity: [0, 0.4, 0]` for the ring, plus `scale: [0, 1]` for the solid dot — 0.6s spring.

```tsx
// In ExperienceSection — the animated spine
<motion.div
  className="absolute left-0 top-0 w-px bg-[var(--color-accent)] origin-top"
  style={{ scaleY: scrollYProgress }}
/>
```

**Estimated LOC.** 50–70 lines (modifications to existing components, no new files needed).

---

## Idea 7 — Circuit Board Trace Decoration on the Contact Section

**Impact: Medium-High**

**What it is.** The Contact section currently has clean whitespace. Behind the contact card, render an SVG circuit board trace pattern — horizontal and vertical copper-colored lines with pads (small filled circles at intersections) and the occasional IC chip rectangle outline. The traces are static but use the accent color at very low opacity (4–6%). On dark mode they glow slightly. When the section enters the viewport, the trace paths draw themselves in (same `pathLength` technique). This is the most "mechatronics" visual motif possible — it directly answers "who designed this site".

**Where.** `ContactSection.tsx`, as an absolutely-positioned SVG background layer behind the card content.

**How.** Design a fixed SVG composition (approximately 800×400) with ~8 trace paths hand-authored as path data. No generative logic — a static, deterministic composition looks more intentional than random. The SVG uses `preserveAspectRatio="xMidYMid slice"` to fill the background. The draw-in uses a stagger: traces animate in sequence, 0.15s apart, so the board "routes" itself as you watch.

**Estimated LOC.** 100–130 lines (new `CircuitTraces.tsx` with hand-authored SVG paths, mounted inside `ContactSection.tsx`).

---

## Idea 8 — Smooth Horizontal Scroll Snap for the Games Section

**Impact: Medium-High**

**What it is.** The four engineering games (PID tuner, monitor arm IK, spot the distracted, prompt builder) are presumably in a grid or list. Instead of a vertical stack, place them in a horizontal scroll container with CSS scroll snap. The user swipes or uses arrow keys to advance through games. An indicator row of four dots below shows current position. The section heading pins to the top (sticky) while the card row scrolls, creating a reading depth effect.

**Where.** `GamesSection.tsx` (and whatever game card component it uses).

**How.**
- Container: `overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth`.
- Each card: `scroll-snap-align: start; flex-shrink: 0; width: calc(100vw - 4rem)` on mobile, `width: 480px` on desktop with multiple visible.
- Dot indicator: array of 4 dots, active one animates with `layoutId` (shared layout, same pattern as the nav underline already in `Navbar.tsx`).
- Keyboard accessibility: `onKeyDown` on the container handling ArrowLeft/ArrowRight.
- No JavaScript scrolling needed for the snap behavior — CSS handles it. JS only needed for the dot sync and keyboard nav.

**Estimated LOC.** 60–80 lines (modifications to `GamesSection.tsx` + new `GameCarousel.tsx` wrapper).

---

## Idea 9 — Page Load Sequence (Orchestrated Entry)

**Impact: Medium-High**

**What it is.** The current page load is handled by `ParticleFieldLoader` plus per-section `FadeInOnScroll`. The hero text appears in pieces (TextReveal + FadeInOnScroll with staggered delays), which is good. The improvement is to add a very brief (0.6s) full-page veil that lifts on mount — a near-black overlay that fades out — so the site's content appears as a deliberate reveal rather than elements appearing one by one in an uncoordinated way. Simultaneously, the `JP.` logo in the nav draws in as an SVG stroke before filling, once, on first load only.

**Where.** A new `PageVeil.tsx` mounted in `app/layout.tsx`, and a small modification to `Navbar.tsx` for the logo stroke-fill animation.

**How.**
- `PageVeil`: a `fixed inset-0 z-[200] bg-[var(--color-bg)]` div, `AnimatePresence` with `exit={{ opacity: 0 }}`, `transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}`. State flips to false in `useEffect(() => setVisible(false), [])`. Adds a subtle logo or name flash during the veil — a single centered `JP.` in large mono that fades out with the veil.
- Gate on `sessionStorage` so it only plays once per tab session, not on every navigation.
- `Navbar` logo: on first render only, brief `pathLength` draw on the `.` SVG circle.

**Estimated LOC.** 50–70 lines.

---

## Idea 10 — Gradient Text Headings with Scroll-Driven Shift

**Impact: Medium**

**What it is.** Section headings (`Projects`, `Experience`, `Contact`) currently render in `var(--color-text)` — solid, no treatment. Apply a two-stop gradient that shifts as the user scrolls: at the top of the section, the gradient runs from white-to-accent; by the time the user has scrolled halfway through, it has shifted to accent-to-white. The gradient position is driven by `useScrollYProgress` via a CSS custom property. On light mode the gradient goes from `#1c1917` to `#166534`. This is subtle enough not to be garish but adds dimension.

**Where.** Modify `SectionHeading.tsx` to accept a `gradient?: boolean` prop, default `true`.

**How.**
```css
/* Added to globals.css */
.heading-gradient {
  background: linear-gradient(
    135deg,
    var(--color-text) 0%,
    var(--color-accent-text) 50%,
    var(--color-text) 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```
The `background-position-x` shifts from `0%` to `100%` via a motion/react `style` prop bound to scroll. Falls back gracefully — if `-webkit-text-fill-color` is not supported, the text renders in normal color.

**Estimated LOC.** 25–35 lines (CSS class + `SectionHeading.tsx` modification).

---

## Idea 11 — Animated Favicon (Tab Activity Indicator)

**Impact: Medium (delight)**

**What it is.** When the tab loses focus (user switches away) the favicon cycles between two states: the normal `JP` favicon and a small blinking green dot favicon. When focus returns, it snaps back to normal. This is a tiny detail but it is memorable — it signals the site is "alive" and rewards users who come back to the tab.

**Where.** New `useFaviconAnimation.ts` hook, called once in `app/layout.tsx` or a client wrapper.

**How.**
- On `visibilitychange` event, start a `setInterval` at 1200ms that alternates `link[rel="icon"]` `href` between `/favicon.ico` and a tiny green-dot SVG encoded as a data URI.
- On `visibilitychange` back to visible, `clearInterval` and restore the original favicon.
- The green-dot SVG is 12 characters as a data URI: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><circle cx='8' cy='8' r='6' fill='%2386EFAC'/></svg>`.

**Estimated LOC.** 30–40 lines.

---

## Idea 12 — "Copy Email" Toast with Typewriter Confirmation

**Impact: Medium (micro-delight)**

**What it is.** In `ContactSection.tsx`, the email link should have a "copy to clipboard" interaction. When clicked, a small toast notification appears at the bottom of the viewport: a mono-font line that types out `junbyung.park@gmail.com copied.` character by character at ~40ms/character, then fades out after 2.5 seconds. The toast has the `grid-paper` background texture, 1px accent border, and a small green checkmark SVG that draws in simultaneously. It feels like a terminal confirmation — completely on-brand for an engineer.

**Where.** New `CopyToast.tsx` component + logic in `ContactSection.tsx`.

**How.**
- `navigator.clipboard.writeText(email)` on click.
- Toast: `fixed bottom-6 left-1/2 -translate-x-1/2`, `AnimatePresence` for mount/unmount.
- Typewriter: `useEffect` driving a `currentLength` state via `setInterval(40ms)`, rendering `text.slice(0, currentLength)` with a blinking cursor span.
- No external library needed.

**Estimated LOC.** 60–80 lines.

---

## Idea 13 — Skill Badge Proficiency Fill Animation

**Impact: Medium**

**What it is.** `SkillBadge` currently renders a name and a proficiency level. Add a visual proficiency fill: each badge has a subtle background fill that animates from left to right on `whileInView`, proportional to the proficiency percentage. At 100% (e.g., Python, SolidWorks) the badge is fully filled with `accent/15`. At 60% it fills 60% of the badge width. The fill is a `scaleX` transform on an absolutely positioned div inside the badge, origin left, so the border and text sit above it.

**Where.** `SkillBadge.tsx`.

**How.**
```tsx
// Inside SkillBadge
<motion.div
  className="absolute inset-0 rounded-full bg-[var(--color-accent)] origin-left"
  style={{ opacity: 0.12 }}
  initial={{ scaleX: 0 }}
  whileInView={{ scaleX: proficiency / 100 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
/>
```
No new component, no new file.

**Estimated LOC.** 15–20 lines (modification to existing `SkillBadge.tsx`).

---

## Idea 14 — Scrollbar as Section Progress Indicator

**Impact: Low-Medium (systemic polish)**

**What it is.** The existing `ScrollProgress` component presumably shows a thin top bar. Extend this: also colorize the custom scrollbar thumb to gradient from `var(--color-border)` at top to `var(--color-accent)` at bottom, so the scrollbar visually indicates how far through the content the user is. Additionally, render the scrollbar thumb proportionally wider in sections that are content-dense (Projects, Experience) and narrower for shorter sections. This is achieved purely through CSS — no JS required.

**Where.** `globals.css` only.

**How.**
```css
::-webkit-scrollbar-thumb {
  background: linear-gradient(
    to bottom,
    var(--color-border),
    var(--color-accent)
  );
}
```
This is a two-line CSS change, but the visual effect is disproportionately impactful: the accent color being present on the scrollbar ties the chrome to the content system.

**Estimated LOC.** 5–8 lines.

---

## Idea 15 — "System Status" Footer with Live UTC Clock

**Impact: Low-Medium (character)**

**What it is.** The footer currently contains standard links. Add a small "system status" row in mono font: three green indicator dots, each labeled `Systems nominal`, `Available for hire`, and a live UTC clock ticking in real time (`UTC 2026-03-30 14:23:07`). The clock updates every second. The three dots pulse gently using the existing `animate={{ scale: [1, 1.2, 1] }}` pattern already used for the hero status dot. This is a nod to engineering dashboards and HMIs — exactly the aesthetic a mechatronics engineer would appreciate. It also communicates availability and recency without stating it bluntly.

**Where.** `Footer.tsx`, a new inner row above the copyright line.

**How.**
- UTC clock: `useEffect` with `setInterval(1000)` updating a `Date` state, formatted via `toISOString().replace('T', ' ').slice(0, 19) + ' UTC'`.
- The three indicator dots reuse the existing `motion.div animate scale` pattern — no new animation primitives.
- Text: `text-xs font-mono text-[var(--color-text-muted)]`, with the dot in `var(--color-accent)`.

**Estimated LOC.** 40–55 lines.

---

## Priority Implementation Order

| # | Idea | Impact | LOC | Effort |
|---|------|--------|-----|--------|
| 1 | Signal waveform section dividers | Very High | 70 | Low |
| 2 | Animated stats bar in hero | Very High | 90 | Low |
| 3 | Custom engineering cursor | High | 110 | Medium |
| 5 | Confetti burst on perfect quiz | High | 100 | Medium |
| 6 | Animated timeline thread | High | 60 | Low |
| 4 | Blueprint reveal on projects heading | High | 80 | Medium |
| 7 | Circuit board traces on contact | Med-High | 115 | Medium |
| 8 | Horizontal scroll snap for games | Med-High | 70 | Medium |
| 9 | Page load veil sequence | Med-High | 60 | Low |
| 10 | Gradient text headings | Medium | 30 | Low |
| 11 | Animated favicon | Medium | 35 | Low |
| 12 | Copy-email typewriter toast | Medium | 70 | Low |
| 13 | Skill badge proficiency fill | Medium | 18 | Low |
| 14 | Scrollbar gradient | Med-Low | 6 | Low |
| 15 | System status footer clock | Med-Low | 48 | Low |

**Recommended quick wins (implement first):** Ideas 14, 13, 10, 11, 15 — these are under 55 lines each, zero risk of breaking existing interactions, and collectively add 0.3–0.4 points of polish.

**Recommended headline feature:** Ideas 1 + 2 together. The waveform dividers give the site a single defining visual motif that screams mechatronics, and the stats bar ensures the three strongest achievements (17%, A*A*A*A, 3rd place) are visible above the fold without scrolling past the hero. These two changes alone likely account for half the gap from 8.8 to 9.5.

---

## Design Constraints to Honour

All ideas above are designed to respect the existing system:

- Fonts: Space Grotesk / Inter / JetBrains Mono — no new fonts introduced
- Accent: #86EFAC dark / #166534 light — all new elements use existing tokens
- Motion library: motion/react only — no framer-motion, no GSAP
- Canvas demos: `devicePixelRatio` scaling (Idea 5 confetti canvas)
- Accessibility: `prefers-reduced-motion` respected in Ideas 3, 5, 9 (animations disabled or simplified)
- Touch: Ideas 3 and 8 are desktop-only or have touch-appropriate fallbacks
- WCAG AA: no new text-on-background combinations introduced at low contrast
