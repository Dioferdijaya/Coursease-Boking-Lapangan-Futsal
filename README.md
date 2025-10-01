# Courstease – Boking Lapangan Futsal
Sebuah web pemesanan lapangan futsal secara real-time dan digital, Lihat ketersediaan jadwal lapangan secara langsung, Booking Instan, Hanya butuh beberapa langkah mudah untuk mengamankan jadwal. Pilih waktu, lakukan konfirmasi, dan lapangan siap untuk Anda gunakan.

Framework: React.js untuk frontend & Express.js & Node.js Untuk backend

# How to Getting Started
## Installation

## Clone repo:<br>
https://github.com/Dioferdijaya/Coursease-Boking-Lapangan-Futsal.git

## Database
**Note: Untuk Database ini tidak di deploy, kami menggunakan Laragon**<br>
Step 1: Pembuatan Database Local
1.	create database booking_db;
2.	Use booking_db<br>

Step 2: Pembuatan Table User<br>

CREATE TABLE users (<br>
    id INT AUTO_INCREMENT PRIMARY KEY,<br>
    name VARCHAR(100),<br>
    email VARCHAR(100) UNIQUE,<br>
    password VARCHAR(255),<br>
    role ENUM('user','admin') DEFAULT 'user'<br>
);<br>

Step 3: Pembuatan Table bookings<br>

CREATE TABLE bookings (<br>
    id INT AUTO_INCREMENT PRIMARY KEY,<br>
    user_id INT,<br>
    field_id INT,<br>
    date DATE,<br>
    start_time TIME,<br>
    end_time TIME,<br>
    status ENUM('pending','confirmed','canceled') DEFAULT 'pending',<br>
    user_name VARCHAR(100),<br>
    user_email VARCHAR(100),<br>
    FOREIGN KEY (user_id) REFERENCES users(id),<br>
    FOREIGN KEY (field_id) REFERENCES fields(id)<br>
);<br>

Step 4: Pembuatan table fields<br>

CREATE TABLE fields (<br>
    id INT AUTO_INCREMENT PRIMARY KEY,<br>
    name VARCHAR(100),<br>
    type VARCHAR(50),<br>
    price_per_hour INT<br>
);<br>

## **Aktifkan atau jalankan server via terminal<br>**
1.	Terminal 1 Cd backend => node server.js<br>
2.	Terminal 2 cd booking-frontend => npm start<br>
Tunggu browser membuka otomatis atau pakai http://localhost:3000 <br>


