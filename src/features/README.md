# Feature folders

Each feature owns the screens and behavior for one product area. Pages compose components, hooks connect the UI to state, services own data operations, and feature types describe the data used there. Keep shared primitives and layout in `src/shared` rather than importing another feature's private components.

The current UI uses `AppProviders` and browser-local demo persistence. Replace those feature data operations with authenticated services before production use.
