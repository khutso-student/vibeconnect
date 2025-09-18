import { useState, useEffect } from "react";

function EventCarousel({ events = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (events.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % events.length);
    }, 3000); // change slide every 3 seconds

    return () => clearInterval(interval);
  }, [events]);

  if (events.length === 0) return <p className="text-gray-300">No event images available</p>;

  const event = events[currentIndex];

  return (
    <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
      <img
        src={event.image.startsWith("http") ? event.image : `http://localhost:5000${event.image}`}
        alt={event.title}
        className="w-full h-full object-cover transition-transform duration-700"
      />
      <div className="absolute  bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        {event.title}
      </div>
    </div>
  );
}

export default EventCarousel;
