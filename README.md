# Dogs Pretty Backend

API en Node.js + Express para listar y subir imagenes a Google Cloud Storage.

## Stack

- Node.js
- Express 5
- @google-cloud/storage
- multer
- dotenv

## Arquitectura

- `src/config`: configuracion de entorno y GCP
- `src/routes`: rutas HTTP
- `src/controllers`: capa HTTP
- `src/services`: logica de negocio
- `src/middlewares`: upload y manejo global de errores

## Requisitos

- Node.js 18+
- Credenciales de Service Account de GCP

## Variables de entorno

Crear archivo `.env` en esta carpeta:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
GCS_BUCKET_PATH=matrimonioxd/dogs-pretty
# O ruta a archivo JSON o JSON completo en una linea
# GOOGLE_APPLICATION_CREDENTIALS=C:/ruta/credenciales.json
```

## Scripts

- `npm run dev`: arranque con nodemon
- `npm run start`: arranque normal

## Endpoints

- `GET /health`
- `GET /api/images`
- `POST /api/images/upload`
  - `multipart/form-data`
  - campo del archivo: `image`
  - maximo: 10MB
  - tipos permitidos: PNG, JPG, WEBP, GIF, BMP, AVIF
