// src/pages/AdminBookings.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminBookings.css"; // Impor file CSS baru

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== "admin") {
      alert("Hanya admin yang bisa mengakses halaman ini!");
      window.location.href = "/dashboard";
      return;
    }

    fetchBookings(user.token);
  }, []);

  const fetchBookings = async (token) => {
    try {
      const res = await axios.get("http://localhost:5000/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil booking");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    try {
      await axios.patch(
        `http://localhost:5000/admin/bookings/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${storedUser.token}` } }
      );

      setBookings(
        bookings.map((b) =>
          b.id === id ? { ...b, status: newStatus } : b
        )
      );
    } catch (err) {
      console.error(err);
      alert("Gagal update status");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="admin-bookings-container">
      <h1 className="admin-bookings-title">Manajemen Booking</h1>
      {bookings.length === 0 ? (
        <p className="no-bookings-admin">Belum ada data booking yang masuk.</p>
      ) : (
        <div className="bookings-grid">
          {bookings.map((b) => (
            <div key={b.id} className="booking-card-admin">
              <div className="booking-details-admin">
                <h3>{b.field_name} ({b.field_type})</h3>
                <p><strong>Tanggal:</strong> {formatDate(b.date)}</p>
                <p><strong>Jam:</strong> {b.start_time.substring(0, 5)} - {b.end_time.substring(0, 5)}</p>
                <p><strong>Harga/jam:</strong> Rp{b.price_per_hour}</p>
                <p className="user-info">
                  <strong>User:</strong> {b.user_name} ({b.user_email})
                </p>
                <p className="status-line">
                  <strong>Status:</strong>
                  <span className={`status-text status-${b.status}`}>
                    {b.status}
                  </span>
                </p>
              </div>

              {b.status === "pending" && (
                <div className="action-buttons">
                  <button
                    onClick={() => handleUpdateStatus(b.id, "confirmed")}
                    className="action-btn btn-confirm"
                  >
                    Konfirmasi
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(b.id, "rejected")}
                    className="action-btn btn-reject"
                  >
                    Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}