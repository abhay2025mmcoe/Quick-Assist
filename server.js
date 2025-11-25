const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));

// User schema
const userSchema = new mongoose.Schema({
    name: String
    email: { type: String, unique: true },
    password: String,
    role: String // 'user' or 'provider'
});
const User = mongoose.model('User', userSchema);

// Service schema
const serviceSchema = new mongoose.Schema({
    name: String,
    serviceType: String,
    contact: String,
    email: String,
    location: String,
    description: String
});
const Service = mongoose.model('Service', serviceSchema);

// Register
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const user = new User({ name, email, password, role });
        await user.save();
        res.json({ role: user.role });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        res.json({ role: user.role });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add service
app.post('/add-service', async (req, res) => {
    const { name, serviceType, contact, email, location, description } = req.body;
    try {
        const service = new Service({ name, serviceType, contact, email, location, description });
        await service.save();
        res.json({ message: 'Service added successfully' });
    } catch (err) {
        console.error('Add service error:', err);
        res.status(500).json({ error: 'Error adding service' });
    }
});

// Get services
app.get('/services', async (req, res) => {
    const { type } = req.query;
    try {
        const services = await Service.find(type ? { serviceType: type } : {});
        res.json(services);
    } catch (err) {
        console.error('Fetch services error:', err);
        res.status(500).json({ error: 'Error fetching services' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));