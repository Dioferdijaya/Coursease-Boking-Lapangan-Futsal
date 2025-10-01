// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import komponen
import UserHome from "./pages/UserHome"; // <-- Import Halaman Home Baru
import Register from "./pages/Register";
import Login from "./pages/Login";
import Fields from "./pages/Fields";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminBookings from "./pages/AdminBookings";

function App() {
  return (
    <Router>
      
      
      <main>
        <Routes>
          {/* Arahkan halaman utama langsung ke register */}
          <Route path="/" element={<Navigate to="/register" />} />
          
          <Route path="/home" element={<UserHome />} /> {/* <-- Route untuk Halaman Home setelah login */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />

          {/* Fallback route, arahkan ke register jika halaman tidak ditemukan */}
          <Route path="*" element={<Navigate to="/register" />} /> 
        </Routes>
      </main>
    </Router>
  );
}

export default App;