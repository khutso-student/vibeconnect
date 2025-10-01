import { useState, useEffect, useContext } from "react";
import { MdOutlineVisibility, MdFavorite } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { AuthContext } from "../context/AuthContext";
import { getLikedEvents } from "../services/event";

export default function Liked({ refreshSignal }) {
  // refreshSignal can be a state from Home.jsx that changes when user likes/unlikes an event
  const [likedEvents, setLikedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);

  const fetchLikedEvents = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const events = await getLikedEvents(user.token); // returns array
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
  }, [user, refreshSignal]); // ✅ refetch if user changes or refreshSignal changes

  const formatLikes = (count) =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;

  if (loading) return <p>Loading liked events...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!likedEvents.length) return <p>You haven't liked any events yet.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {likedEvents.map((event) => (
        <div key={event._id} className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-lg">{event.title}</h2>
          <p className="text-gray-500">{event.location}</p>
          <div className="flex items-center gap-2 mt-2">
            <MdFavorite className="text-red-500" /> {formatLikes(event.likes)}
          </div>
        </div>
      ))}
    </div>
  );
}
