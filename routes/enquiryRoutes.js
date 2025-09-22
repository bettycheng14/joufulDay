const express = require('express')
const router = express.Router()
const Enquiry = require('../models/Enquiry')

// Middleware to protect admin routes
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next()
  return res.redirect('/login')
}

// POST: submit enquiry
router.post('/enquiry', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).send('Name, email, and message are required.')
    }

    const e = new Enquiry({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      subject: subject?.trim(),
      message: message.trim(),
      submittedAt: new Date()
    })

    await e.save()

    res.status(200).send('success')
  } catch (err) {
    console.error('Error saving enquiry:', err)
    res.status(500).send('Error saving enquiry')
  }
})

// HTML escape helper
function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

module.exports = router
