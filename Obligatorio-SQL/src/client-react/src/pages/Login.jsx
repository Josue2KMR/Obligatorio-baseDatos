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
        `http://localhost:5000/api/participantes?email=${form.correo}`
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
    <div className="auth-container" style={{display: 'flex',flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f4f8'}}>
      <div className="auth-card" style={{display: 'flex', flexDirection:'column', justifyContent:'center', alignItems: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '500px', width: '90%'}}>
        <h1 style={{marginBottom: 10, color: '#398495ff', textAlign: 'center'}}>Sistema de reserva de salas (hay que pensar un nombre) </h1>
        <p className="subtitle" style={{fontSize: 20, fontWeight: 'bold', alignItems: 'center', marginBottom:20, color: '#2c3e50'}}>Iniciar sesión</p>
        {error && <div className="error-message" style={{backgroundColor: '#fee', color: '#c33', padding: '10px', borderRadius: '6px', marginBottom: '15px', width: '100%', textAlign: 'center'}}>{error}</div>}
        <form onSubmit={handleSubmit} style={{width: '100%'}}>
          <div className="form-group" style={{display: 'flex', marginBottom: '15px', alignItems: 'center'}}>
            <p style={{marginTop: 0, marginRight: 10, minWidth: '150px', fontWeight: '500', color: '#2c3e50'}}>Correo electrónico</p>
            <input
              type="email"
              placeholder="tu@email.com"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              disabled={loading}
              style={{borderColor: '#3d76d2ff', flex: 1, padding: '8px 12px', borderRadius: '6px', border: '2px solid #3d76d2ff', fontSize: '14px'}}
            />
          </div>

          <div className="form-group"  style={{display: 'flex', marginBottom: '25px', alignItems: 'center'}}>
            <p style={{marginTop: 0, marginRight: 10, minWidth: '150px', fontWeight: '500', color: '#2c3e50'}}>Contraseña</p>
            <input
              type="password"
              placeholder="••••••••"
              value={form.contraseña}
              onChange={(e) => setForm({ ...form, contraseña: e.target.value })}
              disabled={loading}
              style={{borderColor: '#3d76d2ff', flex: 1, padding: '8px 12px', borderRadius: '6px', border: '2px solid #3d76d2ff', fontSize: '14px'}}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading} 
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#5865F2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#4752C4')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#5865F2')}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="auth-footer" style={{marginTop: '25px', textAlign: 'center', width: '100%'}}>
          <p style={{color: '#5a6c7d', fontSize: '14px', marginBottom: '10px'}}>
            ¿No tienes cuenta?
          </p>
          <button 
            type="button" 
            onClick={onRegisterClick} 
            className="link-button"
            style={{
              backgroundColor: 'transparent',
              color: '#398495ff',
              border: '2px solid #398495ff',
              padding: '8px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#398495ff';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#398495ff';
            }}
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;