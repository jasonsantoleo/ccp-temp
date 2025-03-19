import React from "react";

const ImageUploader = ({ onImageSelect }) => {
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageSelect(file); // Pass the file to the parent component
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
    </div>
  );
};

export default ImageUploader;
