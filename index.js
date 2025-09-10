const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Cloudinary (replace with your actual credentials)
cloudinary.config({
    cloud_name: 'dmczkumpi',
    api_key: '961697677923935',
    api_secret: 'foYF_bQpkTUN4MaRZdd4DYVncmA'
});

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

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
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(fileBuffer).pipe(stream);
  });
};
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

// Community Suggestion Schema
const suggestionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    suggestion: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

// Gallery Schema
const gallerySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const Event = mongoose.model('Event', eventSchema);
const Suggestion = mongoose.model('Suggestion', suggestionSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);

// Middleware to validate ID
const validateId = (req, res, next) => {
    if (!req.body.id) {
        return res.status(400).json({ error: 'id is required' });
    }
    next();
};

// CRUD for Events
app.post('/api/events', validateId, async (req, res) => {
    try {
        const { id, ...rest } = req.body;
        const event = await Event.findOneAndUpdate(
            { id },
            { $set: { id, ...rest } },
            { upsert: true, new: true, runValidators: true }
        );
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
        const event = await Event.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true, runValidators: true }
        );
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
app.post('/api/suggestions', validateId, async (req, res) => {
    try {
        const { id, ...rest } = req.body;
        const suggestion = await Suggestion.findOneAndUpdate(
            { id },
            { $set: { id, ...rest } },
            { upsert: true, new: true, runValidators: true }
        );
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
        const suggestion = await Suggestion.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true, runValidators: true }
        );
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

// CRUD for Gallery
app.post('/api/gallery', upload.single('image'), validateId, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
    }
    if (!req.body.description) {
        return res.status(400).json({ error: 'Description is required' });
    }
    try {
        console.log('Uploading to Cloudinary...');
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'image' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });
        console.log('Cloudinary upload result:', uploadResult);
        const { secure_url, public_id } = uploadResult;
        const { id, description } = req.body;
        console.log('Saving to MongoDB:', { id, description, secure_url, public_id });
        const galleryItem = await Gallery.findOneAndUpdate(
            { id },
            { $set: { id, description, imageUrl: secure_url, publicId: public_id } },
            { upsert: true, new: true, runValidators: true }
        );
        res.status(201).json(galleryItem);
    } catch (error) {
        console.error('Error in /api/gallery:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/gallery', async (req, res) => {
    try {
        const items = await Gallery.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/gallery/:id', async (req, res) => {
    try {
        const item = await Gallery.findOne({ id: req.params.id });
        if (!item) return res.status(404).json({ error: 'Gallery item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/gallery/:id', async (req, res) => {
    try {
        const item = await Gallery.findOne({ id: req.params.id });
        if (!item) return res.status(404).json({ error: 'Gallery item not found' });
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(item.publicId);
        // Delete from DB
        await Gallery.deleteOne({ id: req.params.id });
        res.json({ message: 'Gallery item deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
