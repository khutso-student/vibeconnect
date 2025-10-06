import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  MdFavoriteBorder, 
  MdFavorite, 
  MdOutlineVisibility, 
  MdEdit, 
  MdDelete 
} from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { likeEvent, incrementViews } from "../services/event";

export default function EventCard({
  id,
  title,
  date,
  time,
  description,
  location,
  likes = 0,
  liked = false,
  views = 0,
  image,
  createdAt,
  onEdit,
  onDelete,
  showAdminActions = false,
}) {
  const { user } = useContext(AuthContext);
  const [reacting, setReacting] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);
  const [viewCount, setViewCount] = useState(views);

  useEffect(() => {
    setReacting(liked);
  }, [liked]);

  useEffect(() => {
    const incrementView = async () => {
      try {
        const updated = await incrementViews(id);
        if (updated?.views !== undefined) setViewCount(updated.views);
      } catch (error) {
        console.error("❌ Failed to increment view count:", error);
      }
    };
    incrementView();
  }, [id]);

  const handleLike = async () => {
    if (!user?.token) return alert("You must log in to like events");

    try {
      const updated = await likeEvent(id, user.token);
      setLikeCount(updated.likes);
      setReacting(updated.likedByUser);
    } catch (error) {
      console.error("❌ Failed to like/unlike event:", error);
      alert(error.response?.data?.message || error.message);
    }
  };

  const formatLikes = (count) => (count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count);

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const diffMs = new Date() - new Date(dateString);
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  // ============================
  // Determine image URL dynamically
  // ============================
  const getImageSrc = (img) => {
    if (!img) return null;
    // Cloudinary URLs already have http/https
    if (img.startsWith("http")) return img;
    // Local uploads (prepend backend BASE_URL)
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    return img.startsWith("/") ? `${base}${img}` : `${base}/${img}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-[#d6d6d6] overflow-hidden hover:scale-105 transform transition-all duration-300 ">
      {/* Image */}
      <div className="w-full h-48 overflow-hidden">
        {image ? (
          <img
            src={getImageSrc(image)}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            No Image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-purple-800">{title}</h2>
            {user?.role === "user" && (
              <div onClick={handleLike} className="cursor-pointer">
                {reacting ? (
                  <MdFavorite className="text-[#F46BF9] text-2xl" />
                ) : (
                  <MdFavoriteBorder className="text-gray-400 hover:text-[#F46BF9] text-2xl" />
                )}
              </div>
            )}

        </div>

        <div className="flex gap-2 mb-2">
          <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-md text-sm font-medium">
            {date}
          </span>
          <span className="bg-green-200 text-green-800 px-2 py-1 rounded-md text-sm font-medium">
            {time}
          </span>
        </div>

        <p className="text-gray-600 mb-2">{description}</p>

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <div className="flex items-center gap-1">
              <MdFavorite className="text-[#F46BF9]" />
              <span>{formatLikes(likeCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MdOutlineVisibility />
              <span>{viewCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 items-center text-gray-500 text-sm">
              <CiLocationOn /> <span>{location}</span>
            </div>

            {user?.role === "admin" && showAdminActions && (
              <>
                <button onClick={onEdit} className="p-1 bg-gray-100 hover:bg-gray-200 rounded-md">
                  <MdEdit />
                </button>
                <button onClick={onDelete} className="p-1 bg-red-100 hover:bg-red-200 rounded-md">
                  <MdDelete className="text-red-600" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-2">{getTimeAgo(createdAt)}</div>
      </div>
    </div>
  );
}
