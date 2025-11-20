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
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (!participante) return <div>Error al cargar perfil</div>;

  // Ordenar reservas por fecha ascendente
  const reservasOrdenadas = [...misReservas].sort(
    (a, b) => a.fecha.localeCompare(b.fecha)
  );


  // Filtrar categorías
  const activas = reservasOrdenadas.filter(r => r.estado === "activa");

  const utilizadas = reservasOrdenadas.filter(
    r => ["finalizada", "sin asistencia"].includes(r.estado)
  );

 




  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" :
          "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Info Personal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">👤 Mi Perfil</h2>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">CI</label>
            <p className="text-lg text-gray-900">{participante.ci}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <p className="text-lg text-gray-900">{participante.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Nombre</label>
            <p className="text-lg text-gray-900">{participante.nombre}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Apellido</label>
            <p className="text-lg text-gray-900">{participante.apellido}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Eliminar Cuenta
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-red-800 font-semibold mb-3">⚠️ ¿Estás seguro? Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button
                  onClick={eliminarCuenta}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Sí, eliminar permanentemente
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sanciones */}
      {misSanciones.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-4">⚠️ Sanciones</h2>
          <div className="space-y-3">
            {misSanciones.map((sancion, idx) => {
              const hoy = new Date().toISOString().split('T')[0];
              const activa = sancion.fecha_inicio <= hoy && sancion.fecha_fin >= hoy;
              
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border ${
                    activa 
                      ? 'bg-red-100 border-red-300' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      activa ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {activa ? '🚫 ACTIVA' : '✓ Finalizada'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    📅 Desde: <span className="font-medium">{sancion.fecha_inicio}</span> hasta{" "}
                    <span className="font-medium">{sancion.fecha_fin}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/*            MIS RESERVAS                */}
      {/* ======================================= */}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Mis Reservas</h2>

        
        

        {/* ============ ACTIVAS ============ */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-green-700 mb-3">
            🟢 Activas ({activas.length})
          </h3>

          {activas.length === 0 ? (
            <p className="text-gray-600">No tienes reservas activas.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4 font-semibold text-gray-700 border-b pb-2">
              <p>Sala</p>
              <p>Fecha</p>
              <p>Turno</p>
              <p className="text-center">Acción</p>
            </div>
          )}

          {activas.map((r) => (
            <div
              key={r.id_reserva}
              className="grid grid-cols-4 gap-4 py-3 border-b items-center"
            >
              <p className="font-medium">{r.nombre_sala} - {r.edificio}</p>
              <p>{formatearFecha(r.fecha)}</p>
              <p>{r.hora_inicio} - {r.hora_fin}</p>

              <button
                onClick={() => cancelarReserva(r.id_reserva)}
                className="mx-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Cancelar
              </button>
            </div>
          ))}
        </div>

        {/* ============ UTILIZADAS ============ */}
        <div>
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            🔵 Utilizadas ({utilizadas.length})
          </h3>

          {utilizadas.length === 0 ? (
            <p className="text-gray-600">No tienes reservas utilizadas.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4 font-semibold text-gray-700 border-b pb-2">
              <p>Sala</p>
              <p>Fecha</p>
              <p>Turno</p>
              <p className="text-center">Estado</p>
            </div>
          )}

          {utilizadas.map((r) => (
            <div
              key={r.id_reserva}
              className="grid grid-cols-4 gap-4 py-3 border-b items-center"
            >
              <p className="font-medium">{r.nombre_sala} - {r.edificio}</p>
              <p>{formatearFecha(r.fecha)}</p>
              <p>{r.hora_inicio} - {r.hora_fin}</p>

              <span className="mx-auto text-sm font-medium">
                {r.estado === "sin asistencia"
                  ? "SIN ASISTENCIA"
                  : "FINALIZADA"}

              </span>
            </div>
          ))}
        </div>

</div>

    </div>
  );
}
