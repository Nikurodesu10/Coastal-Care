# Coastal Care

Barangay 6-A Eco-Trail, Victorias City — news, fun facts, and a cottage
reservation system for the mangrove island eco-trail.

## Project structure

```
coastal-care/
├── api/                  Vercel serverless functions (Node)
│   ├── news.js           GET — returns news items
│   ├── funfacts.js       GET — returns a random fun fact
│   └── reservations.js   GET/POST — list and create cottage bookings
├── data/                 JSON "database" (see note below)
│   ├── news.json
│   ├── funfacts.json
│   └── reservations.json
├── public/                Static frontend
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── package.json
└── vercel.json
```

## Running locally

You'll need [Node.js](https://nodejs.org) and the Vercel CLI:

```bash
npm install -g vercel
cd coastal-care
vercel dev
```

This serves the static site **and** the `/api` functions together,
exactly like production. Open the URL it prints (usually `http://localhost:3000`).

## Deploying to Vercel (web-only workflow)

1. Push this folder to a GitHub repository.
2. In Vercel, "Add New Project" → import that repo.
3. Leave the framework preset as "Other" — no build step is required.
4. Deploy. Future pushes to the GitHub repo (even via GitHub's web editor)
   will auto-redeploy.

## ⚠️ About the reservations data store

Right now, `api/reservations.js` reads and writes to `data/reservations.json`
on disk. This works perfectly when running locally. **In production on
Vercel, the filesystem is read-only** outside of `/tmp`, and `/tmp` is wiped
whenever a function instance cold-starts — so bookings made on the live site
will not reliably persist or be shared across visitors.

This is fine for demoing the full flow, but before relying on this for real
bookings, swap the `readStore` / `writeStore` functions in
`api/reservations.js` for a real database call. Easiest free options:

- **Vercel KV** (Redis-based, integrates directly in the Vercel dashboard)
- **Supabase** (free Postgres + simple JS client)
- **Google Sheets API** (if you want barangay staff to view/edit bookings
  directly in a spreadsheet)

Everything else (the route, validation, double-booking check) is already
written to work the same way regardless of which storage you plug in —
only those two functions need to change.

## Editing content

- **News items** — edit `data/news.json`. Each entry needs `id`, `date`
  (YYYY-MM-DD), `title`, and `body`.
- **Fun facts** — edit `data/funfacts.json`, a plain array of strings.
- **Cottages** — currently hardcoded in `public/index.html` (the cards and
  `<select>` options) and in `api/reservations.js` (the `COTTAGES` array and
  `MAX_GUESTS_PER_COTTAGE`). Keep both in sync if you add or rename a cottage.
