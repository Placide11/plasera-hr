A small HR / employee CRM built for the Plasera Software Developer Intern
technical assessment: a dashboard, employee directory with search and
filtering, employee profiles, department management, and leave request
approval.

## Live demo

- Deployed app: 
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

| Layer      | Choice                                               |
| ---------- | ----------------------------------------------------- |
| Framework  | Next.js 15 (App Router) + TypeScript                  |
| Styling    | Tailwind CSS v4, custom design tokens (no UI kit)      |
| Database   | SQLite (dev), via **Drizzle ORM** + `better-sqlite3`   |
| Validation | Zod                                                    |
| Icons      | lucide-react                                           |
| Deployment | Vercel                                                 |

### Why Drizzle instead of Prisma?

The brief suggests Prisma, and this project started with it. Prisma's CLI
downloads a native query-engine binary from Prisma's own CDN on
`postinstall`; in my development sandbox that endpoint was unreachable, so
I couldn't verify the app end-to-end. Rather than ship something I hadn't
actually run, I switched to **Drizzle ORM**, which has no such build-time
network dependency, is fully type-safe, and is a well-established,
"appropriate Node.js approach" per the brief. It also generates plain SQL
migrations rather than relying on a bespoke engine, which is easier to
reason about for a project this size. Prisma would work equally well here
— this was a practical, not dogmatic, choice, and I can speak to that
trade-off in the walkthrough.

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
    schema.ts            # Drizzle table definitions
    seed.ts               # sample data
    index.ts              # DB client
  lib/
    data.ts               # server-side read queries used by pages
    utils.ts               # formatting / class-name helpers
```

Pages fetch data directly from the database in Server Components (via
`src/lib/data.ts`); mutations (create/update/delete) go through the API
routes under `src/app/api/*` and are called from client components, which
keeps validation and business rules in one place per resource.

## Setup instructions

### Prerequisites

- Node.js 20+
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example file:

```bash
cp .env.example .env
```

| Variable       | Description                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Path to the local SQLite file in dev (`dev.db`), or a Postgres URL in production (see below).      |

### 3. Database setup

```bash
npm run db:push    # create tables from src/db/schema.ts
npm run db:seed     # populate with sample departments, employees, and leave requests
```

`npm run db:studio` opens Drizzle Studio if you want to browse the data.

The seeded admin user is `admin@plasera.dev` (see `src/db/seed.ts` for the
generated password hash) — there is no login screen wired up yet; see
"Known limitations" below.

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Switching to Postgres for production

SQLite is great for local development but Vercel's filesystem is
ephemeral, so a deployed instance needs a real database. To switch:

1. Provision a Postgres database (e.g. [Neon](https://neon.tech) or
   [Supabase](https://supabase.com), both of which have free tiers that
   work well with Vercel).
2. Change the imports in `src/db/schema.ts` from `drizzle-orm/sqlite-core`
   to `drizzle-orm/pg-core` (`sqliteTable` → `pgTable`; the `text`/`integer`
   column builders map closely — see the
   [Drizzle Postgres docs](https://orm.drizzle.team/docs/column-types/pg)).
3. Change `src/db/index.ts` to use `drizzle-orm/postgres-js` (or
   `drizzle-orm/neon-http` for Neon) instead of `drizzle-orm/better-sqlite3`.
4. Update `drizzle.config.ts`'s `dialect` to `"postgresql"`.
5. Set `DATABASE_URL` to your Postgres connection string in Vercel's
   environment variables, then run `npm run db:push` and `npm run db:seed`
   against it (e.g. via `vercel env pull` locally, or a one-off script).

I kept this as a documented follow-up rather than building it up front,
since it isn't needed to demonstrate the app's functionality locally or in
a preview deployment, and I'd rather be upfront about that than pretend it
was production-ready out of the box.

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import it in Vercel.
3. Set `DATABASE_URL` in the Vercel project's environment variables
   (pointing at a hosted Postgres instance — see above).
4. Deploy. Vercel will run `npm run build` automatically.

## AI usage

I used Claude to help scaffold this project: setting up the Next.js/
Tailwind/Drizzle stack, writing the CRUD API routes and Zod validation,
and building out the page components against the design tokens I
specified. I reviewed and adjusted the generated code as I went (for
example, the Prisma → Drizzle switch above was a decision I made and had
Claude execute, not something it suggested unprompted) and ran the app
locally throughout to check behavior rather than accepting anything
untested. I can walk through any part of the implementation in the Loom
video or during review.

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
- **SQLite in dev only.** As noted above, a Postgres swap is documented
  but not wired up, since Vercel's filesystem doesn't persist SQLite
  writes between deployments.

## Future improvements

Given another week, I'd prioritize, in order:

1. Wire up the documented Postgres switch and add real authentication
   (NextAuth with credentials or magic link, plus route-level role checks
   for HR vs. a read-only employee role).
2. Pagination and column sorting on the employee and leave tables.
3. A lightweight audit trail (who changed what, not just what changed).
4. Bulk actions (e.g. approve multiple leave requests, bulk department
   reassignment).
5. Basic automated tests (Vitest for the API route handlers and Zod
   schemas, Playwright for a couple of critical user flows).
