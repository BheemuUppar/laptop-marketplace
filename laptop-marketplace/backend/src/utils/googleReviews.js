const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.join(__dirname, '../../data/google-reviews.json');
const PLACE_QUERY = 'iPro Technologies Used Laptops Store HSR Layout Bengaluru';

const DEFAULT_META = {
  placeName: 'iPro Technologies Used Laptops Store',
  placeId: '0x3bae1501facb8911:0x19e2b64ac18e7889',
  googleMapsUrl:
    'https://www.google.com/maps/place/iPro+Technologies+Used+Laptops+Store/@12.915473,77.6484697,17z/data=!4m6!3m5!1s0x3bae1501facb8911:0x19e2b64ac18e7889!8m2!3d12.915473!4d77.6484697!16s%2Fg%2F11tsqt9mws',
  rating: 4.8,
  totalRatings: null,
  address: '1825, 13th Cross Rd, Vanganahalli, 1st Sector, HSR Layout, Bengaluru, Karnataka 560102',
  lastFetched: null,
};

function readCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    }
  } catch (err) {
    console.warn('Could not read reviews cache:', err.message);
  }
  return { meta: { ...DEFAULT_META }, reviews: [] };
}

function writeCache(data) {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
}

function mapGoogleReview(review, index) {
  const text = review.text?.text || review.originalText?.text || '';
  const author = review.authorAttribution?.displayName || 'Google user';
  return {
    id: review.name || `google-${index}`,
    customerName: author,
    rating: review.rating || 5,
    review: text,
    purchaseDate: review.publishTime || new Date().toISOString(),
    relativeTime: review.relativePublishTimeDescription || '',
    helpful: 0,
    status: 'approved',
    source: 'google',
    sourceUrl: review.authorAttribution?.uri || DEFAULT_META.googleMapsUrl,
    createdAt: review.publishTime || new Date().toISOString(),
  };
}

async function fetchFromPlacesApi(apiKey) {
  const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.googleMapsUri,places.reviews',
    },
    body: JSON.stringify({ textQuery: PLACE_QUERY, languageCode: 'en' }),
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Places search failed (${searchRes.status}): ${errText}`);
  }

  const searchData = await searchRes.json();
  const place = searchData.places?.[0];
  if (!place) {
    throw new Error('Place not found on Google Maps');
  }

  const reviews = (place.reviews || []).map(mapGoogleReview).filter(r => r.review);

  return {
    meta: {
      placeName: place.displayName?.text || DEFAULT_META.placeName,
      placeId: place.id || DEFAULT_META.placeId,
      googleMapsUrl: place.googleMapsUri || DEFAULT_META.googleMapsUrl,
      rating: place.rating ?? DEFAULT_META.rating,
      totalRatings: place.userRatingCount ?? null,
      address: place.formattedAddress || DEFAULT_META.address,
      lastFetched: new Date().toISOString(),
    },
    reviews,
  };
}

async function getGoogleReviews({ refresh = false } = {}) {
  const cached = readCache();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return cached;
  }

  const cacheAgeMs = cached.meta?.lastFetched
    ? Date.now() - new Date(cached.meta.lastFetched).getTime()
    : Infinity;
  const cacheFresh = cacheAgeMs < 24 * 60 * 60 * 1000;

  if (!refresh && cacheFresh && cached.reviews?.length) {
    return cached;
  }

  try {
    const fresh = await fetchFromPlacesApi(apiKey);
    writeCache(fresh);
    return fresh;
  } catch (err) {
    console.warn('Google Places reviews fetch failed:', err.message);
    return cached.reviews?.length ? cached : { meta: { ...DEFAULT_META, ...cached.meta }, reviews: cached.reviews || [] };
  }
}

async function seedGoogleReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('Set GOOGLE_PLACES_API_KEY in backend/.env to fetch Google Maps reviews.');
    process.exit(1);
  }
  const data = await fetchFromPlacesApi(apiKey);
  writeCache(data);
  console.log(`Saved ${data.reviews.length} Google reviews (rating ${data.meta.rating}, total ${data.meta.totalRatings ?? 'n/a'})`);
  return data;
}

module.exports = { getGoogleReviews, seedGoogleReviews, readCache, DEFAULT_META };
