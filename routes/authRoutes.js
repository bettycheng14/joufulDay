const express = require('express')
const router = express.Router()
const User = require('../models/User')

// Render login page
router.get('/login', (req, res) => {
  return res.sendFile('login.html', { root: 'public_html' })
})

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).send('Email and password are required')

  const user = await User.findOne({ email })
  if (!user) return res.status(401).send('Invalid email or password')

  const match = await user.verifyPassword(password)
  if (!match) return res.status(401).send('Invalid email or password')

  // Store user info in session (without password hash)
  req.session.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || ''
  }

  res.redirect('/member-information')
})

// Render member information page
router.get('/member-information', (req, res) => {
  if (!req.session.user) return res.redirect('/login')
  return res.sendFile('member-information.html', { root: 'public_html' })
})

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err)
    res.clearCookie('connect.sid')
    res.redirect('/login')
  })
})

// Handle sign up
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).send('All fields are required')

  const existing = await User.findOne({ email })
  if (existing) return res.status(409).send('Email already registered')

  const newUser = new User({ name, email })
  await newUser.setPassword(password)
  await newUser.save()

  // Auto-login after signup
  req.session.user = {
    id: newUser._id.toString(),
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone || ''
  }

  res.redirect('/member-information')
})

// Get current user info (for populating member-info form)
router.get('/api/member', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' })
  res.json(req.session.user)
})

// Update member info
router.post('/api/member', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' })

  const { name, phone, password } = req.body
  const user = await User.findById(req.session.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (name) user.name = name
  if (phone) user.phone = phone
  if (password) await user.setPassword(password)

  await user.save()

  // Update session
  req.session.user.name = user.name
  req.session.user.phone = user.phone

  res.json({ success: true, user: req.session.user })
})

module.exports = router
