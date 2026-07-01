const mongoose = require('mongoose');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const SHARD_HOSTS = [
  'ac-c4ezuo3-shard-00-00.62tqsq2.mongodb.net',
  'ac-c4ezuo3-shard-00-01.62tqsq2.mongodb.net',
  'ac-c4ezuo3-shard-00-02.62tqsq2.mongodb.net',
];

function getCredentials() {
  const envUri = process.env.MONGODB_URI?.trim();
  if (envUri) {
    try {
      const parsed = new URL(envUri.replace('mongodb+srv://', 'mongodb://'));
      const user = decodeURIComponent(parsed.username);
      const pass = decodeURIComponent(parsed.password);
      const db = parsed.pathname.replace(/^\//, '').split('?')[0] || 'ipro-technologies';
      if (user && pass) {
        return { user, pass, db };
      }
    } catch {
      // fall through to env vars / defaults
    }
  }

  return {
    user: process.env.MONGODB_USER || 'bheema',
    pass: process.env.MONGODB_PASSWORD || 'Bheemuk@123',
    db: process.env.MONGODB_DB || 'ipro-technologies',
  };
}

function buildDirectUri(host) {
  const { user, pass, db } = getCredentials();
  return `mongodb://${user}:${encodeURIComponent(pass)}@${host}:27017/${db}?ssl=true&directConnection=true&authSource=admin`;
}

function buildReplicaSetUri() {
  const { user, pass, db } = getCredentials();
  const hosts = SHARD_HOSTS.map(host => `${host}:27017`).join(',');
  const replicaSet = process.env.MONGODB_REPLICA_SET || 'atlas-c4ezuo3-shard-0';
  return `mongodb://${user}:${encodeURIComponent(pass)}@${hosts}/${db}?ssl=true&replicaSet=${replicaSet}&authSource=admin&retryWrites=true&w=majority`;
}

function buildSrvUri() {
  const { user, pass, db } = getCredentials();
  return `mongodb+srv://${user}:${encodeURIComponent(pass)}@cluster0.62tqsq2.mongodb.net/${db}?retryWrites=true&w=majority&appName=Cluster0`;
}

function connectOptions(timeoutMs = 10000) {
  return {
    serverSelectionTimeoutMS: timeoutMs,
    readPreference: 'primary',
    retryWrites: true,
  };
}

function isSrvDnsError(message = '') {
  return message.includes('querySrv') || message.includes('ECONNREFUSED');
}

function usesDirectConnection(uri = '') {
  return /directConnection=true/i.test(uri);
}

async function tryConnect(uri, timeoutMs = 10000) {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    await mongoose.connect(uri, connectOptions(timeoutMs));
    return { ok: true };
  } catch (err) {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    return { ok: false, error: err.message };
  }
}

async function verifyWriteAccess() {
  try {
    const result = await mongoose.connection.db.collection('_primary_check').insertOne({
      checkedAt: new Date(),
    });
    await mongoose.connection.db.collection('_primary_check').deleteOne({ _id: result.insertedId });
    return true;
  } catch {
    return false;
  }
}

async function findPrimaryHost() {
  for (const host of SHARD_HOSTS) {
    const uri = buildDirectUri(host);
    const conn = mongoose.createConnection(uri, connectOptions(5000));
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

async function connectViaDiscoveredPrimary(timeoutMs = 10000) {
  const primaryHost = await findPrimaryHost();
  if (!primaryHost) {
    return { ok: false, error: 'No writable Atlas primary found among shard hosts' };
  }

  const uri = buildDirectUri(primaryHost);
  const result = await tryConnect(uri, timeoutMs);
  if (!result.ok) return result;

  const canWrite = await verifyWriteAccess();
  if (!canWrite) {
    await mongoose.disconnect().catch(() => {});
    return { ok: false, error: 'Connected host is not the MongoDB primary (writes rejected)' };
  }

  return { ok: true, label: `discovered primary (${primaryHost})` };
}

async function connectViaReplicaSet(timeoutMs = 10000) {
  const uri = buildReplicaSetUri();
  const result = await tryConnect(uri, timeoutMs);
  if (!result.ok) return result;

  const canWrite = await verifyWriteAccess();
  if (!canWrite) {
    await mongoose.disconnect().catch(() => {});
    return { ok: false, error: 'Replica set connected but writes are not routed to primary' };
  }

  return { ok: true, label: 'replica set (primary discovery)' };
}

async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    const canWrite = await verifyWriteAccess();
    if (canWrite) return mongoose.connection;
    await mongoose.disconnect().catch(() => {});
  }

  const envUri = process.env.MONGODB_URI?.trim();
  const skipSrv = process.env.MONGODB_SKIP_SRV === 'true';

  // 1. SRV URI — preferred for production (Atlas routes writes to primary)
  if (envUri?.startsWith('mongodb+srv://') && !skipSrv) {
    const srvResult = await tryConnect(envUri, 8000);
    if (srvResult.ok && (await verifyWriteAccess())) {
      console.log('Connected to MongoDB (SRV)');
      return mongoose.connection;
    }
    if (srvResult.ok) await mongoose.disconnect().catch(() => {});

    if (isSrvDnsError(srvResult.error) || !srvResult.ok) {
      console.log('SRV unavailable or not writable, discovering Atlas primary...');
      const primary = await connectViaDiscoveredPrimary(10000);
      if (primary.ok) {
        console.log(`Connected to MongoDB (${primary.label})`);
        return mongoose.connection;
      }
    }

    if (srvResult.error) console.warn(`MongoDB SRV connection failed: ${srvResult.error}`);
  }

  // 2. Single-host directConnection URIs often point at a secondary — never use as-is
  if (envUri && !envUri.startsWith('mongodb+srv://') && usesDirectConnection(envUri)) {
    console.warn(
      'MONGODB_URI uses directConnection=true on one host — discovering the current primary instead'
    );

    const primary = await connectViaDiscoveredPrimary(10000);
    if (primary.ok) {
      console.log(`Connected to MongoDB (${primary.label})`);
      return mongoose.connection;
    }

    const replica = await connectViaReplicaSet(8000);
    if (replica.ok) {
      console.log(`Connected to MongoDB (${replica.label})`);
      return mongoose.connection;
    }

    console.warn(`Primary discovery failed: ${primary.error}`);
  }

  // 3. Generic env URI (no directConnection pin)
  if (envUri && !envUri.startsWith('mongodb+srv://') && !usesDirectConnection(envUri)) {
    const result = await tryConnect(envUri, 10000);
    if (result.ok && (await verifyWriteAccess())) {
      console.log('Connected to MongoDB');
      return mongoose.connection;
    }
    if (result.ok) await mongoose.disconnect().catch(() => {});
    console.warn(`MongoDB connection failed or not writable: ${result.error}`);
  }

  if (skipSrv || !envUri) {
    const primary = await connectViaDiscoveredPrimary(10000);
    if (primary.ok) {
      console.log(`Connected to MongoDB (${primary.label})`);
      return mongoose.connection;
    }
  }

  // 4. Built-in SRV fallback, then primary discovery
  if (!envUri?.startsWith('mongodb+srv://')) {
    const srvResult = await tryConnect(buildSrvUri(), 8000);
    if (srvResult.ok && (await verifyWriteAccess())) {
      console.log('Connected to MongoDB (SRV fallback)');
      return mongoose.connection;
    }
    if (srvResult.ok) await mongoose.disconnect().catch(() => {});
  }

  const primary = await connectViaDiscoveredPrimary(10000);
  if (primary.ok) {
    console.log(`Connected to MongoDB (${primary.label})`);
    return mongoose.connection;
  }

  throw new Error(
    'MongoDB connection failed. Use mongodb+srv in MONGODB_URI on Render/production. ' +
      'Locally, do not pin directConnection=true to one shard host — Atlas primary moves between shards. ' +
      'See backend/.env.example.'
  );
}

module.exports = { connectMongo, findPrimaryHost, buildDirectUri, buildSrvUri, buildReplicaSetUri };
