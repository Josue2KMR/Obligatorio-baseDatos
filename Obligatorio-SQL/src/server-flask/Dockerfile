FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

# Instalar dependencias del sistema necesarias
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000

CMD ["/entrypoint.sh"]
