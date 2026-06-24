import { scraper } from 'google-maps-review-scraper';

const url =
  'https://www.google.com/maps/place/iPro+Technologies+Used+Laptops+Store/@12.915473,77.6484697,17z/data=!4m6!3m5!1s0x3bae1501facb8911:0x19e2b64ac18e7889!8m2!3d12.915473!4d77.6484697!16s%2Fg%2F11tsqt9mws!5m1!1e1';

const reviews = await scraper(url, { sort_type: 'newest', pages: 2, clean: true, experimental: false });
console.log('count', Array.isArray(reviews) ? reviews.length : reviews);
if (Array.isArray(reviews) && reviews.length) {
  console.log(JSON.stringify(reviews.slice(0, 12), null, 2));
}
