FROM python:3.11-slim

# Python çıktılarının terminale anlık düşmesi için
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# M3/ARM64 uyumlu kütüphaneler
RUN apt-get update && apt-get install -y libpq-dev gcc --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Railway için dinamik port desteği
ENV PORT 8000

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "main.wsgi:application"]