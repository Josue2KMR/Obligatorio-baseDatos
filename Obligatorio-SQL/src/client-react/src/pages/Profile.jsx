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

  const cancelarReserva = async (idReserva) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reserva/${idReserva}/cancelar`, {
        method: "PUT"
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: "success", text: "✅ Reserva cancelada exitosamente" });
        loadData();
      } else {
        setMessage({ type: "error", text: `❌ ${data.error}` });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "❌ Error al cancelar reserva" });
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
        setMessage({ type: "success", text: "✅ Cuenta eliminada. Adiós..." });
        setTimeout(() => onLogout(), 2000);
      } else {
        setMessage({ type: "error", text: `❌ ${data.error}` });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "❌ Error al eliminar cuenta" });
    }

    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando perfil...</p>
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

  return (
    <div className="content-wrapper">
      {message.text && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          {message.text}
        </div>
      )}

      {/* Info Personal */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">👤 Mi Perfil</h2>
          <button onClick={onLogout} className="btn btn-secondary">
            🚪 Cerrar Sesión
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
            🗑️ Eliminar Cuenta
          </button>
        ) : (
          <div className="delete-confirm">
            <p className="delete-confirm-text">
              ⚠️ ¿Estás seguro? Esta acción no se puede deshacer.
            </p>
            <div className="delete-confirm-actions">
              <button onClick={eliminarCuenta} className="btn btn-danger">
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
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <h2 className="sanctions-title">Sanciones</h2>
          </div>
          <div className="sanctions-list">
            {misSanciones.map((sancion, idx) => {
              const hoy = new Date().toISOString().split('T')[0];
              const activa = sancion.fecha_inicio <= hoy && sancion.fecha_fin >= hoy;
              
              return (
                <div key={idx} className="sanction-item">
                  <span className={`sanction-badge ${activa ? "active" : "finished"}`}>
                    {activa ? '🚫 ACTIVA' : '✓ Finalizada'}
                  </span>
                  <p className="sanction-text">
                    📅 Desde: <strong>{sancion.fecha_inicio}</strong> hasta{" "}
                    <strong>{sancion.fecha_fin}</strong>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mis Reservas */}
      <div className="card">
        <h2 className="card-title">📋 Mis Reservas</h2>
        {misReservas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">No tienes reservas</p>
          </div>
        ) : (
          <div className="reservations-list">
            {misReservas.map((reserva) => (
              <div
                key={reserva.id_reserva}
                className={`reservation-item ${reserva.estado === "activa" ? "active" : reserva.estado === "cancelada" ? "cancelled" : ""}`}
              >
                <div className="reservation-header">
                  <div className="reservation-info">
                    <h3 className="reservation-title">
                      🏛️ {reserva.nombre_sala} - {reserva.edificio}
                    </h3>
                    <div className="reservation-details">
                      <p>📅 {formatearFecha(reserva.fecha)}</p>
                      <p>⏰ {reserva.hora_inicio} - {reserva.hora_fin}</p>
                    </div>
                    <span className={`reservation-status ${
                      reserva.estado === "activa" ? "active" :
                      reserva.estado === "cancelada" ? "cancelled" :
                      "finished"
                    }`}>
                      {reserva.estado}
                    </span>
                  </div>
                  {reserva.estado === "activa" && (
                    <button
                      onClick={() => cancelarReserva(reserva.id_reserva)}
                      className="btn btn-danger"
                    >
                      ❌ Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}