// AI Service to communicate with Python FastAPI module
const predictHealthRisk = async (vitals) => {
  try {
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bp: vitals.bp,
        heart_rate: vitals.heartRate,
        oxygen: vitals.oxygen,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to communicate with AI Module:', error.message);
    return null;
  }
};

module.exports = { predictHealthRisk };
