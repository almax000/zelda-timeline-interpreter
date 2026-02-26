# Zelda Timeline Interpreter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/demo-live-brightgreen)](https://zelda-timeline-interpreter.vercel.app)

> *For the theorists who've spent years debating where Breath of the Wild fits, whether the Downfall Timeline makes sense, and what Echoes of Wisdom means for the whole picture.*

An open-source, visual timeline builder made for the Zelda theory community. Drag games onto an infinite canvas, connect them with branching paths, annotate your reasoning, and share your theory with a single link.

**[Try it now](https://zelda-timeline-interpreter.vercel.app)** -- no sign-up, no backend, runs entirely in your browser.

## Why This Exists

The Zelda timeline is one of the most debated topics in gaming. Every new release reshuffles the puzzle. But most discussions happen in text -- long forum posts, Reddit threads, YouTube scripts -- with no easy way to *show* what you mean.

This tool gives theorists a canvas to build their vision of the timeline, visually. Start from the official timeline or a blank canvas, rearrange to match your theory, draw annotations to highlight connections, and export a shareable image or link.

## What You Can Do

- **Build your theory** -- Drag all 28 games (21 mainline + 7 spin-offs) onto the canvas
- **Branch the timeline** -- 4 color-coded branch types: Main (gold), Child (green), Adult (blue), Fallen Hero (purple)
- **Mark key events** -- Add event nodes between games to explain splits and connections
- **Annotate freely** -- Draw directly on the canvas with the pen tool to circle, underline, or connect ideas
- **Start from the official timeline** -- Load the Hyrule Historia / Nintendo official layout as a base, then modify
- **Compare theories side by side** -- Multi-tab support lets you work on multiple timelines at once
- **Share with one click** -- Export as PNG, PDF, or JSON; share via URL so others can view and remix
- **Snap to grid** -- Smart alignment guides keep your layout clean
- **Undo everything** -- Full undo/redo history (Cmd+Z / Cmd+Shift+Z)
- **Play in your language** -- English, Japanese, Simplified Chinese, Traditional Chinese

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| [React 19](https://react.dev) | UI framework |
| [Vite 7](https://vite.dev) | Build tool |
| [@xyflow/react](https://reactflow.dev) | Node-edge graph visualization |
| [Zustand](https://zustand.docs.pmnd.rs) + [zundo](https://github.com/charkour/zundo) | State management with undo/redo |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [i18next](https://www.i18next.com) | Internationalization |
| [Playwright](https://playwright.dev) | E2E testing |

## Quick Start

```bash
npm install
npm run dev        # Dev server at localhost:2104
npm run build      # Production build
npm run test:e2e   # Playwright E2E tests
```

## Project Structure

```
src/
  components/
    Canvas/       # React Flow canvas, game nodes, edges, context menu
    Toolbar/      # Branch selector, drawing tools, export menu
    Sidebar/      # Game library with search
    UI/           # Reusable UI components
  stores/         # Zustand stores (timeline + settings)
  data/           # Game database + official timeline preset
  types/          # TypeScript types
  i18n/           # i18next configuration
  hooks/          # Custom hooks
  utils/          # Export/import utilities
e2e/              # Playwright E2E tests
public/
  covers/         # Game cover images by region (us/jp)
  locales/        # Translation files (en/ja/zh-CN/zh-TW)
```

## Contributing

Whether you want to add a missing game, improve translations, fix bugs, or propose new features -- contributions from fellow Zelda fans are very welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
