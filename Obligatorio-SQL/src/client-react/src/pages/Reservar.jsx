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

  const hoy = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  useEffect(() => {
    loadData();
    // Siempre usar YYYY-MM-DD sin tocar zona horaria
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

  // → FORMATEA LA FECHA PARA MOSTRAR AL USUARIO (NO PARA ENVIAR AL BACKEND)
  const formatearFechaDisplay = (fechaYYYYMMDD) => {
    if (!fechaYYYYMMDD) return "Fecha no seleccionada";

    // Dividir sin usar Date() para no provocar UTC offset
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

    // → Se envía EXACTAMENTE YYYY-MM-DD, sin tocar
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

  if (loading) {
    return <div className="text-center py-12">Cargando datos...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">📅 Reservar Sala de Estudio</h1>

      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === "success"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleReserva} className="bg-white p-6 rounded-lg shadow-xl space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* SALA */}
          <div>
            <label className="block text-sm font-medium mb-2">1. Sala</label>
            <select
              required
              onChange={(e) => {
                const [nombre_sala, edificio] = e.target.value.split("|");
                const sala = salasDisponibles.find(
                  s => s.nombre_sala === nombre_sala && s.edificio === edificio
                );
                setSalaSeleccionada(sala);
              }}
              className="w-full p-2 border rounded"
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
          <div>
            <label className="block text-sm font-medium mb-2">2. Fecha</label>
            <input
              required
              type="date"
              value={fechaReserva}
              min={hoy}
              onChange={(e) => {
                setFechaReserva(e.target.value);
                setTurnoSeleccionado("");
              }}
              className="w-full p-2 border rounded"
            />
          </div>



          {/* TURNO */}
          <div>
            <label className="block text-sm font-medium mb-2">3. Turno</label>
            <select
              required
              value={turnoSeleccionado}
              onChange={(e) => setTurnoSeleccionado(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Elige un Turno --</option>

              {turnos.map((turno) => {
                // Convertir HH:MM a minutos totales
                const [h, m] = turno.hora_inicio.split(":").map(Number);
                const turnoMinutos = h * 60 + m;

                // Obtener fecha/hora actual
                const ahora = new Date();
                const hoy = ahora.toISOString().split("T")[0];

                const horaNow = ahora.getHours();
                const minNow = ahora.getMinutes();
                const nowMinutos = horaNow * 60 + minNow;

                // ¿Estamos reservando para hoy?
                const esHoy = fechaReserva === hoy;

                // Si es hoy y el turno empezó antes que la hora actual → DESHABILITAR
                const disabled = esHoy && turnoMinutos <= nowMinutos;

                return (
                  <option
                    key={turno.id_turno}
                    value={turno.id_turno}
                    disabled={disabled}
                    className={disabled ? "text-gray-400" : ""}
                  >
                    {turno.hora_inicio} - {turno.hora_fin}
                    {disabled ? "  (No disponible)" : ""}
                  </option>
                );
              })}
            </select>

          </div>

        </div>

        {/* RESUMEN */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-4">Resumen</h2>

          <div className="bg-gray-50 p-4 rounded border">
            {salaSeleccionada && (
              <p><strong>Sala:</strong> {salaSeleccionada.nombre_sala} ({salaSeleccionada.edificio})</p>
            )}
            {fechaReserva && (
              <p><strong>Fecha:</strong> {formatearFechaDisplay(fechaReserva)}</p>
            )}
            {turnoSeleccionado && (
              <p><strong>Horario:</strong> {getTurnoInfo(turnoSeleccionado)}</p>
            )}
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={!salaSeleccionada || !fechaReserva || !turnoSeleccionado}
          >
            Reservar Ahora
          </button>
        </div>
      </form>
    </div>
  );
}
