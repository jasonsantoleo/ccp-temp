import React, { useState } from "react";
import axios from "axios";

// Default to port 4000 instead of 5000
const DEFAULT_API_URL = "http://localhost:4000/api/detect-anomalies";

const ImageUploader = ({ onImageSelect }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full"
      />
      <p className="text-sm text-gray-500 mt-2">
        Upload your hyperspectral image file
      </p>
    </div>
  );
};

const HyperspectralAnomalyDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);

  const handleUpload = (file) => {
    setSelectedImage(file);
    setError(null);
  };

  const handleApiUrlChange = (event) => {
    setApiUrl(event.target.value);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("image", selectedImage);
    
    try {
      const response = await axios.post(apiUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setError(error.response?.data?.error || "Failed to analyze the image. Check if the API server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Hyperspectral Anomaly Detection</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">API URL:</label>
        <input
          type="text"
          value={apiUrl}
          onChange={handleApiUrlChange}
          className="w-full p-2 border rounded-md"
          placeholder="http://localhost:4000/api/detect-anomalies"
        />
      </div>
      
      <div className="mb-6">
        <ImageUploader onImageSelect={handleUpload} />
        {selectedImage && (
          <p className="mt-2 text-sm text-green-600">
            Selected: {selectedImage.name}
          </p>
        )}
      </div>
      
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Analyzing..." : "Analyze Image"}
      </button>
      
      {error && <p className="mt-4 text-red-600">{error}</p>}
      
      {result && (
        <div className="mt-6 p-4 border rounded-md">
          <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Anomalies detected: {result.anomaly_count}</p>
              <p className="mt-1">Total pixels: {result.total_pixels}</p>
              <p className="mt-1">
                Anomaly percentage: {((result.anomaly_count / result.total_pixels) * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">Visualization:</p>
              {result.visualization && (
                <img 
                  src={`data:image/png;base64,${result.visualization}`} 
                  alt="Anomaly Detection Map" 
                  className="w-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HyperspectralAnomalyDetection;