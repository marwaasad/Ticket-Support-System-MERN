// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { jwtMiddleware } = require('./authMiddleware');

const userRoutes = require('./routes/Users');
const Ticket = require('./models/UserSchema');
const User = require('./models/UserRegister');
const QueryHistory = require('./models/queryHistory');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const mongoURI = "mongodb+srv://asadmarwa22:xyz123456@cluster0.g4g0cu3.mongodb.net/Ticket_Support_System"     

mongoose
  .connect(
    mongoURI,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err))

  app.use('/', userRoutes);
  
app.post('/users/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, '76B486F9CB43E4209D3BABDD478B894DAB2D8122EDF9F71FAC225A98E63D02EB', { expiresIn: '1h' });
    const base64Decoded = Buffer.from(token, 'base64');
    res.json({ base64Decoded });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/tickets/getTicketAll', jwtMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    // Find tickets associated with the currently logged-in user using their ID
    const userTickets = await Ticket.find({ user: userId });

    res.json(userTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/tickets/getAll/', async (req, res) => {
  try {
    const allTickets = await Ticket.find();
    res.json(allTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/tickets/changeStatus', async (req, res) => {
  const { ticketNumber, status } = req.body;

  // Validate input
  if (!ticketNumber || (status !== 'open' && status !== 'closed')) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    // Update the ticket status in the database
    const updatedTicket = await Ticket.findOneAndUpdate(
      { ticketNumber: ticketNumber },
      { $set: { status: status } },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/tickets/statusFilter', async (req, res) => {
  const { status } = req.body;

  try {
    const filteredTickets = await Ticket.find({ status }); // Assuming 'status' is a field in your Ticket model
    res.json(filteredTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/tickets/delete/:ticketNumber', async (req, res) => {
  const ticketNumber = req.params.ticketNumber;

  try {
    const deletedTicket = await Ticket.findOneAndDelete({ ticketNumber });

    if (deletedTicket) {
      res.json({ success: true, message: 'Ticket deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Ticket not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post(`/sendMessage/`, async (req, res) => {
  try {
    const { ticketNumber, message } = req.body;
    const sender = 'admin';

    const newMessage = new QueryHistory({ ticketNumber, sender, message });
    await newMessage.save();

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/query/getQueryHistory/:ticketNumber', async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const queryHistory = await QueryHistory.find({ ticketNumber }).sort({ timestamp: 1 });

    res.status(200).json(queryHistory);
  } catch (error) {
    console.error('Error fetching query history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
