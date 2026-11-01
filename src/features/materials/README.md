# Materials

The materials feature owns browsing, filtering, bookmarks, upload, and private file previews. `materialService.ts` handles Supabase operations; `AppProviders` selects that service when a signed-in Supabase session is available and keeps browser-local metadata-only uploads for demo mode. The migration creates a private storage bucket and places new files in pending review. Production uploads still need server-side signature validation and malware scanning.
