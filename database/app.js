require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI || "mongodb+srv://jzhaobasic:1F6DNvlnsvNdGIOb@spots.8xgfr.mongodb.net/test?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connection established'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process with failure
    });

// Define Schema for individual location
const individualLocationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    hours: { type: String, required: true },
    restroom: { type: String, required: true },
    parking: { type: String, required: true },
    rating: { type: Number, default: null }
}, { _id: false }); // Disable _id for subdocuments

// Define Schema for the entire document containing the locations array
const locationsSchema = new mongoose.Schema({
    locations: { type: [individualLocationSchema], required: true }
}, { collection: 'locations' }); // Explicitly specify the collection name

const Locations = mongoose.model('Locations', locationsSchema);

// Define the /data endpoint
app.get('/data', async (req, res) => {
    console.log('Received request to /data');
    try {
        const locationsDoc = await Locations.findOne().lean(); // Fetch the single document as plain JS object
        console.log('Fetched locationsDoc:', locationsDoc);
        if (!locationsDoc) {
            console.log('No locations document found');
            return res.json({ locations: [] });
        }
        res.json({ locations: locationsDoc.locations }); // Return the locations array
    } catch (error) {
        console.error('Error in /data endpoint:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

app.get('/data', (req, res) => {
    res.json({ locations: [{ name: "Test Location", type: "Test Type", hours: "Test Hours", restroom: "Yes", parking: "No", rating: 5.0 }] });
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle undefined routes (Optional)
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
