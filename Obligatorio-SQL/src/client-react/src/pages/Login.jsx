import { useState } from "react";

function Login({ onLogin, onRegisterClick }) {
  const [form, setForm] = useState({
    correo: "",
    contraseña: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.correo || !form.contraseña) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);

      // Verificar si el usuario existe
      const checkResponse = await fetch(
        `http://localhost:5000/api/participante/email/${form.correo}`
      );
      const checkData = await checkResponse.json();

      if (!checkData.success) {
        setError("El correo no está registrado. Por favor regístrate.");
        setLoading(false);
        return;
      }

      // Intentar login
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
        setError("Contraseña incorrecta");
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
        <h1>Iniciar Sesión</h1>
        <p className="subtitle">Sistema de Reservas de Salas</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.contraseña}
              onChange={(e) => setForm({ ...form, contraseña: e.target.value })}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tienes cuenta?{" "}
            <button onClick={onRegisterClick} className="link-button">
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
