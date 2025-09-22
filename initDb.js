// initDb.js
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')
const Enquiry = require('./models/Enquiry')

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing in .env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  console.log('Connected to MongoDB for initialization')

  // Just ensure collections exist by creating empty models
  await User.init()
  await Enquiry.init()

  console.log('Database initialization completed (collections ready)')
  await mongoose.disconnect()
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
