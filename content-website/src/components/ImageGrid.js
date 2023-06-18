import React from 'react';

const ImageGrid = ({ imageUrls }) => {
  return (
    <div className="grid-container">
      {imageUrls.map((imageUrl, index) => (
        <div key={index} className="grid-item">
          <img src={imageUrl} alt={`Image ${index + 1}`} />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
