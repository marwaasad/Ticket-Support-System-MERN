const express = require('express');
const multer = require('multer');
const shortid = require('shortid');
const User = require('../models/UserSchema');
const { jwtMiddleware } = require('../authMiddleware');

const router = express.Router();
const upload = multer();

router.post('/create-ticket/', jwtMiddleware, upload.none(), async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const ticketNumber = shortid.generate();
    const status = 'open';
    const { userId } = req;
    const user = new User({ name, email, message, user:userId, ticketNumber, status });
    await user.save();
    res.status(201).json({ message: 'Ticket received successfully' });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
