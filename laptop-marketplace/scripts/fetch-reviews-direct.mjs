import fetchSessionToken from '../node_modules/google-maps-review-scraper/dist/extraction.js';
import { paginateReviews } from '../node_modules/google-maps-review-scraper/dist/utils.js';
import { createClient } from '../node_modules/google-maps-review-scraper/dist/client.js';

const placeId = '0x3bae1501facb8911:0x19e2b64ac18e7889';
const client = createClient();

const token = await fetchSessionToken(placeId, client);
console.log('token', token);
if (!token) process.exit(1);

await new Promise(r => setTimeout(r, 2000));
const reviews = await paginateReviews(placeId, 2, 2, '', true, token, client);
console.log('count', reviews.length);
console.log(JSON.stringify(reviews.slice(0, 10), null, 2));
