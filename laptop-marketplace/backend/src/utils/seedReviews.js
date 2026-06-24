require('dotenv').config();
const { connectMongo } = require('./connectMongo');
const Review = require('../models/Review');

const SAMPLE_REVIEWS = [
  {
    customerName: 'Rahul Sharma',
    customerRole: 'Software Developer',
    customerCompany: 'Tech Startup, Bengaluru',
    customerImage: '',
    rating: 5,
    reviewText:
      'Bought a refurbished Dell Latitude from iPro Technologies. The laptop was in excellent condition, battery health was as promised, and the price was much better than other stores in HSR Layout.',
    isVisible: true,
    isFeatured: true,
    displayOrder: 1,
  },
  {
    customerName: 'Priya Nair',
    customerRole: 'MBA Student',
    customerCompany: 'Christ University',
    customerImage: '',
    rating: 5,
    reviewText:
      'Needed an affordable laptop for college. The team helped me choose the right HP model with 16GB RAM. Warranty was explained clearly and the whole process was smooth.',
    isVisible: true,
    isFeatured: true,
    displayOrder: 2,
  },
  {
    customerName: 'Arjun Mehta',
    customerRole: 'Freelance Designer',
    customerCompany: 'Self-employed',
    customerImage: '',
    rating: 4,
    reviewText:
      'Picked up a Lenovo ThinkPad for design work. Good build quality and fair pricing. They also upgraded the SSD at a reasonable cost. Happy with the purchase.',
    isVisible: true,
    isFeatured: true,
    displayOrder: 3,
  },
  {
    customerName: 'Sneha Reddy',
    customerRole: 'HR Manager',
    customerCompany: 'Koramangala',
    customerImage: '',
    rating: 5,
    reviewText:
      'We bought three refurbished laptops for our office from iPro. All devices were tested before handover. Support after sale has been responsive whenever we had questions.',
    isVisible: true,
    isFeatured: false,
    displayOrder: 4,
  },
  {
    customerName: 'Karthik Iyer',
    customerRole: 'Business Owner',
    customerCompany: 'HSR Layout',
    customerImage: '',
    rating: 5,
    reviewText:
      'Visited the store on 13th Cross Road and inspected multiple MacBooks before buying. Transparent about condition grades and no pressure selling. Highly recommend for used laptops.',
    isVisible: true,
    isFeatured: true,
    displayOrder: 5,
  },
];

async function seedReviews() {
  await connectMongo();
  const existing = await Review.countDocuments();
  if (existing > 0) {
    console.log(`Reviews collection already has ${existing} record(s). Skipping seed.`);
    console.log('To re-seed, delete reviews from MongoDB first, then run npm run seed:reviews');
    process.exit(0);
  }
  await Review.insertMany(SAMPLE_REVIEWS);
  console.log(`Seeded ${SAMPLE_REVIEWS.length} sample testimonials.`);
  process.exit(0);
}

seedReviews().catch(err => {
  console.error(err.message);
  process.exit(1);
});
