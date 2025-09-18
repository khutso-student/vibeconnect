import React, { useState, useContext } from "react";
import { login as loginApi } from "../services/api"; // ✅ renamed to avoid conflict
import { AuthContext } from "../context/AuthContext";
import Logo from "../assets/Logo.svg";

import { MdOutlineEmail } from "react-icons/md";
import { CiLock } from "react-icons/ci";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginApi(formData); 
      login(res.user, res.token); 
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-[#F6F6F6] px-4">
      <div className="flex flex-col justify-center py-4 px-5 bg-white w-80 h-100 border border-[#cecece] rounded-md">
        <img src={Logo} alt="Web Logo" className="w-40 mb-2" />
        <p className="text-[#344576] text-xl font-semibold mb-2">Login</p>
        <p className="text-sm text-[#A4A2A2] mb-4">
          Login and stay updated to upcoming events
        </p>

        {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

        {/* ✅ Fixed: Added onSubmit */}
        <form onSubmit={handleSubmit} className="flex flex-col w-full text-[#4d4d4d]">
          <div className="flex items-center bg-[#f3f3f3] w-full py-1 px-4 border border-[#D7D7D7] rounded-md mb-2">
            <MdOutlineEmail />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full text-sm py-1.5 px-4 focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-[#f3f3f3] w-full py-1 px-4 border border-[#D7D7D7] rounded-md mb-2">
            <CiLock />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full text-sm py-1.5 px-4 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F46BF9] text-white text-sm py-1.5 cursor-pointer rounded hover:bg-[#344576] flex justify-center items-center"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="flex justify-center items-center mt-2">
          <p className="text-[#A4A2A2] text-sm">Don't have an account?</p>
          <Link
            to="/" // 
            className="text-[#F46BF9] hover:text-[#344576] text-sm hover:underline font-semibold ml-2 duration-300"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
