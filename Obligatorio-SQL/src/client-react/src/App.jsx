import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Resgister";
import Home from "./pages/Home";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
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
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <Login
            onLogin={handleLogin}
            onRegisterClick={() => setCurrentPage("register")}
          />
        );
      case "register":
        return (
          <Register
            onRegisterSuccess={handleLogin}
            onBackToLogin={() => setCurrentPage("login")}
          />
        );
      case "home":
        return <Home user={user} onLogout={handleLogout} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return <div className="app">{renderPage()}</div>;
}

export default App;