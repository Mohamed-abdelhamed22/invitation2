# Mohammed & Hala — Wedding Invitation

A simple responsive wedding invitation with a cinematic curtain-opening splash screen.

Guests leave messages that are stored in **Supabase** and can be viewed by you on an admin page. The site and its API are hosted on **Vercel**.

---

## Deploy to Vercel

This project uses a Supabase database that **already has a `messages` table** with this
schema: `id`, `wedding_id`, `guest_name`, `message`, `created_at`.
The serverless function in `api/messages.mjs` writes and reads that table for one wedding
(set by `WEDDING_ID`).

### 1. Set environment variables in Vercel

In your project → **Settings → Environment Variables**, add these (set for **Production**, **Preview** and **Development**):

| Name | Value |
|------|-------|
| `SUPABASE_URL` | your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | your Supabase public/publishable key |
| `WEDDING_ID` | the wedding id messages belong to (from the `weddings` table) |
| `ADMIN_TOKEN` | a secret only you know |

These same values live (already filled in) in the local **`.env.local`** file — copy them into Vercel.

### 2. Deploy

1. Push this folder to a GitHub/GitLab repo.
2. In the Vercel dashboard → **Add New → Project**, import the repo.
   (Or run `vercel` locally from this folder.)
3. Framework Preset: **Other** — Vercel serves the static files automatically.
   No build command or output directory is needed (the `api/` folder becomes the serverless functions).
4. Deploy. Your public site URL will be `https://<project>.vercel.app`.
5. Admin page: **`/admin`** (e.g. `https://<project>.vercel.app/admin`). Sign in with `ADMIN_TOKEN`.

> **Local dev:** run `vercel dev`. Put your real values in `.env.local` (already set) — Vercel reads them.

---

## Customize

Edit **`config.js`**. You can change names, date, venue, Arabic text, timeline, gallery and splash timing.

### Background music start time
By default the song starts from the beginning. To start it from a specific point, add a line like `music.currentTime = 98;` inside `app.js` right after `music.volume` (98 = 1 minute 38 seconds).

### Curtain animation
The opening is built with CSS curtains, not a single overlaid image. The curtains start closed and slide outward, with fabric folds, tie-backs, lighting and particles. The names fade in during the opening.

Important splash settings:

```js
splash: {
  enabled: true,
  duration: 6200,
  curtainDuration: 4200,
  namesDelay: 2100,
  showSkip: true
}
```

`curtainDuration` and `namesDelay` are kept in config for easy editing; the main animation timing is currently defined in `styles.css`.
