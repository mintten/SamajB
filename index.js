const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
  mongoose.connect('mongodb+srv://minttenprofessional:mzUERcyupdBHGWjv@cluster0.jlwqcdk.mongodb.net/communityDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

app.get('/', (req, res) => {
  const connectionStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.status(200).json({
    message: 'API is running now',
    mongoDBStatus: statusMap[connectionStatus] || 'unknown'
  });
});

// Community Event Schema
const eventSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    functionType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const Event = mongoose.model('Event', eventSchema);

// Community Suggestion Schema
const suggestionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    suggestion: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

// CRUD for Events
app.post('/api/events', async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findOne({ id: req.params.id });
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({ id: req.params.id });
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD for Suggestions
app.post('/api/suggestions', async (req, res) => {
    try {
        const suggestion = new Suggestion(req.body);
        await suggestion.save();
        res.status(201).json(suggestion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/suggestions', async (req, res) => {
    try {
        const suggestions = await Suggestion.find();
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/suggestions/:id', async (req, res) => {
    try {
        const suggestion = await Suggestion.findOne({ id: req.params.id });
        if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });
        res.json(suggestion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/suggestions/:id', async (req, res) => {
    try {
        const suggestion = await Suggestion.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });
        res.json(suggestion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/suggestions/:id', async (req, res) => {
    try {
        const suggestion = await Suggestion.findOneAndDelete({ id: req.params.id });
        if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });
        res.json({ message: 'Suggestion deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});