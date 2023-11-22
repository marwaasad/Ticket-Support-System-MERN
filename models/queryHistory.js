// models/queryHistory.js

const mongoose = require('mongoose');

const queryHistorySchema = new mongoose.Schema({
  ticketNumber: {
    type: String, // or whatever type your ticketNumber is
    required: true,
  },
  sender: {
    type: String, // 'admin' or 'user'
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('QueryHistory', queryHistorySchema);
