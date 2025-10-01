// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css"; // Impor file CSS baru

export default function Profile() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // Sebaiknya gunakan navigate dari react-router-dom jika komponen ini
      // berada di dalam router, namun window.location.href juga berfungsi.
      window.location.href = "/login";
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    // Ambil booking user
    axios
      .get(`http://localhost:5000/bookings?user_id=${userData.id}`)
      .then((res) => setBookings(res.data))
      .catch((err) => console.error("Gagal ambil booking:", err));
  }, []);

  // Fungsi untuk format tanggal agar lebih mudah dibaca
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Fungsi untuk mengubah status menjadi nama kelas CSS
  const getStatusClass = (status) => {
    return (status || "pending").toLowerCase();
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profil Saya</h1>
      {user ? (
        <div className="profile-details">
          <p><strong>Nama:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        <p>Loading profil...</p>
      )}

      <h2 className="booking-history-title">Riwayat Booking</h2>
      <div className="booking-list-container">
        {bookings.length > 0 ? (
          <ul className="booking-list">
            {bookings.map((b) => (
              <li key={b.id} className="booking-item">
                <div className="booking-info">
                  <span className="field-name">{b.field_name}</span>
                  <span className="booking-date">{formatDate(b.date)} | Jam {b.start_time.substring(0, 5)}</span>
                </div>
                <span className={`status-badge ${getStatusClass(b.status)}`}>
                  {b.status || "pending"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-bookings">Anda belum memiliki riwayat booking.</p>
        )}
      </div>
    </div>
  );
}