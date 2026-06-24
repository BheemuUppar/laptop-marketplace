const fs = require('fs');
const h = fs.readFileSync('d:/free/laptop-marketplace/google-maps.html', 'utf8');
const hex = [...h.matchAll(/0x[a-f0-9]+:0x[a-f0-9]+/gi)].map(m => m[0]);
console.log('hex ids', [...new Set(hex)].slice(0, 20));
const ones = [...h.matchAll(/!1s([^!]+)!/g)].map(m => m[1]);
console.log('!1s ids', [...new Set(ones)].slice(0, 20));
