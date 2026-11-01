# Notes

Notes are private study documents organized by subject. The page composes the subject filter, note list, and editor. Demo edits persist to browser storage; authenticated sessions load and save notes through `notesService.ts`, with a short autosave delay. The database keeps previous title/content versions when a note changes and enforces owner access through row level security.
