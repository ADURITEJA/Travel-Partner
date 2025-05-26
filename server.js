const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = 3000;

const GOOGLE_MAPS_API_KEY = "AIzaSyDRJfjNiVjWmidzsJSrA62p0S4Mlcb4yH0";

app.use(cors());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.get('/api/places', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ 
      error: 'Latitude and Longitude are required',
      status: 'error'
    });
  }

  const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=2000&type=tourist_attraction&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(placesUrl);
    const data = await response.json();
    
    if (data.error_message) {
      console.error('Google Maps API Error:', data.error_message);
      return res.status(403).json({
        error: 'Google Maps API Error',
        details: data.error_message,
        status: 'error'
      });
    }

    res.json({
      status: 'success',
      data
    });
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ 
      error: 'Failed to fetch places data',
      details: error.message,
      status: 'error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Google Maps API Key:', GOOGLE_MAPS_API_KEY);
});