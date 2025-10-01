// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css"; // Impor file CSS baru

export default function Dashboard() {
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [date, setDate] = useState(today);
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [fields, setFields] = useState([]);

  const slots = Array.from({ length: 16 }, (_, i) => i + 8);

  // cek login user
  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    if (!user) {
      alert("Login dulu!");
      navigate("/login");
    }
  }, [user, navigate]);

  // ambil lapangan
  useEffect(() => {
    axios
      .get("http://localhost:5000/fields")
      .then((res) => setFields(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleNext = () => setDate(new Date(date.setDate(date.getDate() + 1)));
  const handlePrev = () =>
    date > today && setDate(new Date(date.setDate(date.getDate() - 1)));

  const getDayName = (d) =>
    d.toLocaleDateString("id-ID", { weekday: "long" });
  const getFormattedDate = (d) =>
    d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleBooking = async (hour, fieldId, price) => {
    if (!user) {
      alert("Login dulu!");
      navigate("/login");
      return;
    }

    const confirmBooking = window.confirm(
      `Booking lapangan jam ${hour}:00? Rp${price}`
    );
    if (!confirmBooking) return;

    const bookingData = {
      user_id: user.id,
      field_id: fieldId,
      date: date.toISOString().split("T")[0],
      start_time: `${hour}:00:00`,
      end_time: `${hour + 1}:00:00`,
    };

    try {
      const res = await axios.post("http://localhost:5000/book", bookingData);
      alert(res.data.message);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Booking gagal");
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Jadwal Booking Lapangan</h1>

      <div className="date-navigator">
        <button
          className="nav-button"
          onClick={handlePrev}
          disabled={date <= today}
        >
          ⬅ Sebelumnya
        </button>
        <span className="current-date">
          {getDayName(date)} - {getFormattedDate(date)}
        </span>
        <button className="nav-button" onClick={handleNext}>
          Berikutnya ➡
        </button>
      </div>

      <div className="slots-container">
        {slots.map((hour) => {
          const now = new Date();
          const slotTime = new Date(date);
          slotTime.setHours(hour, 0, 0, 0);

          let status = "Tersedia";
          if (slotTime < now && date.toDateString() === today.toDateString()) {
            status = "Tidak Tersedia";
          }
          // Anda bisa menambahkan logika untuk mengecek booking dari server di sini
          // dan mengubah status menjadi "Dipesan"

          const isExpanded = expandedSlot === hour;

          return (
            <div
              key={hour}
              className={`slot-wrapper ${isExpanded ? "expanded" : ""}`}
            >
              <div
                className={`slot-header status-${status
                  .toLowerCase()
                  .replace(" ", "-")}`}
                onClick={() =>
                  status === "Tersedia" &&
                  setExpandedSlot(isExpanded ? null : hour)
                }
              >
                <span>Jam {hour}:00</span>
                <span>{status}</span>
              </div>

              <div className="slot-details">
                {fields.map((f) => (
                  <div key={f.id} className="field-card">
                    <div className="field-info">
                      <strong>{f.name}</strong> - {f.type || "Tipe Standar"}
                    </div>
                    <button
                      className="booking-button"
                      onClick={() =>
                        handleBooking(hour, f.id, f.price_per_hour)
                      }
                    >
                      Booking Rp{f.price_per_hour}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}