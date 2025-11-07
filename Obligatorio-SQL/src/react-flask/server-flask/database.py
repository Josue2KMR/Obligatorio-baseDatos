import mysql.connector
from mysql.connector import pooling, Error
from config import Config

# Pool de conexiones global
connection_pool = None

def init_db():
    """Inicializar el pool de conexiones a la base de datos"""
    global connection_pool
    try:
        connection_pool = mysql.connector.pooling.MySQLConnectionPool(
            **Config.MYSQL_CONFIG
        )
        print("✓ Pool de conexiones creado exitosamente")
        print(f"  - Base de datos: {Config.MYSQL_CONFIG['database']}")
        print(f"  - Host: {Config.MYSQL_CONFIG['host']}")
        print(f"  - Pool size: {Config.MYSQL_CONFIG['pool_size']}")
        return True
    except Error as err:
        print(f"✗ Error al crear pool de conexiones: {err}")
        return False

def get_db_connection():
    """
    Obtener una conexión del pool
    Usar con context manager (with)
    
    Ejemplo:
        with get_db_connection() as cnx:
            with cnx.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM tabla")
                results = cursor.fetchall()
    """
    if connection_pool is None:
        raise Exception("Pool de conexiones no inicializado. Llamar init_db() primero")
    return connection_pool.get_connection()

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
        # El pool se cierra automáticamente cuando el programa termina
        connection_pool = None
        print("✓ Pool de conexiones cerrado")