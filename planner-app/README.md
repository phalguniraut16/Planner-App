# MyLife Planner

Complete personal life management system — tasks, habits, calendar, study planner, finance, notes, goals, analytics, and more.

Built with React + Vite + TypeScript + Tailwind CSS + shadcn/ui primitives + Supabase (PostgreSQL + Auth + RLS).

## Tech Stack

- Frontend: React 18, TypeScript, Vite
- Styling: Tailwind CSS
- Icons: Lucide React
- Forms: React Hook Form + Zod
- Charts: Recharts
- Calendar: FullCalendar (or equivalent)
- Dates: date-fns
- Backend/DB: Supabase (PostgreSQL, Auth, Realtime)
- PWA: Vite PWA plugin
- Hosting: Vercel / Cloudflare Pages (free tier)

## Getting Started

### 1. Clone and install

```bash
cd planner-app
npm install
```

### 2. Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env` and fill in your Supabase URL and anon key:

```bash
cp .env.example .env
```

3. Open the SQL Editor in your Supabase dashboard.
4. Run the migration file: `supabase/migrations/001_initial_schema.sql`
5. (Optional) Enable Email Auth templates and configure SMTP if you want email verification.

### 3. Run locally

```bash
npm run dev
```

Open `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to Vercel or Cloudflare Pages.

## Project Structure

```
planner-app/
├── supabase/migrations/          # SQL migrations (RLS enabled)
├── src/
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Router + providers
│   ├── index.css                 # Tailwind + CSS variables
│   ├── lib/                      # Supabase client, utils, currency, dates
│   ├── types/                    # TypeScript types (database.ts generated from Supabase)
│   ├── contexts/                 # AuthProvider, ThemeProvider
│   ├── components/ui/            # shadcn-style primitives (Button, Input, Card, ...)
│   ├── components/layout/        # Sidebar, Navbar, Layout
│   ├── components/dashboard/     # Dashboard widgets
│   ├── pages/                    # Route pages (Login, SignUp, Dashboard, Tasks, ...)
│   └── hooks/                    # Custom hooks (useTasks, useHabits, ...)
├── .env.example                  # Environment variable template (never commit .env)
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## Authentication

- Email/password sign-up and login via Supabase Auth.
- Protected routes redirect unauthenticated users to `/login`.
- Sessions persist in localStorage via Supabase client.
- Row Level Security (RLS) on every user-owned table ensures users can only access their own data.

## PWA

The app is configured as a Progressive Web App (installable on mobile/desktop).
Run `npm run build` and serve over HTTPS to enable install prompts and offline fallback.

## Security Notes

- Never commit `.env` to GitHub.
- The Supabase `anon` key is safe to use client-side when RLS is enabled.
- Never expose the Supabase `service_role` key in frontend code.
- All database mutations verify ownership (`auth.uid() = user_id`).

## License

MIT
