import { useState } from 'react';

export default function ImageGallery({ images = [], productName, productId }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages =
    images.length > 0
      ? images
      : [
          {
            id: 0,
            productId,
            url: `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop`,
            isMain: true,
          },
        ];

  const sortedImages = [...displayImages].sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
  const selectedImage = sortedImages[selectedIndex] || sortedImages[0];

  const handlePrev = () =>
    setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  const handleNext = () =>
    setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));

  return (
    <div className="image-gallery">
      <div className="image-gallery__main">
        <img src={selectedImage.url} alt={productName} />
        {sortedImages.length > 1 && (
          <>
            <button className="image-gallery__nav image-gallery__nav--prev" onClick={handlePrev}>
              ‹
            </button>
            <button className="image-gallery__nav image-gallery__nav--next" onClick={handleNext}>
              ›
            </button>
          </>
        )}
      </div>
      {sortedImages.length > 1 && (
        <div className="image-gallery__thumbs">
          {sortedImages.map((image, index) => (
            <img
              key={image.id}
              src={image.url}
              alt={`${productName} ${index + 1}`}
              className={`image-gallery__thumb ${
                selectedIndex === index ? 'image-gallery__thumb--active' : ''
              }`}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
