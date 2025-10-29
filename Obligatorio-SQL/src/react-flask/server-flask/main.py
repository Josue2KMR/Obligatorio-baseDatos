from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app) # Enable CORS for all routes


@app.route('/')
def hello_world():
    return 'Hello World'

@app.route('/api/reservas')
def get_reservas():
    try:
        cnx = mysql.connector.connect(
            user='root',
            password='rootpassword',
            host='localhost',
            database='obligatorio')

        cursor = cnx.cursor(dictionary=True)
        print("Conexion exitosa")
        
        # Execute a query
        cursor.execute("SELECT ci, nombre, apellido, email FROM participante")
        results = cursor.fetchall()
        
        cursor.close()
        cnx.close()
        
        return jsonify(results)
        
    except mysql.connector.Error as err:
        print(f"Error de conexion: {err}")
        return jsonify({"error": str(err)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)