const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = __dirname;
const MESSAGES_FILE = path.join(ROOT, 'messages.txt');
const ADMIN_PASSWORD = process.env.ADMIN_TOKEN || 'change-me-to-match-your-admin-token';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function serveStatic(res, urlPath) {
  let filePath = path.join(ROOT, urlPath);
  if (filePath === ROOT || urlPath === '/') {
    filePath = path.join(ROOT, 'index.html');
  }
  if (path.extname(filePath) === '') filePath += '.html';

  const safe = path.normalize(filePath).startsWith(ROOT);
  if (!safe) return send(res, 403, 'Forbidden');

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    send(res, 200, data, type);
  });
}

function readMessages() {
  try {
    const raw = fs.readFileSync(MESSAGES_FILE, 'utf8');
    return raw.split('\n').filter(l => l.trim() !== '');
  } catch (e) {
    return [];
  }
}

function sanitize(text, maxLen) {
  return String(text || '').replace(/[\r\n]/g, ' ').trim().slice(0, maxLen);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  if (req.method === 'GET') {
    if (pathname === '/api/messages') {
      const lines = readMessages();
      const messages = lines.map(l => {
        const m = l.match(/^\[(.+?)\] (.*?) \| (.*)$/);
        if (m) return { timestamp: m[1], name: m[2], message: m[3] };
        return { timestamp: '', name: 'Unknown', message: l };
      });
      return send(res, 200, JSON.stringify(messages), 'application/json; charset=utf-8');
    }

    if (pathname === '/admin') {
      return serveStatic(res, '/admin.html');
    }

    return serveStatic(res, pathname);
  }

  if (req.method === 'POST' && pathname === '/api/messages') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        return send(res, 400, JSON.stringify({ error: 'Invalid JSON' }), 'application/json');
      }
      const name = sanitize(data.name, 100);
      const message = sanitize(data.message, 2000);
      if (!name || !message) {
        return send(res, 400, JSON.stringify({ error: 'Name and message are required' }), 'application/json');
      }
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const line = `[${timestamp}] ${name} | ${message}`;
      fs.appendFile(MESSAGES_FILE, line + '\n', err => {
        if (err) {
          return send(res, 500, JSON.stringify({ error: 'Could not save message' }), 'application/json');
        }
        send(res, 201, JSON.stringify({ ok: true }), 'application/json');
      });
    });
    return;
  }

  send(res, 405, 'Method not allowed');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Wedding invite running at http://localhost:${PORT}`);
  console.log(`Admin page: http://localhost:${PORT}/admin`);
});
