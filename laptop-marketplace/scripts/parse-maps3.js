const fs = require('fs');
const h = fs.readFileSync('d:/free/laptop-marketplace/google-maps.html', 'utf8');
// decode \u003d style escapes
const decoded = h.replace(/\\u([0-9a-f]{4})/gi, (_, c) => String.fromCharCode(parseInt(c, 16)));
const hex = [...decoded.matchAll(/0x[a-f0-9]+:0x[a-f0-9]+/gi)].map(m => m[0]);
console.log('hex', [...new Set(hex)]);
const ones = [...decoded.matchAll(/!1s([^!]+)!/g)].map(m => m[1]).filter(x => x.length < 80 && !x.includes('('));
console.log('!1s', [...new Set(ones)]);
