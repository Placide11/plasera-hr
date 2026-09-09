# Plasera HR — Mini HR Management System

A small HR / employee CRM built for the Plasera Software Developer Intern
technical assessment: a dashboard, employee directory with search and
filtering, employee profiles, department management, and leave request
approval.

## Live demo

- Deployed app: https://plasera-hr.vercel.app
- Loom walkthrough:

## Features

- **Dashboard** — headcount, active/on-leave counts, department breakdown,
  a recent activity feed, and a callout for pending leave requests.
- **Employee management** — searchable, filterable directory (by name,
  email, title, department, status); add, view, edit, and delete employees.
- **Employee profile** — personal and employment info, manager and direct
  reports, leave history, and a per-employee activity log.
- **Departments** — create, rename, edit, and delete departments; deleting
  a department that still has employees assigned is blocked with a clear
  error rather than silently orphaning records.
- **Leave management** — submit a leave request, filter by status, and
  approve/reject pending requests inline.
- **Responsive UI** — a collapsible sidebar on mobile, responsive tables,
  and forms that work down to a phone-width viewport.

## Technology stack

| Layer      | Choice                                                        |
| ---------- | -------------------------------------------------------------- |
| Framework  | Next.js 15 (App Router) + TypeScript                           |
| Styling    | Tailwind CSS v4, custom design tokens (no UI kit)               |
| Database   | Postgres, via **Drizzle ORM** + [Neon](https://neon.tech) (serverless HTTP driver) |
| Validation | Zod                                                              |
| Icons      | lucide-react                                                     |
| Deployment | Vercel                                                           |

### Why Drizzle instead of Prisma?

The brief suggests Prisma, and this project started with it. Prisma's CLI
downloads a native query-engine binary from Prisma's own CDN on
`postinstall`, and that endpoint was unreachable in my initial development
environment. Rather than ship something I hadn't actually run, I switched
to **Drizzle ORM**, which has no such build-time network dependency, is
fully type-safe, and is a well-established, "appropriate Node.js approach"
per the brief. It also generates plain SQL rather than relying on a
bespoke query engine, which is easier to reason about for a project this
size. Prisma would work equally well here — this was a practical, not
dogmatic, choice, and I can speak to that trade-off in the walkthrough.

### Why Neon's HTTP driver specifically

The database runs on [Neon](https://neon.tech). Rather than a raw
Postgres TCP connection (`postgres-js`), the app uses
`@neondatabase/serverless` with Drizzle's `neon-http` adapter, which talks
to Postgres over HTTPS instead of the raw wire protocol on port 5432. Two
reasons: it's the driver Neon recommends for serverless/edge environments
like Vercel functions (no persistent connection pooling to manage), and in
practice it also proved far more reliable from restrictive local networks
than a raw TCP connection during development.

## Project structure

```
src/
  app/
    (dashboard)/        # authenticated app shell: dashboard, employees, departments, leave
    api/                # REST-ish route handlers (employees, departments, leave)
  components/
    layout/              # sidebar, app shell, page header
    ui/                  # small reusable primitives (button, badge, panel, field...)
    employees/ departments/ leave/   # feature-specific components
  db/
    schema.ts            # Drizzle table definitions (Postgres)
    seed.ts               # sample data
    index.ts              # DB client (Neon HTTP driver)
  lib/
    data.ts               # server-side read queries used by pages
    utils.ts               # formatting / class-name helpers
```

Pages fetch data directly from the database in Server Components (via
`src/lib/data.ts`); mutations (create/update/delete) go through the API
routes under `src/app/api/*` and are called from client components, which
keeps validation and business rules in one place per resource. The
dashboard, department, and employee-profile pages are explicitly marked
`export const dynamic = "force-dynamic"` so they always query fresh data
rather than being statically cached at build time — the employee list and
leave pages get this for free since they read from `searchParams`.

## Setup instructions

### Prerequisites

- Node.js 20+
- npm
- A Postgres database — this project uses [Neon](https://neon.tech)'s free
  tier; [Supabase](https://supabase.com) or any other Postgres provider
  works too, but you'd swap the driver in `src/db/index.ts` from
  `drizzle-orm/neon-http` to `drizzle-orm/postgres-js` (or the
  provider-specific equivalent).

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example file:

```bash
cp .env.example .env
```

| Variable       | Description                                                          |
| -------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL` | Your Postgres connection string (Neon dashboard → Connection Details).   |

For local development, either use the same Neon database as production or
create a separate branch/database in Neon so local testing doesn't touch
production data.

### 3. Database setup

```bash
npm run db:push    # create tables from src/db/schema.ts
```

If your local network has trouble reaching Postgres directly (this
happened during development — see note below), generate SQL instead and
run it through Neon's browser SQL Editor:

```bash
npx drizzle-kit generate   # writes a .sql file into ./drizzle
```

Then:

```bash
npm run db:seed       # populate with sample departments, employees, and leave requests
```

`npm run db:studio` opens Drizzle Studio if you want to browse the data.

The seeded admin user is `admin@plasera.dev` (see `src/db/seed.ts` for the
generated password hash) — there is no login screen wired up yet; see
"Known limitations" below.

> **Note on local networking:** during development, direct TCP connections
> from a Windows/WSL2 machine to Neon's Postgres endpoint (port 5432, and
> in one case even HTTPS on 443) were unreliable on certain networks. If
> `db:push` or `db:seed` time out locally, generating SQL and running it
> through Neon's web SQL Editor works around it reliably, since that never
> leaves the browser. This didn't affect Vercel's build/runtime
> environment at all.

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import it in Vercel.
3. Set `DATABASE_URL` in the Vercel project's environment variables
   (your Neon connection string).
4. Deploy. Vercel will run `npm run build` automatically.
5. Run `npm run db:push` and `npm run db:seed` against the same
   `DATABASE_URL` (locally, or via Neon's SQL Editor for the schema —
   see the networking note above) so the deployed app has data.

## AI usage

I used Claude to help scaffold this project: setting up the Next.js/
Tailwind/Drizzle stack, writing the CRUD API routes and Zod validation,
and building out the page components against the design tokens I
specified. I reviewed and adjusted the generated code as I went — the
Prisma → Drizzle switch and the raw-TCP → Neon HTTP driver switch were
both decisions I made in response to real errors I hit, not something
Claude suggested unprompted — and I tested locally and in production
throughout rather than accepting anything untested. I can walk through
any part of the implementation, including the deployment troubleshooting,
in the Loom video or during review.

## Assumptions

- A single implicit "HR Admin" role is enough for this assessment; there's
  no login screen (see limitations).
- Deleting an employee also deletes their leave history and activity log,
  rather than soft-deleting, to keep the data model simple. In a real
  product this would likely be a deactivation instead.
- "Recent activity" is a simple log of profile/status/leave changes,
  written automatically by the API routes rather than a separate
  audit-log service.

## Known limitations

- **No authentication.** The sidebar shows a static "HR Admin" — there's
  no login, session, or role enforcement. All routes are open.
- **No pagination.** The employee and leave tables load all rows at once;
  fine at this data size, but would need pagination or virtualization at
  real scale.
- **No file uploads.** Employee avatars are generated initials rather than
  uploaded photos.
- **No optimistic UI / toasts.** Mutations show inline loading and error
  states but there's no global toast system for success confirmations.

## Future improvements

Given another week, I'd prioritize, in order:

1. Real authentication (NextAuth with credentials or magic link), plus
   route-level role checks for HR vs. a read-only employee role.
2. Pagination and column sorting on the employee and leave tables.
3. A lightweight audit trail (who changed what, not just what changed).
4. Bulk actions (e.g. approve multiple leave requests, bulk department
   reassignment).
5. Basic automated tests (Vitest for the API route handlers and Zod
   schemas, Playwright for a couple of critical user flows).