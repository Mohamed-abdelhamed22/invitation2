const TABLE = 'messages';

function sanitize(text, maxLen) {
  return String(text || '').replace(/[\r\n]/g, ' ').trim().slice(0, maxLen);
}

function rest() {
  return `${process.env.SUPABASE_URL || ''}/rest/v1/${TABLE}`;
}

function cors(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
}

function send(res, status, body) {
  cors(res);
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

async function saveMessage(guestName, message) {
  const res = await fetch(rest(), {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ wedding_id: process.env.WEDDING_ID, guest_name: guestName, message })
  });
  if (!res.ok) throw new Error(`supabase insert failed: ${res.status}`);
  return res.json();
}

async function listMessages() {
  const res = await fetch(
    `${rest()}?select=guest_name,message,created_at&wedding_id=eq.${process.env.WEDDING_ID}&order=created_at.asc`,
    { headers: { 'apikey': process.env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) throw new Error(`supabase select failed: ${res.status}`);
  const rows = await res.json();
  return rows.map(r => ({ name: r.guest_name, message: r.message, timestamp: r.created_at }));
}

export default async function handler(req, res) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return send(res, 500, { error: 'Supabase env vars not configured' });
  }

  const method = (req.method || '').toUpperCase();

  if (method === 'POST') {
    let body = {};
    try { body = req.body || {}; } catch (e) { body = {}; }
    const guest_name = sanitize(body.name, 100);
    const message = sanitize(body.message, 2000);
    if (!guest_name || !message) return send(res, 400, { error: 'Name and message are required' });
    try {
      await saveMessage(guest_name, message);
      return send(res, 201, { ok: true });
    } catch (e) {
      return send(res, 500, { error: 'Could not save message' });
    }
  }

  if (method === 'GET') {
    const provided = req.headers['x-admin-token'] || '';
    const adminToken = process.env.ADMIN_TOKEN || 'wedding123';
    if (!provided || provided !== adminToken) {
      return send(res, 401, { error: 'Unauthorized' });
    }
    try {
      const messages = await listMessages();
      return send(res, 200, messages);
    } catch (e) {
      return send(res, 500, { error: 'Could not load messages' });
    }
  }

  return send(res, 405, { error: 'Method not allowed' });
}
