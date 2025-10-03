import { useState, useEffect, useContext } from "react";
import { MdOutlineVisibility, MdFavorite } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { AuthContext } from "../context/AuthContext";
import { getLikedEvents } from "../services/event";

export default function Liked({ refreshSignal }) {
  const [likedEvents, setLikedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);

  const fetchLikedEvents = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const events = await getLikedEvents(user.token);
      setLikedEvents(events);
    } catch (err) {
      console.error("Failed to fetch liked events:", err);
      setError("Failed to load liked events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedEvents();
  }, [user, refreshSignal]);

  const formatCount = (count) => (count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count);

  const getImageSrc = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  if (loading) return <p className="text-center py-4">Loading liked events...</p>;
  if (error) return <p className="text-center py-4 text-red-500">{error}</p>;
  if (!likedEvents.length)
    return (
      <div className="flex justify-center items-center w-full h-full py-10">
        <p className="text-gray-400 text-lg">You haven't liked any events yet.</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {likedEvents.map((event) => (
        <div
          key={event._id}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
        >
          {/* Event Image */}
          {event.image ? (
            <img
              src={getImageSrc(event.image)}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400">
              No Image
            </div>
          )}

          {/* Event Info */}
          <div className="p-4">
            <h2 className="text-lg font-semibold text-purple-800">{event.title}</h2>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
              <CiLocationOn /> {event.location}
            </p>
            <p className="text-gray-500 text-sm mt-1">
               {event.time}
            </p>

            <div className="flex justify-between items-center mt-4 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <MdFavorite className="text-red-500" /> {formatCount(event.likes)}
              </div>
              <div className="flex items-center text-gray-400 gap-2">
                <MdOutlineVisibility /> {formatCount(event.views)}
              </div>
            </div>

            <p className="text-gray-700 text-xs sm:text-sm mt-2 line-clamp-3">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
