// server.js
require('dotenv').config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log("Supabase client initialized...");

// Konfigurasi Mayar.id
const MAYAR_API_KEY = process.env.MAYAR_API_KEY;
const MAYAR_BASE_URL = 'https://api.mayar.id/ks/v1';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ===== Middleware Admin =====
const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: "Login dulu!" });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, decoded) => {
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
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password: hashedPassword, role: 'user' }])
    .select();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "User registered successfully!" });
});

// Register admin
app.post("/register-admin", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password: hashedPassword, role: 'admin' }])
    .select();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Admin registered successfully!" });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  const { data: results, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);
  
  if (error) return res.status(500).json({ message: "Server error" });
  if (!results || results.length === 0) return res.status(401).json({ message: "Email atau password salah" });

  const user = results[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Email atau password salah" });

  // Buat JWT
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "1h" }
  );

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token });
});

// Ambil semua lapangan
app.get("/fields", async (req, res) => {
  const { data, error } = await supabase
    .from('fields')
    .select('*');
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Tambah booking
app.post("/book", async (req, res) => {
  const { user_id, field_id, date, start_time, end_time } = req.body;
  
  try {
    // Ambil informasi lapangan untuk menghitung total harga
    const { data: fieldData, error: fieldError } = await supabase
      .from('fields')
      .select('price_per_hour')
      .eq('id', field_id)
      .single();
    
    if (fieldError) throw fieldError;
    
    // Hitung durasi dan total harga
    const start = new Date(`2000-01-01 ${start_time}`);
    const end = new Date(`2000-01-01 ${end_time}`);
    const durationHours = (end - start) / (1000 * 60 * 60);
    const totalPrice = durationHours * fieldData.price_per_hour;
    
    // Insert booking dengan payment status unpaid
    // Status 'pending' akan berubah menjadi 'confirmed' setelah pembayaran
    const { data, error } = await supabase
      .from('bookings')
      .insert([{ 
        user_id, 
        field_id, 
        date, 
        start_time, 
        end_time,
        total_price: totalPrice,
        payment_status: 'unpaid',
        status: 'pending'
      }])
      .select();
    
    if (error) throw error;
    
    res.json({ 
      message: "Booking berhasil dibuat!", 
      booking: data[0],
      total_price: totalPrice 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PAYMENT ENDPOINTS - MAYAR.ID =====

// Membuat payment link Mayar.id
app.post("/payment/create", async (req, res) => {
  const { booking_id, user_email, user_name } = req.body;
  
  try {
    // Ambil data booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id, date, start_time, end_time, total_price,
        fields (name, type)
      `)
      .eq('id', booking_id)
      .single();
    
    if (bookingError) throw bookingError;
    
    // Buat payment request ke Mayar.id
    const paymentData = {
      name: `Booking ${booking.fields.name}`,
      description: `Booking lapangan ${booking.fields.name} (${booking.fields.type}) pada ${booking.date} jam ${booking.start_time}-${booking.end_time}`,
      amount: Math.round(booking.total_price), // Mayar.id menggunakan integer (dalam Rupiah)
      customer: {
        name: user_name,
        email: user_email
      },
      return_url: `${FRONTEND_URL}/payment/success?booking_id=${booking_id}`,
      callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/payment/callback`,
      metadata: {
        booking_id: booking_id.toString()
      }
    };
    
    const response = await axios.post(
      `${MAYAR_BASE_URL}/payment-links`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${MAYAR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Update booking dengan payment info
    await supabase
      .from('bookings')
      .update({
        payment_id: response.data.data.id,
        payment_url: response.data.data.link,
        payment_status: 'pending'
      })
      .eq('id', booking_id);
    
    res.json({
      success: true,
      payment_url: response.data.data.link,
      payment_id: response.data.data.id
    });
    
  } catch (err) {
    console.error('Payment creation error:', err.response?.data || err.message);
    res.status(500).json({ 
      error: 'Gagal membuat payment link',
      details: err.response?.data?.message || err.message 
    });
  }
});

// Callback dari Mayar.id setelah pembayaran
app.post("/payment/callback", async (req, res) => {
  try {
    const { status, payment_link_id, metadata } = req.body;
    
    if (status === 'paid') {
      // Update booking status
      await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          status: 'confirmed'
        })
        .eq('payment_id', payment_link_id);
      
      console.log(`Payment successful for booking ${metadata?.booking_id}`);
    } else if (status === 'expired') {
      await supabase
        .from('bookings')
        .update({ payment_status: 'expired' })
        .eq('payment_id', payment_link_id);
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cek status pembayaran
app.get("/payment/status/:booking_id", async (req, res) => {
  const { booking_id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('payment_status, payment_url, total_price, paid_at')
      .eq('id', booking_id)
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== END PAYMENT ENDPOINTS =====

// Ambil booking user
app.get("/bookings", async (req, res) => {
  const { user_id } = req.query;
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id, date, start_time, end_time, status,
      fields (name, type, price_per_hour),
      users (name, email)
    `)
    .eq('user_id', user_id)
    .order('date', { ascending: false })
    .order('start_time', { ascending: true });
  
  if (error) return res.status(500).json({ message: "Gagal ambil booking" });
  
  // Transform data to match expected format
  const transformedData = data.map(booking => ({
    id: booking.id,
    date: booking.date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: booking.status,
    field_name: booking.fields?.name,
    field_type: booking.fields?.type,
    price_per_hour: booking.fields?.price_per_hour,
    user_name: booking.users?.name,
    user_email: booking.users?.email
  }));
  
  res.json(transformedData);
});

// Ambil semua booking untuk admin
app.get("/admin/bookings", adminMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id, date, start_time, end_time, status,
      fields (name, type, price_per_hour),
      users (name, email)
    `)
    .order('date', { ascending: false })
    .order('start_time', { ascending: true });
  
  if (error) return res.status(500).json({ message: error.message });
  
  // Transform data to match expected format
  const transformedData = data.map(booking => ({
    id: booking.id,
    date: booking.date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: booking.status,
    field_name: booking.fields?.name,
    field_type: booking.fields?.type,
    price_per_hour: booking.fields?.price_per_hour,
    user_name: booking.users?.name,
    user_email: booking.users?.email
  }));
  
  res.json(transformedData);
});

// Update status booking admin (hanya untuk booking yang sudah dibayar)
app.patch("/admin/bookings/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    // Cek status pembayaran terlebih dahulu
    const { data: booking, error: checkError } = await supabase
      .from('bookings')
      .select('payment_status, status')
      .eq('id', id)
      .single();
    
    if (checkError) throw checkError;
    
    // Validasi: Admin hanya bisa update booking yang sudah dibayar
    if (booking.payment_status !== 'paid') {
      return res.status(400).json({ 
        message: 'Booking belum dibayar! User harus membayar terlebih dahulu.' 
      });
    }
    
    // Jika sudah bayar, admin bisa update status (misal: completed, cancelled)
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: `Booking ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { name, username, phone, currentPassword, newPassword } = req.body;

  try {
    // Get current user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError) return res.status(500).json({ message: "User not found" });

    // Prepare update data
    const updateData = { name, username, phone };

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password required" });
      }

      const match = await bcrypt.compare(currentPassword, userData.password);
      if (!match) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    // Return updated user (without password)
    const { password, ...userWithoutPassword } = data;
    res.json({ message: "Profile updated successfully", user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
