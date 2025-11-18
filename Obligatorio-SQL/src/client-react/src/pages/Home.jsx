import { useEffect, useState } from "react";
import { Calendar, Clock, Users, AlertCircle, User, LogOut, BookOpen, X, Check, XCircle } from "lucide-react";

function Home({ user, onLogout }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  
  // Estados para dashboard
  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [salasMasDemandadas, setSalasMasDemandadas] = useState([]);
  const [reservasHoy, setReservasHoy] = useState([]);
  
  // Estados para perfil
  const [participante, setParticipante] = useState(null);
  const [misReservas, setMisReservas] = useState([]);
  const [misSanciones, setMisSanciones] = useState([]);
  
  // Estados para reservas
  const [salasDisponibles, setSalasDisponibles] = useState([]);
  const [fechaReserva, setFechaReserva] = useState("");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState("");
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);

  useEffect(() => {
    if (activeView === "dashboard") {
      loadDashboardData();
    } else if (activeView === "profile") {
      loadProfileData();
    } else if (activeView === "reservar") {
      loadReservasData();
    }
  }, [activeView]);

  const loadDashboardData = async () => {
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
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [participanteRes, reservasRes, sancionesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/participantes?email=${user.correo}`),
        fetch(`http://localhost:5000/api/participantes?email=${user.correo}`).then(r => r.json()).then(data => {
          if (data.success && data.data) {
            return fetch(`http://localhost:5000/api/reservas?ci_participante=${data.data.ci}`);
          }
          return null;
        }),
        fetch(`http://localhost:5000/api/participantes?email=${user.correo}`).then(r => r.json()).then(data => {
          if (data.success && data.data) {
            return fetch(`http://localhost:5000/api/sanciones?ci_participante=${data.data.ci}`);
          }
          return null;
        })
      ]);

      const participanteData = await participanteRes.json();
      if (participanteData.success) {
        setParticipante(participanteData.data);
      }

      if (reservasRes) {
        const reservasData = await reservasRes.json();
        if (reservasData.success) setMisReservas(reservasData.data);
      }

      if (sancionesRes) {
        const sancionesData = await sancionesRes.json();
        if (sancionesData.success) setMisSanciones(sancionesData.data);
      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadReservasData = async () => {
    setLoading(true);
    try {
      const [salasRes, turnosRes] = await Promise.all([
        fetch("http://localhost:5000/api/salas"),
        fetch("http://localhost:5000/api/turnos")
      ]);

      const salasData = await salasRes.json();
      const turnosData = await turnosRes.json();

      if (salasData.success) setSalasDisponibles(salasData.data);
      if (turnosData.success) setTurnos(turnosData.data);
    } catch (err) {
      console.error("Error cargando datos de reserva:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkDisponibilidad = async (sala, turno) => {
    if (!fechaReserva || !participante) return false;
    
    try {
      const res = await fetch(`http://localhost:5000/api/reservas?fecha=${fechaReserva}&nombre_sala=${sala.nombre_sala}&edificio=${sala.edificio}&id_turno=${turno}`);
      const data = await res.json();
      return data.success && data.data.length === 0;
    } catch {
      return false;
    }
  };

  const crearReserva = async () => {
    if (!salaSeleccionada || !turnoSeleccionado || !fechaReserva || !participante) {
      alert("Complete todos los campos");
      return;
    }

    // Usar la función checkDisponibilidad antes de intentar validar/crear la reserva
    const disponible = await checkDisponibilidad(salaSeleccionada, turnoSeleccionado);
    if (!disponible) {
      alert("La sala no está disponible en esa fecha/turno.");
      return;
    }

    try {
      const validacionRes = await fetch("http://localhost:5000/api/reserva/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ci_participante: participante.ci,
          nombre_sala: salaSeleccionada.nombre_sala,
          edificio: salaSeleccionada.edificio,
          fecha: fechaReserva,
          id_turno: turnoSeleccionado
        })
      });

      const validacion = await validacionRes.json();
      
      if (!validacion.success) {
        alert(validacion.error);
        return;
      }

      const reservaRes = await fetch("http://localhost:5000/api/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_sala: salaSeleccionada.nombre_sala,
          edificio: salaSeleccionada.edificio,
          fecha: fechaReserva,
          id_turno: turnoSeleccionado,
          participantes: [participante.ci]
        })
      });

      const reserva = await reservaRes.json();
      
      if (reserva.success) {
        alert("¡Reserva creada exitosamente!");
        setFechaReserva("");
        setTurnoSeleccionado("");
        setSalaSeleccionada(null);
        setActiveView("profile");
      } else {
        alert(reserva.error);
      }
    } catch (err) {
      alert("Error al crear reserva");
      console.error(err);
    }
  };

  const cancelarReserva = async (idReserva) => {
    if (!confirm("¿Está seguro de cancelar esta reserva?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/reserva/${idReserva}/cancelar`, {
        method: "PUT"
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Reserva cancelada");
        loadProfileData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error al cancelar reserva");
      console.error(err);
    }
  };

  const eliminarCuenta = async () => {
    if (!confirm("¿ESTÁ SEGURO? Esta acción no se puede deshacer.")) return;
    if (!confirm("¿Realmente desea eliminar su cuenta permanentemente?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/participante/${participante.ci}`, {
        method: "DELETE"
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Cuenta eliminada");
        onLogout();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error al eliminar cuenta");
      console.error(err);
    }
  };

  const getSalasPorTipo = (tipo) => {
    return salasDisponibles.filter(s => s.tipo_sala === tipo);
  };

  const puedeReservarSala = (sala) => {
    if (!participante) return false;
    
    // Buscar el rol del participante
    // Por ahora simplificamos: libre para todos, posgrado para posgrado, docente para docentes
    if (sala.tipo_sala === "libre") return true;
    // Aquí deberías verificar el rol real del participante desde participante_programa_academico
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Reservas UCU</h1>
            <p className="text-sm text-gray-600 mt-1">{user?.correo}</p>
          </div>
          
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === "dashboard"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveView("reservar")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === "reservar"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Reservar
            </button>
            
            <button
              onClick={() => setActiveView("profile")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === "profile"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Perfil
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        ) : (
          <>
            {/* DASHBOARD */}
            {activeView === "dashboard" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Salas Totales</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{salas.length}</p>
                      </div>
                      <Calendar className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Turnos</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{turnos.length}</p>
                      </div>
                      <Clock className="w-10 h-10 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Reservas Hoy</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{reservasHoy.length}</p>
                      </div>
                      <Users className="w-10 h-10 text-purple-600" />
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
                      <AlertCircle className="w-10 h-10 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Salas Más Demandadas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Salas Más Reservadas</h2>
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

                {/* Estado de Salas Hoy */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Estado de Salas Hoy</h2>
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
                              {ocupada ? "Ocupada" : "Disponible"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{sala.edificio}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Capacidad: {sala.capacidad} | Tipo: {sala.tipo_sala}
                          </p>
                          {ocupada && (
                            <p className="text-xs text-red-600 mt-2">
                              {reservasEnSala.length} reserva(s) activa(s)
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PERFIL */}
            {activeView === "profile" && participante && (
              <div className="space-y-6">
                {/* Info Personal */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Mi Perfil</h2>
                    <button
                      onClick={onLogout}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
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
                    <button
                      onClick={eliminarCuenta}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar Cuenta
                    </button>
                  </div>
                </div>

                {/* Sanciones */}
                {misSanciones.length > 0 && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-6 h-6" />
                      Sanciones Activas
                    </h2>
                    <div className="space-y-3">
                      {misSanciones.map((sancion, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                          <p className="text-sm text-gray-600">
                            Desde: <span className="font-medium">{sancion.fecha_inicio}</span> hasta{" "}
                            <span className="font-medium">{sancion.fecha_fin}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mis Reservas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Reservas</h2>
                  {misReservas.length === 0 ? (
                    <p className="text-gray-600">No tienes reservas activas</p>
                  ) : (
                    <div className="space-y-3">
                      {misReservas.map((reserva) => (
                        <div
                          key={reserva.id_reserva}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {reserva.nombre_sala} - {reserva.edificio}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Fecha: {reserva.fecha} | Turno: {reserva.id_turno}
                              </p>
                              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                                reserva.estado === "activa" ? "bg-green-100 text-green-800" :
                                reserva.estado === "cancelada" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {reserva.estado}
                              </span>
                            </div>
                            {reserva.estado === "activa" && (
                              <button
                                onClick={() => cancelarReserva(reserva.id_reserva)}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RESERVAR */}
            {activeView === "reservar" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Nueva Reserva</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={fechaReserva}
                        onChange={(e) => setFechaReserva(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Turno
                      </label>
                      <select
                        value={turnoSeleccionado}
                        onChange={(e) => setTurnoSeleccionado(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccione un turno</option>
                        {turnos.map((turno) => (
                          <option key={turno.id_turno} value={turno.id_turno}>
                            {turno.hora_inicio} - {turno.hora_fin}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Salas por Tipo */}
                  <div className="space-y-6">
                    {/* Salas Libres */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Salas Libres (Acceso General)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getSalasPorTipo("libre").map((sala) => (
                          <button
                            key={`${sala.nombre_sala}-${sala.edificio}`}
                            onClick={() => setSalaSeleccionada(sala)}
                            disabled={!puedeReservarSala(sala)}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${
                              salaSeleccionada?.nombre_sala === sala.nombre_sala &&
                              salaSeleccionada?.edificio === sala.edificio
                                ? "border-green-600 bg-green-50"
                                : "border-gray-200 hover:border-green-300"
                            } ${!puedeReservarSala(sala) ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <h4 className="font-semibold text-gray-900">{sala.nombre_sala}</h4>
                            <p className="text-sm text-gray-600 mt-1">{sala.edificio}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Capacidad: {sala.capacidad} personas
                            </p>
                            {!puedeReservarSala(sala) && (
                              <p className="text-xs text-red-600 mt-2">Solo para docentes</p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botón Confirmar */}
                  <div className="mt-8 flex items-center justify-end gap-4">
                    <button
                      onClick={() => {
                        setFechaReserva("");
                        setTurnoSeleccionado("");
                        setSalaSeleccionada(null);
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Limpiar
                    </button>
                    <button
                      onClick={crearReserva}
                      disabled={!fechaReserva || !turnoSeleccionado || !salaSeleccionada}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Confirmar Reserva
                    </button>
                  </div>

                  {/* Información de Sala Seleccionada */}
                  {salaSeleccionada && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Resumen de Reserva</h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p><strong>Sala:</strong> {salaSeleccionada.nombre_sala}</p>
                        <p><strong>Edificio:</strong> {salaSeleccionada.edificio}</p>
                        <p><strong>Capacidad:</strong> {salaSeleccionada.capacidad} personas</p>
                        <p><strong>Tipo:</strong> {salaSeleccionada.tipo_sala}</p>
                        {fechaReserva && <p><strong>Fecha:</strong> {fechaReserva}</p>}
                        {turnoSeleccionado && (
                          <p><strong>Horario:</strong> {turnos.find(t => t.id_turno == turnoSeleccionado)?.hora_inicio} - {turnos.find(t => t.id_turno == turnoSeleccionado)?.hora_fin}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reglas de Reserva */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Reglas de Reserva
                  </h3>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      <span>Máximo 2 horas por día</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      <span>Máximo 3 reservas por semana</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      <span>Las salas de posgrado requieren estar inscrito en un programa de posgrado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      <span>Las salas de docentes son exclusivas para profesores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      <span>No puedes reservar si tienes sanciones activas</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Home;