import numpy as np
import io
import base64
import argparse
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import IsolationForest
from sklearn.decomposition import PCA
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend

# Parse command line arguments
parser = argparse.ArgumentParser(description='Run the hyperspectral anomaly detection API server.')
parser.add_argument('--port', type=int, default=4000, help='Port to run the server on')
parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to run the server on')
args = parser.parse_args()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def generate_synthetic_hyperspectral_data(rows=100, cols=100, bands=50):
    data = np.random.rand(rows, cols, bands) * 255  # Simulating hyperspectral cube
    data = data.astype(np.uint8)
    # Introduce anomalies (high-intensity pixels in a specific range)
    num_anomalies = 20
    for _ in range(num_anomalies):
        x, y = np.random.randint(0, rows), np.random.randint(0, cols)
        data[x, y, :] = np.random.randint(200, 255, bands)  # High reflectance anomaly
    return data

def detect_anomalies(data):
    rows, cols, bands = data.shape
    reshaped_data = data.reshape(rows * cols, bands)  # Flatten spatial dimensions
    
    # Apply PCA for dimensionality reduction
    pca = PCA(n_components=5)
    reduced_data = pca.fit_transform(reshaped_data)
    
    # Use Isolation Forest for anomaly detection
    iso_forest = IsolationForest(contamination=0.01, random_state=42)
    anomaly_scores = iso_forest.fit_predict(reduced_data)
    
    # Reshape back to image size
    anomaly_map = anomaly_scores.reshape(rows, cols)
    return anomaly_map

def create_visualization(anomaly_map):
    plt.figure(figsize=(10, 8))
    plt.imshow(anomaly_map, cmap='coolwarm')
    plt.title('Anomaly Detection Map')
    plt.colorbar()
    
    # Save plot to a bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    
    # Encode the image to base64
    img_str = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close()
    
    return img_str

def process_hyperspectral_image(image_data):
    """
    Process the uploaded hyperspectral image.
    For now, we'll use synthetic data, but this would be replaced with actual image processing.
    """
    # In a real scenario, you would extract the hyperspectral data from the image
    # For demo purposes, we'll generate synthetic data
    data = generate_synthetic_hyperspectral_data()
    
    # Detect anomalies
    anomaly_map = detect_anomalies(data)
    
    # Create visualization
    visualization = create_visualization(anomaly_map)
    
    # Count detected anomalies (where value is -1)
    anomaly_count = np.sum(anomaly_map == -1)
    
    return {
        "anomaly_count": int(anomaly_count),
        "total_pixels": data.shape[0] * data.shape[1],
        "visualization": visualization
    }

@app.route('/api/detect-anomalies', methods=['POST'])
def api_detect_anomalies():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400
    
    try:
        # Process the image
        result = process_hyperspectral_image(file)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print(f"Starting server on port {args.port}...")
    app.run(debug=True, host=args.host, port=args.port)