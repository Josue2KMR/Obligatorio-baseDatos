from flask import Flask, jsonify, request
from flask_cors import CORS
from mysql.connector import Error
from database import init_db, get_db_connection, test_connection
from config import Config
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)  # CORS configurado globalmente

db_initialized = False


# ==================== LOGIN ====================

@app.route('/api/login', methods=['POST'])
def login():
    """
    Autenticación de usuario
    MEJORA IMPLEMENTADA: Se recomienda usar bcrypt para hashear contraseñas
    """
    try:
        data = request.get_json()
        correo = data.get('correo')
        contraseña = data.get('contraseña')
        
        if not correo or not contraseña:
            return jsonify({"success": False, "error": "Correo y contraseña requeridos"}), 400
        
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT correo, contraseña FROM login WHERE correo = %s"
                cursor.execute(query, (correo,))
                result = cursor.fetchone()
                
                if result:
                    # TODO: Implementar check_password_hash cuando se migre a contraseñas hasheadas
                    if result['contraseña'] == contraseña:
                        return jsonify({"success": True, "data": {"correo": result['correo']}}), 200
                
                return jsonify({"success": False, "error": "Credenciales inválidas"}), 401
                
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/login/register', methods=['POST'])
def register_login():
    """
    Registro de credenciales
    MEJORA IMPLEMENTADA: Validación mejorada
    TODO: Implementar hashing de contraseñas con bcrypt
    """
    try:
        data = request.get_json()
        correo = data.get('correo')
        contraseña = data.get('contraseña')

        if not correo or not contraseña:
            return jsonify({"success": False, "error": "Correo y contraseña requeridos"}), 400

        # TODO: Implementar generate_password_hash para seguridad
        # contraseña_hash = generate_password_hash(contraseña)

        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "INSERT INTO login (correo, contraseña) VALUES (%s, %s)"
                try:
                    cursor.execute(query, (correo, contraseña))
                    cnx.commit()
                    return jsonify({"success": True, "message": "Credenciales creadas"}), 201
                except Error as err:
                    if hasattr(err, 'errno') and err.errno == 1062:
                        return jsonify({"success": False, "error": "El correo ya tiene credenciales"}), 409
                    elif hasattr(err, 'errno') and err.errno == 1452:
                        return jsonify({"success": False, "error": "El participante no existe (violación FK)"}), 400
                    else:
                        return jsonify({"success": False, "error": str(err)}), 500
                        
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# ==================== PARTICIPANTES ====================

@app.route('/api/participantes')
def get_participantes():
    """
    Lista todos los participantes
    MEJORA IMPLEMENTADA: Búsqueda unificada con query params
    """
    try:
        ci = request.args.get('ci')
        email = request.args.get('email')
        
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                if ci:
                    # Búsqueda por CI
                    query = "SELECT * FROM participante WHERE ci = %s"
                    cursor.execute(query, (ci,))
                    result = cursor.fetchone()
                    if result:
                        return jsonify({"success": True, "data": result}), 200
                    else:
                        return jsonify({"success": False, "error": "Participante no encontrado"}), 404
                
                elif email:
                    # Búsqueda por email
                    query = "SELECT * FROM participante WHERE email = %s"
                    cursor.execute(query, (email,))
                    result = cursor.fetchone()
                    if result:
                        return jsonify({"success": True, "data": result}), 200
                    else:
                        return jsonify({"success": False, "error": "Correo no registrado"}), 404
                
                else:
                    # Lista todos
                    query = "SELECT * FROM participante"
                    cursor.execute(query)
                    results = cursor.fetchall()
                    return jsonify({"success": True, "data": results, "count": len(results)}), 200
                    
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/participante', methods=['POST'])
def create_participante():
    """
    Crea un nuevo participante
    MEJORA IMPLEMENTADA: Validación de datos existentes
    """
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        if not all(key in data for key in ['ci', 'nombre', 'apellido', 'email']):
            return jsonify({"success": False, "error": "Faltan campos requeridos"}), 400
        
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                # Verificar si ya existe
                cursor.execute("SELECT ci FROM participante WHERE ci = %s OR email = %s", 
                              (data['ci'], data['email']))
                if cursor.fetchone():
                    return jsonify({"success": False, "error": "CI o email ya registrado"}), 409
                
                # Insertar
                query = "INSERT INTO participante (ci, nombre, apellido, email) VALUES (%s, %s, %s, %s)"
                cursor.execute(query, (data['ci'], data['nombre'], data['apellido'], data['email']))
                cnx.commit()
                return jsonify({"success": True, "message": "Participante creado"}), 201
                
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/participante/<ci>', methods=['PUT'])
def update_participante(ci):
    """
    Actualiza un participante
    MEJORA IMPLEMENTADA: Validación de existencia antes de actualizar
    """
    try:
        data = request.get_json()
        
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                # Verificar existencia
                cursor.execute("SELECT ci FROM participante WHERE ci = %s", (ci,))
                if not cursor.fetchone():
                    return jsonify({"success": False, "error": "Participante no encontrado"}), 404
                
                # Actualizar
                query = "UPDATE participante SET nombre = %s, apellido = %s, email = %s WHERE ci = %s"
                cursor.execute(query, (data['nombre'], data['apellido'], data['email'], ci))
                cnx.commit()
                
                if cursor.rowcount > 0:
                    return jsonify({"success": True, "message": "Participante actualizado"}), 200
                else:
                    return jsonify({"success": False, "error": "No se realizaron cambios"}), 400
                    
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/participante/<ci>', methods=['DELETE'])
def delete_participante(ci):
    """
    Elimina un participante (soft delete recomendado)
    MEJORA SUGERIDA: Implementar soft delete con estado='inactivo'
    """
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                # Verificar existencia
                cursor.execute("SELECT ci FROM participante WHERE ci = %s", (ci,))
                if not cursor.fetchone():
                    return jsonify({"success": False, "error": "Participante no encontrado"}), 404
                
                # TODO: Implementar soft delete
                # query = "UPDATE participante SET estado = 'inactivo' WHERE ci = %s"
                query = "DELETE FROM participante WHERE ci = %s"
                cursor.execute(query, (ci,))
                cnx.commit()
                return jsonify({"success": True, "message": "Participante eliminado"}), 200
                
    except Error as err:
        # Manejar error de FK
        if hasattr(err, 'errno') and err.errno in (1451, 1452):
            return jsonify({"success": False, "error": "No se puede eliminar: existen registros relacionados"}), 400
        return jsonify({"success": False, "error": str(err)}), 500
    
    # ==================== ROL DE PARTICIPANTE ====================

@app.route('/api/participante/<ci>/rol')
def get_participante_rol(ci):
    """
    Obtiene el rol de un participante
    """
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT ppa.rol, ppa.nombre_programa, pa.tipo
                FROM participante_programa_academico ppa
                JOIN programa_academico pa ON pa.nombre_programa = ppa.nombre_programa
                WHERE ppa.ci_participante = %s
                LIMIT 1
                """
                cursor.execute(query, (ci,))
                result = cursor.fetchone()
                
                if result:
                    return jsonify({"success": True, "data": result}), 200
                else:
                    # Si no tiene rol asignado, se considera estudiante de grado
                    return jsonify({"success": True, "data": {"rol": "estudiante", "tipo": "grado"}}), 200
                    
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500
    
@app.route('/api/participante/<ci>/cascade', methods=['DELETE'])
def delete_participante_cascade(ci):
    """
    Elimina un participante y todas sus relaciones en cascada
    """
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:

                # Verificar existencia
                cursor.execute("SELECT ci, email FROM participante WHERE ci = %s", (ci,))
                participante_data = cursor.fetchone()

                if not participante_data:
                    return jsonify({"success": False, "error": "Participante no encontrado"}), 404

                # Guardar correo ANTES de la transacción (evita error "transaction in progress")
                correo_participante = participante_data["email"]

                try:
                    cnx.start_transaction()

                    # 1. Eliminar sanciones
                    cursor.execute(
                        "DELETE FROM sancion_participante WHERE ci_participante = %s", 
                        (ci,)
                    )

                    # 2. Eliminar relación con reservas
                    cursor.execute(
                        "DELETE FROM reserva_participante WHERE ci_participante = %s", 
                        (ci,)
                    )

                    # 3. Eliminar relación con programas académicos
                    cursor.execute(
                        "DELETE FROM participante_programa_academico WHERE ci_participante = %s", 
                        (ci,)
                    )

                    # 4. Eliminar credenciales de login (ya sin subquery)
                    if correo_participante:
                        cursor.execute(
                            "DELETE FROM login WHERE correo = %s", 
                            (correo_participante,)
                        )

                    # 5. Finalmente eliminar al participante
                    cursor.execute(
                        "DELETE FROM participante WHERE ci = %s", 
                        (ci,)
                    )

                    cnx.commit()
                    return jsonify({"success": True, "message": "Participante y todas sus relaciones eliminadas"}), 200

                except Error as err:
                    cnx.rollback()
                    raise err

    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500

# ==================== PROGRAMAS ACADÉMICOS ====================

@app.route('/api/programas')
def get_programas():
    """Lista todos los programas académicos"""
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
    """
    Lista participantes por programa
    MEJORA IMPLEMENTADA: JOIN con tabla participante para datos completos
    """
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT p.ci, p.nombre, p.apellido, p.email, 
                       ppa.nombre_programa, ppa.rol, ppa.id_facultad
                FROM participante_programa_academico ppa
                JOIN participante p ON p.ci = ppa.ci_participante
                WHERE ppa.nombre_programa = %s
                """
                cursor.execute(query, (nombre_programa,))
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# ==================== SALAS ====================

@app.route('/api/salas')
def get_salas():
    """Lista todas las salas"""
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
    """Busca una sala específica"""
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
    """Crea una nueva sala"""
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['nombre_sala', 'edificio', 'capacidad', 'tipo_sala']):
            return jsonify({"success": False, "error": "Faltan campos requeridos"}), 400
        
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala) VALUES (%s, %s, %s, %s)"
                cursor.execute(query, (data['nombre_sala'], data['edificio'], data['capacidad'], data['tipo_sala']))
                cnx.commit()
                return jsonify({"success": True, "message": "Sala creada"}), 201
    except Error as err:
        if hasattr(err, 'errno') and err.errno == 1062:
            return jsonify({"success": False, "error": "La sala ya existe"}), 409
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/sala/<nombre_sala>/<edificio>', methods=['PUT'])
def update_sala(nombre_sala, edificio):
    """Actualiza una sala"""
    try:
        data = request.get_json()
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "UPDATE sala SET capacidad = %s, tipo_sala = %s WHERE nombre_sala = %s AND edificio = %s"
                cursor.execute(query, (data['capacidad'], data['tipo_sala'], nombre_sala, edificio))
                cnx.commit()
                
                if cursor.rowcount > 0:
                    return jsonify({"success": True, "message": "Sala actualizada"}), 200
                else:
                    return jsonify({"success": False, "error": "Sala no encontrada"}), 404
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/sala/<nombre_sala>/<edificio>', methods=['DELETE'])
def delete_sala(nombre_sala, edificio):
    """Elimina una sala"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "DELETE FROM sala WHERE nombre_sala = %s AND edificio = %s"
                cursor.execute(query, (nombre_sala, edificio))
                cnx.commit()
                
                if cursor.rowcount > 0:
                    return jsonify({"success": True, "message": "Sala eliminada"}), 200
                else:
                    return jsonify({"success": False, "error": "Sala no encontrada"}), 404
    except Error as err:
        if hasattr(err, 'errno') and err.errno in (1451, 1452):
            return jsonify({"success": False, "error": "No se puede eliminar: existen reservas asociadas"}), 400
        return jsonify({"success": False, "error": str(err)}), 500


# ==================== TURNOS ====================

@app.route('/api/turnos')
def get_turnos():
    """Lista todos los turnos disponibles"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT id_turno, TIME_FORMAT(hora_inicio, '%H:%i:%s') as hora_inicio, TIME_FORMAT(hora_fin, '%H:%i:%s') as hora_fin FROM turno ORDER BY hora_inicio"
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# ==================== RESERVAS ====================

@app.route('/api/reservas')
def get_reservas():
    """
    Lista reservas con filtros opcionales
    MEJORA IMPLEMENTADA: Filtros por fecha, sala, participante, estado
    """
    try:
        # Obtener parámetros de filtro
        fecha = request.args.get('fecha')
        nombre_sala = request.args.get('nombre_sala')
        edificio = request.args.get('edificio')
        ci_participante = request.args.get('ci_participante')
        estado = request.args.get('estado')
        
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT r.*, s.capacidad, s.tipo_sala
                FROM reserva r
                JOIN sala s ON s.nombre_sala = r.nombre_sala AND s.edificio = r.edificio
                """
                
                conditions = []
                params = []
                
                if fecha:
                    conditions.append("r.fecha = %s")
                    params.append(fecha)
                if nombre_sala:
                    conditions.append("r.nombre_sala = %s")
                    params.append(nombre_sala)
                if edificio:
                    conditions.append("r.edificio = %s")
                    params.append(edificio)
                if estado:
                    conditions.append("r.estado = %s")
                    params.append(estado)
                if ci_participante:
                    query += " JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva"
                    conditions.append("rp.ci_participante = %s")
                    params.append(ci_participante)
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
                
                cursor.execute(query, tuple(params))
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results, "count": len(results)}), 200
                
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reserva/validar', methods=['POST'])
def validar_reserva():
    """
    Valida una reserva antes de crearla
    MEJORA IMPLEMENTADA: Consulta optimizada en una sola transacción
    """
    try:
        data = request.get_json()
        ci = data['ci_participante']
        nombre_sala = data['nombre_sala']
        edificio = data['edificio']
        fecha = data['fecha']
        id_turno = data['id_turno']
        
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                # CONSULTA OPTIMIZADA: Validar todo en una sola consulta usando subqueries
                query = """
                SELECT 
                    (SELECT COUNT(*) FROM reserva 
                     WHERE nombre_sala = %s AND edificio = %s AND fecha = %s AND id_turno = %s
                     AND estado IN ('activa','finalizada','sin asistencia')) as sala_ocupada,
                    
                    (SELECT COUNT(*) FROM reserva r
                     JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
                     WHERE rp.ci_participante = %s AND r.fecha = %s AND r.estado = 'activa') as reservas_dia,
                    
                    (SELECT COUNT(*) FROM reserva r
                     JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
                     WHERE rp.ci_participante = %s AND r.fecha BETWEEN %s AND %s 
                     AND r.estado = 'activa') as reservas_semana,
                    
                    (SELECT COUNT(*) FROM sancion_participante
                     WHERE ci_participante = %s AND CURDATE() BETWEEN fecha_inicio AND fecha_fin) as sancionado
                """
                
                fecha_inicio = datetime.strptime(fecha, '%Y-%m-%d')
                fecha_fin = fecha_inicio + timedelta(days=7)
                
                cursor.execute(query, (
                    nombre_sala, edificio, fecha, id_turno,  # sala_ocupada
                    ci, fecha,  # reservas_dia
                    ci, fecha_inicio.strftime('%Y-%m-%d'), fecha_fin.strftime('%Y-%m-%d'),  # reservas_semana
                    ci  # sancionado
                ))
                
                result = cursor.fetchone()
                
                # Validar resultados
                if result['sala_ocupada'] > 0:
                    return jsonify({"success": False, "error": "Sala no disponible"}), 400
                
                if result['reservas_dia'] >= 2:
                    return jsonify({"success": False, "error": "Límite de 2 horas diarias alcanzado"}), 400
                
                if result['reservas_semana'] >= 3:
                    return jsonify({"success": False, "error": "Límite de 3 reservas semanales alcanzado"}), 400
                
                if result['sancionado'] > 0:
                    return jsonify({"success": False, "error": "Participante sancionado"}), 400
                
                return jsonify({"success": True, "message": "Reserva válida"}), 200
                
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reserva', methods=['POST'])
def create_reserva():
    """
    Crea una nueva reserva
    MEJORA IMPLEMENTADA: Validación antes de insertar y transacciones explícitas
    """
    try:
        data = request.get_json()
        participantes = data.get('participantes', [])
        
        if not participantes:
            return jsonify({"success": False, "error": "Debe incluir al menos un participante"}), 400
        
        # Validar cada participante
        for ci in participantes:
            validacion_data = {
                'ci_participante': ci,
                'nombre_sala': data['nombre_sala'],
                'edificio': data['edificio'],
                'fecha': data['fecha'],
                'id_turno': data['id_turno']
            }
            
            # Validar usando el endpoint de validación
            with get_db_connection() as cnx:
                with cnx.cursor(dictionary=True) as cursor:
                    # Reutilizar lógica de validación
                    query = """
                    SELECT 
                        (SELECT COUNT(*) FROM reserva 
                         WHERE nombre_sala = %s AND edificio = %s AND fecha = %s AND id_turno = %s
                         AND estado IN ('activa','finalizada','sin asistencia')) as sala_ocupada,
                        
                        (SELECT COUNT(*) FROM reserva r
                         JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
                         WHERE rp.ci_participante = %s AND r.fecha = %s AND r.estado = 'activa') as reservas_dia,
                        
                        (SELECT COUNT(*) FROM sancion_participante
                         WHERE ci_participante = %s AND CURDATE() BETWEEN fecha_inicio AND fecha_fin) as sancionado
                    """
                    
                    cursor.execute(query, (
                        data['nombre_sala'], data['edificio'], data['fecha'], data['id_turno'],
                        ci, data['fecha'],
                        ci
                    ))
                    
                    result = cursor.fetchone()
                    
                    if result['sala_ocupada'] > 0:
                        return jsonify({"success": False, "error": "Sala no disponible"}), 400
                    if result['reservas_dia'] >= 2:
                        return jsonify({"success": False, "error": f"Participante {ci} alcanzó límite diario"}), 400
                    if result['sancionado'] > 0:
                        return jsonify({"success": False, "error": f"Participante {ci} está sancionado"}), 400
        
        # Crear reserva con transacción explícita
        with get_db_connection() as cnx:
            try:
                cnx.start_transaction()
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
                    return jsonify({"success": True, "id_reserva": id_reserva, "message": "Reserva creada"}), 201
                    
            except Error as err:
                cnx.rollback()
                raise err
                
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reserva/<int:id_reserva>/cancelar', methods=['PUT'])
def cancelar_reserva(id_reserva):
    """Cancela una reserva"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                # Verificar que existe y está activa
                cursor.execute("SELECT estado FROM reserva WHERE id_reserva = %s", (id_reserva,))
                reserva = cursor.fetchone()
                
                if not reserva:
                    return jsonify({"success": False, "error": "Reserva no encontrada"}), 404
                
                if reserva[0] != 'activa':
                    return jsonify({"success": False, "error": "Solo se pueden cancelar reservas activas"}), 400
                
                query = "UPDATE reserva SET estado = 'cancelada' WHERE id_reserva = %s"
                cursor.execute(query, (id_reserva,))
                cnx.commit()
                return jsonify({"success": True, "message": "Reserva cancelada"}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reserva/<int:id_reserva>/asistencia', methods=['PUT'])
def marcar_asistencia(id_reserva):
    """Marca la asistencia de un participante"""
    try:
        data = request.get_json()
        
        if 'asistencia' not in data or 'ci_participante' not in data:
            return jsonify({"success": False, "error": "Faltan campos requeridos"}), 400
        
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = """
                UPDATE reserva_participante
                SET asistencia = %s
                WHERE id_reserva = %s AND ci_participante = %s
                """
                cursor.execute(query, (data['asistencia'], id_reserva, data['ci_participante']))
                cnx.commit()
                
                if cursor.rowcount > 0:
                    return jsonify({"success": True, "message": "Asistencia marcada"}), 200
                else:
                    return jsonify({"success": False, "error": "Registro no encontrado"}), 404
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reserva/<int:id_reserva>/sin_asistencia', methods=['PUT'])
def marcar_sin_asistencia(id_reserva):
    """Marca una reserva sin asistencia"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "UPDATE reserva SET estado = 'sin asistencia' WHERE id_reserva = %s"
                cursor.execute(query, (id_reserva,))
                cnx.commit()
                
                if cursor.rowcount > 0:
                    return jsonify({"success": True, "message": "Reserva marcada sin asistencia"}), 200
                else:
                    return jsonify({"success": False, "error": "Reserva no encontrada"}), 404
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# ==================== SANCIONES ====================

@app.route('/api/sanciones')
def get_sanciones():
    """Lista todas las sanciones"""
    try:
        ci = request.args.get('ci_participante')
        activas = request.args.get('activas')
        
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = "SELECT * FROM sancion_participante WHERE 1=1"
                params = []
                
                if ci:
                    query += " AND ci_participante = %s"
                    params.append(ci)
                
                if activas == 'true':
                    query += " AND CURDATE() BETWEEN fecha_inicio AND fecha_fin"
                
                query += " ORDER BY fecha_inicio DESC"
                
                cursor.execute(query, tuple(params))
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/sancion', methods=['POST'])
def create_sancion():
    """Crea una nueva sanción"""
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['ci_participante', 'fecha_inicio', 'fecha_fin']):
            return jsonify({"success": False, "error": "Faltan campos requeridos"}), 400
        
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
        if hasattr(err, 'errno') and err.errno == 1452:
            return jsonify({"success": False, "error": "Participante no encontrado"}), 404
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/sancion/<ci>/<fecha_inicio>', methods=['DELETE'])
def delete_sancion(ci, fecha_inicio):
    """Elimina una sanción"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                query = "DELETE FROM sancion_participante WHERE ci_participante = %s AND fecha_inicio = %s"
                cursor.execute(query, (ci, fecha_inicio))
                cnx.commit()
                
                if cursor.rowcount > 0:
                    return jsonify({"success": True, "message": "Sanción eliminada"}), 200
                else:
                    return jsonify({"success": False, "error": "Sanción no encontrada"}), 404
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# ==================== REPORTES ====================

@app.route('/api/reportes/salas-mas-reservadas')
def salas_mas_reservadas():
    """Reporte de salas más reservadas"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT nombre_sala, edificio, COUNT(*) AS total_reservas
                FROM reserva
                GROUP BY nombre_sala, edificio
                ORDER BY total_reservas DESC
                LIMIT 10
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/turnos-mas-demandados')
def turnos_mas_demandados():
    """Reporte de turnos más demandados"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT t.id_turno, t.hora_inicio, t.hora_fin, COUNT(*) AS total
                FROM reserva r
                JOIN turno t ON t.id_turno = r.id_turno
                GROUP BY t.id_turno, t.hora_inicio, t.hora_fin
                ORDER BY total DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/promedio-participantes')
def promedio_participantes():
    """Reporte de promedio de participantes por sala"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT r.nombre_sala, r.edificio, AVG(cnt) AS promedio_participantes
                FROM (
                    SELECT id_reserva, COUNT(*) AS cnt
                    FROM reserva_participante
                    GROUP BY id_reserva
                ) x
                JOIN reserva r ON r.id_reserva = x.id_reserva
                GROUP BY r.nombre_sala, r.edificio
                ORDER BY promedio_participantes DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/reservas-por-carrera')
def reservas_por_carrera():
    """Reporte de reservas por carrera"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT ppa.nombre_programa, f.nombre AS facultad, COUNT(DISTINCT r.id_reserva) AS total
                FROM reserva r
                JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva
                JOIN participante_programa_academico ppa ON ppa.ci_participante = rp.ci_participante
                JOIN facultad f ON f.id_facultad = ppa.id_facultad
                GROUP BY ppa.nombre_programa, f.nombre
                ORDER BY total DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/ocupacion-por-edificio')
def ocupacion_por_edificio():
    """
    Reporte de ocupación por edificio
    MEJORA IMPLEMENTADA: Cálculo corregido del porcentaje
    """
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT 
                    s.edificio,
                    COUNT(DISTINCT s.nombre_sala) AS total_salas,
                    COUNT(r.id_reserva) AS total_reservas,
                    ROUND(COUNT(r.id_reserva) * 100.0 / 
                        (COUNT(DISTINCT s.nombre_sala) * (SELECT COUNT(*) FROM turno)), 2) AS porcentaje_ocupacion
                FROM sala s
                LEFT JOIN reserva r ON r.nombre_sala = s.nombre_sala AND r.edificio = s.edificio
                GROUP BY s.edificio
                ORDER BY porcentaje_ocupacion DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/reservas-por-tipo-usuario')
def reservas_por_tipo_usuario():
    """Reporte de reservas por tipo de usuario"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT 
                    ppa.rol, 
                    COUNT(DISTINCT rp.id_reserva) AS reservas,
                    SUM(CASE WHEN rp.asistencia = TRUE THEN 1 ELSE 0 END) AS asistencias,
                    ROUND(SUM(CASE WHEN rp.asistencia = TRUE THEN 1 ELSE 0 END) * 100.0 / 
                        COUNT(*), 2) AS porcentaje_asistencia
                FROM reserva_participante rp
                JOIN participante_programa_academico ppa ON ppa.ci_participante = rp.ci_participante
                GROUP BY ppa.rol
                ORDER BY reservas DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/cantidad-sanciones')
def cantidad_sanciones():
    """
    Reporte de cantidad de sanciones por tipo de usuario
    MEJORA IMPLEMENTADA: JOIN con participante para mostrar nombres
    """
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT 
                    ppa.rol, 
                    COUNT(*) AS sanciones,
                    COUNT(DISTINCT s.ci_participante) AS participantes_sancionados
                FROM sancion_participante s
                JOIN participante_programa_academico ppa ON ppa.ci_participante = s.ci_participante
                GROUP BY ppa.rol
                ORDER BY sanciones DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/porcentaje-uso-reservas')
def porcentaje_uso_reservas():
    """
    Reporte de porcentaje de uso de reservas
    ERROR CORREGIDO: Sintaxis SQL del cálculo de porcentaje
    """
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT 
                    SUM(CASE WHEN estado = 'finalizada' THEN 1 ELSE 0 END) AS usadas,
                    SUM(CASE WHEN estado IN ('cancelada','sin asistencia') THEN 1 ELSE 0 END) AS no_usadas,
                    COUNT(*) AS total,
                    ROUND((SUM(CASE WHEN estado = 'finalizada' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) AS porcentaje_uso
                FROM reserva
                """
                cursor.execute(query)
                result = cursor.fetchone()
                return jsonify({"success": True, "data": result}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/salas-incumplimiento')
def salas_incumplimiento():
    """Reporte de salas con mayor incumplimiento"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT 
                    nombre_sala, 
                    edificio,
                    COUNT(*) AS sin_asistencia,
                    (SELECT COUNT(*) FROM reserva r2 
                     WHERE r2.nombre_sala = reserva.nombre_sala 
                     AND r2.edificio = reserva.edificio) AS total_reservas,
                    ROUND(COUNT(*) * 100.0 / 
                        (SELECT COUNT(*) FROM reserva r2 
                         WHERE r2.nombre_sala = reserva.nombre_sala 
                         AND r2.edificio = reserva.edificio), 2) AS porcentaje_incumplimiento
                FROM reserva
                WHERE estado = 'sin asistencia'
                GROUP BY nombre_sala, edificio
                ORDER BY sin_asistencia DESC
                LIMIT 10
                """
                cursor.execute(query)
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/participantes-mas-activos')
def participantes_mas_activos():
    """
    Reporte de participantes más activos
    MEJORA IMPLEMENTADA: JOIN con tabla participante para mostrar nombres
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT 
                    p.ci, 
                    p.nombre, 
                    p.apellido, 
                    p.email,
                    COUNT(*) AS total_reservas,
                    SUM(CASE WHEN rp.asistencia = TRUE THEN 1 ELSE 0 END) AS asistencias,
                    ROUND(SUM(CASE WHEN rp.asistencia = TRUE THEN 1 ELSE 0 END) * 100.0 / 
                        COUNT(*), 2) AS porcentaje_asistencia
                FROM reserva_participante rp
                JOIN participante p ON p.ci = rp.ci_participante
                GROUP BY p.ci, p.nombre, p.apellido, p.email
                ORDER BY total_reservas DESC
                LIMIT %s
                """
                cursor.execute(query, (limit,))
                results = cursor.fetchall()
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


@app.route('/api/reportes/distribucion-por-dia')
def distribucion_por_dia():
    """
    Reporte de distribución de reservas por día
    MEJORA IMPLEMENTADA: Nombres de días en español y ordenados correctamente
    """
    try:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                query = """
                SELECT 
                    CASE DAYOFWEEK(fecha)
                        WHEN 1 THEN 'Domingo'
                        WHEN 2 THEN 'Lunes'
                        WHEN 3 THEN 'Martes'
                        WHEN 4 THEN 'Miércoles'
                        WHEN 5 THEN 'Jueves'
                        WHEN 6 THEN 'Viernes'
                        WHEN 7 THEN 'Sábado'
                    END AS dia,
                    DAYOFWEEK(fecha) AS dia_num,
                    COUNT(*) AS total
                FROM reserva
                GROUP BY dia, dia_num
                ORDER BY dia_num
                """
                cursor.execute(query)
                results = cursor.fetchall()
                # Remover dia_num del resultado final
                for r in results:
                    r.pop('dia_num', None)
                return jsonify({"success": True, "data": results}), 200
    except Error as err:
        return jsonify({"success": False, "error": str(err)}), 500


# ==================== HEALTH CHECK ====================

@app.route('/api/health')
def health_check():
    """
    Health check del servicio
    MEJORA: Endpoint único para health check (eliminado el duplicado en '/')
    """
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        
        return jsonify({
            "status": "healthy",
            "database": "connected",
            "message": "Servicio funcionando correctamente",
            "api_version": "1.0"
        }), 200
    
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }), 503


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    """Manejador de errores 404"""
    return jsonify({"success": False, "error": "Endpoint no encontrado"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Manejador de errores 500"""
    return jsonify({"success": False, "error": "Error interno del servidor"}), 500


@app.errorhandler(400)
def bad_request(error):
    """Manejador de errores 400"""
    return jsonify({"success": False, "error": "Solicitud inválida"}), 400


# ==================== MAIN ====================

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Iniciando servidor Flask")
    print("="*50)
    
    if init_db():
        print(f"\n✅ Base de datos inicializada correctamente")
        test_connection()
        print(f"\n🌐 Servidor corriendo en: http://localhost:{Config.PORT}")
        print(f"🔧 Modo debug: {Config.DEBUG}")
        print(f"📊 Health check: http://localhost:{Config.PORT}/api/health")
        print("="*50 + "\n")
        
        app.run(debug=Config.DEBUG, port=Config.PORT)
    else:
        print("\n❌ No se pudo inicializar la base de datos")
        print("💡 Verifica tu archivo .env y que MySQL esté corriendo")
        print("="*50 + "\n")


