require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Enquiry = require('./models/Enquiry');
const Tour = require('./models/Tour');
const tourData = require('./data/tours.json');

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('❌ MONGO_URI missing in .env');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Ensure collections exist (indexes built)
    await Promise.all([User.init(), Enquiry.init(), Tour.init()]);
    console.log('✅ Collections ready');

    // Reset and insert Tour data
    await Tour.deleteMany();
    await Tour.insertMany(tourData);
    console.log(`✅ Inserted ${tourData.length} tours`);

  } catch (err) {
    console.error('❌ Error during initialization:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

main();
