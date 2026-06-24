const fs = require('fs');
const h = fs.readFileSync('d:/free/laptop-marketplace/google-maps.html', 'utf8');
const keys = ['APP_INITIALIZATION', 'review', '4.9', '107', 'Local Guide', 'months ago', 'weeks ago', 'ihA8ara7Arbc1sQP0si-uAc'];
for (const k of keys) console.log(k, h.indexOf(k));

// Extract long quoted strings that might be review text
const re = /"([^"\\]{30,400})"/g;
let m;
const texts = [];
while ((m = re.exec(h)) !== null) {
  const s = m[1];
  if (/laptop|warranty|staff|price|service|good|best|helpful|HSR|iPro/i.test(s)) texts.push(s);
}
console.log('matching strings:', texts.slice(0, 20));
