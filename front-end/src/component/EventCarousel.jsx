import { useState, useEffect } from "react";

function EventCarousel({ events = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Asset base URL for images
  const ASSET_URL = import.meta.env.VITE_ASSET_URL || "http://localhost:5000";

  useEffect(() => {
    if (events.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % events.length);
    }, 3000); // change slide every 3 seconds

    return () => clearInterval(interval);
  }, [events]);

  if (events.length === 0) 
    return <p className="text-gray-300">No event images available</p>;

  const event = events[currentIndex];

  // Construct full image URL using ASSET_URL
  const imageUrl = event.image
    ? event.image.startsWith("http")
      ? event.image
      : `${ASSET_URL}${event.image.startsWith("/") ? "" : "/"}${event.image}`
    : "";

  return (
    <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
      {imageUrl ? (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={event.title || "Event"}
          className="w-full h-full object-cover transition-opacity duration-700 opacity-100"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No image
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        {event.title || "Untitled Event"}
      </div>
    </div>
  );
}

export default EventCarousel;
