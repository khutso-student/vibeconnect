import API from "./api"; // your base axios instance

const BASE_URL = import.meta.env.VITE_API_URL ; // automatically picks dev or prod

// ✅ Create a new event (Admin only)
export const createEvent = async (eventData, token) => {
  try {
    if (!eventData.image) throw new Error("Image is required. Please upload an image.");

    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });

    if (!formData.has("category")) formData.append("category", "General");

    const res = await API.post(`${BASE_URL}/events`, formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
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
    const res = await API.get(`${BASE_URL}/events`);
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching events:", err.response?.data || err.message);
    throw err;
  }
};



// Like/unlike event
export const likeEvent = async (eventId, token) => {
  if (!token) throw new Error("User token is required for liking an event");

  try {
    const res = await API.patch(
      `${BASE_URL}/events/${eventId}/like`, 
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error liking/unliking event:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get liked events for the logged-in user
// ✅ Get liked events for the logged-in user
export const getLikedEvents = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await API.get(`/events/liked`, config); // ✅ use API, not axios
  return data;
};




// Increment views
export const incrementViews = async (eventId, token = null) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await API.patch(`/events/${eventId}/view`, {}, { headers });
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
      if (value !== undefined && value !== null) formData.append(key, value);
    });

    if (!formData.has("category")) formData.append("category", "General");

    const res = await API.put(`${BASE_URL}/events/${id}`, formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
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
    const res = await API.delete(`${BASE_URL}/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error deleting event:", err.response?.data || err.message);
    throw err;
  }
};
