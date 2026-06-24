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

async function canWrite(host) {
  const uri = buildDirectUri(host);
  const conn = mongoose.createConnection(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await conn.asPromise();
    await conn.db.collection('_primary_check').insertOne({ checkedAt: new Date() });
    await conn.close();
    return true;
  } catch (err) {
    try {
      await conn.close();
    } catch {}
    return false;
  }
}

async function findPrimaryHost() {
  for (const host of SHARD_HOSTS) {
    const ok = await canWrite(host);
    if (ok) return host;
  }
  return null;
}

async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Prefer SRV URI from env if provided and working
  if (process.env.MONGODB_URI?.startsWith('mongodb+srv://')) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
      console.log('Connected to MongoDB (SRV)');
      return mongoose.connection;
    } catch (err) {
      console.warn('SRV connection failed, trying direct primary discovery:', err.message);
    }
  }

  const primaryHost = await findPrimaryHost();
  if (!primaryHost) {
    throw new Error('Could not find a writable MongoDB primary node. Check Atlas IP whitelist and network.');
  }

  const uri = buildDirectUri(primaryHost);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to MongoDB primary: ${primaryHost}`);
  return mongoose.connection;
}

module.exports = { connectMongo, findPrimaryHost, buildDirectUri };
