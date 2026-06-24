require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { slugify } = require('./slugify');

const IMG = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop&q=80';

const PRODUCTS = [
  // Lenovo ThinkPad
  {
    brand: 'Lenovo', model: 'ThinkPad T490 (i7-8th Gen)',
    processor: 'Intel Core i7-8665U', generation: '8th Gen',
    ram: '16 GB DDR4', storage: '256 GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" FHD IPS Touch Anti-Glare',
    sellingPrice: 32999,
    description: 'RAM upgradable up to 40GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'Lenovo', model: 'ThinkPad E14 G1',
    processor: 'Intel Core i7-10510U', generation: '10th Gen',
    ram: '8GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" FHD Anti-Glare',
    sellingPrice: 33999,
    description: 'Storage upgradable up to 1TB.',
  },
  {
    brand: 'Lenovo', model: 'ThinkPad T14 (Ryzen 7 Pro)',
    processor: 'AMD Ryzen 7 Pro 4750U', generation: 'Ryzen 4000 Series',
    ram: '16GB DDR4 (3200 MHz)', storage: '256GB SSD',
    graphics: 'AMD Radeon Graphics', displaySize: '14" FHD IPS Touch Anti-Glare',
    sellingPrice: 37999, originalPrice: 41999,
    description: 'Storage upgradable up to 1TB.',
  },
  {
    brand: 'Lenovo', model: 'ThinkPad P14s G1 (i7 Workstation)',
    processor: 'Intel Core i7-10510U', generation: '10th Gen',
    ram: '16GB DDR4', storage: '256GB SSD',
    graphics: '2GB NVIDIA Quadro P520', displaySize: '14" FHD Anti-Glare',
    sellingPrice: 38999, originalPrice: 44999,
    description: 'Mobile workstation with dedicated Quadro graphics.',
  },
  {
    brand: 'Lenovo', model: 'ThinkPad T14 (i7-10th Gen)',
    processor: 'Intel Core i7-10610U', generation: '10th Gen',
    ram: '16GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" FHD Anti-Glare',
    sellingPrice: 38999, originalPrice: 41999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'Lenovo', model: 'ThinkPad X13 (i7-10th Gen)',
    processor: 'Intel Core i7-10610U', generation: '10th Gen',
    ram: '16GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '13" FHD IPS Anti-Glare',
    sellingPrice: 37000, originalPrice: 39999,
    description: 'Storage upgradable up to 1TB.',
  },
  {
    brand: 'Lenovo', model: 'ThinkPad X13 (Ryzen 7 Pro)',
    processor: 'AMD Ryzen 7 Pro', generation: 'Ryzen Pro Series',
    ram: '16GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '13" FHD IPS Anti-Glare',
    sellingPrice: 35000,
    description: 'Storage upgradable up to 1TB.',
  },
  {
    brand: 'Lenovo', model: 'ThinkPad T490 (i7-10th Gen)',
    processor: 'Intel Core i7-10610U', generation: '10th Gen',
    ram: '16GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" FHD IPS',
    sellingPrice: 38999, originalPrice: 44999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'Lenovo', model: 'ThinkPad P14s G1 (i5 Workstation)',
    processor: 'Intel Core i5-10310U', generation: '10th Gen',
    ram: '8GB DDR4', storage: '256GB SSD',
    graphics: '2GB NVIDIA Quadro P520', displaySize: '14" FHD Anti-Glare',
    sellingPrice: 28999, originalPrice: 29499,
    description: 'Mobile workstation with dedicated Quadro graphics.',
  },
  {
    brand: 'Lenovo', model: 'ThinkPad T495',
    processor: 'AMD Ryzen 7 Pro', generation: 'Ryzen Pro Series',
    ram: '16GB DDR4', storage: '256GB SSD',
    graphics: 'AMD Radeon Graphics', displaySize: '14" FHD IPS Anti-Glare',
    sellingPrice: 31999, originalPrice: 37999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  // Dell
  {
    brand: 'Dell', model: 'Latitude 5410 (i5-10th Gen)',
    processor: 'Intel Core i5-10310U', generation: '10th Gen',
    ram: '8 GB', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" FHD',
    sellingPrice: 27999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'Dell', model: 'Latitude 5420 (i5-11th Gen)',
    processor: 'Intel Core i5 11th Gen', generation: '11th Gen',
    ram: '8GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" FHD',
    sellingPrice: 29999, originalPrice: 31999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'Dell', model: 'Precision 5570 (i7-12th Gen)',
    processor: 'Intel Core i7-12800H', generation: '12th Gen',
    ram: '16GB DDR5 (4800MHz)', storage: '512GB SSD',
    graphics: '8GB Nvidia RTX A1000 + Intel Integrated', displaySize: '15" FHD+',
    sellingPrice: 89999, originalPrice: 99999, condition: 'Excellent',
    description: 'Like new. 14-core processor. Storage upgradable up to 4TB.',
    featured: true,
  },
  {
    brand: 'Dell', model: 'Latitude 5450',
    processor: 'Intel Core Ultra 5 135U', generation: 'Core Ultra Series',
    ram: '16GB DDR5', storage: '256GB NVMe Gen 4 SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" QHD+',
    sellingPrice: 58999, condition: 'Excellent',
    description: 'Latest generation Core Ultra processor.',
    featured: true,
  },
  {
    brand: 'Dell', model: 'Latitude 5340 (i7-13th Gen)',
    processor: 'Intel Core i7-13650U', generation: '13th Gen',
    ram: '16GB DDR5', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '13.3" FHD Anti-Glare',
    sellingPrice: 58999,
    description: 'Storage upgradable up to 1TB.',
    featured: true,
  },
  {
    brand: 'Dell', model: 'Latitude 5401 (i7-9th Gen)',
    processor: 'Intel Core i7-9400H', generation: '9th Gen H-Series',
    ram: '8GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" FHD',
    sellingPrice: 38999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'Dell', model: 'Latitude 7400 (i7-8th Gen)',
    processor: 'Intel Core i7-8665U', generation: '8th Gen',
    ram: '8GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" FHD',
    sellingPrice: 29999, originalPrice: 31999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'Dell', model: 'Latitude 7490 (i7-8th Gen Touch)',
    processor: 'Intel Core i7-8665U', generation: '8th Gen',
    ram: '16GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" FHD Touch Screen',
    sellingPrice: 28999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'Dell', model: 'Latitude 7390 (i7-8th Gen Touch)',
    processor: 'Intel Core i7-8650U', generation: '8th Gen',
    ram: '8GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '13.3" FHD Anti-Glare Touch',
    sellingPrice: 28999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'Dell', model: 'Latitude 5400 (i5-8th Gen)',
    processor: 'Intel Core i5-8365U', generation: '8th Gen',
    ram: '8GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" FHD',
    sellingPrice: 22999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'Dell', model: 'Latitude 7490 (i5-8th Gen Touch)',
    processor: 'Intel Core i5-8350U', generation: '8th Gen',
    ram: '8GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" FHD IPS Touch Anti-Glare',
    sellingPrice: 22999, originalPrice: 26999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'Dell', model: 'Precision 5560',
    processor: 'Intel Core i7-11850H', generation: '11th Gen',
    ram: '16GB (3200MHz)', storage: '512GB SSD',
    graphics: '4GB Nvidia RTX A1200 + Intel Integrated', displaySize: '15" FHD',
    sellingPrice: 64999, originalPrice: 71999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 2TB.',
    featured: true,
  },
  // Apple
  {
    brand: 'Apple', model: 'MacBook Pro 13" M1 (A2338)',
    processor: 'Apple M1', generation: 'M1',
    ram: '16GB Unified Memory', storage: '256GB SSD',
    graphics: 'Apple M1 8-Core GPU', displaySize: '13.3" Retina with True Tone',
    sellingPrice: 47999, originalPrice: 57999, condition: 'Excellent',
    description: 'OS: macOS. M1 chip with 8-core CPU and 8-core GPU.',
    featured: true,
  },
  // HP
  {
    brand: 'HP', model: 'ProBook 635 Aero G7 (Ryzen 5 PRO)',
    processor: 'AMD Ryzen 5 PRO', generation: 'Ryzen Pro Series',
    ram: '8GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '13.3" FHD',
    sellingPrice: 28999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'HP', model: 'ProBook 635 Aero G7 (Ryzen 7 Pro)',
    processor: 'AMD Ryzen 7 Pro', generation: 'Ryzen Pro Series',
    ram: '8GB', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '13.3" FHD',
    sellingPrice: 34999, originalPrice: 39999,
    description: 'RAM upgradable up to 32GB. Storage upgradable up to 1TB.',
  },
  {
    brand: 'HP', model: 'ProBook 640 G8 (i5-11th Gen)',
    processor: 'Intel Core i5-1145G7', generation: '11th Gen',
    ram: '8GB DDR4', storage: '256GB SSD',
    graphics: 'Intel Integrated Graphics', displaySize: '14" Full HD',
    sellingPrice: 30999, originalPrice: 36999,
    description: 'RAM upgradable up to 32GB.',
  },
];

async function seedProducts() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`Database already has ${existing} products. Clearing before re-seed...`);
    await Product.deleteMany({});
  }

  const docs = PRODUCTS.map((p) => {
    let slug = slugify(p.brand, p.model);
    return {
      brand: p.brand,
      model: p.model,
      slug,
      processor: p.processor,
      generation: p.generation,
      ram: p.ram,
      storage: p.storage,
      graphics: p.graphics,
      displaySize: p.displaySize,
      batteryHealth: p.batteryHealth ?? 85,
      condition: p.condition ?? 'Good',
      warrantyMonths: p.warrantyMonths ?? 3,
      quantityAvailable: p.quantityAvailable ?? 1,
      sellingPrice: p.sellingPrice,
      originalPrice: p.originalPrice,
      description: p.description,
      images: p.images ?? [IMG],
      featured: p.featured ?? false,
      isAvailable: true,
    };
  });

  // Ensure unique slugs for duplicates
  const slugCounts = {};
  for (const doc of docs) {
    if (slugCounts[doc.slug]) {
      slugCounts[doc.slug]++;
      doc.slug = `${doc.slug}-${slugCounts[doc.slug]}`;
    } else {
      slugCounts[doc.slug] = 1;
    }
  }

  const inserted = await Product.insertMany(docs);
  console.log(`Successfully inserted ${inserted.length} products.`);

  const byBrand = {};
  for (const p of inserted) {
    byBrand[p.brand] = (byBrand[p.brand] || 0) + 1;
  }
  console.log('By brand:', byBrand);

  process.exit(0);
}

seedProducts().catch((err) => {
  console.error(err);
  process.exit(1);
});
