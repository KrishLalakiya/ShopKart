# ShopKart — Frontend

React + Vite client for the ShopKart full-stack project.

Setup instructions, the full API reference and deployment notes live in the
[root README](../README.md).

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

The backend must be running on `http://localhost:8082`. To point at a different
backend (e.g. a deployed one), copy `.env.example` to `.env.local` and set:

```
VITE_API_URL=https://your-backend.onrender.com
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |