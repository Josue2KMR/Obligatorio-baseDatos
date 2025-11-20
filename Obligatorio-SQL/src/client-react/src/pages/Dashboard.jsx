import { useEffect, useState } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [salasMasDemandadas, setSalasMasDemandadas] = useState([]);
  const [reservasHoy, setReservasHoy] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [salasRes, turnosRes, demandasRes, reservasRes] = await Promise.all([
        fetch("http://localhost:5000/api/salas"),
        fetch("http://localhost:5000/api/turnos"),
        fetch("http://localhost:5000/api/reportes/salas-mas-reservadas"),
        fetch(`http://localhost:5000/api/reservas?fecha=${new Date().toISOString().split('T')[0]}`)
      ]);

      const salasData = await salasRes.json();
      const turnosData = await turnosRes.json();
      const demandasData = await demandasRes.json();
      const reservasData = await reservasRes.json();

      if (salasData.success) setSalas(salasData.data);
      if (turnosData.success) setTurnos(turnosData.data);
      if (demandasData.success) setSalasMasDemandadas(demandasData.data);
      if (reservasData.success) setReservasHoy(reservasData.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Salas Totales</p>
              <p className="stat-value">{salas.length}</p>
            </div>
            <span className="stat-icon">🏛️</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Turnos</p>
              <p className="stat-value">{turnos.length}</p>
            </div>
            <span className="stat-icon">⏰</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Reservas Hoy</p>
              <p className="stat-value">{reservasHoy.length}</p>
            </div>
            <span className="stat-icon">📅</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Ocupación</p>
              <p className="stat-value">
                {((reservasHoy.length / (salas.length * turnos.length)) * 100).toFixed(0)}%
              </p>
            </div>
            <span className="stat-icon">📊</span>
          </div>
        </div>
      </div>

      {/* Salas Más Demandadas */}
      <div className="card">
        <h2 className="card-title">🔥 Salas Más Reservadas</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Sala</th>
                <th>Edificio</th>
                <th>Total Reservas</th>
              </tr>
            </thead>
            <tbody>
              {salasMasDemandadas.slice(0, 5).map((sala, idx) => (
                <tr key={idx}>
                  <td className="font-medium">{sala.nombre_sala}</td>
                  <td className="text-secondary">{sala.edificio}</td>
                  <td className="font-medium">{sala.total_reservas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estado de Salas */}
      <div className="card">
        <h2 className="card-title">📍 Estado de Salas Hoy</h2>
        <div className="rooms-grid">
          {salas.map((sala) => {
            const reservasEnSala = reservasHoy.filter(
              r => r.nombre_sala === sala.nombre_sala && r.edificio === sala.edificio
            );
            const ocupada = reservasEnSala.length > 0;
            
            return (
              <div
                key={`${sala.nombre_sala}-${sala.edificio}`}
                className={`room-card ${ocupada ? "occupied" : "available"}`}
              >
                <div className="room-header">
                  <h3 className="room-name">{sala.nombre_sala}</h3>
                  <span className={`room-badge ${ocupada ? "occupied" : "available"}`}>
                    {ocupada ? "🔴 Ocupada" : "🟢 Libre"}
                  </span>
                </div>
                <p className="room-building">{sala.edificio}</p>
                <p className="room-details">
                  👥 {sala.capacidad} | 📂 {sala.tipo_sala}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}