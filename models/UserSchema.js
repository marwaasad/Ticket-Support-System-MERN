
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: false },
  message: { type: String, required: true },
  ticketNumber: { type: String},
  status: {
    type: String,
    enum: ['open', 'closed'], 
    default: 'open',
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
