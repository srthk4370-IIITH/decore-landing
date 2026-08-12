# Compositions: Design Battles

Event site for **Decore's** design battle night. Static: no build step, no bundler.
Open `index.html`, or serve the folder with any static server.

```bash
python -m http.server 8123
```

## Structure

| File | What it holds |
| --- | --- |
| `index.html` | All markup, one page |
| `styles.css` | Tokens, layout, theme |
| `main.js` | Motion layer and the drag puzzle |
| `assets/` | Logo, prize photograph, and one screenshot per event |

## Layout

Mobile first. Base rules are the phone layout; larger screens are additive
`min-width` blocks at 600px, 900px and 1200px. `--pad` and `--gap` step up at
those breakpoints so the vertical rhythm scales with the viewport.

## Design

- One palette, dark throughout. Alternating light and dark sections is what
  made the page read as three different sites stitched together.
- Crimson comes from `logo.png`.
- Shape rule: surfaces and images are square, only pills are rounded.
- Type: Anton (display), Space Grotesk (UI), Space Mono (labels).
- The hero is three overlapping skewed type layers with a glass letter threaded
  between them: three copies of one glyph stacked as bloom, iridescent body and
  bright rim. The back type layer is stroke-only with a chromatic edge.
- Event screenshots are `contain`, never `cover`: cropping one crops the joke
  out of it. A blurred copy of the same image fills the leftover box.

## Motion

The page is scroll-led. Most of this is scrubbed by scroll position rather than
fired once, so the page responds continuously as you move.

- hero, type layers separate and the glass letter drifts and turns
- ticker, carries the six event names
- manifesto, words ink in at reading pace
- main stage, pinned sequence: the word pans, the image wipes open, facts land
- battles, sticky stack where each card shrinks under the next
- prizes, photograph parallax and podium rows on scrub
- footer, the wordmark skews back toward upright

Two traps worth remembering if you edit `main.js`:

- Inside a scrubbed, refreshing timeline use `fromTo`, never `from`. A `from`
  tween re-records whatever the element shows at refresh time and sticks at
  opacity 0.
- Pin an inner wrapper, not a section. A pinned element keeps the width it was
  measured at, and a stale measurement pushes the page wider than the viewport.

Everything honours `prefers-reduced-motion`.

## Dependencies

GSAP (ScrollTrigger, Draggable) and Lenis, both from jsDelivr. Fonts from Google Fonts.
The page needs a network connection for those; nothing else is external.

## Events

Skribbl is the main stage. The rest: Pinterest Finds, Memify, Design Wordle,
Hexcodle, No-Lift Drawing. One unified scoreboard runs across all six.
