require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectMongo } = require('./connectMongo');
const AdminUser = require('../models/AdminUser');

function parseArgs(argv) {
  const args = { username: '', password: '', useEnv: false };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--username' && argv[i + 1]) {
      args.username = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--password' && argv[i + 1]) {
      args.password = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--use-env') {
      args.useEnv = true;
    }
  }
  return args;
}

function generateTempPassword() {
  const suffix = crypto.randomBytes(4).toString('hex');
  return `Temp@${suffix}`;
}

async function resetAdminPassword() {
  const cli = parseArgs(process.argv);
  const username = cli.username || process.env.ADMIN_USERNAME || 'admin';

  let password = cli.password;
  let generated = false;

  if (!password && cli.useEnv) {
    password = process.env.ADMIN_PASSWORD;
  }
  if (!password) {
    password = generateTempPassword();
    generated = true;
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  await connectMongo();

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await AdminUser.findOne({ username });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.mustChangePassword = true;
    await existing.save();
  } else {
    await AdminUser.create({ username, passwordHash, role: 'admin', mustChangePassword: true });
  }

  console.log('');
  console.log('=== Admin password reset (support workflow) ===');
  console.log(`Username:            ${username}`);
  console.log(`Temporary password:    ${password}`);
  console.log(`Must change on login:  yes`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Verify you are speaking with the account owner.');
  console.log('  2. Share the temporary password securely (phone/SMS in person).');
  console.log('  3. Ask them to log in and go to Admin → Account to set a new password.');
  if (generated) {
    console.log('');
    console.log('(Password was auto-generated. Old password was NOT required.)');
  }
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

resetAdminPassword().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
