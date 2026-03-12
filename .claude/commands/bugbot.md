---
description: Review code changes for potential issues and improvements
allowed-tools: Read, Bash, Grep, Glob
---

Review the diff for real bugs and correctness issues. Focus on problems that would break production, lose data, or cause incorrect behavior.

## What to Look For
- Logic bugs (wrong conditions, swapped arguments, incorrect returns)
- Data correctness (billing errors, double-counting, cross-user data leaks)
- Missing cleanup (resources not freed, subscriptions not cancelled)
- Security issues (credentials in logs, missing auth checks)
- API contract violations (wrong status codes, missing fields)
- Irreversible mistakes (destructive ops without confirmation)
- Race conditions only when there's a concrete scenario
- Contradictions within the same PR
- Violations of CLAUDE.md / AGENTS.md patterns (e.g. instantiating `new PrismaClient()` instead of using `@/lib/prisma`)

## What to Skip
- Don't suggest adding try/catch unless there's a specific demonstrated failure mode that causes data loss. If a route already handles errors internally, don't suggest the caller also wrap it.
- Only flag code duplication when it's significant — e.g., multiple routes implementing the same query, or reimplementing logic that already exists in a lib function. Don't flag small-scale duplication like similar constants or two components with overlapping markup.
- Don't flag pure style issues — import ordering, `Optional` vs union types, lint exceptions for pre-existing code. Do flag React antipatterns (useEffect for data fetching, missing keys in lists, etc.).
- Don't flag theoretical issues — speculative SQLite failures, self-correcting race conditions, edge cases requiring malformed input from the user's own browser.
- Dead code from the current PR is worth flagging as Low severity, but don't flag pre-existing dead code or elevate it above Low.

## Project-Specific Checks
- **Prisma singleton**: flag any `new PrismaClient()` — always use `@/lib/prisma`
- **Server Components**: flag unnecessary `"use client"` directives
- **TypeScript**: flag `any` types or `@ts-ignore` without explanation
- **Environment variables**: flag hardcoded secrets or DB connection strings
- **File uploads**: verify uploaded files are saved to `public/uploads/` and paths stored correctly
- **Migrations**: flag Prisma schema changes without a corresponding migration file

## Severity Guidelines
- **High**: breaks production, loses data, leaks user data, corrupts database state, exposes credentials
- **Medium**: incorrect behavior users will notice, API returning wrong status codes, missing error handling for common cases, violating a specific AGENTS.md rule
- **Low**: dead code from this PR, minor inconsistencies, missing optional improvements. When unsure between Medium and Low, choose Low.
