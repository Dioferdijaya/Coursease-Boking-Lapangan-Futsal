# Courstease – Boking Lapangan Futsal
Sebuah web pemesanan lapangan futsal secara real-time dan digital, Lihat ketersediaan jadwal lapangan secara langsung, Booking Instan, Hanya butuh beberapa langkah mudah untuk mengamankan jadwal. Pilih waktu, lakukan konfirmasi, dan lapangan siap untuk Anda gunakan.

Framework: React.js untuk frontend & Express.js & Node.js Untuk backend

# How to Getting Started
## Installation

## Clone repo:<br>
https://github.com/Dioferdijaya/Coursease-Boking-Lapangan-Futsal.git

## Database
**Note: Aplikasi ini menggunakan Supabase sebagai database**

### Setup Database Supabase

1. **Buat akun Supabase**
   - Kunjungi [https://supabase.com](https://supabase.com)
   - Buat project baru

2. **Buat Table di Supabase SQL Editor**

   **Table users:**
   ```sql
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100),
       email VARCHAR(100) UNIQUE,
       password VARCHAR(255),
       role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin'))
   );
   ```

   **Table fields:**
   ```sql
   CREATE TABLE fields (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100),
       type VARCHAR(50),
       price_per_hour INTEGER
   );
   ```

   **Table bookings:**
   ```sql
   CREATE TABLE bookings (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
       field_id INTEGER REFERENCES fields(id),
       date DATE,
       start_time TIME,
       end_time TIME,
       status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'canceled')),
       user_name VARCHAR(100),
       user_email VARCHAR(100)
   );
   ```

3. **Konfigurasi API Keys**
   - Buka file `backend/.env`
   - Ganti `SUPABASE_URL` dengan URL project Supabase Anda
   - Ganti `SUPABASE_ANON_KEY` dengan Anon/Public key dari Supabase
   - Anda bisa menemukan kedua nilai ini di: **Project Settings > API**

## **Aktifkan atau jalankan server via terminal**
1. **Install dependencies backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Jalankan backend server:**
   ```bash
   node server.js
   ```

3. **Di terminal baru, install dependencies frontend:**
   ```bash
   cd booking-frontend
   npm install
   ```

4. **Jalankan frontend:**
   ```bash
   npm start
   ```

Tunggu browser membuka otomatis atau pakai http://localhost:3000


