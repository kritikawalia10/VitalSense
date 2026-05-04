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

    const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    
    res.json(response.data);
  } catch (err) {
    console.error('Maps Proxy Error:', err.message);
    res.status(500).send('Server Error while fetching map data');
  }
});

module.exports = router;
