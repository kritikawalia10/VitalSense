const HealthData = require('../models/HealthData');
const Alert = require('../models/Alert');
const { predictHealthRisk } = require('./aiService');

let currentVitals = {
  bp: 120,
  heartRate: 70,
  oxygen: 98,
  timestamp: new Date()
};

let lastDbSave = Date.now();

const startSimulation = () => {
  setInterval(async () => {
    // Random Walk: Fluctuate by small increments rather than jumping to random values
    const bpDelta = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const hrDelta = Math.floor(Math.random() * 3) - 1; // -1 to +1
    const oxDelta = Math.floor(Math.random() * 3) - 1; // -1 to +1

    currentVitals.bp = Math.max(100, Math.min(160, currentVitals.bp + bpDelta));
    currentVitals.heartRate = Math.max(50, Math.min(120, currentVitals.heartRate + hrDelta));
    currentVitals.oxygen = Math.max(88, Math.min(100, currentVitals.oxygen + oxDelta));
    currentVitals.timestamp = new Date();

    // Call the AI Module for a prediction
    const aiPrediction = await predictHealthRisk(currentVitals);
    
    // We consider it an anomaly if the AI says Warning or Critical, OR if the API is down and fallback rules trigger
    const fallbackAnomaly = currentVitals.bp > 140 || currentVitals.heartRate > 100;
    const isAnomaly = aiPrediction ? (aiPrediction.risk === 'Warning' || aiPrediction.risk === 'Critical') : fallbackAnomaly;
    
    const timeSinceLastSave = Date.now() - lastDbSave;

    // Save to DB on anomaly or every 5 minutes (300000 ms)
    if (isAnomaly || timeSinceLastSave >= 300000) {
      try {
        const newData = new HealthData(currentVitals);
        await newData.save();
        lastDbSave = Date.now();

        // Generate Alert based on AI Prediction
        if (aiPrediction) {
          if (aiPrediction.risk === 'Critical' || aiPrediction.risk === 'Warning') {
            await new Alert({ 
              severity: aiPrediction.risk, 
              message: `AI Detection (${aiPrediction.risk}): ${aiPrediction.suggestion}. BP: ${currentVitals.bp}, HR: ${currentVitals.heartRate}` 
            }).save();
          }
        } else {
          // Fallback alerts if AI is unreachable
          if (currentVitals.bp > 140) {
            await new Alert({ severity: 'High', message: `High Blood Pressure detected: ${currentVitals.bp} mmHg` }).save();
          }
          if (currentVitals.heartRate > 100) {
            await new Alert({ severity: 'Critical', message: `Critical Heart Rate detected: ${currentVitals.heartRate} bpm` }).save();
          }
        }
      } catch (err) {
        console.error('Error saving simulated data:', err);
      }
    }
  }, 5000);
};

const getLatestVitals = () => {
  return currentVitals;
};

module.exports = { startSimulation, getLatestVitals };
