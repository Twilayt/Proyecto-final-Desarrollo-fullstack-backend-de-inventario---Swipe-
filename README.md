# SWIPE Backend (Express + Supabase + JWT)

Este backend está pensado para tu proyecto final:
- Express + PostgreSQL (Supabase)
- Autenticación JWT + roles (admin/user)
- Rutas protegidas
- Paginación y filtros (GET)
- API externa de clima (Open-Meteo)
- Manejo centralizado de errores
- Rate limiting básico

## 1) Requisitos
- Node.js 18+ (para `fetch`)
- Una base de datos en Supabase (PostgreSQL)

## 2) Variables de entorno
Copia `.env.example` a `.env` y llena tus valores.

## 3) Levantar local
```bash
npm install
npm run seed   # crea usuarios de prueba y algunos productos
npm run dev
```

API por defecto: http://localhost:3000

## 4) Usuarios de prueba (creados por seed)
- Admin: admin@swipe.com / Admin123!
- User:  user@swipe.com  / User123!

## 5) Endpoints principales
- POST  /api/auth/login
- GET   /api/dashboard/resumen   (protegida)
- GET   /api/products            (protegida, paginación + búsqueda)
- GET   /api/products/alertas/caducidad?dias=30  (protegida)
- GET   /api/clients             (protegida, paginación + búsqueda)
- GET   /api/weather?city=Chihuahua (pública)
- GET   /health
- GET   /health/db

## 6) Postman
En `/postman` hay una colección y un environment de ejemplo.
