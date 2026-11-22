# Feature folders

Each feature owns the screens and behavior for one product area. Pages compose components, hooks connect the UI to state, services own data operations, and feature types describe the data used there. Keep shared primitives and layout in `src/shared` rather than importing another feature's private components.

The UI uses `AppProviders` for shared state, while feature services load and save authenticated records through Supabase. Keep feature pages focused on presentation and user actions; do not add sample student records or local browser persistence as a fallback.
