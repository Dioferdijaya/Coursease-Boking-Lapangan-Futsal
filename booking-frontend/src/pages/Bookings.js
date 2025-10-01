import { useEffect, useState } from "react";
import axios from "axios";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/bookings")
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>All Bookings</h2>
      <ul>
        {bookings.map(b => (
          <li key={b.id}>
            {b.user} booked {b.field} on {b.date} from {b.start_time} to {b.end_time} ({b.status})
          </li>
        ))}
      </ul>
    </div>
  );
}
