// src/pages/UserHome.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserHome.css'; // Kita akan buat file CSS ini

export default function UserHome() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Jika tidak ada user, tendang ke halaman login
      navigate('/login');
    }
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>; // Tampilkan loading selagi mengecek user
  }
  
  // Daftar menu untuk user biasa
  const userMenus = [
    { name: 'Booking Lapangan', path: '/dashboard', icon: '⚽' },
    { name: 'Daftar Lapangan', path: '/fields', icon: '🗺️' },
    { name: 'Riwayat Booking', path: '/profile', icon: '🧾' },
    { name: 'Profil Saya', path: '/profile', icon: '👤' }
  ];

  // Daftar menu untuk admin (user biasa + manajemen)
  const adminMenus = [
    ...userMenus,
    { name: 'Manajemen Booking', path: '/admin/bookings', icon: '⚙️' }
  ];

  const menusToDisplay = user.role === 'admin' ? adminMenus : userMenus;

  return (
    <div className="user-home-container">
      <h1>Selamat Datang Kembali, {user.name}!</h1>
      <p>Pilih menu di bawah untuk melanjutkan.</p>
      <div className="home-grid">
        {menusToDisplay.map(menu => (
          <Link to={menu.path} key={menu.name} className="home-card">
            <div className="card-icon">{menu.icon}</div>
            <div className="card-title">{menu.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}