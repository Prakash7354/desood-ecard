# Desood eCard

Mobile-first digital business card for **Desood**, UK architectural design and planning.
Live at `https://card.desood.com`.

Built with React + TypeScript, Vite, Tailwind CSS and shadcn/ui. The whole card lives in `src/pages/Index.tsx`;
brand colours are HSL tokens in `src/index.css` (`--ink`, `--paper`, `--red`, `--red-deep`, ...).

Enquiries open the visitor's email app addressed to `info@desood.com` (no backend or CRM).

## Requirements

- Node.js 18+ (LTS recommended)
- npm

## Getting started

```bash
npm install
npm run dev
```

## Available scripts

- `npm run dev` - start Vite in development mode
- `npm run build` - create a production build in `dist/`
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint checks
- `npm run test` - run Vitest tests once

## Deploying (Cloudflare Pages)

Connected to this GitHub repo; every push to `main` redeploys.

- Framework preset: **Vite** (or None)
- Build command: `npm run build`
- Build output directory: `dist`
- Custom domain: `card.desood.com`

The app is a single-page app; Cloudflare Pages serves `index.html` for unknown paths automatically
because there is no top-level `404.html`.

## Lockfile policy

This repository does not track `package-lock.json`.
