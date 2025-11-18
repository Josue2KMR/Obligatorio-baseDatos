import { useEffect, useState } from "react";

function Home({ user, onLogout }) {
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchParticipantes();
  }, []);

  const fetchParticipantes = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/participantes");
      const data = await response.json();

      if (data.success) {
        setParticipantes(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div>
          <h1>Sistema de Reservas</h1>
          <p>Bienvenido, {user?.correo}</p>
        </div>
        <button onClick={onLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </header>

      <div className="home-content">
        <section className="section">
          <h2>Participantes Registrados</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
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
                {participantes.length === 0 ? (
                  <tr>
                    <td colSpan="4">No hay participantes registrados</td>
                  </tr>
                ) : (
                  participantes.map((p) => (
                    <tr key={p.ci}>
                      <td>{p.ci}</td>
                      <td>{p.nombre}</td>
                      <td>{p.apellido}</td>
                      <td>{p.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;
