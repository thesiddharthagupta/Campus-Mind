# CampusMind

CampusMind is a modular academic workspace for browsing course material, taking notes, practicing, and tracking study progress.

## Run locally

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.

CampusMind requires Supabase for sign-in and account data. Copy `.env.example` to `.env.local`, enter your Supabase project URL and public anon key, then run the app. If Supabase is not configured, the login page explains how to connect it; there are no built-in demo credentials or sample student records. See `supabase/README.md` for database setup.

## Structure

- `src/app` owns routes, app shell, and providers.
- `src/features` contains isolated product areas; each keeps its pages, components, hooks, services, and types together. Authentication uses Supabase Auth when credentials are configured, with protected feature routes.
- `src/shared` contains reusable layout, UI, and feedback components.
- `src/lib` contains external service clients.
- `supabase/migrations` contains the relational schema and Row Level Security policies.

Feature components display data and raise callbacks. Feature services own persistence. Pages compose components rather than embedding all UI and data logic in one file.

## Data and security

Student records load and save through feature services connected to Supabase. Study sessions power the weekly study-time, streak, and goal summaries. Moderator and admin accounts have a protected review queue for pending materials and reports. Review database policies and configure the malware scanner before production uploads are enabled. Never place a service-role key in the browser app.

