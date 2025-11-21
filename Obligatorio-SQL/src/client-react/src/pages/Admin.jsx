import { useEffect, useState } from "react";

export default function Admin({ onLogout }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("salas"); // salas, usuarios, sanciones
  const [message, setMessage] = useState({ type: "", text: "" });

  // Estado para Salas
  const [salas, setSalas] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [showCreateSala, setShowCreateSala] = useState(false);
  const [nuevaSala, setNuevaSala] = useState({
    nombre_sala: "",
    edificio: "",
    capacidad: "",
    tipo_sala: "libre",
  });

  // Estado para Usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para Sanciones
  const [sancionForm, setSancionForm] = useState({
    ci_participante: "",
    dias: "",
  });

  const [sanciones, setSanciones] = useState([]);

  // Estado para confirmaciones
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "salas") {
        const [salasRes, edificiosRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/salas"),
          fetch("http://localhost:5000/api/edificios"),
        ]);
        const salasData = await salasRes.json();
        const edificiosData = await edificiosRes.json();

        if (salasData.success) setSalas(salasData.data);
        if (edificiosData.success) setEdificios(edificiosData.data);
      }

      if (activeTab === "usuarios") {
        const res = await fetch("http://localhost:5000/api/admin/usuarios");
        const data = await res.json();
        if (data.success) setUsuarios(data.data);
      }

      if (activeTab === "sanciones") {
        const [usuariosRes, sancionesRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/usuarios"),
          fetch("http://localhost:5000/api/admin/sanciones"),
        ]);
        const usuariosData = await usuariosRes.json();
        const sancionesData = await sancionesRes.json();

        if (usuariosData.success) setUsuarios(usuariosData.data);
        if (sancionesData.success) setSanciones(sancionesData.data);
      }
    } catch (err) {
      console.error("Error:", err);
      showMessage("error", "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // ==================== GESTIÓN DE SALAS ====================

  const handleCrearSala = async (e) => {
    e.preventDefault();

    if (!nuevaSala.nombre_sala || !nuevaSala.edificio || !nuevaSala.capacidad) {
      showMessage("error", "Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/sala", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaSala),
      });

      const data = await res.json();

      if (data.success) {
        showMessage("success", "Sala creada exitosamente");
        setShowCreateSala(false);
        setNuevaSala({
          nombre_sala: "",
          edificio: "",
          capacidad: "",
          tipo_sala: "libre",
        });
        loadData();
      } else {
        showMessage("error", `${data.error}`);
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Error al crear sala");
    }
  };

  const handleEliminarSala = async (nombre_sala, edificio) => {
    setConfirmMessage(
      `¿Eliminar sala "${nombre_sala}" del edificio "${edificio}"?\n\nEsto eliminará todas las reservas asociadas.`
    );
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/admin/sala/${encodeURIComponent(
            nombre_sala
          )}/${encodeURIComponent(edificio)}`,
          { method: "DELETE" }
        );

        const data = await res.json();

        if (data.success) {
          showMessage("success", "Sala eliminada");
          loadData();
        } else {
          showMessage("error", `${data.error}`);
        }
      } catch (err) {
        console.error(err);
        showMessage("error", "Error al eliminar sala");
      }
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };
  // ==================== GESTIÓN DE USUARIOS ====================

  const handleEliminarUsuario = async (ci, nombre, apellido) => {
    setConfirmMessage(
      `¿Eliminar usuario ${nombre} ${apellido}?\n\nEsto eliminará todas sus reservas y datos asociados.`
    );
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/participante/${ci}/cascade`,
          { method: "DELETE" }
        );

        const data = await res.json();

        if (data.success) {
          showMessage("success", "Usuario eliminado");
          loadData();
        } else {
          showMessage("error", `${data.error}`);
        }
      } catch (err) {
        console.error(err);
        showMessage("error", "Error al eliminar usuario");
      }
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };
  // ==================== GESTIÓN DE SANCIONES ====================

  const handleCrearSancion = async (e) => {
    e.preventDefault();

    if (!sancionForm.ci_participante || !sancionForm.dias) {
      showMessage("error", "Todos los campos son obligatorios");
      return;
    }

    if (sancionForm.dias <= 0 || sancionForm.dias > 365) {
      showMessage("error", "Los días deben estar entre 1 y 365");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/sancion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sancionForm),
      });

      const data = await res.json();

      if (data.success) {
        showMessage("success", `${data.message}`);
        setSancionForm({ ci_participante: "", dias: "" });
        loadData();
      } else {
        showMessage("error", `${data.error}`);
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Error al crear sanción");
    }
  };

  const handleEliminarSancion = async (idSancion, nombreUsuario) => {
    setConfirmMessage(`¿Eliminar sanción de ${nombreUsuario}?`);
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/admin/sancion/${idSancion}`,
          { method: "DELETE" }
        );

        const data = await res.json();

        if (data.success) {
          showMessage("success", "Sanción eliminada");
          loadData();
        } else {
          showMessage("error", `${data.error}`);
        }
      } catch (err) {
        console.error(err);
        showMessage("error", "Error al eliminar sanción");
      }
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };
  // ==================== FILTROS ====================

  const usuariosFiltrados = usuarios.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(term) ||
      u.apellido?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.ci?.toString().includes(term)
    );
  });

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div>
            <h1
              className="card-title"
              style={{ fontSize: "28px", marginBottom: "8px" }}
            >
              Panel de Administración
            </h1>
            <p className="card-subtitle">
              Gestión de salas, usuarios y sanciones
            </p>
          </div>
          <button onClick={onLogout} className="btn btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {message.text && (
        <div
          className={`alert ${
            message.type === "success" ? "alert-success" : "alert-error"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "salas" ? "active" : ""}`}
            onClick={() => setActiveTab("salas")}
          >
            Gestión de Salas
          </button>
          <button
            className={`tab ${activeTab === "usuarios" ? "active" : ""}`}
            onClick={() => setActiveTab("usuarios")}
          >
            Gestión de Usuarios
          </button>
          <button
            className={`tab ${activeTab === "sanciones" ? "active" : ""}`}
            onClick={() => setActiveTab("sanciones")}
          >
            Sancionar Usuarios
          </button>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Confirmar Acción</h3>
            <p className="modal-message">{confirmMessage}</p>
            <div className="modal-actions">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmAction && confirmAction()}
                className="btn btn-danger"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: SALAS ==================== */}
      {activeTab === "salas" && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Administración de Salas</h2>
            <button
              onClick={() => setShowCreateSala(!showCreateSala)}
              className="btn btn-primary"
            >
              {showCreateSala ? "Cancelar" : "Nueva Sala"}
            </button>
          </div>

          {/* Formulario Crear Sala */}
          {showCreateSala && (
            <form onSubmit={handleCrearSala} className="form-section">
              <div className="form-grid">
                <div className="form-field">
                  <label>Nombre de la Sala *</label>
                  <input
                    type="text"
                    placeholder="Ej: Sala 301"
                    value={nuevaSala.nombre_sala}
                    onChange={(e) =>
                      setNuevaSala({
                        ...nuevaSala,
                        nombre_sala: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Edificio *</label>
                  <select
                    value={nuevaSala.edificio}
                    onChange={(e) =>
                      setNuevaSala({ ...nuevaSala, edificio: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Seleccionar Edificio --</option>
                    {edificios.map((e) => (
                      <option key={e.nombre_edificio} value={e.nombre_edificio}>
                        {e.nombre_edificio}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Capacidad *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 8"
                    value={nuevaSala.capacidad}
                    onChange={(e) =>
                      setNuevaSala({ ...nuevaSala, capacidad: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Tipo de Sala *</label>
                  <select
                    value={nuevaSala.tipo_sala}
                    onChange={(e) =>
                      setNuevaSala({ ...nuevaSala, tipo_sala: e.target.value })
                    }
                    required
                  >
                    <option value="libre">Libre</option>
                    <option value="posgrado">Posgrado</option>
                    <option value="docente">Docente</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Crear Sala
              </button>
            </form>
          )}

          <div className="divider"></div>

          {/* Tabla de Salas */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Sala</th>
                  <th>Edificio</th>
                  <th>Capacidad</th>
                  <th>Tipo</th>
                  <th>Reservas Totales</th>
                  <th>Reservas Activas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((sala) => (
                  <tr key={`${sala.nombre_sala}-${sala.edificio}`}>
                    <td className="font-medium">{sala.nombre_sala}</td>
                    <td>{sala.edificio}</td>
                    <td>{sala.capacidad}</td>
                    <td>
                      <span
                        className={`badge ${
                          sala.tipo_sala === "posgrado"
                            ? "badge-warning"
                            : sala.tipo_sala === "docente"
                            ? "badge-info"
                            : "badge-success"
                        }`}
                      >
                        {sala.tipo_sala}
                      </span>
                    </td>
                    <td>{sala.total_reservas || 0}</td>
                    <td>{sala.reservas_activas || 0}</td>
                    <td>
                      <button
                        onClick={() =>
                          handleEliminarSala(sala.nombre_sala, sala.edificio)
                        }
                        className="btn btn-danger btn-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB: USUARIOS ==================== */}
      {activeTab === "usuarios" && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Ver Datos de Usuarios</h2>
            <input
              type="text"
              placeholder="Buscar por CI, nombre, apellido o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ maxWidth: "400px" }}
            />
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>CI</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Programa</th>
                  <th>Reservas</th>
                  <th>Sanciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.ci}>
                    <td className="font-medium">{usuario.ci}</td>
                    <td>
                      {usuario.nombre} {usuario.apellido}
                    </td>
                    <td className="text-secondary">{usuario.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          usuario.rol === "docente"
                            ? "badge-info"
                            : usuario.rol === "admin"
                            ? "badge-danger"
                            : "badge-success"
                        }`}
                      >
                        {usuario.rol || "estudiante"}
                      </span>
                    </td>
                    <td className="text-secondary">
                      {usuario.nombre_programa || "N/A"}
                    </td>
                    <td>{usuario.total_reservas || 0}</td>
                    <td>
                      {usuario.sanciones_activas > 0 ? (
                        <span className="badge badge-danger">
                          {usuario.sanciones_activas} activa(s)
                        </span>
                      ) : (
                        <span className="text-secondary">Sin sanciones</span>
                      )}
                    </td>
                    <td>
                      {usuario.rol !== "admin" && (
                        <button
                          onClick={() =>
                            handleEliminarUsuario(
                              usuario.ci,
                              usuario.nombre,
                              usuario.apellido
                            )
                          }
                          className="btn btn-danger btn-sm"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {usuariosFiltrados.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p className="empty-state-text">No se encontraron usuarios</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB: SANCIONES ==================== */}
      {activeTab === "sanciones" && (
        <div className="card">
          <h2 className="card-title">Aplicar Sanción a Usuario</h2>

          <form onSubmit={handleCrearSancion} className="form-section">
            <div className="form-grid">
              <div className="form-field">
                <label>Seleccionar Usuario *</label>
                <select
                  value={sancionForm.ci_participante}
                  onChange={(e) =>
                    setSancionForm({
                      ...sancionForm,
                      ci_participante: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">-- Seleccionar Usuario --</option>
                  {usuarios
                    .filter((u) => u.rol !== "admin")
                    .map((u) => (
                      <option key={u.ci} value={u.ci}>
                        {u.ci} - {u.nombre} {u.apellido} ({u.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-field">
                <label>Días de Sanción *</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  placeholder="Ej: 7"
                  value={sancionForm.dias}
                  onChange={(e) =>
                    setSancionForm({ ...sancionForm, dias: e.target.value })
                  }
                  required
                />
                <small className="form-hint">
                  La sanción comenzará hoy y durará la cantidad de días
                  especificada
                </small>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Aplicar Sanción
            </button>
          </form>

          <div className="divider"></div>

          {/* Tabla de Sanciones Activas */}
          <div>
            <h3
              className="card-title"
              style={{ fontSize: "20px", marginBottom: "16px" }}
            >
              Sanciones Activas
            </h3>

            {sanciones.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">
                  No hay sanciones activas en el sistema
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Fin</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sanciones.map((sancion) => {
                      const hoy = new Date();
                      hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche

                      const fechaInicio = new Date(sancion.fecha_inicio);
                      const fechaFin = new Date(sancion.fecha_fin);

                      const activa = fechaInicio <= hoy && fechaFin >= hoy;

                      return (
                        <tr key={sancion.id_sancion}>
                          <td className="font-medium">
                            {sancion.nombre} {sancion.apellido}
                            <br />
                            <span
                              className="text-secondary"
                              style={{ fontSize: "12px" }}
                            >
                              CI: {sancion.ci_participante}
                            </span>
                          </td>
                          <td className="text-secondary">{sancion.email}</td>
                          <td>{sancion.fecha_inicio}</td>
                          <td>{sancion.fecha_fin}</td>
                          <td>
                            <span
                              className={`badge ${
                                activa ? "badge-danger" : "badge-secondary"
                              }`}
                            >
                              {activa ? "ACTIVA" : "Finalizada"}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                handleEliminarSancion(
                                  sancion.id_sancion,
                                  `${sancion.nombre} ${sancion.apellido}`
                                )
                              }
                              className="btn btn-danger btn-sm"
                            >
                              Quitar Sanción
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="divider"></div>

          <div className="info-box">
            <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>
              Información sobre Sanciones
            </h3>
            <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
              <li>Las sanciones impiden al usuario realizar nuevas reservas</li>
              <li>
                La sanción se aplica desde hoy hasta la fecha especificada
              </li>
              <li>
                Los usuarios pueden ver sus sanciones activas en su perfil
              </li>
              <li>Las sanciones no afectan reservas ya realizadas</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
