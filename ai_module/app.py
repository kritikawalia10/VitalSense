from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import pandas as pd

app = FastAPI(title="VitalSense AI Engine")

# Configure CORS so Node backend/frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
MODEL_PATH = "model.joblib"
model = None

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    print(f"Warning: {MODEL_PATH} not found. Please run train.py first.")

class VitalsInput(BaseModel):
    bp: int
    heart_rate: int
    oxygen: int

# Mapping dictionary for predictions
RISK_MAP = {
    0: {"risk": "Normal", "suggestion": "All Good"},
    1: {"risk": "Warning", "suggestion": "Reduce Stress"},
    2: {"risk": "Critical", "suggestion": "Visit Doctor Immediately"}
}

@app.get("/")
def read_root():
    return {"message": "VitalSense AI Engine is running. Use POST /predict to analyze vitals."}

@app.post("/predict")
def predict_health(vitals: VitalsInput):
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded on the server.")
    
    try:
        # Convert input to DataFrame to match training feature names
        input_data = pd.DataFrame([{
            'blood_pressure': vitals.bp,
            'heart_rate': vitals.heart_rate,
            'oxygen_level': vitals.oxygen
        }])
        
        # Predict
        prediction = model.predict(input_data)[0]
        
        # Format response
        result = RISK_MAP.get(prediction, {"risk": "Unknown", "suggestion": "Consult Physician"})
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
