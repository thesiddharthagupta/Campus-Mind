# CampusMind

CampusMind is a modular academic workspace for browsing course material, taking notes, practicing, and tracking study progress.

## Run locally

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.

The app starts in **demo mode** with sample academic content and browser-local persistence. It does not require credentials to explore. Create a `.env.local` from `.env.example` to enable Supabase sign-in and account creation; see `supabase/README.md` before using real student data.

## Structure

- `src/app` owns routes, app shell, and providers.
- `src/features` contains isolated product areas; each keeps its pages, components, hooks, services, and types together. Authentication uses Supabase Auth when credentials are configured, with protected feature routes.
- `src/shared` contains reusable layout, UI, and feedback components.
- `src/lib` contains external service clients.
- `supabase/migrations` contains the relational schema and Row Level Security policies.

Feature components display data and raise callbacks. Feature services own persistence. Pages compose components rather than embedding all UI and data logic in one file.

## Demo limitations

Browser storage is used only in demo mode. Study sessions are saved when a focus session is finished and power the weekly study-time, streak, and goal summaries. With Supabase configured, sessions and the other account data use Supabase services and Row Level Security. A moderator review interface remains to be built. Production use also requires reviewed database policies and server-side upload scanning. Do not treat browser storage as secure authentication or authorization.

