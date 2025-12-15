const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://coursease-booking-lapangan-futsal.up.railway.app";

export default API_URL;
