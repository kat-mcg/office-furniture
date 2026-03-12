# CLAUDE.md — Office Furniture Procurement

## Project Overview

Internal tool for managing office furniture procurement, selection, and order timeline tracking. Built with Next.js 14 App Router, Prisma ORM (SQLite), Tailwind CSS, and Cheerio for URL scraping.

## Architecture

```
src/
  app/
    page.tsx               # Add furniture item (URL scraping + manual form)
    gallery/page.tsx       # Browse & select items (CEO view)
    cart/page.tsx          # Order cart with timeline
    floorplans/page.tsx    # Upload and view floor plans
    settings/page.tsx      # Office areas & move-in date
    edit/[id]/page.tsx     # Edit existing furniture item
    api/
      furniture/           # CRUD: GET/POST (list/create), GET/PATCH/DELETE by [id]
      scrape/              # POST: scrape product URL for title/price/image/dimensions
      cart/                # POST: toggle item in cart; GET: cart summary
      settings/            # GET/PATCH: app-wide settings (move-in date)
      areas/               # CRUD for office areas + floor plan image upload
      categories/          # CRUD for furniture categories
  lib/
    prisma.ts              # Prisma client singleton (shared across routes)
    fit-check.ts           # Dimension fit-check logic for floor plans
prisma/
  schema.prisma            # Database schema
  seed.ts                  # Sample data seed (3 items + 6 office areas)
public/
  uploads/                 # Floor plan images (persisted on disk)
```

## Tech Stack

| Layer           | Technology                 |
| --------------- | -------------------------- |
| Framework       | Next.js 14 (App Router)    |
| Language        | TypeScript 5 (strict mode) |
| ORM / DB        | Prisma + SQLite            |
| Styling         | Tailwind CSS 3             |
| Scraping        | Cheerio                    |
| File uploads    | Multer                     |
| Package manager | npm                        |

## Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client (required after schema changes)
npx prisma generate

# Create/migrate local database
npx prisma migrate dev

# Seed with sample data
npx tsx prisma/seed.ts

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Type check (no emit)
npx tsc --noEmit

# Lint
npm run lint

# Format (write)
npm run format

# Format check (CI)
npm run format:check
```

## Environment Variables

| Variable       | Description                       | Example                      |
| -------------- | --------------------------------- | ---------------------------- |
| `DATABASE_URL` | Prisma database connection string | `file:./prisma/dev.db`       |
| `NODE_ENV`     | Node environment                  | `development` / `production` |

## Code Style

- **TypeScript strict mode** — all code must typecheck cleanly (`npx tsc --noEmit`)
- **Prettier** — format with `npm run format`; enforced in CI via `npm run format:check`
- **ESLint** — `next/core-web-vitals` + `next/typescript`; run with `npm run lint`
- **No `any`** — avoid TypeScript `any`; use proper types or `unknown`
- **Server Components by default** — use `"use client"` only when browser APIs or state are needed
- **API routes** — all in `src/app/api/`; use Next.js Route Handler conventions (`export async function GET(request: Request)`)
- **Prisma client** — always import from `@/lib/prisma` (singleton), never instantiate directly

## Patterns & Conventions

### Prisma Client

```ts
// Always use the singleton from lib/prisma
import prisma from "@/lib/prisma";
```

### API Route Structure

```ts
// src/app/api/resource/route.ts
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }

// src/app/api/resource/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) { ... }
```

### File Uploads

- Multer handles multipart uploads in API routes
- Uploaded files go to `public/uploads/`
- File paths stored in DB as relative URLs (`/uploads/filename`)

## Deployment

See README.md for Render and Railway deployment instructions. SQLite requires a persistent disk/volume mounted at the `prisma/` directory.

## CI/CD

| Workflow           | Trigger         | What it checks              |
| ------------------ | --------------- | --------------------------- |
| `eslint.yml`       | push/PR to main | ESLint                      |
| `typecheck.yml`    | push/PR to main | TypeScript (`tsc --noEmit`) |
| `prettier.yml`     | push/PR to main | Prettier format             |
| `nextjs-build.yml` | push/PR to main | Next.js production build    |
