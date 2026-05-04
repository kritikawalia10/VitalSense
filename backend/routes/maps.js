const express = require('express');
const router = express.Router();
const axios = require('axios');

// @route   GET api/maps/hospitals
// @desc    Proxy request to Overpass API to avoid CORS issues
// @access  Public
router.get('/hospitals', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ msg: 'Please provide latitude and longitude' });
    }

    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:10000,${lat},${lon});
        way["amenity"="hospital"](around:10000,${lat},${lon});
        relation["amenity"="hospital"](around:10000,${lat},${lon});
      );
      out center;
    `;

    // Using lz4 mirror which is often more reliable/faster for proxy requests
    const response = await axios.get(`https://lz4.overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'VitalSense-Health-App/1.0'
      }
    });
    
    res.json(response.data);
  } catch (err) {
    console.error('Maps Proxy Error:', err.response?.data || err.message);
    res.status(500).json({ 
      msg: 'Server Error while fetching map data', 
      error: err.response?.data || err.message 
    });
  }
});

module.exports = router;
