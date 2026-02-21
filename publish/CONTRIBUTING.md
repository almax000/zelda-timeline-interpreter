# Contributing to Zelda Timeline Interpreter

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/zelda-timeline-interpreter.git
   cd zelda-timeline-interpreter
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:2104

## Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Make your changes
3. Verify your changes:
   ```bash
   npm run build      # Type check + production build
   npm run lint        # ESLint
   npm run test:e2e    # Playwright E2E tests
   ```
4. Commit and push:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feat/your-feature
   ```
5. Open a Pull Request

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**Examples:**
- `feat(canvas): add edge label editing`
- `fix(i18n): restore language on reload`
- `docs: update README with new features`

## Adding a New Game

Game data lives in `src/data/games.ts`. To add a game:

1. Add the game entry with all required fields
2. Add cover images to `public/covers/us/` and `public/covers/jp/`
3. Add translated names in all locale files under `public/locales/`

## Adding a New Language

1. Create a new translation file in `public/locales/<lang>/translation.json`
2. Copy the structure from `public/locales/en/translation.json`
3. Register the language in `src/i18n/index.ts`
4. Add the language option in `src/components/Sidebar/LanguageDropdown.tsx`
5. Map the language to a cover region in `src/stores/settingsStore.ts`

## Code Style

- TypeScript strict mode, no `any`
- Functional components with hooks
- Zustand for state management
- Tailwind CSS v4 for styling

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
