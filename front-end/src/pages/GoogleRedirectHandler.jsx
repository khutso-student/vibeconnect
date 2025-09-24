import { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ FIXED named import
import { AuthContext } from "../context/AuthContext";

export default function GoogleRedirectHandler() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      try {
        // ✅ Decode JWT to extract user info
        const payload = jwtDecode(token);
        const user = {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        };

        login(user, token); // Save to context + localStorage
        navigate("/home"); // Redirect to dashboard
      } catch (err) {
        console.error("❌ JWT decode failed:", err);
        navigate("/login");
      }
    } else {
      navigate("/login"); // If token missing, redirect to login
    }
  }, [location]);

  return <p>Redirecting...</p>;
}
