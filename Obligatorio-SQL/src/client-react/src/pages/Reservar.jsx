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
  const [turnosOcupados, setTurnosOcupados] = useState([]);

  const hoy = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  //Cargar turnos ocupados para una sala y fecha
  const cargarTurnosOcupados = async (fecha, sala) => {
    if (!sala || !fecha) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/reservas?fecha=${fecha}&nombre_sala=${sala.nombre_sala}&edificio=${sala.edificio}`
      );
      const data = await res.json();

      if (data.success) {
        const ocupados = data.data
          .filter((r) => r.estado === "activa")
          .map((r) => Number(r.id_turno)); 

        setTurnosOcupados(ocupados);
      } else {
        setTurnosOcupados([]);
      }
    } catch (err) {
      console.error("Error cargando turnos ocupados:", err);
      setTurnosOcupados([]);
    }
  };

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
        fetch("http://localhost:5000/api/turnos"),
      ]);

      const participanteData = await participanteRes.json();
      const salasData = await salasRes.json();
      const turnosData = await turnosRes.json();

      if (participanteData.success) setParticipante(participanteData.data);
      if (salasData.success) setSalasDisponibles(salasData.data);
      if (turnosData.success) setTurnos(turnosData.data);
    } catch (err) {
      console.error("Error:", err);
      setMessage({
        type: "error",
        text: "Error al cargar datos",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTurnoInfo = (id) => {
    const turno = turnos.find((t) => t.id_turno === Number(id));
    return turno ? `${turno.hora_inicio} - ${turno.hora_fin}` : "N/A";
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
      setMessage({
        type: "error",
        text: "No se pudo obtener el participante",
      });
      return;
    }

    if (!salaSeleccionada || !fechaReserva || !turnoSeleccionado) {
      setMessage({
        type: "error",
        text: "Error: Sala, Fecha y Turno son obligatorios",
      });
      return;
    }

    const reservaData = {
      nombre_sala: salaSeleccionada.nombre_sala,
      edificio: salaSeleccionada.edificio,
      fecha: fechaReserva,
      id_turno: Number(turnoSeleccionado),
      participantes: [participante.ci],
    };

    try {
      const res = await fetch("http://localhost:5000/api/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservaData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `Reserva Exitosa! ID: ${data.id_reserva}`,
        });
        setTurnoSeleccionado("");

        //Actualizar turnos ocupados para reflejar la nueva reserva
        cargarTurnosOcupados(fechaReserva, salaSeleccionada);
      } else {
        setMessage({
          type: "error",
          text: `Error: Fallo en la Reserva: ${data.error}`,
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Error de conexión con el servidor.",
      });
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
    setTurnosOcupados([]);
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
          <h1
            className="card-title"
            style={{ fontSize: "28px", marginBottom: "8px" }}
          >
            Reservar Sala de Estudio
          </h1>
          <p className="card-subtitle">
            Completa el formulario para realizar tu reserva
          </p>
        </div>

        <form onSubmit={handleReserva} className="card">
          <div className="reservation-form">
            <div className="form-grid">
              {/* SALA */}
              <div className="form-field">
                <label>Sala</label>
                <select
                  required
                  value={
                    salaSeleccionada
                      ? `${salaSeleccionada.nombre_sala}|${salaSeleccionada.edificio}`
                      : ""
                  }
                  onChange={(e) => {
                    if (!e.target.value) {
                      setSalaSeleccionada(null);
                      setTurnosOcupados([]);
                      return;
                    }

                    const [nombre_sala, edificio] = e.target.value.split("|");
                    const sala = salasDisponibles.find(
                      (s) =>
                        s.nombre_sala === nombre_sala && s.edificio === edificio
                    );

                    setSalaSeleccionada(sala);

                    if (sala && fechaReserva) {
                      cargarTurnosOcupados(fechaReserva, sala);
                    }
                  }}
                >
                  <option value="">Elegir Sala</option>
                  {salasDisponibles.map((sala) => (
                    <option
                      key={`${sala.nombre_sala}-${sala.edificio}`}
                      value={`${sala.nombre_sala}|${sala.edificio}`}
                    >
                      {sala.nombre_sala} ({sala.edificio}) - Cap:{" "}
                      {sala.capacidad}
                    </option>
                  ))}
                </select>
              </div>

              {/* FECHA */}
              <div className="form-field">
                <label>Fecha</label>
                <input
                  required
                  type="date"
                  value={fechaReserva}
                  min={hoy}
                  onChange={(e) => {
                    const nuevaFecha = e.target.value;
                    setFechaReserva(nuevaFecha);
                    setTurnoSeleccionado("");

                    if (salaSeleccionada) {
                      cargarTurnosOcupados(nuevaFecha, salaSeleccionada);
                    } else {
                      setTurnosOcupados([]);
                    }
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* TURNO */}
              <div className="form-field">
                <label>Turno</label>
                <select
                  required
                  value={turnoSeleccionado}
                  onChange={(e) => setTurnoSeleccionado(e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={!salaSeleccionada || !fechaReserva}
                >
                  <option value="">Elegir Turno</option>

                  {turnos.map((turno) => {
                    const [h, m] = turno.hora_inicio.split(":").map(Number);
                    const turnoMinutos = h * 60 + m;

                    const ahora = new Date();
                    const nowMinutos =
                      ahora.getHours() * 60 + ahora.getMinutes();

                    const hoyLocal = new Date();
                    const yyyy = hoyLocal.getFullYear();
                    const mm = String(hoyLocal.getMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const dd = String(hoyLocal.getDate()).padStart(2, "0");
                    const fechaHoy = `${yyyy}-${mm}-${dd}`;

                    const esHoy = fechaReserva === fechaHoy;

                    const pasado = esHoy && turnoMinutos <= nowMinutos;
                    const ocupado = turnosOcupados.includes(turno.id_turno);

                    const disabled = pasado || ocupado;

                    return (
                      <option
                        key={turno.id_turno}
                        value={turno.id_turno}
                        disabled={disabled}
                        className={disabled ? "text-gray-400" : ""}
                      >
                        {turno.hora_inicio} - {turno.hora_fin}
                        {pasado ? " (No disponible)" : ""}
                        {ocupado ? " (Ya reservado)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* RESUMEN */}
            {(salaSeleccionada || fechaReserva || turnoSeleccionado) && (
              <div className="reservation-summary">
                <h2 className="summary-title">Resumen de tu Reserva</h2>
                <div className="summary-content">
                  {salaSeleccionada && (
                    <p>
                      <strong>🏛️ Sala:</strong> {salaSeleccionada.nombre_sala} (
                      {salaSeleccionada.edificio})
                    </p>
                  )}
                  {fechaReserva && (
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {formatearFechaDisplay(fechaReserva)}
                    </p>
                  )}
                  {turnoSeleccionado && (
                    <p>
                      <strong>Horario:</strong>{" "}
                      {getTurnoInfo(turnoSeleccionado)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {message.text && (
              <div
                className={`alert ${
                  message.type === "success" ? "alert-success" : "alert-error"
                }`}
              >
                {message.text}
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
                Limpiar
              </button>
              <button
                type="submit"
                className="btn btn-primary "
                disabled={
                  !salaSeleccionada || !fechaReserva || !turnoSeleccionado
                }
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
