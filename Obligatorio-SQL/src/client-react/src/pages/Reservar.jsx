import { useEffect, useState } from "react";

export default function Reservar({ user }) {
  const [loading, setLoading] = useState(false);
  const [participante, setParticipante] = useState(null);
  const [salasDisponibles, setSalasDisponibles] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [fechaReserva, setFechaReserva] = useState("");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState("");
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadData();
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    setFechaReserva(`${yyyy}-${mm}-${dd}`);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [participanteRes, salasRes, turnosRes] = await Promise.all([
        fetch(`http://localhost:5000/api/participantes?email=${user.correo}`),
        fetch("http://localhost:5000/api/salas"),
        fetch("http://localhost:5000/api/turnos")
      ]);

      const participanteData = await participanteRes.json();
      const salasData = await salasRes.json();
      const turnosData = await turnosRes.json();

      if (participanteData.success) setParticipante(participanteData.data);
      if (salasData.success) setSalasDisponibles(salasData.data);
      if (turnosData.success) setTurnos(turnosData.data);

    } catch (err) {
      console.error("Error:", err);
      setMessage({ type: "error", text: "❌ Error al cargar datos iniciales." });
    } finally {
      setLoading(false);
    }
  };

  const getTurnoInfo = (id) => {
    const turno = turnos.find(t => t.id_turno === Number(id));
    return turno ? `${turno.hora_inicio} - ${turno.hora_fin}` : 'N/A';
  };

  const formatearFechaDisplay = (fechaYYYYMMDD) => {
    if (!fechaYYYYMMDD) return "Fecha no seleccionada";
    const [year, month, day] = fechaYYYYMMDD.split("-");
    const fechaObj = new Date(year, Number(month) - 1, day);
    if (isNaN(fechaObj.getTime())) return "Fecha inválida";
    return fechaObj.toLocaleDateString("es-UY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleReserva = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!participante) {
      setMessage({ type: "error", text: "❌ No se pudo obtener el participante." });
      return;
    }

    if (!salaSeleccionada || !fechaReserva || !turnoSeleccionado) {
      setMessage({ type: "error", text: "❌ Sala, Fecha y Turno son obligatorios." });
      return;
    }

    const reservaData = {
      nombre_sala: salaSeleccionada.nombre_sala,
      edificio: salaSeleccionada.edificio,
      fecha: fechaReserva,          
      id_turno: Number(turnoSeleccionado),
      participantes: [participante.ci]
    };

    try {
      const res = await fetch("http://localhost:5000/api/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservaData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: `✅ Reserva Exitosa! ID: ${data.id_reserva}` });
        setSalaSeleccionada(null);
        setTurnoSeleccionado("");
      } else {
        setMessage({ type: "error", text: `❌ Fallo en la Reserva: ${data.error}` });
      }

    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "❌ Error de conexión con el servidor." });
    }
  };

  const handleClearForm = () => {
    setSalaSeleccionada(null);
    setTurnoSeleccionado("");
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    setFechaReserva(`${yyyy}-${mm}-${dd}`);
    setMessage({ type: "", text: "" });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="reservas-container">
      <div className="content-wrapper">
        <div className="card">
          <h1 className="card-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
            📅 Reservar Sala de Estudio
          </h1>
          <p className="card-subtitle">
            Completa el formulario para realizar tu reserva
          </p>
        </div>

        {message.text && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleReserva} className="card">
          <div className="reservation-form">
            <div className="form-grid">
              
              {/* SALA */}
              <div className="form-field">
                <label>1️⃣ Sala</label>
                <select
                  required
                  value={salaSeleccionada ? `${salaSeleccionada.nombre_sala}|${salaSeleccionada.edificio}` : ""}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setSalaSeleccionada(null);
                      return;
                    }
                    const [nombre_sala, edificio] = e.target.value.split("|");
                    const sala = salasDisponibles.find(
                      s => s.nombre_sala === nombre_sala && s.edificio === edificio
                    );
                    setSalaSeleccionada(sala);
                  }}
                >
                  <option value="">-- Elige una Sala --</option>
                  {salasDisponibles.map((sala) => (
                    <option
                      key={`${sala.nombre_sala}-${sala.edificio}`}
                      value={`${sala.nombre_sala}|${sala.edificio}`}
                    >
                      {sala.nombre_sala} ({sala.edificio}) - Cap: {sala.capacidad}
                    </option>
                  ))}
                </select>
              </div>

              {/* FECHA */}
              <div className="form-field">
                <label>2️⃣ Fecha</label>
                <input
                  required
                  type="date"
                  value={fechaReserva}
                  min={fechaReserva}
                  onChange={(e) => {
                    setFechaReserva(e.target.value);
                    setTurnoSeleccionado("");
                  }}
                />
              </div>

              {/* TURNO */}
              <div className="form-field">
                <label>3️⃣ Turno</label>
                <select
                  required
                  value={turnoSeleccionado}
                  onChange={(e) => setTurnoSeleccionado(e.target.value)}
                >
                  <option value="">-- Elige un Turno --</option>
                  {turnos.map((turno) => (
                    <option key={turno.id_turno} value={turno.id_turno}>
                      {turno.hora_inicio} - {turno.hora_fin}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* RESUMEN */}
            {(salaSeleccionada || fechaReserva || turnoSeleccionado) && (
              <div className="reservation-summary">
                <h2 className="summary-title">📋 Resumen de tu Reserva</h2>
                <div className="summary-content">
                  {salaSeleccionada && (
                    <p>
                      <strong>🏛️ Sala:</strong> {salaSeleccionada.nombre_sala} ({salaSeleccionada.edificio})
                    </p>
                  )}
                  {fechaReserva && (
                    <p>
                      <strong>📅 Fecha:</strong> {formatearFechaDisplay(fechaReserva)}
                    </p>
                  )}
                  {turnoSeleccionado && (
                    <p>
                      <strong>⏰ Horario:</strong> {getTurnoInfo(turnoSeleccionado)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* BOTONES */}
            <div className="divider"></div>
            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={handleClearForm}
                className="btn btn-outline"
              >
                🔄 Limpiar Formulario
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={!salaSeleccionada || !fechaReserva || !turnoSeleccionado}
              >
                ✅ Confirmar Reserva
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}