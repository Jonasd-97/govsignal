# GovSignal Frontend (Updated)

Updated React/Vite frontend built to align directly with the current GovSignal backend.

## What was fixed

- Replaced the monolithic single-file frontend with a structured app shell
- Removed direct DOM manipulation for mobile nav; everything is React state-driven
- Fixed backend integration by using one API layer and the correct `VITE_API_URL`
- Implemented the backend auth flows fully, including forgot-password and reset-password
- Wired the frontend to existing backend routes for:
  - auth/profile
  - opportunities
  - watchlist
  - saved searches
  - past performance
  - digest settings
  - Stripe checkout / billing portal
  - AI analysis / proposal / scoring
- Added consistent normalization for opportunity payloads returned from both opportunities and watchlist endpoints
- Added responsive layout and reusable UI patterns

## Environment

Create a `.env` file:

```bash
VITE_API_URL=http://localhost:3001
```

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
