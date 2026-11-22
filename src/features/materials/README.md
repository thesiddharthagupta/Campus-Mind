# Materials

The materials feature owns browsing, filtering, bookmarks, upload, and private file previews. `materialService.ts` handles Supabase operations; `AppProviders` uses these services for signed-in accounts. The migration creates a private storage bucket and places new files in pending review. Uploads pass through server-side signature validation and require a configured malware scanner.
