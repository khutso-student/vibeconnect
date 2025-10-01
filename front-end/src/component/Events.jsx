import React, { useContext } from "react";
import EventCard from "./EventCard";
import { likeEvent } from "../services/event";
import { AuthContext } from "../context/AuthContext";

export default function Events({ events = [], onLikeUpdate, searchTerm }) {
  const { user } = useContext(AuthContext);

  // Handle like/unlike
  const handleLike = async (event) => {
    if (!user) return alert("Please log in to like events");
    if (user.role !== "user") return;

    try {
      const updated = await likeEvent(event._id, user.token);
      // update parent state via callback
      onLikeUpdate({
        ...event,
        likes: updated.likes,
        likedBy: updated.likedBy,
      });
    } catch (err) {
      console.error("Failed to like/unlike event:", err);
      alert(err.response?.data?.message || "Failed to like/unlike event");
    }
  };

  // Filter events based on search
  const filteredEvents = (events || []).filter((event) => {
    const term = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term) ||
      new Date(event.date).toLocaleDateString().includes(term)
    );
  });

  return (
    <div className="flex flex-col w-full h-full p-2 sm:p-3">
      <h1 className="text-[#1E1E1E] font-semibold mb-4">All Events</h1>

      {filteredEvents.length === 0 ? (
        <p className="text-center">No available events</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-1 sm:p-2">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              id={event._id}
              title={event.title}
              date={new Date(event.date).toLocaleDateString()}
              time={event.time}
              description={event.description}
              location={event.location}
              likes={event.likes || 0}
              liked={user ? event.likedBy?.includes(user._id) : false}
              image={event.image}
              createdAt={event.createdAt}
              onLike={() => handleLike(event)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
