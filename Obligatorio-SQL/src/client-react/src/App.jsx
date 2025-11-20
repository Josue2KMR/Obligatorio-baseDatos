import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reservar from "./pages/Reservar";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import "./styles.css";

function App() {
  const [currentView, setCurrentView] = useState("login");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  // Verificar si el usuario es admin cuando inicia sesión
  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.correo) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/admin/verificar?correo=${user.correo}`
          );
          const data = await res.json();
          
          if (data.success) {
            setIsAdmin(data.is_admin);
            // Si es admin, mostrar el panel de admin por defecto
            if (data.is_admin) {
              setActiveSection("admin");
            }
          }
        } catch (err) {
          console.error("Error verificando admin:", err);
        }
      }
    };

    checkAdmin();
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView("main");
    setActiveSection("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setCurrentView("login");
    setActiveSection("dashboard");
  };

  const handleRegisterSuccess = () => {
    setCurrentView("login");
  };

  // Vista de autenticación
  if (currentView === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onRegisterClick={() => setCurrentView("register")}
      />
    );
  }

  if (currentView === "register") {
    return (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onBackToLogin={() => setCurrentView("login")}
      />
    );
  }

  // Vista principal (dashboard con navegación)
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">OneRoom UCU</h1>
          <p className="user-email">{user?.correo}</p>
          {isAdmin && (
            <span className="admin-badge">🛡️ Administrador</span>
          )}
        </div>

        <nav className="nav-menu">
          <button
            className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${activeSection === "reservar" ? "active" : ""}`}
            onClick={() => setActiveSection("reservar")}
          >
            <span className="nav-icon">📅</span>
            Reservar Sala
          </button>

          <button
            className={`nav-item ${activeSection === "perfil" ? "active" : ""}`}
            onClick={() => setActiveSection("perfil")}
          >
            <span className="nav-icon">👤</span>
            Mi Perfil
          </button>

          {isAdmin && (
            <>
              <div className="nav-divider"></div>
              <button
                className={`nav-item admin-item ${activeSection === "admin" ? "active" : ""}`}
                onClick={() => setActiveSection("admin")}
              >
                <span className="nav-icon">🛡️</span>
                Panel Admin
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeSection === "dashboard" && <Dashboard />}
        {activeSection === "reservar" && <Reservar user={user} />}
        {activeSection === "perfil" && <Profile user={user} onLogout={handleLogout} />}
        {activeSection === "admin" && isAdmin && <Admin user={user} onLogout={handleLogout} />}
      </main>
    </div>
  );
}

export default App;