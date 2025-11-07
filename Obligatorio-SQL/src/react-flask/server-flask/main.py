from flask import Flask, jsonify
from flask_cors import CORS
from mysql.connector import Error
from database import init_db, get_db_connection, test_connection
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)  # Enable CORS for all routes

# Variable para controlar la inicialización
db_initialized = False

@app.before_request
def initialize_database():
    """Inicializar el pool de conexiones antes de la primera petición"""
    global db_initialized
    if not db_initialized:
        if init_db():
            test_connection()
            db_initialized = True
        else:
            print("❌ Fallo al inicializar la base de datos")


@app.route('/')
def hello_world():
    """Ruta de bienvenida"""
    return jsonify({
        "message": "Hello World",
        "status": "ok",
        "api_version": "1.0"
    })


@app.route('/api/reservas')
def get_reservas():
    """
    Obtener todas las reservas de participantes
    
    Returns:
        JSON con la lista de participantes
    """
    try:
        # Usar context manager para gestionar la conexión automáticamente
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                print("✓ Conexión obtenida del pool")
                
                # Ejecutar consulta
                query = "SELECT ci, nombre, apellido, email FROM participante"
                cursor.execute(query)
                results = cursor.fetchall()
                
                print(f"✓ Se obtuvieron {len(results)} registros")
                
                return jsonify({
                    "success": True,
                    "data": results,
                    "count": len(results)
                }), 200
        
    except Error as err:
        print(f"✗ Error de base de datos: {err}")
        return jsonify({
            "success": False,
            "error": "Error de base de datos",
            "message": str(err)
        }), 500
    
    except Exception as e:
        print(f"✗ Error inesperado: {e}")
        return jsonify({
            "success": False,
            "error": "Error interno del servidor",
            "message": str(e)
        }), 500


@app.route('/api/participante/<ci>')
def get_participante_by_ci(ci):
    """
    Obtener un participante por su CI
    
    Args:
        ci: Cédula de identidad del participante
    
    Returns:
        JSON con los datos del participante
    """
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT ci, nombre, apellido, email FROM participante WHERE ci = %s"
                cursor.execute(query, (ci,))
                result = cursor.fetchone()
                
                if result:
                    return jsonify({
                        "success": True,
                        "data": result
                    }), 200
                else:
                    return jsonify({
                        "success": False,
                        "error": "Participante no encontrado"
                    }), 404
        
    except Error as err:
        print(f"✗ Error de base de datos: {err}")
        return jsonify({
            "success": False,
            "error": "Error de base de datos",
            "message": str(err)
        }), 500


@app.route('/api/health')
def health_check():
    """
    Endpoint para verificar el estado de la aplicación y DB
    
    Returns:
        JSON con el estado del servicio
    """
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        
        return jsonify({
            "status": "healthy",
            "database": "connected",
            "message": "Servicio funcionando correctamente"
        }), 200
    
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }), 503


@app.errorhandler(404)
def not_found(error):
    """Manejador de errores 404"""
    return jsonify({
        "success": False,
        "error": "Endpoint no encontrado"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Manejador de errores 500"""
    return jsonify({
        "success": False,
        "error": "Error interno del servidor"
    }), 500


if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Iniciando servidor Flask")
    print("="*50)
    
    # Inicializar base de datos
    if init_db():
        print(f"\n✓ Base de datos inicializada correctamente")
        test_connection()
        print(f"\n🌐 Servidor corriendo en: http://localhost:{Config.PORT}")
        print(f"🔧 Modo debug: {Config.DEBUG}")
        print("="*50 + "\n")
        
        app.run(debug=Config.DEBUG, port=Config.PORT)
    else:
        print("\n❌ No se pudo inicializar la base de datos")
        print("Verifica tu archivo .env y que MySQL esté corriendo")
        print("="*50 + "\n")