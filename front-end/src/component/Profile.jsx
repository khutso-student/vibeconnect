import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative">
      {/* Profile Avatar Button */}
      <div
        onClick={() => setShowModal(!showModal)}
        className="w-11 h-11 bg-gradient-to-r from-pink-500 to-purple-600 flex justify-center items-center rounded-full cursor-pointer hover:scale-105 transform transition-all duration-300 shadow-md"
      >
        <FaUserCircle className="text-white text-3xl" />
      </div>

      {/* Dropdown Card */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute top-14 right-0 w-72 bg-[#1E1E1E]/95 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl p-5 z-50"
          >
            {/* Header Section */}
            <div className="flex items-center gap-4 border-b border-gray-700 pb-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg leading-tight">
                  {user?.name || "Guest User"}
                </h3>
                <p className="text-gray-400 text-sm break-words">
                  {user?.email || "guest@example.com"}
                </p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Role:</span>
                <span className="text-white">{user?.role || "User"}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Joined:</span>
                <span className="text-white">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700 my-4" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-300"
            >
              <IoIosLogOut className="text-xl" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
