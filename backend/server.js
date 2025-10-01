// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi database MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "booking_db"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL connected...");
});

// ===== Middleware Admin =====
const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: "Login dulu!" });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token invalid" });
    if (decoded.role !== "admin") return res.status(403).json({ message: "Hanya admin!" });
    req.user = decoded;
    next();
  });
};

// ===== ROUTES =====

// Register user
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')";
  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "User registered successfully!" });
  });
});

// Register admin
app.post("/register-admin", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')";
  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Admin registered successfully!" });
  });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(401).json({ message: "Email atau password salah" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Email atau password salah" });

    // Buat JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token });
  });
});

// Ambil semua lapangan
app.get("/fields", (req, res) => {
  db.query("SELECT * FROM fields", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Tambah booking
app.post("/book", (req, res) => {
  const { user_id, field_id, date, start_time, end_time } = req.body;
  const sql = "INSERT INTO bookings (user_id, field_id, date, start_time, end_time) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [user_id, field_id, date, start_time, end_time], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Booking berhasil dibuat!" });
  });
});

// Ambil booking user
app.get("/bookings", (req, res) => {
  const { user_id } = req.query;
  db.promise().query(`
    SELECT b.id, b.date, b.start_time, b.end_time, b.status,
           f.name AS field_name, f.type AS field_type, f.price_per_hour,
           u.name AS user_name, u.email AS user_email
    FROM bookings b
    JOIN fields f ON b.field_id = f.id
    JOIN users u ON b.user_id = u.id
    WHERE b.user_id = ?
    ORDER BY b.date DESC, b.start_time ASC
  `, [user_id])
  .then(([rows]) => res.json(rows))
  .catch(err => res.status(500).json({ message: "Gagal ambil booking" }));
});

// Ambil semua booking untuk admin
app.get("/admin/bookings", adminMiddleware, (req, res) => {
  const sql = `
    SELECT b.id, b.date, b.start_time, b.end_time, b.status,
           f.name AS field_name, f.type AS field_type, f.price_per_hour,
           u.name AS user_name, u.email AS user_email
    FROM bookings b
    JOIN fields f ON b.field_id = f.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.date DESC, b.start_time ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err });
    res.json(results);
  });
});

// Update status booking admin
app.patch("/admin/bookings/:id", adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sql = "UPDATE bookings SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ message: err });
    res.json({ message: `Booking ${status}` });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
