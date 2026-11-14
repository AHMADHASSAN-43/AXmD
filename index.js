const express = require('express');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
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
let pageHtml = null;
try { pageHtml = fs.readFileSync(path.join(__dirname, 'mini.html')); } catch (e) {}

// Routes
app.use('/api', miniRoutes);       // AHMAD-MD routes

// main page: short cache so a refresh always gets the latest design quickly
app.get('/', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    if (pageHtml) {
        res.type('html').send(pageHtml);
    } else {
        res.sendFile(__path + '/mini.html');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT} `);
});

module.exports = app;
