import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Events from "../component/Events";
import Liked from "../component/Liked";
import Notification from "../component/Notification";
import Profile from "../component/Profile";

import WhiteLogo from "../assets/WhiteLogo.svg";
import Icon from "../assets/Icon.svg";
import { MdSearch } from "react-icons/md";
import { HiMenu, HiX } from "react-icons/hi";

import { getEvents } from "../services/event"; // ✅ corrected import

export default function Home() {
  const [activeTab, setActiveTab] = useState("Events");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);

  // ✅ state for mobile nav
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // ✅ events + likedEvents
  const [events, setEvents] = useState([]);
  const [likedEvents, setLikedEvents] = useState([]);

  // Fetch all events when component loads
useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await getEvents(); // your API call
      const data = Array.isArray(res) ? res : res.events || []; // ✅ ensure it's always an array
      setEvents(data);

      // preload liked ones
      if (user) {
        setLikedEvents(data.filter((ev) => ev.likedBy?.includes(user._id)));
      }
    } catch (error) {
      console.error("❌ Failed to fetch events:", error);
    }
  };
  fetchEvents();
}, [user]);

  // ✅ handle like/unlike updates from EventCard
  const handleLikeUpdate = (updatedEvent) => {
    // update all events list
    setEvents((prev) =>
      prev.map((ev) => (ev._id === updatedEvent._id ? updatedEvent : ev))
    );

    // update liked list
    setLikedEvents((prev) => {
      if (updatedEvent.likedBy?.includes(user?._id)) {
        if (!prev.some((ev) => ev._id === updatedEvent._id)) {
          return [...prev, updatedEvent];
        }
        return prev.map((ev) =>
          ev._id === updatedEvent._id ? updatedEvent : ev
        );
      } else {
        return prev.filter((ev) => ev._id !== updatedEvent._id);
      }
    });
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setIsMobileNavOpen(false); // auto-close when user selects a tab
  };

  const navButtonClass = (tabName) =>
    `w-20 py-1.5 px-4 gap-2 text-sm cursor-pointer transition-all duration-200 ${
      activeTab === tabName
        ? "text-[#F46BF9]"
        : "text-white hover:text-[#F46BF9]"
    }`;

  return (
    <div className="relative flex flex-col w-full h-screen">
      {/* Top bar */}
      <div className="flex flex-col w-full h-55 bg-[#1E1E1E] p-3">
        <div className="flex justify-between items-center w-full h-20 mb-2">
          <a href="">
            <img src={WhiteLogo} alt="Site Logo" className="w-30 sm:w-40" />
          </a>

          <div className="flex items-center w-auto  gap-2 p-2">
            {/* Desktop nav */}
            <div className="hidden sm:flex w-1/2 justify-center">
              <button
                onClick={() => handleTabChange("Events")}
                className={navButtonClass("Events")}
              >
                Events
              </button>
              {user?.role === "user" && (
                <button
                  onClick={() => handleTabChange("Liked")}
                  className={navButtonClass("Liked")}
                >
                  Liked
                </button>
              )}
            </div>

            {user?.role === "admin" && (
              <Link
                to="/maindashboard"
                className="hidden sm:flex py-2 px-4 border border-[#1E1E1E] hover:border-[#F46BF9] text-[#fff] hover:text-[#F46BF9] text-sm rounded-md duration-300"
              >
                Dashboard
              </Link>
            )}

            <Notification />
            <Profile />
            {/* Hamburger for small screens */}
            <button
              className="text-white sm:hidden text-3xl"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            >
              {isMobileNavOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>

        <h1 className="text-white text-xl sm:text-3xl font-semibold mb-3">
          Find your event here, {user?.name || "Guest"}
        </h1>

        {/* Search Input */}
        <div className="flex items-center gap-2 w-full sm:w-1/2 h-13 bg-white rounded-xl px-5 py-3">
          <MdSearch className="text-[#949494] text-2xl" />
          <input
            type="search"
            placeholder="Search by event name, or place"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-[#686767] text-sm sm:text-md focus:outline-none"
          />
        </div>
      </div>

      {/* ✅ Mobile side nav */}
      <div
        className={`absolute top-0 left-0 h-full bg-[#1e1e1e] sm:hidden z-50 flex flex-col items-center overflow-hidden transition-all duration-500 ease-in-out ${
          isMobileNavOpen ? "w-1/2" : "w-0"
        }`}
      >
        <img src={Icon} alt="icon" className="w-15 h-15 mt-5" />

        <div className="flex flex-col mt-10 gap-4 px-5">
          <button
            onClick={() => handleTabChange("Events")}
            className={navButtonClass("Events")}
          >
            Events
          </button>
          {user?.role === "user" && (
            <button
              onClick={() => handleTabChange("Liked")}
              className={navButtonClass("Liked")}
            >
              Liked
            </button>
          )}

          {user?.role === "admin" && (
            <Link
              to="/maindashboard"
              className="flex justify-center items-center py-2 px-4 border border-[#fff] hover:border-[#F46BF9] text-[#fff] hover:text-[#F46BF9] text-sm rounded-md duration-300"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "Events" && (
          <Events
            searchTerm={searchTerm}
            events={events}
            onLikeUpdate={handleLikeUpdate}
          />
        )}
        {activeTab === "Liked" && <Liked likedEvents={likedEvents} />}
      </div>
    </div>
  );
}
