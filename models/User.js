const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user' }
})

userSchema.methods.setPassword = async function(plain) {
  const salt = await bcrypt.genSalt(10)
  this.passwordHash = await bcrypt.hash(plain, salt)
}

userSchema.methods.verifyPassword = async function(plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

module.exports = mongoose.model('User', userSchema)
