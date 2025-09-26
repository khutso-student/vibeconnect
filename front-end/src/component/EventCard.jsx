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
  likes,
  liked = false, // prop indicating if current user liked
  views = 0, // ✅ initial views
  image,
  createdAt,
  onEdit,
  onDelete,
  showAdminActions = false,
}) {
  const { user } = useContext(AuthContext);
  const [reacting, setReacting] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes || 0);
  const [viewCount, setViewCount] = useState(views || 0); // ✅ view count state

  // Sync like state when prop changes
  useEffect(() => {
    setReacting(liked);
  }, [liked]);

  // Increment view count when component mounts
  useEffect(() => {
    const incrementView = async () => {
      try {
        const updated = await incrementViews(id); // public, no token needed
        if (updated?.views !== undefined) setViewCount(updated.views);
      } catch (error) {
        console.error("❌ Failed to increment view count:", error);
      }
    };

    incrementView();
  }, [id]);

  const formatLikes = (count) =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;

  // Toggle like/unlike
  const handleLike = async () => {
    if (!user) return alert("Please log in to like events");
    if (user.role !== "user") return; // admins cannot react

    try {
      const updated = await likeEvent(id, user.token);
      setLikeCount(updated.likes);
      setReacting(updated.likedByUser);
    } catch (error) {
      console.error("Failed to like/unlike event:", error);
    }
  };

  // Time ago function
  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now - created;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  return (
    <div className="flex flex-col w-full h-auto gap-2 bg-white border border-[#A4A2A2] shadow-sm rounded-md p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-md font-semibold text-[#1E1E1E]">{title}</p>

        {/* Users can react */}
        {user?.role === "user" && (
          <div onClick={handleLike} className="cursor-pointer">
            {reacting ? (
              <MdFavorite className="text-[#F46BF9] text-2xl" />
            ) : (
              <MdFavoriteBorder className="text-[#949494] hover:text-[#F46BF9] text-2xl" />
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="w-full h-40 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
        {image ? (
          <img
             src={`${import.meta.env.VITE_ASSET_URL}${image}`}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500 text-sm">No Image</span>
        )}
      </div>

      {/* Date & Time */}
      <div className="flex gap-2">
        <div className="bg-[#E2C6E3] px-4 py-1.5 text-sm font-bold text-[#AA5EAD] rounded-md">
          {date}
        </div>
        <div className="bg-[#9BEFB2] px-4 py-1.5 text-sm font-bold text-[#308947] rounded-md">
          {time}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#555]">{description}</p>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-[#949494]">
        <span>{getTimeAgo(createdAt)}</span>
        <div className="flex gap-1 items-center">
          <CiLocationOn />
          <span>{location}</span>
        </div>
      </div>

      {/* Likes, Views & Admin Actions */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-4 text-xs text-[#949494]">
          {/* Likes */}
          <div className="flex items-center gap-1">
            {reacting ? (
              <MdFavorite className="text-[#F46BF9] text-sm" />
            ) : (
              <MdFavoriteBorder className="text-[#949494] text-sm" />
            )}
            <span>{formatLikes(likeCount)}</span>
          </div>

          {/* ✅ Views */}
          <div className="flex items-center gap-1">
            <MdOutlineVisibility className="text-[#949494] text-sm" />
            <span>{viewCount}</span>
          </div>
        </div>

        {/* Admin Actions */}
        {user?.role === "admin" && showAdminActions && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              <MdEdit className="text-gray-600" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 bg-red-100 hover:bg-red-200 rounded-md"
            >
              <MdDelete className="text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
