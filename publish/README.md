# Zelda Timeline Interpreter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/demo-live-brightgreen)](https://zelda-timeline-interpreter.vercel.app)

An interactive web tool for creating, visualizing, and sharing your own Zelda timeline theories.

**[Live Demo](https://zelda-timeline-interpreter.vercel.app)**

## Features

- **Drag & Drop Timeline Builder** - Drag games from the sidebar onto the canvas
- **4 Branch Types** - Main (gold), Child (green), Adult (blue), Fallen Hero (purple)
- **Event Nodes** - Add custom text events between games
- **Smart Snap Guides** - Alignment guides for precise node positioning
- **Official Timeline Preset** - Load the official Zelda timeline as a starting point
- **Multi-Language** - English, Japanese, Simplified Chinese, Traditional Chinese
- **Cover Art by Region** - Automatic cover art selection based on language
- **Undo/Redo** - Full history with keyboard shortcuts (Cmd+Z / Cmd+Shift+Z)
- **Canvas Annotations** - Draw directly on the canvas with pen tool
- **Context Menu** - Right-click to delete, change branch types, or add labels
- **Export/Import** - Save as PNG, PDF, or JSON; import and share via URL
- **Multi-Tab** - Work on multiple timelines simultaneously
- **28 Games** - Complete library including mainline and spin-off titles

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
# Install dependencies
npm install

# Start dev server (port 2104)
npm run dev

# Build for production
npm run build

# Run E2E tests
npm run test:e2e
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

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
