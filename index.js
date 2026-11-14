const express = require('express');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const app = express();
__path = process.cwd();
const PORT = process.env.PORT || 3000;

// Import modules
const miniRoutes = require('./mini');

// Gzip every response (the dashboard HTML is large, this cuts load time a lot)
app.use(compression());

// Parse JSON bodies
app.use(express.json());

// Read the big HTML once at startup (no disk read on every visit = faster open)
let pageHtml = null;      // Buffer (default page)
let pageText = null;      // String (used for named share links)
try {
    pageHtml = fs.readFileSync(path.join(__dirname, 'mini.html'));
    pageText = pageHtml.toString('utf8');
} catch (e) {}

// Pre-compress the page once per encoding (brotli is ~25% smaller than gzip = faster on slow nets)
const encCache = {};
function encoded(enc) {
    if (!pageHtml) return null;
    if (!encCache[enc]) {
        encCache[enc] = enc === 'br'
            ? zlib.brotliCompressSync(pageHtml, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 6 } })
            : zlib.gzipSync(pageHtml, { level: 9 });
    }
    return encCache[enc];
}

// Service worker: cached shell so the site opens fast even on a slow connection
let swJs = null;
try { swJs = fs.readFileSync(path.join(__dirname, 'sw.js')); } catch (e) {}

// Routes
app.use('/api', miniRoutes);       // AHMAD-MD routes

app.get('/sw.js', (req, res) => {
    if (!swJs) return res.status(404).end();
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Service-Worker-Allowed', '/');
    res.type('application/javascript').send(swJs);
});

function cleanName(n) {
    return String(n || '').replace(/[<>"'&\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 22);
}

// When a link is shared with ?name=Someone, WhatsApp/Telegram previews are built
// from the server HTML (they do not run JavaScript), so put the name in there too.
function personalise(html, name, by) {
    let out = html;
    if (name && name !== 'AHMAD-MD') {
        out = out
            .replace('<title>AHMAD-MD | Mini BOT</title>', '<title>' + name + ' | Mini BOT</title>')
            .replace('<meta property="og:site_name" content="AHMAD-MD">', '<meta property="og:site_name" content="' + name + '">')
            .replace('<meta property="og:title" content="AHMAD-MD | Mini BOT">', '<meta property="og:title" content="' + name + ' | Mini BOT">')
            .replace('<meta name="twitter:title" content="AHMAD-MD | Mini BOT">', '<meta name="twitter:title" content="' + name + ' | Mini BOT">')
            .replace('id="siteTitle" title="Click to edit name">AHMAD-MD</h1>', 'id="siteTitle" title="Click to edit name">' + name + '</h1>')
            .replace('<span id="featuresTitle">AHMAD-MD FEATURES</span>', '<span id="featuresTitle">' + name.toUpperCase() + ' FEATURES</span>');
    }
    if (by) {
        out = out.replace('content="Generate your WhatsApp pairing code instantly."', 'content="Shared by ' + by + ' - Generate your WhatsApp pairing code instantly."');
    }
    return out;
}

// main page: short cache so a refresh always gets the latest design quickly
app.get('/', (req, res) => {
    // Vercel's edge keeps the page for an hour and serves it instantly without waking the server
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    const name = cleanName(req.query.name);
    const by = cleanName(req.query.by);
    if (pageText && (name || by)) {
        return res.type('html').send(personalise(pageText, name, by));
    }
    if (pageHtml) {
        const ae = String(req.headers['accept-encoding'] || '');
        const enc = /\bbr\b/.test(ae) ? 'br' : (/\bgzip\b/.test(ae) ? 'gzip' : null);
        res.setHeader('Vary', 'Accept-Encoding');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        if (enc) {
            const buf = encoded(enc);
            res.setHeader('Content-Encoding', enc);
            res.setHeader('Content-Length', buf.length);
            return res.end(buf);
        }
        res.send(pageHtml);
    } else {
        res.sendFile(__path + '/mini.html');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT} `);
});

module.exports = app;
