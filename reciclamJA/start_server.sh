#!/bin/bash

# --- Backend (Django) ---
cd /var/www/reciclaja/ModulSintesis/reciclamJA
source .venv/bin/activate  # Activa el entorno virtual (ajusta si se llama diferente)
python manage.py runserver 0.0.0.0:8000 &

# --- Frontend (React) ---
cd /var/www/reciclaja/ModulSintesis/reciclamJA/client
npm run dev &  # Para desarrollo (usa `npm run build` + Nginx para producción)

echo "✅ Servidores iniciados: Django (http://0.0.0.0:8000) y React (http://0.0.0.0:3000)"