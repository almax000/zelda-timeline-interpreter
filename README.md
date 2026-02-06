# Zelda Timeline Interpreter

An interactive web tool for creating, visualizing, and sharing your own Zelda timeline theories. Built with React 19, React Flow, and Zustand.

## Features

- **Drag & Drop Timeline Builder** - Drag games from the sidebar onto the canvas to build your timeline
- **4 Branch Types** - Main (gold), Child (green), Adult (blue), Fallen Hero (purple) timeline connections
- **Official Timeline Preset** - Load the official Zelda timeline as a starting point
- **Multi-Language Support** - English, Japanese, Simplified Chinese, Traditional Chinese
- **Cover Art by Region** - Automatic cover art selection based on language with fallback
- **Undo/Redo** - Full undo/redo support with keyboard shortcuts (Cmd+Z / Cmd+Shift+Z)
- **Context Menu** - Right-click nodes/edges to delete, change branch types, or add labels
- **Export/Import** - Save as PNG, PDF, or JSON; import from JSON
- **Persistent State** - Timeline auto-saves to localStorage
- **28 Games** - Complete library including mainline, spin-offs, and canon titles

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| Vite 7 | Build tool |
| @xyflow/react | Node-edge graph visualization |
| Zustand + zundo | State management with undo/redo |
| Tailwind CSS v4 | Styling |
| i18next | Internationalization |
| Playwright | E2E testing |

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
    Toolbar/      # Branch selector, language switcher, export menu
    Sidebar/      # Game library with search
    UI/           # Reusable UI components
  stores/         # Zustand stores (timeline + settings)
  data/           # Game database + official timeline preset
  types/          # TypeScript types
  i18n/           # i18next configuration
  hooks/          # Custom hooks (undo/redo shortcuts)
  utils/          # Export/import utilities
e2e/              # Playwright E2E tests
public/
  covers/         # Game cover images by region (us/jp)
  locales/        # Translation files (en/ja/zh-CN/zh-TW)
```

## Deployment

Deployed on Vercel. The project uses Vite, which Vercel auto-detects for zero-config deployment.

```bash
# Preview production build locally
npm run build && npm run preview
```

## License

MIT
