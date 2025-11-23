import { useEffect, useState, useCallback } from "react";
import "../styles.css";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [salasMasDemandadas, setSalasMasDemandadas] = useState([]);
  const [reservasHoy, setReservasHoy] = useState([]);
  const [turnosDemandados, setTurnosDemandados] = useState([]);
  const [promedioParticipantes, setPromedioParticipantes] = useState([]);
  const [reservasPorCarrera, setReservasPorCarrera] = useState([]);
  const [ocupacionEdificio, setOcupacionEdificio] = useState([]);
  const [, setReservasTipoUsuario] = useState([]);
  const [porcentajeUso, setPorcentajeUso] = useState(null);
  const [sancionesDetallado, setSancionesDetallado] = useState([]);
  const [reservasAsistenciasDetallado, setReservasAsistenciasDetallado] =
    useState([]);

  // Función para hacer fetch con reintentos automáticos
  const fetchWithRetry = async (url, retries = 3, delay = 500) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return response;
        }
        if (response.status === 500 && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        return response;
      } catch (error) {
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        salasRes,
        turnosRes,
        demandasRes,
        reservasRes,
        turnosDemandadosRes,
        promedioRes,
        carreraRes,
        ocupacionRes,
        tipoUsuarioRes,
        porcentajeUsoRes,
        sancionesDetalladoRes,
        reservasAsistenciasRes,
      ] = await Promise.all([
        fetchWithRetry("http://localhost:5000/api/salas"),
        fetchWithRetry("http://localhost:5000/api/turnos"),
        fetchWithRetry("http://localhost:5000/api/reportes/salas-mas-reservadas"),
        fetchWithRetry(
          `http://localhost:5000/api/reservas?fecha=${
            new Date().toISOString().split("T")[0]
          }`
        ),
        fetchWithRetry("http://localhost:5000/api/reportes/turnos-mas-demandados"),
        fetchWithRetry("http://localhost:5000/api/reportes/promedio-participantes"),
        fetchWithRetry("http://localhost:5000/api/reportes/reservas-por-carrera"),
        fetchWithRetry("http://localhost:5000/api/reportes/ocupacion-por-edificio"),
        fetchWithRetry("http://localhost:5000/api/reportes/reservas-por-tipo-usuario"),
        fetchWithRetry("http://localhost:5000/api/reportes/porcentaje-uso-reservas"),
        fetchWithRetry("http://localhost:5000/api/reportes/sanciones-detallado"),
        fetchWithRetry(
          "http://localhost:5000/api/reportes/reservas-asistencias-detallado"
        ),
      ]);

      const salasData = await salasRes.json();
      const turnosData = await turnosRes.json();
      const demandasData = await demandasRes.json();
      const reservasData = await reservasRes.json();
      const turnosDemandadosData = await turnosDemandadosRes.json();
      const promedioData = await promedioRes.json();
      const carreraData = await carreraRes.json();
      const ocupacionData = await ocupacionRes.json();
      const tipoUsuarioData = await tipoUsuarioRes.json();
      const porcentajeUsoData = await porcentajeUsoRes.json();
      const sancionesDetalladoData = await sancionesDetalladoRes.json();
      const reservasAsistenciasData = await reservasAsistenciasRes.json();

      if (salasData.success) setSalas(salasData.data);
      if (turnosData.success) setTurnos(turnosData.data);
      if (demandasData.success) setSalasMasDemandadas(demandasData.data);
      if (reservasData.success) setReservasHoy(reservasData.data);
      if (turnosDemandadosData.success)
        setTurnosDemandados(turnosDemandadosData.data);
      if (promedioData.success) setPromedioParticipantes(promedioData.data);
      if (carreraData.success) setReservasPorCarrera(carreraData.data);
      if (ocupacionData.success) setOcupacionEdificio(ocupacionData.data);
      if (tipoUsuarioData.success) setReservasTipoUsuario(tipoUsuarioData.data);
      if (porcentajeUsoData.success) setPorcentajeUso(porcentajeUsoData.data);
      if (sancionesDetalladoData.success)
        setSancionesDetallado(sancionesDetalladoData.data);
      if (reservasAsistenciasData.success)
        setReservasAsistenciasDetallado(reservasAsistenciasData.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* ===== SECCIÓN: ESTADÍSTICAS GENERALES ===== */}
      <section className="dashboard-section">
        <h2 className="section-title">📊 Resumen General</h2>
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
                  {(
                    (reservasHoy.length / (salas.length * turnos.length)) *
                    100
                  ).toFixed(0)}
                  %
                </p>
              </div>
              <span className="stat-icon">📊</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN: ESTADO DE SALAS EN TIEMPO REAL ===== */}
      <section className="dashboard-section">
        <div className="report-card">
          <h2 className="report-card-title">📍 Estado de Salas Hoy</h2>
          <div className="rooms-grid">
            {salas.map((sala) => {
              const reservasEnSala = reservasHoy.filter(
                (r) =>
                  r.nombre_sala === sala.nombre_sala &&
                  r.edificio === sala.edificio
              );
              const ocupada = reservasEnSala.length > 0;

              return (
                <div
                  key={`${sala.nombre_sala}-${sala.edificio}`}
                  className={`room-card ${ocupada ? "occupied" : "available"}`}
                >
                  <div className="room-header">
                    <h3 className="room-name">{sala.nombre_sala}</h3>
                    <span
                      className={`room-badge ${
                        ocupada ? "occupied" : "available"
                      }`}
                    >
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
      </section>

      {/* ===== SECCIÓN: DEMANDA Y OCUPACIÓN ===== */}
      <section className="dashboard-section">
        <h2 className="section-title">🔥 Demanda y Ocupación</h2>
        
        {/* Salas Más Reservadas */}
        <div className="report-card">
          <h2 className="report-card-title">🏆 Salas Más Reservadas</h2>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
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

        {/* Turnos Más Demandados */}
        <div className="report-card">
          <h2 className="report-card-title">⏰ Turnos Más Demandados</h2>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Horario</th>
                  <th>Total Reservas</th>
                </tr>
              </thead>
              <tbody>
                {turnosDemandados.slice(0, 5).map((turno) => (
                  <tr key={turno.id_turno}>
                    <td className="font-medium">
                      {turno.hora_inicio} - {turno.hora_fin}
                    </td>
                    <td className="font-medium">{turno.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ocupación por Edificio */}
        <div className="report-card">
          <h2 className="report-card-title">🏢 Ocupación por Edificio</h2>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Edificio</th>
                  <th>Total Salas</th>
                  <th>Total Reservas</th>
                  <th>% Ocupación</th>
                </tr>
              </thead>
              <tbody>
                {ocupacionEdificio.map((edificio, idx) => (
                  <tr key={idx}>
                    <td className="font-medium">{edificio.edificio}</td>
                    <td>{edificio.total_salas}</td>
                    <td>{edificio.total_reservas}</td>
                    <td>
                      <span
                        className={`badge ${
                          edificio.porcentaje_ocupacion > 50
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {edificio.porcentaje_ocupacion}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN: ANÁLISIS DE PARTICIPANTES ===== */}
      <section className="dashboard-section">
        <h2 className="section-title">👥 Análisis de Participantes</h2>
        
        {/* Promedio de Participantes por Sala */}
        <div className="report-card">
          <h2 className="report-card-title">📊 Promedio de Participantes por Sala</h2>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Sala</th>
                  <th>Edificio</th>
                  <th>Promedio</th>
                </tr>
              </thead>
              <tbody>
                {promedioParticipantes.slice(0, 5).map((sala, idx) => (
                  <tr key={idx}>
                    <td className="font-medium">{sala.nombre_sala}</td>
                    <td className="text-secondary">{sala.edificio}</td>
                    <td className="font-medium">{parseFloat(sala.promedio_participantes).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reservas por Carrera y Facultad */}
        <div className="report-card">
          <h2 className="report-card-title">🎓 Reservas por Carrera y Facultad</h2>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Programa</th>
                  <th>Facultad</th>
                  <th>Total Reservas</th>
                </tr>
              </thead>
              <tbody>
                {reservasPorCarrera.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-medium">{item.nombre_programa}</td>
                    <td className="text-secondary">{item.facultad}</td>
                    <td className="font-medium">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reservas y Asistencias por Tipo de Usuario */}
        <div className="report-card">
          <h2 className="report-card-title">
            📈 Reservas y Asistencias por Tipo de Usuario
          </h2>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Tipo Usuario</th>
                  <th>Total Reservas</th>
                  <th>Asistencias</th>
                  <th>Inasistencias</th>
                  <th>% Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {reservasAsistenciasDetallado.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-medium">{item.tipo_usuario}</td>
                    <td>{item.total_reservas}</td>
                    <td className="text-success">{item.total_asistencias}</td>
                    <td className="text-danger">{item.inasistencias}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.porcentaje_asistencia >= 70
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {item.porcentaje_asistencia || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN: SANCIONES Y CUMPLIMIENTO ===== */}
      <section className="dashboard-section">
        <h2 className="section-title">⚠️ Sanciones y Cumplimiento</h2>
        
        {/* Sanciones por Tipo de Usuario */}
        <div className="report-card">
          <h2 className="report-card-title">🚫 Sanciones por Tipo de Usuario</h2>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Tipo Usuario</th>
                  <th>Total Sanciones</th>
                  <th>Participantes Sancionados</th>
                  <th>Sanciones Activas</th>
                  <th>Promedio Días</th>
                </tr>
              </thead>
              <tbody>
                {sancionesDetallado.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-medium">{item.tipo_usuario}</td>
                    <td>{item.total_sanciones}</td>
                    <td>{item.participantes_sancionados}</td>
                    <td>
                      <span className="badge badge-danger">
                        {item.sanciones_activas}
                      </span>
                    </td>
                    <td className="font-medium">{item.promedio_dias_sancion || 0} días</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Porcentaje de Uso de Reservas */}
        <div className="report-card">
          <h2 className="report-card-title">📈 Porcentaje de Uso de Reservas</h2>
          {porcentajeUso && (
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-info">
                    <p className="stat-label">Finalizadas</p>
                    <p className="stat-value">{porcentajeUso.usadas}</p>
                  </div>
                  <span className="stat-icon">✅</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-info">
                    <p className="stat-label">Canceladas/Sin Asistencia</p>
                    <p className="stat-value">{porcentajeUso.no_usadas}</p>
                  </div>
                  <span className="stat-icon">❌</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-info">
                    <p className="stat-label">Total Reservas</p>
                    <p className="stat-value">{porcentajeUso.total}</p>
                  </div>
                  <span className="stat-icon">📋</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-info">
                    <p className="stat-label">% Uso Efectivo</p>
                    <p className="stat-value">{porcentajeUso.porcentaje_uso}%</p>
                  </div>
                  <span className="stat-icon">📊</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
