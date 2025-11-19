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
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Salas Totales</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{salas.length}</p>
            </div>
            <span className="text-4xl">🏛️</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Turnos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{turnos.length}</p>
            </div>
            <span className="text-4xl">⏰</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reservas Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{reservasHoy.length}</p>
            </div>
            <span className="text-4xl">📅</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ocupación</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {((reservasHoy.length / (salas.length * turnos.length)) * 100).toFixed(0)}%
              </p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>
      </div>

      {/* Salas Más Demandadas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Salas Más Reservadas</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sala</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Edificio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Reservas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salasMasDemandadas.slice(0, 5).map((sala, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{sala.nombre_sala}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sala.edificio}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{sala.total_reservas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estado de Salas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Estado de Salas Hoy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {salas.map((sala) => {
            const reservasEnSala = reservasHoy.filter(
              r => r.nombre_sala === sala.nombre_sala && r.edificio === sala.edificio
            );
            const ocupada = reservasEnSala.length > 0;
            
            return (
              <div
                key={`${sala.nombre_sala}-${sala.edificio}`}
                className={`p-4 rounded-lg border-2 ${
                  ocupada ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{sala.nombre_sala}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    ocupada ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
                  }`}>
                    {ocupada ? "🔴 Ocupada" : "🟢 Libre"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{sala.edificio}</p>
                <p className="text-xs text-gray-500 mt-1">
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