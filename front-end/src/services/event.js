import API from "./api"; // your base axios instance

// ✅ Create a new event (Admin only)
export const createEvent = async (eventData, token) => {
  try {
    if (!eventData.image) {
      throw new Error("Image is required. Please upload an image.");
    }

    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (!formData.has("category")) {
      formData.append("category", "General");
    }

    const res = await API.post("/events", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error creating event:", err.response?.data || err.message);
    throw err;
  }
};

// ✅ Get all events (Public)
export const getEvents = async () => {
  try {
    const res = await API.get("/events");
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching events:", err.response?.data || err.message);
    throw err;
  }
};

// ✅ Like an event (User must be logged in)
export const likeEvent = async (id, token) => {
  try {
    const res = await API.patch(`/events/${id}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error liking event:", err.response?.data || err.message);
    throw err;
  }
};

// ✅ NEW: View an event (increments view count, requires user token)
export const incrementViews = async (eventId) => {
  try {
    const res = await API.patch(`/events/${eventId}/view`);
    return res.data;
  } catch (err) {
    console.error("❌ Error incrementing view count:", err.response?.data || err.message);
    return null;
  }
};

// ✅ Update event (Admin only)
export const updateEvent = async (id, eventData, token) => {
  try {
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (!formData.has("category")) {
      formData.append("category", "General");
    }

    const res = await API.put(`/events/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error updating event:", err.response?.data || err.message);
    throw err;
  }
};

// ✅ Delete event (Admin only)
export const deleteEvent = async (id, token) => {
  try {
    const res = await API.delete(`/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error deleting event:", err.response?.data || err.message);
    throw err;
  }
};
