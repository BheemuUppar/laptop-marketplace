require('dotenv').config();
const { seedGoogleReviews } = require('./googleReviews');

seedGoogleReviews()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
