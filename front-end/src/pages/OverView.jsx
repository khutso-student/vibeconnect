import { useState, useEffect, useContext } from "react";
import { MdOutlineVisibility, MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { getEvents, likeEvent } from "../services/event";
import { AuthContext } from "../context/AuthContext";

const EventCard = ({ event, onLike, user }) => {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md border border-[#e9e9e9] p-4 transition-all duration-300">
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col gap-1 w-full">
          <h2 className="text-[#1E1E1E] font-semibold text-lg">{event.title}</h2>
          <p className="text-sm text-[#555555]">{new Date(event.date).toLocaleDateString()}</p>
        </div>

        {/* Like Button */}
        {user?.role === "user" && (
          <button onClick={() => onLike(event)} className="focus:outline-none">
            {event.likedBy?.includes(user._id) ? (
              <MdFavorite className="text-[#F46BF9] text-xl" />
            ) : (
              <MdFavoriteBorder className="text-[#949494] hover:text-[#F46BF9] text-xl" />
            )}
          </button>
        )}
      </div>

      {/* Event Details */}
      <div className="flex justify-between items-center mt-3 text-[#555555] text-sm">
        <div className="flex items-center gap-2">
          <MdFavoriteBorder />
          <span>{event.likes || 0}</span>
          <MdOutlineVisibility />
          <span>{event.views || 0}</span>
        </div>

        <div className="flex items-center gap-2 text-[#949494]">
          <CiLocationOn />
          <span className="text-sm">{event.location}</span>
        </div>
      </div>
    </div>
  );
};

export default function OverView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getEvents();
      const eventList = Array.isArray(res) ? res : res.events || [];
      setEvents(eventList);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleLike = async (event) => {
    if (!user) return alert("Please log in to like events");
    if (user.role !== "user") return;

    try {
      const updated = await likeEvent(event._id, user.token);
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === event._id
            ? { ...ev, likes: updated.likes, likedBy: updated.likedByUser ? [user._id] : [] }
            : ev
        )
      );
    } catch (err) {
      console.error("Failed to like/unlike event:", err);
      alert(err.response?.data?.message || "Failed to like/unlike event");
    }
  };

  const filteredEvents = events.filter((event) => {
    const term = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(term) ||
      new Date(event.date).toLocaleDateString().includes(term) ||
      event.location.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-4 w-full h-full p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-[#555555] text-xl font-semibold">History of Events</h1>
          <p className="text-sm text-[#555555]">
            Total Overview: {events.length}
          </p>
        </div>
        <input
          type="search"
          placeholder="Filter by Name, Date, or Location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white w-full sm:w-1/2 text-sm px-4 py-2 focus:outline-[#ececec] border border-[#e9e9e9] rounded-md"
        />
      </div>

      {/* Event Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading events...</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500">No events found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} onLike={handleLike} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
