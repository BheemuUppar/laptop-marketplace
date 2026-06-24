const fs = require('fs');
const h = fs.readFileSync('d:/free/laptop-marketplace/google-maps.html', 'utf8');
for (const p of ['aggregateRating', 'ratingValue', 'reviewCount', 'reviewBody', 'author', 'schema.org', 'itemprop', 'star', 'TxA8avwYqsPj4Q_5yJgI', '0x3bae']) {
  let idx = 0, n = 0;
  while ((idx = h.indexOf(p, idx)) >= 0 && n < 3) {
    console.log(p, idx, h.slice(Math.max(0, idx - 80), idx + 120).replace(/\s+/g, ' '));
    idx++; n++;
  }
}
