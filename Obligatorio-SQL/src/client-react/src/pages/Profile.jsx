import { useEffect, useState } from "react";

export default function Perfil({ user, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [participante, setParticipante] = useState(null);
  const [misReservas, setMisReservas] = useState([]);
  const [misSanciones, setMisSanciones] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const participanteRes = await fetch(`http://localhost:5000/api/participantes?email=${user.correo}`);
      const participanteData = await participanteRes.json();

      if (participanteData.success && participanteData.data) {
        setParticipante(participanteData.data);

        const [reservasRes, sancionesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/reservas?ci_participante=${participanteData.data.ci}`),
          fetch(`http://localhost:5000/api/sanciones?ci_participante=${participanteData.data.ci}`)
        ]);

        const reservasData = await reservasRes.json();
        const sancionesData = await sancionesRes.json();

        if (reservasData.success) setMisReservas(reservasData.data);
        if (sancionesData.success) setMisSanciones(sancionesData.data);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";

    const date = new Date(`${fecha}T00:00:00`);

    return date.toLocaleDateString("es-UY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const estaEnUso = (fecha, horaInicio, horaFin) => {
    const ahora = new Date();
    const fechaReserva = new Date(`${fecha}T00:00:00`);
    
    if (fechaReserva.toDateString() !== ahora.toDateString()) {
      return false;
    }
    
    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
    
    const minutosInicio = horaInicioH * 60 + horaInicioM;
    const minutosFin = horaFinH * 60 + horaFinM;
    const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
    
    return minutosActuales >= minutosInicio && minutosActuales < minutosFin;
  };

  const cancelarReserva = async (idReserva) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reserva/${idReserva}/cancelar`, {
        method: "PUT"
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: "success", text: "Reserva cancelada exitosamente" });
        loadData();
      } else {
        setMessage({ type: "error", text: `${data.error}` });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error al cancelar reserva" });
    }

    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const eliminarCuenta = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/participante/${participante.ci}/cascade`, {
        method: "DELETE"
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: "success", text: "Cuenta eliminada exitosamente" });
        setTimeout(() => onLogout(), 2000);
      } else {
        setMessage({ type: "error", text: `${data.error}` });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error al eliminar cuenta" });
    }

    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (!participante) {
    return (
      <div className="alert alert-error">
        Error al cargar el perfil. Por favor, intenta nuevamente.
      </div>
    );
  }


  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hoy = `${yyyy}-${mm}-${dd}`;

  const nowMin = now.getHours() * 60 + now.getMinutes();


  function turnoHaFinalizado(fecha, horaFin) {
    const reservaDate = new Date(fecha + "T00:00:00");

    const hoyDate = new Date(hoy + "T00:00:00");
    if (reservaDate < hoyDate) return true;

    if (reservaDate > hoyDate) return false;

    const [h, m] = horaFin.split(":").map(Number);
    const finMin = h * 60 + m;
    return finMin <= nowMin;
  }



  const enUso = misReservas.filter((r) => {
    return r.estado !== "cancelada" && estaEnUso(r.fecha, r.hora_inicio, r.hora_fin);
  });

  const activas = misReservas.filter((r) => {
    if (r.estado === "cancelada") return false;
    if (estaEnUso(r.fecha, r.hora_inicio, r.hora_fin)) return false;
    if (!turnoHaFinalizado(r.fecha, r.hora_fin)) return true;
    return false;
  });

  const utilizadas = misReservas.filter((r) => {
    if (r.estado === "cancelada") return false;

    if (turnoHaFinalizado(r.fecha, r.hora_fin)) return true;

    return false;
  });

  const canceladas = misReservas.filter((r) => r.estado === "cancelada");


  return (
    <div className="content-wrapper">
      {/* Mensaje de alerta */}
      {message.text && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          {message.text}
        </div>
      )}

      {/* Info Personal */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Mi Perfil</h2>
          <button onClick={onLogout} className="btn btn-secondary">
            Cerrar Sesión
          </button>
        </div>
        
        <div className="profile-grid">
          <div className="profile-field">
            <label>CI</label>
            <p>{participante.ci}</p>
          </div>
          <div className="profile-field">
            <label>Email</label>
            <p>{participante.email}</p>
          </div>
          <div className="profile-field">
            <label>Nombre</label>
            <p>{participante.nombre}</p>
          </div>
          <div className="profile-field">
            <label>Apellido</label>
            <p>{participante.apellido}</p>
          </div>
        </div>

        <div className="divider"></div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-danger"
          >
            Eliminar Cuenta
          </button>
        ) : (
          <div className="delete-confirm">
            <p className="delete-confirm-text">
              Esta acción no se puede deshacer.
            </p>
            <div className="delete-confirm-actions">
              <button
                onClick={eliminarCuenta}
                className="btn btn-danger"
              >
                Sí, eliminar permanentemente
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sanciones */}
      {misSanciones.length > 0 && (
        <div className="sanctions-container">
          <div className="sanctions-header">
            <h2 className="sanctions-title">Sanciones</h2>
          </div>
          <div className="sanctions-list">
            {misSanciones.map((sancion, idx) => {
              const hoy = new Date().toISOString().split('T')[0];
              const activa = sancion.fecha_inicio <= hoy && sancion.fecha_fin >= hoy;
              
              return (
                <div key={idx} className="sanction-item">
                  <span className={`sanction-badge ${activa ? 'active' : 'finished'}`}>
                    {activa ? 'ACTIVA' : 'Finalizada'}
                  </span>
                  <p className="sanction-text">
                    Desde: <strong>{sancion.fecha_inicio}</strong> hasta{" "}
                    <strong>{sancion.fecha_fin}</strong>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MIS RESERVAS */}
      <div className="card">
        <h2 className="card-title">Mis Reservas</h2>

        {/* EN USO */}
        <div className="mb-6">
          <h3 className="card-title" style={{ fontSize: '18px', color: '#f59e0b' }}>
            En Uso Ahora ({enUso.length})
          </h3>

          {enUso.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No tienes reservas en uso en este momento.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sala</th>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {enUso.map((r) => (
                    <tr key={r.id_reserva} style={{ backgroundColor: '#FEF3C7' }}>
                      <td className="font-medium">{r.nombre_sala} - {r.edificio}</td>
                      <td>{formatearFecha(r.fecha)}</td>
                      <td>{r.hora_inicio} - {r.hora_fin}</td>
                      <td className="text-center">
                        <span 
                          className="reservation-status"
                          style={{
                            backgroundColor: '#FCD34D',
                            color: '#92400E',
                            fontWeight: 'bold'
                          }}
                        >
                          EN USO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="divider"></div>

        {/* ACTIVAS */}
        <div className="mb-6">
          <h3 className="card-title" style={{ fontSize: '18px', color: '#059669' }}>
            Activas ({activas.length})
          </h3>

          {activas.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No tienes reservas activas.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sala</th>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th className="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {activas.map((r) => (
                    <tr key={r.id_reserva}>
                      <td className="font-medium">{r.nombre_sala} - {r.edificio}</td>
                      <td>{formatearFecha(r.fecha)}</td>
                      <td>{r.hora_inicio} - {r.hora_fin}</td>
                      <td className="text-center">
                        <button
                          onClick={() => cancelarReserva(r.id_reserva)}
                          className="btn btn-danger"
                          style={{ fontSize: '12px', padding: '8px 16px' }}
                        >
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="divider"></div>

        {/* FINALIZADAS */}
        <div>
          <h3 className="card-title" style={{ fontSize: '18px', color: '#2563eb' }}>
            Finalizadas ({utilizadas.length})
          </h3>

          {utilizadas.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No tienes reservas finalizadas.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sala</th>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {utilizadas.map((r) => (
                    <tr key={r.id_reserva}>
                      <td className="font-medium">{r.nombre_sala} - {r.edificio}</td>
                      <td>{formatearFecha(r.fecha)}</td>
                      <td>{r.hora_inicio} - {r.hora_fin}</td>
                      <td className="text-center">
                        <span 
                          className="reservation-status"
                          style={{
                            backgroundColor: r.estado === "sin asistencia" ? '#FCA5A5' : '#BFDBFE',
                            color: r.estado === "sin asistencia" ? '#991B1B' : '#1E40AF'
                          }}
                        >
                          {r.estado === "sin asistencia" ? "SIN ASISTENCIA" : "FINALIZADA"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="divider"></div>

        {/* CANCELADAS */}
        <div>
          <h3 className="card-title" style={{ fontSize: '18px', color: '#dc2626' }}>
            Canceladas ({canceladas.length})
          </h3>

          {canceladas.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No tienes reservas canceladas.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sala</th>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {canceladas.map((r) => (
                    <tr key={r.id_reserva}>
                      <td className="font-medium">{r.nombre_sala} - {r.edificio}</td>
                      <td>{formatearFecha(r.fecha)}</td>
                      <td>{r.hora_inicio} - {r.hora_fin}</td>
                      <td className="text-center">
                        <span 
                          className="reservation-status"
                          style={{
                            backgroundColor: '#FECACA',
                            color: '#991B1B'
                          }}
                        >
                          CANCELADA
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  }
 