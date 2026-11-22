# Supabase setup

1. Create a Supabase project and copy its project URL and public anon key into `.env.local` using `.env.example` as the template.
2. Enable the email authentication provider and add the local app origin to the Auth redirect URL allowlist.
3. Apply `migrations/202610310001_initial_schema.sql`, then `migrations/202611220001_study_sessions.sql` with the Supabase CLI or SQL editor.
4. Review and configure Storage buckets and policies before enabling real uploads.
5. Add server-side functions for moderation, file signature scanning, document extraction, and privileged operations.

The upload flow stores bytes in the private `study-materials` bucket and inserts a pending material row. It requires an authenticated user and a subject record whose name matches the selected course. Populate the academic hierarchy using trusted admin tooling before trying a real upload. The browser enforces MIME and size checks for usability; production deployments still need server-side file signature validation and malware scanning.

The SQL enables row level security and starts with conservative access. Moderator workflows and public material review require a trusted server-side process; never grant a browser client elevated roles or the service-role key.

Without Supabase credentials, the app uses browser-local demo data, including saved study sessions. With credentials and an authenticated session, authentication, materials, bookmarks, notes, quiz attempts, reports, study sessions, academic hierarchy, and topic completion use Supabase. Seed the academic hierarchy, quizzes, questions, and private answer keys through trusted admin tooling. Moderator review screens are still pending. Do not use demo mode for real student notes.
