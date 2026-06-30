const { v2: cloudinary } = require('cloudinary');

const PLACEHOLDER_SECRETS = new Set([
  '',
  'your_api_secret',
  'YOUR_API_SECRET',
  'your_api_key',
  'YOUR_API_KEY',
]);

function isPlaceholder(value) {
  if (!value) return true;
  return PLACEHOLDER_SECRETS.has(value.trim()) || value.includes('<');
}

function parseCloudinaryUrl(url) {
  if (!url?.startsWith('cloudinary://')) return null;

  const withoutScheme = url.slice('cloudinary://'.length);
  const atIndex = withoutScheme.lastIndexOf('@');
  if (atIndex === -1) return null;

  const credentials = withoutScheme.slice(0, atIndex);
  const cloud_name = withoutScheme.slice(atIndex + 1);
  const colonIndex = credentials.indexOf(':');
  if (colonIndex === -1) return null;

  const api_key = credentials.slice(0, colonIndex);
  const api_secret = credentials.slice(colonIndex + 1);

  if (isPlaceholder(api_key) || isPlaceholder(api_secret) || !cloud_name) return null;

  return { cloud_name, api_key, api_secret };
}

function getCloudinaryConfig() {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  if (fromUrl) return fromUrl;

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = process.env.CLOUDINARY_API_KEY?.trim();
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (cloud_name && api_key && api_secret && !isPlaceholder(api_secret) && !isPlaceholder(api_key)) {
    return { cloud_name, api_key, api_secret };
  }

  return null;
}

function configureCloudinary() {
  const config = getCloudinaryConfig();
  if (!config) return false;
  cloudinary.config(config);
  return true;
}

function isCloudinaryConfigured() {
  return !!getCloudinaryConfig();
}

module.exports = {
  cloudinary,
  configureCloudinary,
  isCloudinaryConfigured,
  getCloudinaryConfig,
};
