# Office Furniture Procurement

Internal tool for managing office furniture procurement, selection, and order timeline tracking.

## Features

- **Add Furniture** - Paste product URLs to auto-scrape details (title, price, image, dimensions), then manually edit all fields
- **Browse & Select** - Gallery view of all items; add items to a shared order cart
- **Order Cart & Timeline** - View selected items with auto-calculated order deadlines based on move-in date and lead times
- **Floor Plans** - Upload floor plan images per office area; dimension-based fit checking for furniture items
- **Settings** - Configure office areas with room dimensions, set move-in date

## Tech Stack

- Next.js 14 (App Router)
- Prisma + SQLite
- Cheerio (HTML scraping)
- Tailwind CSS

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev

# Seed with sample data (3 furniture items + 6 office areas)
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Render

### 1. Create a new Web Service on Render

- Connect your Git repository
- **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `DATABASE_URL` = `file:./prisma/prod.db`
  - `NODE_ENV` = `production`

### 2. Persistent Disk (required for SQLite)

- Add a **Persistent Disk** in Render settings
- Mount path: `/opt/render/project/src/prisma`
- This ensures the SQLite database persists across deploys

### 3. Deploy

Push to your connected branch. Render will build and deploy automatically.

### Seed on first deploy

After the first deploy, open the Render shell and run:

```bash
npx tsx prisma/seed.ts
```

## Deploy to Railway

### 1. Create a new project

- Connect your Git repository
- Railway auto-detects Next.js

### 2. Configure

- **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `DATABASE_URL` = `file:./prisma/prod.db`
- Add a **Volume** mounted at `/app/prisma` for SQLite persistence

## Project Structure

```
src/
  app/
    page.tsx           # Add furniture item (with URL scraping)
    gallery/page.tsx   # Browse & select items (CEO view)
    cart/page.tsx       # Order cart with timeline
    floorplans/page.tsx # View/upload floor plans
    settings/page.tsx  # Office areas & move-in date
    edit/[id]/page.tsx # Edit existing item
    api/
      furniture/       # CRUD for furniture items
      scrape/          # URL scraping endpoint
      cart/            # Cart toggle endpoint
      settings/        # App settings (move-in date)
      areas/           # Office areas CRUD + floor plan upload
  lib/
    prisma.ts          # Prisma client singleton
    fit-check.ts       # Dimension fit-check logic
prisma/
  schema.prisma        # Database schema
  seed.ts              # Seed script
public/
  uploads/             # Floor plan uploads
```
