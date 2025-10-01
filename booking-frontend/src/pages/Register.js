// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate dan Link
import axios from "axios";
import "./Register.css"; // Gunakan CSS yang sama dengan login

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate(); // ✅ 1. Panggil hook useNavigate

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/register", form);
      alert(res.data.message); // Tampilkan pesan sukses
      
      navigate("/login"); // ✅ 2. Arahkan ke halaman login setelah sukses

    } catch (err) {
      alert(err.response?.data?.message || "Registrasi gagal!");
    }
  };

  return (
    <div className="container">
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1 className="form-login">Register</h1>
          <div className="description">
            <h2>Selamat Datang di Courstease</h2>
            <p>Platform booking lapangan Futsal terpercaya untuk mewujudkan semangat berolahraga Anda.</p>
            <ul>
              <li>✨ Booking lapangan dengan mudah</li>
              <li>🏃‍♂️ Berbagai jenis lapangan Futsal</li>
              <li>⚡ Proses booking cepat</li>
              <li>🔒 Pembayaran aman</li>
            </ul>
          </div>

          <div className="input-box">
            <input
              name="name"
              type="text"
              placeholder="Nama Lengkap"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn">
            Register
          </button>

          {/* ✅ 3. Tambahkan link untuk pindah ke halaman Login */}
          <div className="register-link">
            <p>
              Sudah punya akun? <Link to="/login">Login di sini</Link>
            </p>
          </div>
          
        </form>
      </div>
    </div>
  );
}