-- NOTE: Your Supabase project ALREADY has a `messages` table with this schema:
--
--   id          uuid primary key default gen_random_uuid()
--   wedding_id  uuid not null   (references the `weddings` table)
--   guest_name  text not null
--   message     text not null
--   created_at  timestamptz default now()
--
-- So there is nothing to create. Do NOT run a "create table" for messages.

-- ============================================================
-- OPTIONAL: Harden security with Row Level Security
-- ============================================================
-- Right now the publishable (anon) key can INSERT and SELECT all guest
-- messages, meaning anyone can read the messages by calling the REST API.
-- To lock that down, run the following in the Supabase SQL editor.

-- Enable RLS (already enabled for messages? verify in the dashboard).
alter table public.messages enable row level security;

-- Allow anyone (anon key) to add a message, but NOT read the list.
drop policy if exists "public can insert" on public.messages;
create policy "public can insert" on public.messages
  for insert with check (true);

-- Block public reads (so the anon key can't list messages).
-- NOTE: after this, the admin GET must use the SERVICE ROLE key, because
-- the publishable key will no longer be able to read.
drop policy if exists "public cannot read" on public.messages;
create policy "public cannot read" on public.messages
  for select using (false);

-- Then set SUPABASE_SERVICE_ROLE_KEY in Netlify and the function will use
-- it for the admin GET. The Wedding_inv_final function currently uses only
-- the publishable key, so if you apply the read-block policy, ask to have
-- the function updated to use the service role key for the GET.
