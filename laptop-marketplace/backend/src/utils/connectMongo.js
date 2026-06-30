const mongoose = require('mongoose');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const SHARD_HOSTS = [
  'ac-c4ezuo3-shard-00-00.62tqsq2.mongodb.net',
  'ac-c4ezuo3-shard-00-01.62tqsq2.mongodb.net',
  'ac-c4ezuo3-shard-00-02.62tqsq2.mongodb.net',
];

function buildDirectUri(host) {
  const user = process.env.MONGODB_USER || 'bheema';
  const pass = encodeURIComponent(process.env.MONGODB_PASSWORD || 'Bheemuk@123');
  const db = process.env.MONGODB_DB || 'ipro-technologies';
  return `mongodb://${user}:${pass}@${host}:27017/${db}?ssl=true&directConnection=true&authSource=admin`;
}

function buildSrvUri() {
  const user = process.env.MONGODB_USER || 'bheema';
  const pass = encodeURIComponent(process.env.MONGODB_PASSWORD || 'Bheemuk@123');
  const db = process.env.MONGODB_DB || 'ipro-technologies';
  return `mongodb+srv://${user}:${pass}@cluster0.62tqsq2.mongodb.net/${db}?retryWrites=true&w=majority&appName=Cluster0`;
}

function isSrvDnsError(message = '') {
  return message.includes('querySrv') || message.includes('ECONNREFUSED');
}

async function tryConnect(uri, timeoutMs = 10000) {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
    return { ok: true };
  } catch (err) {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    return { ok: false, error: err.message };
  }
}

async function findPrimaryHost() {
  for (const host of SHARD_HOSTS) {
    const uri = buildDirectUri(host);
    const conn = mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 });
    try {
      await conn.asPromise();
      await conn.db.collection('_primary_check').insertOne({ checkedAt: new Date() });
      await conn.close();
      return host;
    } catch {
      await conn.close().catch(() => {});
    }
  }
  return null;
}

async function connectViaDirectPrimary() {
  const primaryHost = await findPrimaryHost();
  if (!primaryHost) return { ok: false, error: 'No writable Atlas shard found' };

  const uri = buildDirectUri(primaryHost);
  const result = await tryConnect(uri, 10000);
  if (result.ok) {
    return { ok: true, label: `direct primary (${primaryHost})` };
  }
  return result;
}

async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const envUri = process.env.MONGODB_URI?.trim();
  const skipSrv = process.env.MONGODB_SKIP_SRV === 'true';

  // Direct URI in env — use it immediately (best when SRV DNS is blocked)
  if (envUri && !envUri.startsWith('mongodb+srv://')) {
    const result = await tryConnect(envUri, 10000);
    if (result.ok) {
      console.log('Connected to MongoDB');
      return mongoose.connection;
    }
    console.warn(`MongoDB connection failed: ${result.error}`);
  }

  // SRV URI — try once, then fall back to direct primary discovery
  if (envUri?.startsWith('mongodb+srv://') && !skipSrv) {
    const srvResult = await tryConnect(envUri, 8000);
    if (srvResult.ok) {
      console.log('Connected to MongoDB (SRV)');
      return mongoose.connection;
    }

    if (isSrvDnsError(srvResult.error)) {
      console.log('SRV DNS unavailable on this network, using direct Atlas connection...');
      const direct = await connectViaDirectPrimary();
      if (direct.ok) {
        console.log(`Connected to MongoDB (${direct.label})`);
        return mongoose.connection;
      }
    }
  }

  if (skipSrv || !envUri) {
    const direct = await connectViaDirectPrimary();
    if (direct.ok) {
      console.log(`Connected to MongoDB (${direct.label})`);
      return mongoose.connection;
    }
  }

  // Last resort: built-in SRV then direct
  if (!envUri?.startsWith('mongodb+srv://')) {
    const srvResult = await tryConnect(buildSrvUri(), 8000);
    if (srvResult.ok) {
      console.log('Connected to MongoDB (SRV fallback)');
      return mongoose.connection;
    }
  }

  const direct = await connectViaDirectPrimary();
  if (direct.ok) {
    console.log(`Connected to MongoDB (${direct.label})`);
    return mongoose.connection;
  }

  throw new Error(
    'MongoDB connection failed. Your Atlas IP whitelist looks fine — if you use mongodb+srv and see querySrv errors, ' +
    'set MONGODB_SKIP_SRV=true or use a direct mongodb:// URI in MONGODB_URI (see backend/.env.example).'
  );
}

module.exports = { connectMongo, findPrimaryHost, buildDirectUri, buildSrvUri };
