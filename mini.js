const express = require('express');
const axios = require('axios');
const router = express.Router();
const stats = require('./stats');

// Cleaned & Corrected Server Links (90 Heroku Servers)
const serverUrls = {
  "server1": "https://ahmadha011-1e474a215aac.herokuapp.com",
  "server2": "https://ahmadha0110-779c241f40bc.herokuapp.com",
  "server3": "https://ahmadha012-e49e602a95c1.herokuapp.com",
  "server4": "https://ahmadha013-1d733730d562.herokuapp.com",
  "server5": "https://ahmadha014-f2a903404be1.herokuapp.com",
  "server6": "https://ahmadha015-10204bb6fafc.herokuapp.com",
  "server7": "https://ahmadha016-60645d2b0728.herokuapp.com",
  "server8": "https://ahmadha017-f0a5beb5705c.herokuapp.com",
  "server9": "https://ahmadha018-a5a2ec5aab46.herokuapp.com",
  "server10": "https://ahmadha019-511b8e63665a.herokuapp.com",
  "server11": "https://ahmadhas011-baf7bd4c2eeb.herokuapp.com",
  "server12": "https://ahmadhas0110-d171fc706ab6.herokuapp.com",
  "server13": "https://ahmadhas012-822af6f8260b.herokuapp.com",
  "server14": "https://ahmadhas013-86a34b2f9ad1.herokuapp.com",
  "server15": "https://ahmadhas014-2574eb0992d3.herokuapp.com",
  "server16": "https://ahmadhas015-7510275b84bd.herokuapp.com",
  "server17": "https://ahmadhas016-cbe998f77a6a.herokuapp.com",
  "server18": "https://ahmadhas017-3985433692bb.herokuapp.com",
  "server19": "https://ahmadhas018-dc99c6602d0c.herokuapp.com",
  "server20": "https://ahmadhas019-0ee63ab7cea7.herokuapp.com",
  "server21": "https://ahmadhass011-7c3d00e2483d.herokuapp.com",
  "server22": "https://ahmadhass0110-a94d960c188a.herokuapp.com",
  "server23": "https://ahmadhass012-1a0b626ae0e8.herokuapp.com",
  "server24": "https://ahmadhass013-54ccf55de1a8.herokuapp.com",
  "server25": "https://ahmadhass014-121ad358aeec.herokuapp.com",
  "server26": "https://ahmadhass015-8db0923b7aeb.herokuapp.com",
  "server27": "https://ahmadhass016-295ab7e75215.herokuapp.com",
  "server28": "https://ahmadhass017-e67d305229f9.herokuapp.com",
  "server29": "https://ahmadhass018-c152b1fa9632.herokuapp.com",
  "server30": "https://ahmadhass019-8ae4990e0c16.herokuapp.com",
  "server31": "https://ahmadhassa011-a55c6e34da09.herokuapp.com",
  "server32": "https://ahmadhassa0110-9daa10495d44.herokuapp.com",
  "server33": "https://ahmadhassa012-856c7f6caaad.herokuapp.com",
  "server34": "https://ahmadhassa013-223b37d32635.herokuapp.com",
  "server35": "https://ahmadhassa014-85ae612c18a9.herokuapp.com",
  "server36": "https://ahmadhassa015-6f2c7499aeee.herokuapp.com",
  "server37": "https://ahmadhassa016-66e37ad35c26.herokuapp.com",
  "server38": "https://ahmadhassa017-73106e29f32b.herokuapp.com",
  "server39": "https://ahmadhassa018-e702b24d1492.herokuapp.com",
  "server40": "https://ahmadhassa019-7dd0d754cf2e.herokuapp.com",
  "server41": "https://ahmadhassan011-243e6e15f7aa.herokuapp.com",
  "server42": "https://ahmadhassan0110-ba9666633706.herokuapp.com",
  "server43": "https://ahmadhassan012-9d2545d4cf9e.herokuapp.com",
  "server44": "https://ahmadhassan013-884ce3ccbcb0.herokuapp.com",
  "server45": "https://ahmadhassan014-d897f98c0d6f.herokuapp.com",
  "server46": "https://ahmadhassan015-fc718324fd44.herokuapp.com",
  "server47": "https://ahmadhassan016-6f580d4f749f.herokuapp.com",
  "server48": "https://ahmadhassan017-690cea1dc838.herokuapp.com",
  "server49": "https://ahmadhassan018-41a9a395778c.herokuapp.com",
  "server50": "https://ahmadhassan019-216b25ec4ed6.herokuapp.com",
  "server51": "https://ahmadhassanx011-03b7dfbcea81.herokuapp.com",
  "server52": "https://ahmadhassanx0110-e149e7f87a5c.herokuapp.com",
  "server53": "https://ahmadhassanx012-2a56455a56ea.herokuapp.com",
  "server54": "https://ahmadhassanx013-4a0a9ffce248.herokuapp.com",
  "server55": "https://ahmadhassanx014-c2f000b1ee3f.herokuapp.com",
  "server56": "https://ahmadhassanx015-810d429f5bbf.herokuapp.com",
  "server57": "https://ahmadhassanx016-8267b75f2083.herokuapp.com",
  "server58": "https://ahmadhassanx017-b9e967437d18.herokuapp.com",
  "server59": "https://ahmadhassanx018-5c9da195b2f2.herokuapp.com",
  "server60": "https://ahmadhassanx019-fad38b11d938.herokuapp.com",
  "server61": "https://ahmadhassanxd011-c07faf7b7c60.herokuapp.com",
  "server62": "https://ahmadhassanxd0110-8b980beb54a3.herokuapp.com",
  "server63": "https://ahmadhassanxd012-b386b3774f68.herokuapp.com",
  "server64": "https://ahmadhassanxd013-e15262876b30.herokuapp.com",
  "server65": "https://ahmadhassanxd014-2ed24657e2c4.herokuapp.com",
  "server66": "https://ahmadhassanxd015-b930bf769d55.herokuapp.com",
  "server67": "https://ahmadhassanxd016-565757f2c58f.herokuapp.com",
  "server68": "https://ahmadhassanxd017-f17e34a13c8e.herokuapp.com",
  "server69": "https://ahmadhassanxd018-ec0279730bde.herokuapp.com",
  "server70": "https://ahmadhassanxd019-33cc10ec7966.herokuapp.com",
  "server71": "https://ahmadhassanxdj011-6ea8acda1dda.herokuapp.com",
  "server72": "https://ahmadhassanxdj0110-61644d333401.herokuapp.com",
  "server73": "https://ahmadhassanxdj012-cb1daa0a8891.herokuapp.com",
  "server74": "https://ahmadhassanxdj013-514249984d6e.herokuapp.com",
  "server75": "https://ahmadhassanxdj014-ffda7034990c.herokuapp.com",
  "server76": "https://ahmadhassanxdj015-c34cc298b394.herokuapp.com",
  "server77": "https://ahmadhassanxdj016-f84d017171fc.herokuapp.com",
  "server78": "https://ahmadhassanxdj017-5b90eea8242d.herokuapp.com",
  "server79": "https://ahmadhassanxdj018-c6dea51e2ec8.herokuapp.com",
  "server80": "https://ahmadhassanxdj019-c0400fc38c62.herokuapp.com",
  "server81": "https://ahmadhnxdj011-c80d85433313.herokuapp.com",
  "server82": "https://ahmadhnxdj0110-91fbf2750543.herokuapp.com",
  "server83": "https://ahmadhnxdj012-b5f193375e8e.herokuapp.com",
  "server84": "https://ahmadhnxdj013-15584559f1c9.herokuapp.com",
  "server85": "https://ahmadhnxdj014-dc6b5e366744.herokuapp.com",
  "server86": "https://ahmadhnxdj015-49adb1d0c6fb.herokuapp.com",
  "server87": "https://ahmadhnxdj016-5dbdd6a98c6f.herokuapp.com",
  "server88": "https://ahmadhnxdj017-0641adbe2a06.herokuapp.com",
  "server89": "https://ahmadhnxdj018-1c25ed4c149d.herokuapp.com",
  "server90": "https://ahmadhnxdj019-166882e9cdbd.herokuapp.com"
};

// Get server list
router.get('/servers', (req, res) => {
    const servers = Object.keys(serverUrls).map(key => ({
        id: key,
        name: `Server ${key.replace('server', '')}`,
        url: serverUrls[key]
    }));
    res.json({ servers });
});

// Get server status
router.get('/status/:serverId', async (req, res) => {
    try {
        const { serverId } = req.params;
        const serverUrl = serverUrls[serverId];

        if (!serverUrl) {
            return res.json({ error: 'Server not found' });
        }

        const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
        const response = await axios.get(`${baseUrl}/active`, {
            timeout: 5000
        });

        res.json({
            count: response.data.count || 0,
            limit: response.data.limit || 30
        });
    } catch (error) {
        res.json({
            count: 0,
            limit: 30,
            error: 'Failed to fetch status'
        });
    }
});

// React to channel post
router.get('/chreact', async (req, res) => {
    try {
        const { server, url, emojis } = req.query;

        if (!server || !url) {
            return res.json({ error: 'Server and URL are required' });
        }

        const serverUrl = serverUrls[server];
        if (!serverUrl) {
            return res.json({ error: 'Server not found' });
        }

        const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
        let reactUrl = `${baseUrl}/chreact?url=${encodeURIComponent(url)}`;
        if (emojis) {
            reactUrl += `&emojis=${encodeURIComponent(emojis)}`;
        }

        const response = await axios.get(reactUrl, {
            timeout: 30000
        });

        res.json(response.data);

    } catch (error) {
        res.json({
            success: false,
            error: 'Failed to react',
            message: error.message
        });
    }
});

// Generate pair code
router.get('/code', async (req, res) => {
    try {
        const { server, number } = req.query;

        if (!server || !number) {
            return res.json({ error: 'Server and number are required' });
        }

        const serverUrl = serverUrls[server];
        if (!serverUrl) {
            return res.json({ error: 'Server not found' });
        }

        const phoneNumber = number.replace(/[^\d]/g, '');
        if (phoneNumber.length < 10 || phoneNumber.length > 15) {
            return res.json({ error: 'Invalid phone number format' });
        }

        const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
        const response = await axios.get(`${baseUrl}/code?number=${phoneNumber}`, {
            timeout: 30000
        });

        if (response.data && response.data.code) {
            res.json({ code: response.data.code });
            // Count this as a successful pair request and attribute it to a country.
            stats.recordPair(phoneNumber).catch(() => {});
        } else {
            res.json({ error: 'No code received' });
        }
    } catch (error) {
        res.json({ error: 'Failed to generate code' });
    }
});

// ===== Site stats (page views / pair requests / country leaderboard) =====

// Record a page view (called once per browser session by the frontend)
router.post('/stats/view', async (req, res) => {
    try {
        const data = await stats.recordView();
        res.set('Cache-Control', 'no-store');
        res.json(data);
    } catch (error) {
        // Real error status (NOT zeros) so the page keeps showing the last known numbers
        res.status(503).json({ error: 'Failed to record view' });
    }
});

// Current totals (views + pairs)
router.get('/stats', async (req, res) => {
    try {
        const data = await stats.getStats();
        res.set('Cache-Control', 'no-store');
        res.json(data);
    } catch (error) {
        res.status(503).json({ error: 'Failed to load stats' });
    }
});

// Country leaderboard: which countries are generating the most pair codes
router.get('/stats/countries', async (req, res) => {
    try {
        const countries = await stats.getCountries();
        res.set('Cache-Control', 'no-store');
        res.json({ countries });
    } catch (error) {
        res.status(503).json({ error: 'Failed to load countries' });
    }
});

// Random server endpoint for bot pair command
router.get('/random', (req, res) => {
    const servers = Object.keys(serverUrls);
    const randomServer = servers[Math.floor(Math.random() * servers.length)];
    res.json({
        server: randomServer,
        url: serverUrls[randomServer]
    });
});

// Update all servers
router.get('/updatex', async (req, res) => {
    try {
        const { key } = req.query;

        if (key !== 'jawi804') {
            return res.status(401).json({
                success: false,
                error: 'Invalid or missing authentication key'
            });
        }

        const results = [];

        for (const [serverId, serverUrl] of Object.entries(serverUrls)) {
            try {
                const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
                const updateUrl = `${baseUrl}/updateplugins?key=jawi804`;
                const response = await axios.get(updateUrl, {
                    timeout: 40000
                });

                results.push({
                    server: serverId,
                    status: 'success',
                    response: response.data
                });
            } catch (error) {
                results.push({
                    server: serverId,
                    status: 'error',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            total: results.length,
            results: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update servers'
        });
    }
});

module.exports = router;
