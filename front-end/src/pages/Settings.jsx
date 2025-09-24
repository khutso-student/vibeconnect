import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { SlPicture } from "react-icons/sl";

export default function Settings() {
  const { user, setUser, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "" });
  const [profileFile, setProfileFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load user data once AuthContext finishes loading
  useEffect(() => {
    if (!authLoading && user) {
      setForm({ name: user.name || "", email: user.email || "" });
      setPreviewImage(user.profileImage || "");
    }
  }, [authLoading, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user?._id) {
      alert("⚠️ User not found. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      let uploadedImage = previewImage;

      // Upload profile image if selected
      if (profileFile) {
        const formData = new FormData();
        formData.append("image", profileFile);

        const { data } = await api.post(
          `/uploads/upload-profile/${user._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        uploadedImage = data.profileImage;
      }

      // Update user details
      const { data: updatedUserData } = await api.put(`/users/${user._id}`, {
        name: form.name,
        email: form.email,
        profileImage: uploadedImage,
      });

      setUser(updatedUserData.user); // update context
      setProfileFile(null);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("❌ Update failed:", error);
      alert("❌ Failed to update profile. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (authLoading) return <div>Loading...</div>; // prevent flashing empty form

  return (
    <div className="flex justify-center items-center w-full h-full bg-gray-50 p-4">
      <div className="flex flex-col w-full max-w-2xl bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <h1 className="text-gray-700 text-2xl font-semibold mb-6">Edit Profile</h1>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-28 h-28">
            <img
              src={
                previewImage ||
                "https://ui-avatars.com/api/?name=User&background=F46BF9&color=fff&size=150"
              }
              alt="Profile"
              className="w-full h-full object-cover rounded-full border border-gray-300 shadow-sm"
            />
            <label className="absolute bottom-0 right-0 bg-[#F46BF9] text-white p-2 rounded-full cursor-pointer hover:bg-[#AA5EAD] transition">
              <SlPicture className="text-lg" />
              <input
                type="file"
                className="hidden"
                onChange={handleImageSelect}
                accept="image/*"
              />
            </label>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#69326b]"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#69326b]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#F46BF9] text-white text-sm px-4 py-2.5 rounded-lg hover:bg-[#69326b] transition shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-300 transition shadow-md"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
