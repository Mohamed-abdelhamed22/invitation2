# Mohammed & Hala — Wedding Invitation

A simple responsive wedding invitation with a cinematic curtain-opening splash screen.

Guest messages can be collected in two ways:

- **Option A — Netlify + Supabase (recommended, online)**: guests leave messages that are stored in a free cloud database and you view them on an admin page.
- **Option B — Local Node server**: messages are saved to a local `messages.txt` file, viewable on a local admin page. Only works on your computer while the server is running.

---

## Option A — Deploy to Netlify (with Supabase)

This uses a Superbase project that **already has a `messages` table** with this schema:
`id`, `wedding_id`, `guest_name`, `message`, `created_at`. The function in `netlify/functions/messages.mjs` writes and reads that table for one wedding (set by `WEDDING_ID`).

### 1. Set environment variables in Netlify
In your Netlify site, go to **Site configuration → Environment variables** and add:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | your Supabase public/publishable key |
| `WEDDING_ID` | the wedding id messages belong to (from the `weddings` table) |
| `ADMIN_TOKEN` | a secret only you know |

These same values live (already filled in) in the local **`.env.local`** file — copy them into Netlify.

### 2. Set the admin password to match
The admin page sends the password as the admin token. **They must match**:
- `admin.html` → `const PASSWORD = 'your_admin_token_here';` (use the same value as `ADMIN_TOKEN`)
- `ADMIN_TOKEN` env var above = the same value

### 3. Deploy your site
1. Push this folder to a GitHub/GitLab repo, or use **Netlify Drop** by dragging the folder into [app.netlify.com/drop](https://app.netlify.com/drop).
2. Netlify will detect this is a static site and deploy it. Your visitors open your site URL.
3. Your admin page is at **`/admin`** (e.g. `https://yoursite.netlify.app/admin`). Sign in with the password to see all messages.

> **Note:** The deploy needs to pick up the functions. If you use the GitHub workflow, they deploy automatically. If you use Netlify Drop, the `netlify/functions` folder is bundled too.

> **Security note:** Right now the `messages` table is readable by anyone who calls the Supabase REST API (the publishable key can read it). The `schema.sql` file includes optional SQL to enable Row Level Security and block public reads. If you apply that, the admin GET also needs a `SUPABASE_SERVICE_ROLE_KEY` — contact me to update the function accordingly.

---

## Option B — Run locally with the Node server

The **Node.js server** saves guest messages to a text file and shows them on a local admin page.

1. Install [Node.js](https://nodejs.org/) (if not already installed).
2. Open Command Prompt in this folder and run:

```text
node server.js
```

3. Open `http://localhost:3000` in your browser to see the invitation.
4. A text file named `messages.txt` is created automatically. Every message a guest sends is appended to it.
5. Admin page: open `http://localhost:3000/admin` and enter the password.

Change the local password in both places so they match:
- `server.js` → `const ADMIN_PASSWORD = 'wedding123';`
- `admin.html` → `const PASSWORD = 'wedding123';`

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
