#!/bin/sh
set -e

echo "Esperando a que MySQL esté disponible en $DB_HOST:$DB_PORT..."
DB_PORT=${DB_PORT:-3306}

until python - <<PY
import os, sys
import mysql.connector
try:
    mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        connection_timeout=3
    )
    sys.exit(0)
except Exception:
    sys.exit(1)
PY
do
  echo -n '.'
  sleep 2
done

echo "\nMySQL disponible — iniciando aplicación Flask"

export FLASK_PORT=${FLASK_PORT:-5000}
export FLASK_DEBUG=${FLASK_DEBUG:-False}

python main.py
