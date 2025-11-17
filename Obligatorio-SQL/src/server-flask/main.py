from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from mysql.connector import Error
from database import init_db, get_db_connection, test_connection
from config import Config
from datetime import datetime, timedelta

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db_initialized = False

@app.before_request
def initialize_database():
    global db_initialized
    if not db_initialized:
        if init_db():
            test_connection()
            db_initialized = True
        else:
            print("Fallo al inicializar la base de datos")


@app.route('/')
def hello_world():
    return jsonify({
        "message": "Hello World",
        "status": "ok",
        "api_version": "1.0"
    })


# LOGIN
@app.route('/api/login', methods=['POST', 'OPTIONS'])
@cross_origin()
def login():
    try:
        data = request.get_json()
        correo = data.get('correo')
        contraseña = data.get('contraseña')
        
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT correo, contraseña FROM login WHERE correo = %s"
                cursor.execute(query, (correo,))
                result = cursor.fetchone()
                
                if result and result['contraseña'] == contraseña:
                    return jsonify({"success": True, "data": result}), 200
                else:
                    return jsonify({"success": False, "error": "Credenciales inválidas"}), 401
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# PARTICIPANTES
@app.route('/api/participantes')
def get_participantes():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT * FROM participante"
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results, "count": len(results)}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/participante/<ci>')
def get_participante_by_ci(ci):
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT * FROM participante WHERE ci = %s"
                cursor.execute(query, (ci,))
                result = cursor.fetchone()
                
                if result:
                    return jsonify({"success": True, "data": result}), 200
                else:
                    return jsonify({"success": False, "error": "Participante no encontrado"}), 404
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/participante/email/<email>')
@cross_origin()
def get_participante_by_email(email):
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT * FROM participante WHERE email = %s"
                cursor.execute(query, (email,))
                result = cursor.fetchone()

                if result:
                    return jsonify({"success": True, "data": result}), 200
                else:
                    return jsonify({"success": False, "error": "Correo no registrado"}), 404
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/participante', methods=['POST'])
def create_participante():
    try:
        data = request.get_json()
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "INSERT INTO participante (ci, nombre, apellido, email) VALUES (%s, %s, %s, %s)"
                cursor.execute(query, (data['ci'], data['nombre'], data['apellido'], data['email']))
                cnx.commit()
                return jsonify({"success": True, "message": "Participante creado"}), 201
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/participante/<ci>', methods=['PUT'])
def update_participante(ci):
    try:
        data = request.get_json()
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "UPDATE participante SET nombre = %s, apellido = %s, email = %s WHERE ci = %s"
                cursor.execute(query, (data['nombre'], data['apellido'], data['email'], ci))
                cnx.commit()
                return jsonify({"success": True, "message": "Participante actualizado"}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/participante/<ci>', methods=['DELETE'])
def delete_participante(ci):
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "DELETE FROM participante WHERE ci = %s"
                cursor.execute(query, (ci,))
                cnx.commit()
                return jsonify({"success": True, "message": "Participante eliminado"}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500



        # LOGIN - REGISTER
        @app.route('/api/login/register', methods=['POST'])
        @cross_origin()
        def register_login():
            try:
                data = request.get_json()
                correo = data.get('correo')
                contraseña = data.get('contraseña')

                if not correo or not contraseña:
                    return jsonify({"success": False, "error": "Correo y contraseña requeridos"}), 400

                with get_db_connection() as cnx:
                    with cnx.cursor() as cursor:
                        query = "INSERT INTO login (correo, contraseña) VALUES (%s, %s)"
                        try:
                            cursor.execute(query, (correo, contraseña))
                            cnx.commit()
                            return jsonify({"success": True, "message": "Credenciales creadas"}), 201
                        except Error as err:
                            # Duplicate key or foreign key errors
                            err_msg = str(err)
                            if hasattr(err, 'errno') and err.errno == 1062:
                                return jsonify({"success": False, "error": "El correo ya tiene credenciales"}), 409
                            elif hasattr(err, 'errno') and err.errno in (1452,):
                                return jsonify({"success": False, "error": "El participante no existe (violación FK)"}), 400
                            else:
                                return jsonify({"success": False, "error": err_msg}), 500
            except Error as err:
                return jsonify({"success": False, "error": str(err)}), 500


# PROGRAMAS ACADÉMICOS
@app.route('/api/programas')
def get_programas():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT * FROM programa_academico"
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/programa/<nombre_programa>/participantes')
def get_participantes_por_programa(nombre_programa):
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT * FROM participante_programa_academico WHERE nombre_programa = %s"
                cursor.execute(query, (nombre_programa,))
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# SALAS
@app.route('/api/salas')
def get_salas():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT * FROM sala"
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/sala/<nombre_sala>/<edificio>')
def get_sala(nombre_sala, edificio):
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT * FROM sala WHERE nombre_sala = %s AND edificio = %s"
                cursor.execute(query, (nombre_sala, edificio))
                result = cursor.fetchone()
                
                if result:
                    return jsonify({"success": True, "data": result}), 200
                else:
                    return jsonify({"success": False, "error": "Sala no encontrada"}), 404
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/sala', methods=['POST'])
def create_sala():
    try:
        data = request.get_json()
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala) VALUES (%s, %s, %s, %s)"
                cursor.execute(query, (data['nombre_sala'], data['edificio'], data['capacidad'], data['tipo_sala']))
                cnx.commit()
                return jsonify({"success": True, "message": "Sala creada"}), 201
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/sala/<nombre_sala>/<edificio>', methods=['PUT'])
def update_sala(nombre_sala, edificio):
    try:
        data = request.get_json()
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "UPDATE sala SET capacidad = %s, tipo_sala = %s WHERE nombre_sala = %s AND edificio = %s"
                cursor.execute(query, (data['capacidad'], data['tipo_sala'], nombre_sala, edificio))
                cnx.commit()
                return jsonify({"success": True, "message": "Sala actualizada"}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/sala/<nombre_sala>/<edificio>', methods=['DELETE'])
def delete_sala(nombre_sala, edificio):
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "DELETE FROM sala WHERE nombre_sala = %s AND edificio = %s"
                cursor.execute(query, (nombre_sala, edificio))
                cnx.commit()
                return jsonify({"success": True, "message": "Sala eliminada"}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# TURNOS
@app.route('/api/turnos')
def get_turnos():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT * FROM turno ORDER BY hora_inicio"
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# RESERVAS
@app.route('/api/reservas')
def get_reservas():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT r.*, s.capacidad, s.tipo_sala
                FROM reserva r
                JOIN sala s ON s.nombre_sala = r.nombre_sala AND s.edificio = r.edificio
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reserva/validar', methods=['POST'])
def validar_reserva():
    try:
        data = request.get_json()
        ci = data['ci_participante']
        nombre_sala = data['nombre_sala']
        edificio = data['edificio']
        fecha = data['fecha']
        id_turno = data['id_turno']
        
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                # Validar disponibilidad de sala
                query = """
                SELECT * FROM reserva
                WHERE nombre_sala = %s AND edificio = %s AND fecha = %s AND id_turno = %s
                AND estado IN ('activa','finalizada','sin asistencia')
                """
                cursor.execute(query, (nombre_sala, edificio, fecha, id_turno))
                if cursor.fetchone():
                    return jsonify({"success": False, "error": "Sala no disponible"}), 400
                
                # Validar límite de 2 horas diarias
                query = """
                SELECT COUNT(*) AS cantidad
                FROM reserva r
                JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
                WHERE rp.ci_participante = %s AND r.fecha = %s AND r.estado = 'activa'
                """
                cursor.execute(query, (ci, fecha))
                if cursor.fetchone()['cantidad'] >= 2:
                    return jsonify({"success": False, "error": "Límite de 2 horas diarias alcanzado"}), 400
                
                # Validar 3 reservas activas en la semana
                fecha_inicio = datetime.strptime(fecha, '%Y-%m-%d')
                fecha_fin = fecha_inicio + timedelta(days=7)
                query = """
                SELECT COUNT(*) AS cantidad
                FROM reserva r
                JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
                WHERE rp.ci_participante = %s AND r.fecha BETWEEN %s AND %s AND r.estado = 'activa'
                """
                cursor.execute(query, (ci, fecha_inicio.strftime('%Y-%m-%d'), fecha_fin.strftime('%Y-%m-%d')))
                if cursor.fetchone()['cantidad'] >= 3:
                    return jsonify({"success": False, "error": "Límite de 3 reservas semanales alcanzado"}), 400
                
                # Validar sanción
                query = """
                SELECT * FROM sancion_participante
                WHERE ci_participante = %s AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
                """
                cursor.execute(query, (ci,))
                if cursor.fetchone():
                    return jsonify({"success": False, "error": "Participante sancionado"}), 400
                
                return jsonify({"success": True, "message": "Reserva válida"}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reserva', methods=['POST'])
def create_reserva():
    try:
        data = request.get_json()
        participantes = data['participantes']
        
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                # Crear reserva
                query = """
                INSERT INTO reserva (nombre_sala, edificio, fecha, id_turno, estado)
                VALUES (%s, %s, %s, %s, 'activa')
                """
                cursor.execute(query, (data['nombre_sala'], data['edificio'], data['fecha'], data['id_turno']))
                
                # Obtener ID de reserva
                id_reserva = cursor.lastrowid
                
                # Asociar participantes
                query = """
                INSERT INTO reserva_participante (ci_participante, id_reserva, fecha_solicitud_reserva, asistencia)
                VALUES (%s, %s, NOW(), NULL)
                """
                for ci in participantes:
                    cursor.execute(query, (ci, id_reserva))
                
                cnx.commit()
                return jsonify({"success": True, "id_reserva": id_reserva}), 201
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reserva/<int:id_reserva>/cancelar', methods=['PUT'])
def cancelar_reserva(id_reserva):
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "UPDATE reserva SET estado = 'cancelada' WHERE id_reserva = %s"
                cursor.execute(query, (id_reserva,))
                cnx.commit()
                return jsonify({"success": True, "message": "Reserva cancelada"}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reserva/<int:id_reserva>/asistencia', methods=['PUT'])
def marcar_asistencia(id_reserva):
    try:
        data = request.get_json()
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = """
                UPDATE reserva_participante
                SET asistencia = %s
                WHERE id_reserva = %s AND ci_participante = %s
                """
                cursor.execute(query, (data['asistencia'], id_reserva, data['ci_participante']))
                cnx.commit()
                return jsonify({"success": True, "message": "Asistencia marcada"}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reserva/<int:id_reserva>/sin_asistencia', methods=['PUT'])
def marcar_sin_asistencia(id_reserva):
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "UPDATE reserva SET estado = 'sin asistencia' WHERE id_reserva = %s"
                cursor.execute(query, (id_reserva,))
                cnx.commit()
                return jsonify({"success": True, "message": "Reserva marcada sin asistencia"}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# SANCIONES
@app.route('/api/sanciones')
def get_sanciones():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT * FROM sancion_participante"
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/sancion', methods=['POST'])
def create_sancion():
    try:
        data = request.get_json()
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = """
                INSERT INTO sancion_participante (ci_participante, fecha_inicio, fecha_fin)
                VALUES (%s, %s, %s)
                """
                cursor.execute(query, (data['ci_participante'], data['fecha_inicio'], data['fecha_fin']))
                cnx.commit()
                return jsonify({"success": True, "message": "Sanción creada"}), 201
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/sancion/<ci>/<fecha_inicio>', methods=['DELETE'])
def delete_sancion(ci, fecha_inicio):
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "DELETE FROM sancion_participante WHERE ci_participante = %s AND fecha_inicio = %s"
                cursor.execute(query, (ci, fecha_inicio))
                cnx.commit()
                return jsonify({"success": True, "message": "Sanción eliminada"}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# REPORTES
@app.route('/api/reportes/salas-mas-reservadas')
def salas_mas_reservadas():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT nombre_sala, edificio, COUNT(*) AS total_reservas
                FROM reserva
                GROUP BY nombre_sala, edificio
                ORDER BY total_reservas DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/turnos-mas-demandados')
def turnos_mas_demandados():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT id_turno, COUNT(*) AS total
                FROM reserva
                GROUP BY id_turno
                ORDER BY total DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/promedio-participantes')
def promedio_participantes():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT r.nombre_sala, AVG(cnt) AS promedio_participantes
                FROM (
                    SELECT id_reserva, COUNT(*) AS cnt
                    FROM reserva_participante
                    GROUP BY id_reserva
                ) x
                JOIN reserva r ON r.id_reserva = x.id_reserva
                GROUP BY r.nombre_sala
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/reservas-por-carrera')
def reservas_por_carrera():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT pa.nombre_programa, f.nombre AS facultad, COUNT(*) AS total
                FROM reserva r
                JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva
                JOIN participante_programa_academico pa ON pa.ci_participante = rp.ci_participante
                JOIN facultad f ON f.id_facultad = pa.id_facultad
                GROUP BY pa.nombre_programa, f.nombre
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/ocupacion-por-edificio')
def ocupacion_por_edificio():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT edificio, 
                       COUNT(*) AS reservas,
                       (COUNT(*) / (SELECT COUNT(*) FROM turno)) * 100 AS porcentaje
                FROM reserva
                GROUP BY edificio
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/reservas-por-tipo-usuario')
def reservas_por_tipo_usuario():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT rol, COUNT(*) AS reservas,
                       SUM(CASE WHEN asistencia = TRUE THEN 1 ELSE 0 END) AS asistencias
                FROM reserva_participante rp
                JOIN participante_programa_academico pa ON pa.ci_participante = rp.ci_participante
                GROUP BY rol
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/cantidad-sanciones')
def cantidad_sanciones():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT rol, COUNT(*) AS sanciones
                FROM sancion_participante s
                JOIN participante_programa_academico pa ON pa.ci_participante = s.ci_participante
                GROUP BY rol
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/porcentaje-uso-reservas')
def porcentaje_uso_reservas():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT 
                  SUM(CASE WHEN estado = 'finalizada' THEN 1 ELSE 0 END) AS usadas,
                  SUM(CASE WHEN estado IN ('cancelada','sin asistencia') THEN 1 ELSE 0 END) AS no_usadas,
                  (SUM(estado='finalizada') / COUNT(*)) * 100 AS porcentaje_uso
                FROM reserva
                """
                cursor.execute(query)
                result = cursor.fetchone()
                return jsonify({"success": True, "data": result}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# CONSULTAS EXTRA
@app.route('/api/reportes/salas-incumplimiento')
def salas_incumplimiento():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT nombre_sala, COUNT(*) AS sin_asistencia
                FROM reserva
                WHERE estado = 'sin asistencia'
                GROUP BY nombre_sala
                ORDER BY sin_asistencia DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/participantes-mas-activos')
def participantes_mas_activos():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT rp.ci_participante, COUNT(*) AS total
                FROM reserva_participante rp
                GROUP BY rp.ci_participante
                ORDER BY total DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/distribucion-por-dia')
def distribucion_por_dia():
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT DAYNAME(fecha) AS dia, COUNT(*) AS total
                FROM reserva
                GROUP BY dia
                ORDER BY total DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/health')
def health_check():
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
    return jsonify({"success": False, "error": "Endpoint no encontrado"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"success": False, "error": "Error interno del servidor"}), 500


if __name__ == '__main__':
    print("\n" + "="*50)
    print("Iniciando servidor Flask")
    print("="*50)
    
    if init_db():
        print(f"\nBase de datos inicializada correctamente")
        test_connection()
        print(f"\nServidor corriendo en: http://localhost:{Config.PORT}")
        print(f"Modo debug: {Config.DEBUG}")
        print("="*50 + "\n")
        
        app.run(debug=Config.DEBUG, port=Config.PORT)
    else:
        print("\nNo se pudo inicializar la base de datos")
        print("Verifica tu archivo .env y que MySQL esté corriendo")
        print("="*50 + "\n")