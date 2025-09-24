import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MainDash from "./pages/MainDash";
import ProtectedRoute from "./component/ProtectedRoute";
import GoogleRedirectHandler from  "./pages/GoogleRedirectHandler" // ✅ import it

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* ✅ Google OAuth redirect handler */}
        <Route path="/google-redirect" element={<GoogleRedirectHandler />} />

        {/* ✅ Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maindashboard"
          element={
            <ProtectedRoute>
              <MainDash />
            </ProtectedRoute>
          }
        />

        {/* ✅ Optional 404 fallback (good practice) */}
        <Route path="*" element={<p>404 - Page not found</p>} />
      </Routes>
    </div>
  );
}

export default App;
