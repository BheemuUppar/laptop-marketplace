const fs = require('fs');
const h = fs.readFileSync('d:/free/laptop-marketplace/google-maps.html', 'utf8');
const marker = 'APP_INITIALIZATION_STATE=';
const start = h.indexOf(marker);
if (start < 0) { console.log('no APP_INITIALIZATION_STATE'); process.exit(1); }
let i = start + marker.length;
let depth = 0;
let started = false;
let end = i;
for (; end < h.length; end++) {
  const c = h[end];
  if (c === '[') { depth++; started = true; }
  else if (c === ']') {
    depth--;
    if (started && depth === 0) { end++; break; }
  }
}
const jsonStr = h.slice(i, end);
console.log('length', jsonStr.length);
try {
  const data = JSON.parse(jsonStr);
  const flat = JSON.stringify(data);
  console.log('has review-ish words', /laptop|warranty|staff|helpful|Google/i.test(flat));
  // find review-like arrays
  function walk(node, path = '') {
    if (typeof node === 'string' && node.length > 40 && node.length < 500) {
      if (/laptop|warranty|staff|price|service|helpful|good|best|refurb/i.test(node)) {
        console.log('TEXT:', node.slice(0, 200));
      }
    }
    if (Array.isArray(node)) node.forEach((v, idx) => walk(v, path + '[' + idx + ']'));
    else if (node && typeof node === 'object') Object.entries(node).forEach(([k,v]) => walk(v, path + '.' + k));
  }
  walk(data);
} catch (e) {
  console.log('parse error', e.message);
  console.log(jsonStr.slice(0, 500));
}
