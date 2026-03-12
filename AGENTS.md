# AGENTS.md — AI Agent Guidelines

## Overview

This document provides guidelines for AI coding agents (Claude, Copilot, etc.) working in this repository.

## Before Making Changes

1. Read `CLAUDE.md` for project architecture, commands, and conventions
2. Run `npx tsc --noEmit` to verify the baseline typechecks
3. Run `npm run lint` to verify the baseline lints cleanly
4. Run `npm run format:check` to check formatting baseline

## Code Quality Requirements

Every change must pass all of these before being committed:

```bash
npx tsc --noEmit       # TypeScript must typecheck cleanly
npm run lint           # ESLint must pass (zero warnings)
npm run format:check   # Prettier formatting must be correct
```

To auto-fix formatting:

```bash
npm run format         # Writes Prettier formatting in place
```

## TypeScript Rules

- **No `any`** — always use explicit types or `unknown`
- **Strict null checks** — handle `null`/`undefined` explicitly (strict mode is on)
- **No `@ts-ignore`** — fix the underlying type error instead
- **No `@ts-expect-error`** unless absolutely necessary and documented why
- Import types with `import type { ... }` when the import is type-only

## React / Next.js Rules

- **Server Components by default** — only add `"use client"` when genuinely needed
- **No `useEffect` for data fetching** — fetch in Server Components or Route Handlers
- **No inline styles** — use Tailwind CSS utility classes
- **Image optimization** — use `next/image` for `<img>` tags when possible
- **Link navigation** — use `next/link` `<Link>` for internal navigation, not `<a href>`

## Database Rules (Prisma)

- **Always use the singleton client** from `@/lib/prisma` — never `new PrismaClient()`
- **Schema changes require a migration** — run `npx prisma migrate dev --name <description>`
- **Run `npx prisma generate`** after any schema change before building
- **No raw SQL** in API routes — use the Prisma query API

## API Routes

- All API routes live under `src/app/api/`
- Use Next.js Route Handler exports: `GET`, `POST`, `PATCH`, `DELETE`
- Return `Response.json(...)` or `NextResponse.json(...)` with appropriate HTTP status codes
- Handle errors with `try/catch` and return structured `{ error: string }` responses
- File uploads use Multer; save to `public/uploads/`

## Testing Approach

There are no automated tests currently. When adding new logic:

- For pure utility functions (like `src/lib/fit-check.ts`), write unit tests
- For API routes, manually test with `curl` or a REST client against `npm run dev`
- Verify Prisma queries work with `npx prisma studio`

## Code Review Checklist

Before submitting code for review, verify:

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run format:check` passes (or `npm run format` was run)
- [ ] New API routes return correct HTTP status codes (200, 201, 400, 404, 500)
- [ ] No secrets, credentials, or environment values hardcoded in source
- [ ] No `console.log` debug statements left in production code
- [ ] Prisma schema changes include a migration file
- [ ] `npx prisma generate` was run after schema changes
- [ ] The `public/uploads/` directory is gitignored (existing)

## Common Pitfalls

| Pitfall                     | Fix                                                             |
| --------------------------- | --------------------------------------------------------------- |
| Prisma client not found     | Run `npx prisma generate`                                       |
| Build fails on missing env  | Set `DATABASE_URL` in `.env.local`                              |
| Type error on Prisma models | Re-run `npx prisma generate` after schema changes               |
| "use client" needed         | Add `"use client"` at top of file when using hooks/browser APIs |
| Multer type errors          | Use `@types/multer` types; cast `request` appropriately         |
