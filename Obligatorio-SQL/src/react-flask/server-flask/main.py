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
    # Connect to the database
    try:
        cnx = mysql.connector.connect(
            user='root',
            password='rootpassword',
            host='localhost',
            database='obligatorio')

        cursor = cnx.cursor()
        print("Conexion exitosa")
    except mysql.connector.Error as err:
        print("Error de conexion: {}".format(err))
        return
    # Execute a query
    cursor.execute("SELECT * FROM participante")
    results = cursor.fetchall()


    cursor.close()
    cnx.close()

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)