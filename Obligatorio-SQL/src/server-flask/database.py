import mysql.connector
from mysql.connector import pooling, Error
from config import Config

# Pool de conexiones global
connection_pool = None

def init_db():
    """Inicializar el pool de conexiones a la base de datos"""
    global connection_pool
    try:
        # COPIA para agregar autocommit sin modificar Config original
        mysql_config = Config.MYSQL_CONFIG.copy()
        mysql_config["autocommit"] = True     # 🔥 FIX: evita “transaction already in progress”
        mysql_config["pool_reset_session"] = True  # Limpia la sesión al devolver la conexión

        connection_pool = mysql.connector.pooling.MySQLConnectionPool(
            **mysql_config
        )

        print("✓ Pool de conexiones creado exitosamente")
        print(f"  - Base de datos: {mysql_config['database']}")
        print(f"  - Host: {mysql_config['host']}")
        print(f"  - Pool size: {mysql_config['pool_size']}")
        print(f"  - AUTOCOMMIT: {mysql_config['autocommit']}")
        print(f"  - pool_reset_session: {mysql_config['pool_reset_session']}")
        return True

    except Error as err:
        print(f"✗ Error al crear pool de conexiones: {err}")
        return False


def get_db_connection():
    """
    Obtener una conexión del pool
    Usar SIEMPRE con context manager (with)
    """
    if connection_pool is None:
        raise Exception("Pool de conexiones no inicializado. Llamar init_db() primero")

    conn = connection_pool.get_connection()

    # 🔥 Garantiza que nunca venga con una transacción previa abierta
    try:
        conn.rollback()
    except:
        pass

    return conn


def test_connection():
    """Probar la conexión a la base de datos"""
    try:
        with get_db_connection() as cnx:
            with cnx.cursor() as cursor:
                cursor.execute("SELECT DATABASE(), VERSION()")
                db_name, version = cursor.fetchone()
                print(f"✓ Conexión exitosa a la base de datos '{db_name}'")
                print(f"  - MySQL version: {version}")
                return True
    except Error as err:
        print(f"✗ Error al probar conexión: {err}")
        return False


def close_db():
    """Cerrar el pool de conexiones"""
    global connection_pool
    if connection_pool:
        connection_pool = None
        print("✓ Pool de conexiones cerrado")
