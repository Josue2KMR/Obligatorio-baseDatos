import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Perfil from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Reservar from "./pages/Reservar";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [currentView, setCurrentView] = useState("dashboard");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentPage("home");
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCurrentPage("login");
    setCurrentView("dashboard");
  };

  // Páginas de autenticación
  if (currentPage === "login") {
    return <Login onLogin={handleLogin} onRegisterClick={() => setCurrentPage("register")} />;
  }

  if (currentPage === "register") {
    return (
      <Register
        onRegisterSuccess={handleLogin}
        onBackToLogin={() => setCurrentPage("login")}
      />
    );
  }

  // Página principal con navegación
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📚 ReservaUCU</h1>
              <p className="text-sm text-gray-600 mt-1">{user?.correo}</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === "dashboard"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📊 Dashboard
            </button>
            
            <button
              onClick={() => setCurrentView("reservar")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === "reservar"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📝 Reservar
            </button>
            
            <button
              onClick={() => setCurrentView("perfil")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === "perfil"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              👤 Perfil
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "reservar" && <Reservar user={user} />}
        {currentView === "perfil" && <Perfil user={user} onLogout={handleLogout} />}
      </main>
    </div>
  );
}

export default App;