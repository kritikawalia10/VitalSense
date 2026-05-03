import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
import joblib

def generate_dummy_data(num_samples=1000):
    np.random.seed(42)
    
    # Normal Data (Risk: 0)
    normal_size = int(num_samples * 0.5)
    normal_bp_sys = np.random.randint(90, 120, normal_size)
    normal_hr = np.random.randint(60, 100, normal_size)
    normal_o2 = np.random.randint(95, 100, normal_size)
    normal_risk = np.zeros(normal_size)
    
    # Warning Data (Risk: 1)
    warning_size = int(num_samples * 0.3)
    warning_bp_sys = np.random.randint(121, 140, warning_size)
    warning_hr = np.random.randint(101, 120, warning_size)
    warning_o2 = np.random.randint(90, 94, warning_size)
    warning_risk = np.ones(warning_size)
    
    # Critical Data (Risk: 2)
    critical_size = num_samples - normal_size - warning_size
    critical_bp_sys = np.random.randint(141, 180, critical_size)
    critical_hr = np.random.randint(121, 160, critical_size)
    critical_o2 = np.random.randint(80, 89, critical_size)
    critical_risk = np.full(critical_size, 2)
    
    bp_sys = np.concatenate([normal_bp_sys, warning_bp_sys, critical_bp_sys])
    hr = np.concatenate([normal_hr, warning_hr, critical_hr])
    o2 = np.concatenate([normal_o2, warning_o2, critical_o2])
    risk = np.concatenate([normal_risk, warning_risk, critical_risk])
    
    # Shuffle
    indices = np.arange(num_samples)
    np.random.shuffle(indices)
    
    data = pd.DataFrame({
        'blood_pressure': bp_sys,
        'heart_rate': hr,
        'oxygen_level': o2,
        'risk_level': risk
    })
    return data.iloc[indices]

if __name__ == "__main__":
    print("Generating dataset...")
    df = generate_dummy_data(1000)
    
    X = df[['blood_pressure', 'heart_rate', 'oxygen_level']]
    y = df['risk_level']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Decision Tree model...")
    model = DecisionTreeClassifier(max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    print(f"Model Accuracy: {score * 100:.2f}%")
    
    # Save the model
    model_filename = "model.joblib"
    joblib.dump(model, model_filename)
    print(f"Model saved to {model_filename}")
