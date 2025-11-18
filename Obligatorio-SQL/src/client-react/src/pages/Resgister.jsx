import { useState } from "react";

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

      // 2. Crear credenciales de login (ENDPOINT CORREGIDO)
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
        alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
        onRegisterSuccess({ correo: form.email });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Crear Cuenta</h1>
        <p className="text-gray-600 mb-6">Regístrate para reservar salas</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula de Identidad
            </label>
            <input
              type="number"
              placeholder="12345678"
              value={form.ci}
              onChange={(e) => setForm({ ...form, ci: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Juan"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                placeholder="Pérez"
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.contraseña}
              onChange={(e) => setForm({ ...form, contraseña: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              placeholder="Repite tu contraseña"
              value={form.confirmarContraseña}
              onChange={(e) =>
                setForm({ ...form, confirmarContraseña: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={onBackToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;