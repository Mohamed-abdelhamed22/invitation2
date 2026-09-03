const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'wedding123';

// The wedding these messages belong to (Mohamed & Hala).
// Set from your Supabase 'weddings' table.
const WEDDING_ID = process.env.WEDDING_ID || 'b56f980e-20bf-4c43-98e7-11fe606b5ad9';

const TABLE = 'messages';
const REST = `${SUPABASE_URL || ''}/rest/v1/${TABLE}`;

function json(status, body) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}

function sanitize(text, maxLen) {
  return String(text || '').replace(/[\r\n]/g, ' ').trim().slice(0, maxLen);
}

async function saveMessage(guestName, message) {
  const res = await fetch(REST, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ wedding_id: WEDDING_ID, guest_name: guestName, message })
  });
  if (!res.ok) throw new Error(`supabase insert failed: ${res.status}`);
  return res.json();
}

async function listMessages() {
  const res = await fetch(
    `${REST}?select=guest_name,message,created_at&wedding_id=eq.${WEDDING_ID}&order=created_at.asc`,
    { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) throw new Error(`supabase select failed: ${res.status}`);
  const rows = await res.json();
  return rows.map(r => ({ name: r.guest_name, message: r.message, timestamp: r.created_at }));
}

export async function handler(event) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json(500, { error: 'Supabase env vars not configured' });
  }

  const method = (event.httpMethod || '').toUpperCase();

  if (method === 'POST') {
    let body = {};
    try { body = event.body ? JSON.parse(event.body) : {}; } catch (e) { body = {}; }
    const guest_name = sanitize(body.name, 100);
    const message = sanitize(body.message, 2000);
    if (!guest_name || !message) return json(400, { error: 'Name and message are required' });
    try {
      await saveMessage(guest_name, message);
      return json(201, { ok: true });
    } catch (e) {
      return json(500, { error: 'Could not save message' });
    }
  }

  if (method === 'GET') {
    const provided = event.headers['x-admin-token'] || event.headers['X-Admin-Token'] || '';
    if (!provided || provided !== ADMIN_TOKEN) {
      return json(401, { error: 'Unauthorized' });
    }
    try {
      const messages = await listMessages();
      return json(200, messages);
    } catch (e) {
      return json(500, { error: 'Could not load messages' });
    }
  }

  return json(405, { error: 'Method not allowed' });
}
