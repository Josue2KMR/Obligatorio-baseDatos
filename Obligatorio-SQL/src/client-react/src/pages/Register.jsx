import { useState } from "react";
import "../styles.css";

function Register({ onRegisterSuccess, onBackToLogin }) {
  const [form, setForm] = useState({
    ci: "",
    nombre: "",
    apellido: "",
    email: "",
    contraseña: "",
    confirmarContraseña: "",
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

    // Validaciones
    if (
      !form.ci ||
      !form.nombre ||
      !form.apellido ||
      !form.email ||
      !form.contraseña ||
      !form.confirmarContraseña
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // Validar correo UCU
    if (!validarCorreoUCU(form.email)) {
      setError(
        "Debes usar un correo institucional UCU (@correo.ucu.edu.uy o @correo.ucu.uy)"
      );
      return;
    }

    if (form.contraseña !== form.confirmarContraseña) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (form.contraseña.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);

      // 1. Crear participante
      const participanteResponse = await fetch(
        "http://localhost:5000/api/participante",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ci: form.ci,
            nombre: form.nombre,
            apellido: form.apellido,
            email: form.email,
          }),
        }
      );

      const participanteData = await participanteResponse.json();

      if (!participanteData.success) {
        setError(participanteData.error || "Error al registrar participante");
        setLoading(false);
        return;
      }

      // 2. Crear credenciales de login
      const loginResponse = await fetch(
        "http://localhost:5000/api/login/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correo: form.email,
            contraseña: form.contraseña,
          }),
        }
      );

      const loginData = await loginResponse.json();

      if (loginData.success) {
        // Cambiar de alert a un mensaje de éxito temporal
        setError(""); // Limpiar errores previos

        // Crear elemento de éxito temporal
        const successDiv = document.createElement("div");
        successDiv.className = "success-message";
        successDiv.textContent = "¡Registro exitoso! Redirigiendo...";
        document.querySelector(".auth-card").prepend(successDiv);

        // Redirigir después de 2 segundos
        setTimeout(() => {
          onRegisterSuccess({ correo: form.email });
        }, 2000);
      } else {
        setError(loginData.error || "Error al crear credenciales de login");
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
        <h1>Crear Cuenta</h1>
        <p className="subtitle">Regístrate para reservar salas</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <p>Cédula de Identidad</p>
            <input
              type="number"
              placeholder="12345678"
              value={form.ci}
              onChange={(e) => setForm({ ...form, ci: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <p>Nombre</p>
            <input
              type="text"
              placeholder="Juan"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <p>Apellido</p>
            <input
              type="text"
              placeholder="Pérez"
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <p>Correo Electrónico UCU</p>
            <input
              type="email"
              placeholder="tu@correo.ucu.edu.uy"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
            />
            <small style={{ color: "#666", fontSize: "0.85rem" }}>
              Debe ser un correo institucional (@correo.ucu.edu.uy o
              @ucu.edu.uy)
            </small>
          </div>

          <div className="form-group">
            <p>Contraseña</p>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.contraseña}
              onChange={(e) => setForm({ ...form, contraseña: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <p>Confirmar Contraseña</p>
            <input
              type="password"
              placeholder="Repite tu contraseña"
              value={form.confirmarContraseña}
              onChange={(e) =>
                setForm({ ...form, confirmarContraseña: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-login"
          >
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Ya tienes cuenta?</p>
          <button onClick={onBackToLogin} className="btn-secondary-login">
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
