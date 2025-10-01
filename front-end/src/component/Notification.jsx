import { useState, useEffect } from "react";
import { GoBell } from "react-icons/go";
import API from "../services/api";

export default function Notification({ userId, isAdmin }) {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get("/events"); // fetch all events
        const events = res.data.events;

        if (!Array.isArray(events)) return;

        let notifs = [];

        if (isAdmin) {
          // Admin: show likes on their events
          events.forEach((event) => {
            if (!event.createdBy?._id || event.createdBy._id !== userId) return;

            event.likedBy?.forEach((user) => {
              if (!user?._id || !user.name) return;
              notifs.push({
                id: `${event._id}-${user._id}`,
                text: `${user.name} liked your event "${event.title}"`,
                viewed: false,
              });
            });
          });
        } else {
          // Regular users: show new events not created by them
          events.forEach((event) => {
            if (!event.createdBy?._id || event.createdBy._id === userId) return;
            notifs.push({
              id: event._id,
              text: `New event: "${event.title}"`,
              viewed: false,
            });
          });
        }

        // Sort newest first and limit to 10
        setNotifications(
          notifs
            .sort((a, b) => (a.id < b.id ? 1 : -1))
            .slice(0, 10)
        );
      } catch (err) {
        console.error("❌ Error fetching notifications:", err.message);
      }
    };

    fetchNotifications();
  }, [userId, isAdmin]);

  const handleView = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, viewed: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.viewed).length;

  return (
    <div className="relative flex justify-center items-center w-12 h-12">
      <GoBell
        onClick={() => setShow(!show)}
        className="text-2xl text-white hover:text-pink-500 cursor-pointer transition-colors duration-300"
      />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-pink-500 animate-pulse"></span>
      )}

      {show && (
        <div className="absolute top-14 right-[-112px] sm:right-0 w-75 sm:w-80 max-h-72 bg-white border border-gray-200 shadow-lg rounded-lg overflow-y-auto z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="font-semibold text-gray-700">Notifications</p>
          </div>

          {notifications.length === 0 && (
            <p className="p-3 text-gray-400">No notifications</p>
          )}

          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleView(notif.id)}
              className={`flex items-start p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                !notif.viewed ? "bg-gray-100" : ""
              }`}
            >
              {!notif.viewed && (
                <span className="w-2 h-2 rounded-full bg-pink-500 mt-2 mr-2 flex-shrink-0"></span>
              )}
              <p className="text-gray-700 text-sm">{notif.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
