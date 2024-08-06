const express = require('express');
const https = require('https');
require('dotenv').config();
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/test', (req, res) => {
    res.send('Test route is working');
});


app.post('/check-hotspot', async (req, res) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    try {
        const isHotspot = await checkHotspot(latitude, longitude);
        res.json({ isHotspot });
    } catch (error) {
        console.error('Error in /check-hotspot:', error.message); 
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function checkHotspot(latitude, longitude) {
    const radius = 10; // 10 miles
    const minListings = 3000;

    const apiKey = process.env.AIRBNB_API_KEY;
    if (!apiKey) {
        throw new Error('API key is missing');
    }

    const url = `https://airbnb-listings.p.rapidapi.com/v2/listingsByLatLng?lat=${latitude}&lng=${longitude}&range=${radius}&offset=0`;

    try {
        const response = await axios.get(url, {
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'airbnb-listings.p.rapidapi.com'
            }
        });

        console.log('API Response:', response.data);

        if (response.data.error) {
            console.error('API Error:', response.data.error);
            throw new Error(response.data.error);
        }

        const listings = response.data.listings ? response.data.listings.length : 0;
        return listings >= minListings;
    } catch (error) {
        console.error('Error fetching or parsing data:', error.message);
        throw error;
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
