// stats.js — page views / pair requests / per-country counters
// IMPORTANT: on Vercel (serverless) memory is wiped on every cold start, so
// set MONGODB_URI (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN) in
// the Vercel env vars, otherwise the counters will reset to zero.

const mongoose = require('mongoose');
const axios = require('axios');

// Storage backends, in order of preference:
//   1. MongoDB   (MONGODB_URI)
//   2. Upstash Redis REST (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
//   3. in-memory (NOT persistent on Vercel: every cold start resets to 0)
let dbReady = false;
let StatModel = null;
let CountryModel = null;
let dbPromise = null;

const REDIS_URL = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const redisReady = !!(REDIS_URL && REDIS_TOKEN);

async function redis(cmd) {
    const r = await axios.post(REDIS_URL, cmd, {
        headers: { Authorization: 'Bearer ' + REDIS_TOKEN },
        timeout: 6000
    });
    return r.data.result;
}

async function connectMongo() {
    // MongoDB link (set MONGODB_URI in Vercel to override this default)
    const uri = process.env.MONGODB_URI || 'mongodb+srv://tanip85719_db_user:r5b9Wy0oAIFy3icZ@cluster0.conedxv.mongodb.net/ahmadmd?retryWrites=true&w=majority&appName=Cluster0';
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 });
        }
        const statSchema = new mongoose.Schema({
            _id: { type: String },
            views: { type: Number, default: 0 },
            pairs: { type: Number, default: 0 },
            epoch: { type: Number, default: 0 }
        });
        const countrySchema = new mongoose.Schema({
            code: { type: String, index: true, unique: true },
            name: { type: String },
            count: { type: Number, default: 0 }
        });
        StatModel = mongoose.models.AhmadStat || mongoose.model('AhmadStat', statSchema);
        CountryModel = mongoose.models.AhmadCountry || mongoose.model('AhmadCountry', countrySchema);
        dbReady = true;
        // One-time clean start: the very first time this runs, wipe old/test
        // numbers so only real visitors and real countries are counted.
        try {
            const r = await StatModel.updateOne({ _id: 'init_clean_v1' }, { $setOnInsert: { views: 0, pairs: 0 } }, { upsert: true });
            if (r.upsertedCount === 1) {
                await StatModel.findByIdAndUpdate('global', { $set: { views: 0, pairs: 0, epoch: Date.now() } }, { upsert: true });
                await CountryModel.deleteMany({});
            }
        } catch (e) { console.error('clean start failed:', e.message); }
        return true;
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        dbReady = false;
        dbPromise = null; // allow a retry on the next request
        return false;
    }
}

// Every stats function awaits this first, so the very first request after a
// cold start no longer races the connection and silently falls back to
// in-memory counters (that race is what made the numbers reset to zero).
function dbInit() {
    if (!dbPromise) dbPromise = connectMongo();
    return dbPromise;
}
dbInit();

function persistent() { return dbReady || redisReady; }

// ---- in-memory fallback ----
const mem = { views: 0, pairs: 0, countries: {} /* code -> {name, count} */ };

// ---- calling code -> ISO2 country map (longest prefix wins) ----
// Not exhaustive E.164 data, but covers the vast majority of real traffic.
const CALLING_CODES = {
    '1242': 'BS', '1246': 'BB', '1264': 'AI', '1268': 'AG', '1284': 'VG',
    '1340': 'VI', '1345': 'KY', '1441': 'BM', '1473': 'GD', '1649': 'TC',
    '1664': 'MS', '1670': 'MP', '1671': 'GU', '1684': 'AS', '1721': 'SX',
    '1758': 'LC', '1767': 'DM', '1784': 'VC', '1787': 'PR', '1809': 'DO',
    '1829': 'DO', '1849': 'DO', '1868': 'TT', '1869': 'KN', '1876': 'JM',
    '1939': 'PR',
    '20': 'EG', '211': 'SS', '212': 'MA', '213': 'DZ', '216': 'TN',
    '218': 'LY', '220': 'GM', '221': 'SN', '222': 'MR', '223': 'ML',
    '224': 'GN', '225': 'CI', '226': 'BF', '227': 'NE', '228': 'TG',
    '229': 'BJ', '230': 'MU', '231': 'LR', '232': 'SL', '233': 'GH',
    '234': 'NG', '235': 'TD', '236': 'CF', '237': 'CM', '238': 'CV',
    '239': 'ST', '240': 'GQ', '241': 'GA', '242': 'CG', '243': 'CD',
    '244': 'AO', '245': 'GW', '246': 'IO', '248': 'SC', '249': 'SD',
    '250': 'RW', '251': 'ET', '252': 'SO', '253': 'DJ', '254': 'KE',
    '255': 'TZ', '256': 'UG', '257': 'BI', '258': 'MZ', '260': 'ZM',
    '261': 'MG', '262': 'RE', '263': 'ZW', '264': 'NA', '265': 'MW',
    '266': 'LS', '267': 'BW', '268': 'SZ', '269': 'KM', '27': 'ZA',
    '290': 'SH', '291': 'ER', '297': 'AW', '298': 'FO', '299': 'GL',
    '30': 'GR', '31': 'NL', '32': 'BE', '33': 'FR', '34': 'ES',
    '350': 'GI', '351': 'PT', '352': 'LU', '353': 'IE', '354': 'IS',
    '355': 'AL', '356': 'MT', '357': 'CY', '358': 'FI', '359': 'BG',
    '36': 'HU', '370': 'LT', '371': 'LV', '372': 'EE', '373': 'MD',
    '374': 'AM', '375': 'BY', '376': 'AD', '377': 'MC', '378': 'SM',
    '380': 'UA', '381': 'RS', '382': 'ME', '383': 'XK', '385': 'HR',
    '386': 'SI', '387': 'BA', '389': 'MK', '39': 'IT', '40': 'RO',
    '41': 'CH', '420': 'CZ', '421': 'SK', '423': 'LI', '43': 'AT',
    '44': 'GB', '45': 'DK', '46': 'SE', '47': 'NO', '48': 'PL',
    '49': 'DE', '500': 'FK', '501': 'BZ', '502': 'GT', '503': 'SV',
    '504': 'HN', '505': 'NI', '506': 'CR', '507': 'PA', '508': 'PM',
    '509': 'HT', '51': 'PE', '52': 'MX', '53': 'CU', '54': 'AR',
    '55': 'BR', '56': 'CL', '57': 'CO', '58': 'VE', '590': 'GP',
    '591': 'BO', '592': 'GY', '593': 'EC', '594': 'GF', '595': 'PY',
    '596': 'MQ', '597': 'SR', '598': 'UY', '599': 'CW', '60': 'MY',
    '61': 'AU', '62': 'ID', '63': 'PH', '64': 'NZ', '65': 'SG',
    '66': 'TH', '670': 'TL', '672': 'NF', '673': 'BN', '674': 'NR',
    '675': 'PG', '676': 'TO', '677': 'SB', '678': 'VU', '679': 'FJ',
    '680': 'PW', '681': 'WF', '682': 'CK', '683': 'NU', '685': 'WS',
    '686': 'KI', '687': 'NC', '688': 'TV', '689': 'PF', '690': 'TK',
    '691': 'FM', '692': 'MH', '7': 'RU', '81': 'JP', '82': 'KR',
    '84': 'VN', '86': 'CN', '90': 'TR', '91': 'IN', '92': 'PK',
    '93': 'AF', '94': 'LK', '95': 'MM', '960': 'MV', '961': 'LB',
    '962': 'JO', '963': 'SY', '964': 'IQ', '965': 'KW', '966': 'SA',
    '967': 'YE', '968': 'OM', '970': 'PS', '971': 'AE', '972': 'IL',
    '973': 'BH', '974': 'QA', '975': 'BT', '976': 'MN', '977': 'NP',
    '98': 'IR', '992': 'TJ', '993': 'TM', '994': 'AZ', '995': 'GE',
    '996': 'KG', '998': 'UZ', '1': 'US', '880': 'BD', '855': 'KH',
    '856': 'LA'
};
const SORTED_PREFIXES = Object.keys(CALLING_CODES).sort((a, b) => b.length - a.length);

function countryFromNumber(number) {
    const digits = String(number || '').replace(/[^\d]/g, '');
    for (const p of SORTED_PREFIXES) {
        if (digits.startsWith(p)) return CALLING_CODES[p];
    }
    return null;
}

async function recordView() {
    await dbInit();
    if (dbReady && StatModel) {
        const doc = await StatModel.findByIdAndUpdate(
            'global', { $inc: { views: 1 } }, { upsert: true, new: true }
        );
        return { views: doc.views, pairs: doc.pairs || 0, epoch: doc.epoch || 0, persistent: true };
    }
    if (redisReady) {
        const views = await redis(['INCR', 'ahmad:views']);
        const pairs = await redis(['GET', 'ahmad:pairs']);
        const ep = await redis(['GET', 'ahmad:epoch']);
        return { views: Number(views) || 0, pairs: Number(pairs) || 0, epoch: Number(ep) || 0, persistent: true };
    }
    mem.views += 1;
    return { views: mem.views, pairs: mem.pairs, persistent: false };
}

async function getStats() {
    await dbInit();
    if (dbReady && StatModel) {
        const doc = await StatModel.findById('global');
        return { views: (doc && doc.views) || 0, pairs: (doc && doc.pairs) || 0, epoch: (doc && doc.epoch) || 0, persistent: true };
    }
    if (redisReady) {
        const [v, p, e] = await Promise.all([redis(['GET', 'ahmad:views']), redis(['GET', 'ahmad:pairs']), redis(['GET', 'ahmad:epoch'])]);
        return { views: Number(v) || 0, pairs: Number(p) || 0, epoch: Number(e) || 0, persistent: true };
    }
    return { views: mem.views, pairs: mem.pairs, epoch: mem.epoch || 0, persistent: false };
}

async function recordPair(phoneNumber) {
    await dbInit();
    const code = countryFromNumber(phoneNumber);
    if (dbReady && StatModel) {
        await StatModel.findByIdAndUpdate('global', { $inc: { pairs: 1 } }, { upsert: true });
        if (code) {
            await CountryModel.findOneAndUpdate(
                { code }, { $inc: { count: 1 }, $setOnInsert: { name: code } }, { upsert: true }
            );
        }
        return;
    }
    if (redisReady) {
        await redis(['INCR', 'ahmad:pairs']);
        if (code) await redis(['HINCRBY', 'ahmad:countries', code, 1]);
        return;
    }
    mem.pairs += 1;
    if (code) {
        if (!mem.countries[code]) mem.countries[code] = { name: code, count: 0 };
        mem.countries[code].count += 1;
    }
}

async function getCountries() {
    await dbInit();
    if (dbReady && StatModel) {
        const docs = await CountryModel.find({}).sort({ count: -1 }).lean();
        return docs.map(d => ({ code: d.code, name: d.name || d.code, count: d.count }));
    }
    if (redisReady) {
        const flat = (await redis(['HGETALL', 'ahmad:countries'])) || [];
        const out = [];
        for (let i = 0; i < flat.length; i += 2) out.push({ code: flat[i], name: flat[i], count: Number(flat[i + 1]) || 0 });
        return out.sort((a, b) => b.count - a.count);
    }
    return Object.entries(mem.countries)
        .map(([code, v]) => ({ code, name: v.name, count: v.count }))
        .sort((a, b) => b.count - a.count);
}

// Wipe every counter (admin only, protected by ADMIN_KEY in mini.js).
// A new "epoch" is stored so browsers drop the numbers they cached.
async function resetAll() {
    await dbInit();
    const epoch = Date.now();
    if (dbReady && StatModel) {
        await StatModel.findByIdAndUpdate('global', { $set: { views: 0, pairs: 0, epoch } }, { upsert: true });
        await CountryModel.deleteMany({});
        return { ok: true, epoch };
    }
    if (redisReady) {
        await redis(['SET', 'ahmad:views', 0]);
        await redis(['SET', 'ahmad:pairs', 0]);
        await redis(['DEL', 'ahmad:countries']);
        await redis(['SET', 'ahmad:epoch', epoch]);
        return { ok: true, epoch };
    }
    mem.views = 0; mem.pairs = 0; mem.countries = {}; mem.epoch = epoch;
    return { ok: true, epoch };
}

module.exports = { resetAll, dbInit, persistent, recordView, getStats, recordPair, getCountries, countryFromNumber };
