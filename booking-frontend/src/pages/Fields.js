// src/pages/Fields.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./Fields.css"; // Impor file CSS

export default function Fields() {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/fields")
      .then((res) => setFields(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="fields-container">
      <h2 className="fields-title">Pilih Lapangan Futsal</h2>
      <ul className="fields-list">
        {fields.map((field) => (
          <li key={field.id} className="field-item">
            <span className="field-name">{field.name}</span>
            <span className="field-location">{field.location}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}