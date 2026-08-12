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

## Design

- Palette is pulled from `logo.png`: crimson against paper and ink.
- One theme. Light by default, tokens swap under `prefers-color-scheme: dark`.
  Contrast blocks (hero, main stage, playground) use `--inv-*` so they flip
  with the theme instead of inverting against it.
- Shape rule: surfaces and images are square, only pills are rounded.
- Type: Anton (display), Space Grotesk (UI), Space Mono (labels).
- The hero is three overlapping skewed type layers with the logo mark sitting
  between them. The back layer is stroke-only with a chromatic edge.
- Event screenshots are `contain`, never `cover`: cropping one crops the joke
  out of it. A blurred copy of the same image fills the leftover box.

## Motion

Each animation has one job:

- hero layers and parallax, the type reads as one surface with depth
- ticker, carries the six event names
- manifesto word fade, sets reading pace
- main stage image drift
- sticky stack, each event holds the viewport on its own turn
- section reveal, stops content popping in
- counters, emphasis on the three numbers
- drag puzzle, the payoff

Everything honours `prefers-reduced-motion`.

## Dependencies

GSAP (ScrollTrigger, Draggable) and Lenis, both from jsDelivr. Fonts from Google Fonts.
The page needs a network connection for those; nothing else is external.

## Events

Skribbl is the main stage. The rest: Pinterest Finds, Memify, Design Wordle,
Hexcodle, No-Lift Drawing. One unified scoreboard runs across all six.
