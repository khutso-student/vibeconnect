import { useState, useEffect, useContext } from "react";
import { AuthContext } from '../context/AuthContext';
import BarGraph from "../component/BarGraph";
import EventCarousel from '../component/EventCarousel';
import { CiBoxList } from "react-icons/ci"; 
import { GoProjectRoadmap } from "react-icons/go";
import { LuTimerOff } from "react-icons/lu";
import { FaRegBell, FaUserCircle } from "react-icons/fa";
import { MdFavoriteBorder, MdOutlineVisibility } from "react-icons/md";
import { getEvents } from "../services/event";

const StatCard = ({ icon: Icon, title, value, color = "#F46BF9" }) => (
  <div className="flex flex-col justify-center items-center bg-white w-full h-32 rounded-md border border-[#EAEAEA] hover:shadow-md duration-300 p-2">
    <div
      className="flex justify-center items-center text-white text-lg sm:text-2xl w-10 sm:w-12 h-10 sm:h-12 rounded-full"
      style={{ backgroundColor: color }}
    >
      <Icon />
    </div>
    <p className="text-[#555555] text-xs sm:text-sm mt-2">{title}</p>
    <h1 className="text-[#555555] text-xl font-bold">{value}</h1>
  </div>
);

const Box = ({ title, date, likes = 0, views = 0, status = "upcoming" }) => {
  const statusColor = status === "upcoming" ? "#4ade80" : "#9ca3af"; // green for upcoming, gray for passed

  return (
    <div className="flex justify-between items-center bg-white w-full h-16 rounded-lg px-4 shadow-sm border border-[#EAEAEA] hover:shadow-md hover:bg-[#F9F9F9] duration-300 transition-all">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: statusColor }}></div>
        <div className="flex flex-col">
          <h3 className="text-[#1E1E1E] font-semibold text-sm sm:text-md truncate">{title}</h3>
          <p className="text-[#949494] text-xs sm:text-sm">{date}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[#555555] text-xs sm:text-sm">
        <div className="flex items-center gap-1">
          <MdFavoriteBorder className="text-[#F46BF9]" />
          <span>{likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MdOutlineVisibility className="text-[#949494]" />
          <span>{views}</span>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getEvents();
      const eventList = Array.isArray(res.events) 
        ? res.events.map(e => ({
            ...e,
            date: e.date || e.createdAt || new Date().toISOString(),
            likes: e.likes || 0,
            views: e.views || 0,
          }))
        : [];
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

  // Stats
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
  const passedEvents = events.filter(e => new Date(e.date) < new Date()).length;

  // Latest 3 events for Box
  const recentEvents = events
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <div className="flex flex-col lg:flex-row gap-2 w-full h-full overflow-y-auto transition-all p-2">
      {/* Right side */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex gap-1 sm:gap-3 items-center w-full h-auto p-0.5 sm:p-2">
          <StatCard icon={CiBoxList} title="Total Events" value={totalEvents} />
          <StatCard icon={GoProjectRoadmap} title="Upcoming" value={upcomingEvents} />
          <StatCard icon={LuTimerOff} title="Passed" value={passedEvents} />
        </div>

        <div className="flex justify-center items-center w-full h-70 p-0.5 sm:p-2">
          <BarGraph data={events} />
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto w-full h-full">
          {loading ? (
            <p className="text-center text-gray-500 text-sm">Loading recent events...</p>
          ) : recentEvents.map(event => (
            <Box
              key={event._id}
              title={event.title}
              date={new Date(event.date).toLocaleDateString()}
              likes={event.likes}
              views={event.views}
              status={new Date(event.date) >= new Date() ? "upcoming" : "passed"}
            />
          ))}
        </div>
      </div>

      {/* Left side */}
      <div className="flex flex-col gap-4 w-full h-full lg:w-80 bg-white p-4 rounded-2xl shadow-sm">
        {/* User / Welcome Card */}
        <div className="flex items-center gap-3 p-3 bg-[#F46BF9]/10 rounded-xl">
          <FaUserCircle className="text-5xl text-[#F46BF9]" />
          <div>
            <p className="text-sm text-gray-600">Welcome back</p>
            <h2 className="text-md font-bold text-[#F46BF9]">{user?.name || "Guest"}</h2>
            <p className="text-xs text-gray-500">{user?.role || "Guest"}</p>
          </div>
        </div>

        {/* Quick Action / Notification Card */}
        <div className="flex justify-between items-center p-3 bg-[#E2C6E3]/20 rounded-xl hover:bg-[#E2C6E3]/30 cursor-pointer duration-200">
          <div>
            <p className="text-xs text-gray-500">Upcoming Events</p>
            <h3 className="text-md font-semibold">{upcomingEvents}</h3>
          </div>
          <FaRegBell className="text-2xl text-[#AA5EAD]" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-xs text-gray-500">Filter by Month</label>
          <select className="border border-[#c9c7c7] px-2 py-1 rounded-md">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <label className="text-xs text-gray-500">Filter by Year</label>
          <select className="border border-[#c9c7c7] px-2 py-1 rounded-md">
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>

        <EventCarousel events={events} />

        <p className="text-center text-xs text-gray-400 mt-2">
          &copy; VibeConnect.2025. All Rights Reserved
        </p>
      </div>
    </div>
  );
}
