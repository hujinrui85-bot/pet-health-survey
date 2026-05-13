const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const DIR = __dirname;
const DATA_FILE = path.join(DIR, 'records.json');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

// Load existing records
function loadRecords() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch(e) { /* ignore */ }
  return [];
}

// Save records
function saveRecords(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

// CORS headers
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function jsonResponse(res, code, data) {
  setCORS(res);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => { resolve(body); });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:' + PORT);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    setCORS(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // === API: Save record ===
  if (pathname === '/api/save' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const record = JSON.parse(body);
      record.id = crypto.randomUUID();
      record.createdAt = new Date().toISOString();

      const records = loadRecords();
      records.push(record);
      saveRecords(records);

      jsonResponse(res, 200, { ok: true, id: record.id, total: records.length });
    } catch(e) {
      jsonResponse(res, 400, { ok: false, error: e.message });
    }
    return;
  }

  // === API: Get all records ===
  if (pathname === '/api/records' && req.method === 'GET') {
    const records = loadRecords();
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    jsonResponse(res, 200, records);
    return;
  }

  // === API: Stats ===
  if (pathname === '/api/stats' && req.method === 'GET') {
    const records = loadRecords();
    const today = new Date().toISOString().slice(0, 10);
    jsonResponse(res, 200, {
      total: records.length,
      today: records.filter(r => r.createdAt && r.createdAt.slice(0, 10) === today).length,
      phones: [...new Set(records.map(r => r.phone))].length
    });
    return;
  }

  // === Static file serving ===
  let filePath;
  if (pathname === '/' || pathname === '') {
    filePath = path.join(DIR, 'cat-nutrition-assistant.html');
  } else if (pathname === '/admin') {
    filePath = path.join(DIR, 'admin.html');
  } else {
    filePath = path.join(DIR, pathname.replace(/^\//, ''));
  }

  const ext = path.extname(filePath);
  const contentType = mime[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Server: http://192.168.5.9:' + PORT + '/cat-nutrition-assistant.html');
  console.log('Admin: http://192.168.5.9:' + PORT + '/admin');
  console.log('Records saved to: ' + DATA_FILE);
});
