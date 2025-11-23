import { useState } from "react";
import "../styles.css"; 

function Login({ onLogin, onRegisterClick }) {
  const [form, setForm] = useState({
    correo: "",
    contraseña: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validarCorreoUCU = (email) => {
    const patron = /^[a-zA-Z0-9._%+-]+@(correo\.ucu\.edu\.uy|correo\.ucu\.uy)$/;
    return patron.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.correo || !form.contraseña) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // Validacion correo UCU
    if (!validarCorreoUCU(form.correo)) {
      setError("Debes usar un correo institucional UCU (@correo.ucu.edu.uy o @correo.ucu.uy)");
      return;
    }

    try {
      setLoading(true);

      const loginResponse = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const loginData = await loginResponse.json();

      if (loginData.success) {
        onLogin({ correo: form.correo });
      } else {
        setError(loginData.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>OneRoom UCU</h1>
        <p className="subtitle">Iniciar sesión</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <p>Correo electrónico</p>
            <input
              type="email"
              placeholder="tu@correo.ucu.edu.uy"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <p>Contraseña</p>
            <input
              type="password"
              placeholder="••••••••"
              value={form.contraseña}
              onChange={(e) => setForm({ ...form, contraseña: e.target.value })}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary-login" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿No tienes cuenta?</p>
          <button 
            type="button" 
            onClick={onRegisterClick} 
            className="btn-secondary-login"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;