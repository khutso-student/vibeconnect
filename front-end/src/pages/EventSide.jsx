import { useState, useEffect, useContext } from "react";
import { IoAdd } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import EventCard from "../component/EventCard";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../services/event";
import { AuthContext } from "../context/AuthContext";

export default function EventSide() {
  const [modal, setModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    location: "",
    category: "General",
    image: null,
  });

  const { user } = useContext(AuthContext);

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getEvents();
      const eventList = Array.isArray(res) ? res : res.events || [];
      setEvents(eventList);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit Add/Edit Event
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== "admin") return alert("Only admins can add events.");
    if (!formData.image && !editingEvent?.image) return alert("Please upload an image before submitting.");

    try {
      console.log("Submitting Event:", formData);

      if (editingEvent) {
        // Edit mode
        await updateEvent(editingEvent._id, formData, user.token);
        alert("✅ Event updated successfully!");
        setEditingEvent(null);
      } else {
        // Create mode
        await createEvent(formData, user.token);
        alert("✅ Event created successfully!");
      }

      // Reset form
      setFormData({
        title: "",
        date: "",
        time: "",
        description: "",
        location: "",
        category: "General",
        image: null,
      });
      setModal(false);
      fetchEvents();
    } catch (err) {
      console.error("Failed to submit event:", err);
      alert(err.response?.data?.message || "Failed to submit event");
    }
  };

  // Handle edit button
  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date.split("T")[0], // format for <input type="date">
      time: event.time,
      description: event.description,
      location: event.location,
      category: event.category,
      image: null, // optional to upload new image
    });
    setModal(true);
  };

  // Delete Event
  const handleDelete = async (id) => {
    if (!user || user.role !== "admin") return;
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteEvent(id, user.token);
      fetchEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  // Filter events by search term
  const filteredEvents = events.filter((event) => {
    const term = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term) ||
      new Date(event.date).toLocaleDateString().includes(term)
    );
  });

  return (
    <div className="flex flex-col items-center gap-2 w-full h-full overflow-y-auto p-2">
      {/* Search + Add */}
      <div className="flex gap-2 w-full h-14 p-2 rounded-md bg-white">
        <input
          type="search"
          placeholder="Filter by Event name, date, and location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs sm:text-sm bg-[#F6F6F6] border border-[#EAEAEA] p-4 rounded-md focus:outline-[#d3d2d2]"
        />
        {user?.role === "admin" && (
          <button
            onClick={() => {
              setModal(true);
              setEditingEvent(null);
              setFormData({
                title: "",
                date: "",
                time: "",
                description: "",
                location: "",
                category: "General",
                image: null,
              });
            }}
            className="flex justify-center items-center gap-2 bg-[#F46BF9] hover:bg-[#344576] text-xs sm:text-sm text-white w-35 sm:w-30 p-2 rounded-md duration-300"
          >
            <IoAdd className="text-md" /> Add Event
          </button>
        )}
      </div>

      {/* Event Grid */}
      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredEvents.length === 0 ? (
        <p>No events found</p>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 ">
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
              image={event.image}
              createdAt={event.createdAt}
              onEdit={() => handleEdit(event)}
              onDelete={() => handleDelete(event._id)}
              showAdminActions={true} 
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div
          onClick={() => {
            setModal(false);
            setEditingEvent(null);
          }}
          className="fixed top-0 left-0 w-full h-full bg-[#00000060] flex justify-center items-center p-2"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:100 max-w-md rounded-md bg-white p-4"
          >
            <div className="flex justify-between items-center w-full mb-4">
              <p className="font-bold text-lg text-[#2c2c2c]">
                {editingEvent ? "Edit Event" : "Add Event"}
              </p>
              <button
                onClick={() => {
                  setModal(false);
                  setEditingEvent(null);
                }}
                className="bg-[#fcfcfc] hover:bg-[#F46BF9] text-[#504d4d] hover:text-white p-2 rounded-md border border-[#f3f3f3] cursor-pointer duration-300"
              >
                <MdClose />
              </button>
            </div>

            {/* Add/Edit Event Form */}
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                required
                className="p-2 border rounded-md"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="p-2 border rounded-md"
              />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="p-2 border rounded-md"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
                className="p-2 border rounded-md"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
                className="p-2 border rounded-md"
              />
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="p-2 border rounded-md"
                {...(!editingEvent && { required: true })}
              />
              <button
                type="submit"
                className="bg-[#F46BF9] text-white p-2 rounded-md hover:bg-[#344576] duration-300"
              >
                {editingEvent ? "Update Event" : "Add Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
