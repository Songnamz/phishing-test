const express = require('express');
const geoip = require('geoip-lite');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files (e.g., index.html, learn-more.html)
app.use(express.static(__dirname));

// API endpoint to log clicks
app.post('/api/log-click', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip) || {};
    const userAgent = req.headers['user-agent'];

    const log = {
        timestamp: new Date(),
        ip,
        location: geo,
        userAgent
    };

    console.log(log); // Print to console

    let logs = [];
    if (fs.existsSync('logs.json')) {
        const data = fs.readFileSync('logs.json', 'utf-8').trim();
        if (data) {
            logs = JSON.parse(data);
        }
    }

    logs.push(log);
    fs.writeFileSync('logs.json', JSON.stringify(logs, null, 4)); // Write logs back

    res.status(200).send({ message: 'Logged' });
});

// API endpoint to return stats
app.get('/api/stats', (req, res) => {
    let logs = [];
    if (fs.existsSync('logs.json')) {
        const data = fs.readFileSync('logs.json', 'utf-8').trim();
        if (data) {
            logs = JSON.parse(data);
        }
    }

    const totalClicks = logs.length;
    res.status(200).send({ totalClicks });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
