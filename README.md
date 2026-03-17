# Dedicure React

Plain React SPA extracted from the original Dedicure Next.js app.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Backend

This frontend expects an API backend exposing the same routes the Next app used.
Set `VITE_API_BASE_URL` to point at that backend.

Example:

```bash
VITE_API_BASE_URL=http://localhost:3004
```

Without that backend, screens that depend on live data will not load.
