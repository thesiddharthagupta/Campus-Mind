# Supabase setup

1. Create a Supabase project and copy its project URL and public anon key into `.env.local` using `.env.example` as the template.
2. Enable the email authentication provider and add the local app origin to the Auth redirect URL allowlist.
3. Apply the migrations in order with the Supabase CLI or SQL editor: `202610310001_initial_schema.sql`, `202611220001_study_sessions.sql`, then `202611220002_moderation_review.sql`.
4. Review and configure Storage buckets and policies before enabling real uploads.
5. Configure a malware scanner that accepts a `POST` multipart upload with the file in a `file` field and an `Authorization: Bearer ...` header. It must return JSON `{ "safe": true }` only after the file passes its scan. Set its HTTPS endpoint and API key as Edge Function secrets: `supabase secrets set MALWARE_SCANNER_URL=https://your-scanner.example/scan MALWARE_SCANNER_API_KEY=your-key`.
6. Deploy the upload validator with `supabase functions deploy upload-material`. It checks file signatures and size, requires the scanner to approve the file, then saves it through the signed-in user's Row Level Security policies.
7. For production, set the `ALLOWED_ORIGIN` Edge Function secret to the exact web app origin. The function accepts all origins when this optional secret is unset.

The upload flow sends files to `supabase/functions/upload-material`, which verifies the user's session, enforces the 25 MB limit, checks file signatures against the extension, sends the file to the configured scanner over HTTPS, stores bytes in the private `study-materials` bucket only when the scanner returns `{ "safe": true }`, and inserts a pending material row. The scanner API key stays in Edge Function secrets; the scanner receives the uploaded file. A missing scanner configuration, timeout, non-success response, or any response other than `safe: true` blocks the upload. Choose a scanner provider and confirm its endpoint follows this contract before enabling uploads. The function requires an authenticated user and a subject in the academic structure. Populate the academic hierarchy using trusted admin tooling before trying a real upload.

The SQL enables row level security and starts with conservative access. Moderator workflows and public material review require a trusted server-side process; never grant a browser client elevated roles or the service-role key.

The app requires Supabase credentials and an authenticated session. Authentication, materials, bookmarks, notes, quiz attempts, reports, study sessions, academic hierarchy, and topic completion use Supabase; there are no built-in sample accounts or student records. The protected review queue is available to accounts whose profile role is `moderator` or `admin`; assign those roles only through trusted admin tooling. Seed the academic hierarchy, quizzes, questions, and private answer keys through trusted admin tooling. Keep the service-role key out of `.env.local` and the browser application.
