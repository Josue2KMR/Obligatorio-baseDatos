import { useEffect, useState } from "react";
import "./App.css";

function App() {
  //estado del formulario
  const [form, setForm] = useState({
    ci: "",
    nombre: "",
    apellido: "",
    email: "",
  });

  //estado de participantes
  const [participantes, setParticipantes] = useState([]);

  //carga datos del backend
  useEffect(() => {
    fetch("http://localhost:5000/api/reservas")
      .then((res) => res.json())
      .then((data) => setParticipantes(data))
      .catch((err) => console.error(err));
  }, []);

  //manejo de submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.ci || !form.nombre) return;
    setParticipantes([...participantes, form]);
    setForm({ ci: "", nombre: "", apellido: "", email: "" });
  };

  return (
    <div className="container">
      <h1>Gestión de Participantes</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="CI"
          value={form.ci}
          onChange={(e) => setForm({ ...form, ci: e.target.value })}
        />
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
        <input
          placeholder="Apellido"
          value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <button type="submit">Agregar</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>CI</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {participantes.map((p) => (
            <tr key={p.ci}>
              <td>{p.ci}</td>
              <td>{p.nombre}</td>
              <td>{p.apellido}</td>
              <td>{p.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
