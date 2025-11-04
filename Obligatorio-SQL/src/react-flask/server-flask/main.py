from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from config import Config

app = Flask(__name__)
CORS(app)  # Permitir CORS en todas las rutas

@app.route('/')
def home():
    return 'Servidor activo ✅'

@app.route('/api/reservas', methods=['GET'])
def get_reservas():
    try:
        # Conectarse usando la configuración segura
        cnx = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            port=Config.DB_PORT
        )

        cursor = cnx.cursor(dictionary=True)

        # Consulta segura: sin concatenar texto directamente
        query = "SELECT ci, nombre, apellido, email FROM participante"
        cursor.execute(query)
        results = cursor.fetchall()

        cursor.close()
        cnx.close()

        return jsonify(results)

    except Error as err:
        print(f"Error en la conexión o consulta: {err}")
        return jsonify({"error": str(err)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
