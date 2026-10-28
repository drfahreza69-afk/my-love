/**
 * REZA NEVERMIND — Production Server for Railway, Render, & Cloud Hosting
 * Zero external npm dependencies required (uses native Node.js http, fs, path, zlib).
 * Features:
 * 1. Serves index.html (and /reza_nevermind.html) with automatic Brotli/Gzip compression.
 * 2. Provides /api/health for Railway zero-downtime healthcheck.
 * 3. Provides /api/state (GET & POST) for persistent Cloud State Sync across devices.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Railway Volume support (falls back to ./data directory)
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.resolve(process.env.RAILWAY_VOLUME_MOUNT_PATH)
  : path.join(__dirname, 'data');

const STATE_FILE = path.join(DATA_DIR, 'cloud-state.json');
const INDEX_FILE = path.join(__dirname, 'index.html');
const MANIFEST_FILE = path.join(__dirname, 'manifest.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[REZA NEVERMIND] Warning creating data directory:', err.message);
}

// Pre-cache index.html + compressed buffers in memory for ultra-fast response
let rawHtmlBuffer = null;
let gzipHtmlBuffer = null;
let brHtmlBuffer = null;

function loadHtmlBuffers() {
  try {
    rawHtmlBuffer = fs.readFileSync(INDEX_FILE);
    gzipHtmlBuffer = zlib.gzipSync(rawHtmlBuffer, { level: 4 });
    console.log(`[REZA NEVERMIND] Loaded index.html (${(rawHtmlBuffer.length / 1024).toFixed(1)} KB raw, ${(gzipHtmlBuffer.length / 1024).toFixed(1)} KB gzip)`);
  } catch (err) {
    console.error('[REZA NEVERMIND] Error loading index.html:', err.message);
  }
}
loadHtmlBuffers();

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // 1. Railway Healthcheck Endpoint
  if (pathname === '/api/health' || pathname === '/health') {
    return sendJson(res, 200, {
      status: 'ok',
      app: 'REZA NEVERMIND',
      edition: 'Sovereign Edition',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
  }

  // 2. Cloud State Sync API (GET /api/state & POST /api/state)
  if (pathname === '/api/state') {
    if (req.method === 'GET') {
      try {
        if (fs.existsSync(STATE_FILE)) {
          const content = fs.readFileSync(STATE_FILE, 'utf-8');
          return sendJson(res, 200, JSON.parse(content));
        }
        return sendJson(res, 200, { app: 'REZA NEVERMIND', updatedAt: null, store: {} });
      } catch (err) {
        return sendJson(res, 500, { error: 'Failed to read cloud state', details: err.message });
      }
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
        if (body.length > 15 * 1024 * 1024) {
          req.destroy();
        }
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (!parsed || typeof parsed.store !== 'object') {
            return sendJson(res, 400, { error: 'Invalid state payload' });
          }
          const payload = {
            app: 'REZA NEVERMIND',
            updatedAt: new Date().toISOString(),
            store: parsed.store
          };
          fs.writeFileSync(STATE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
          return sendJson(res, 200, { status: 'saved', updatedAt: payload.updatedAt });
        } catch (err) {
          return sendJson(res, 400, { error: 'Invalid JSON', details: err.message });
        }
      });
      return;
    }
  }

  // 3. Web App Manifest
  if (pathname === '/manifest.json' && fs.existsSync(MANIFEST_FILE)) {
    const manifest = fs.readFileSync(MANIFEST_FILE);
    res.writeHead(200, {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    });
    return res.end(manifest);
  }

  // 4. Serve Main Application (index.html / reza_nevermind.html / SPA fallback)
  if (!rawHtmlBuffer) loadHtmlBuffers();
  if (!rawHtmlBuffer) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('index.html not found');
  }

  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  const baseHeaders = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Vary': 'Accept-Encoding',
    'X-Content-Type-Options': 'nosniff'
  };

  if (brHtmlBuffer && acceptEncoding.includes('br')) {
    res.writeHead(200, { ...baseHeaders, 'Content-Encoding': 'br', 'Content-Length': brHtmlBuffer.length });
    return res.end(brHtmlBuffer);
  }
  if (gzipHtmlBuffer && acceptEncoding.includes('gzip')) {
    res.writeHead(200, { ...baseHeaders, 'Content-Encoding': 'gzip', 'Content-Length': gzipHtmlBuffer.length });
    return res.end(gzipHtmlBuffer);
  }

  res.writeHead(200, { ...baseHeaders, 'Content-Length': rawHtmlBuffer.length });
  return res.end(rawHtmlBuffer);
});

server.listen(PORT, HOST, () => {
  console.log(`========================================================`);
  console.log(`  REZA NEVERMIND • Sovereign Edition Server Active`);
  console.log(`  Listening on http://${HOST}:${PORT}`);
  console.log(`  Healthcheck : http://${HOST}:${PORT}/api/health`);
  console.log(`  Cloud State : ${STATE_FILE}`);
  console.log(`========================================================`);
});
