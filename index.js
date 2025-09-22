require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const path = require('path')
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes')
const enquiryRoutes = require('./routes/enquiryRoutes')

const app = express()
const port = process.env.PORT || 3000

// Log all HTTP requests to console
app.use(morgan('tiny'));

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public_html')))

// Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error('Please set MONGO_URI in .env')
  process.exit(1)
}
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB error:', err)
    process.exit(1)
  })

// Sessions (local memory)
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 hours
}))

// Routes
app.use('/', authRoutes)
app.use('/', enquiryRoutes)

app.listen(port, () => console.log(`Web server running at: http://localhost:${port}`))
