# ProyectWebMirror

Clon de Steam desarrollado como proyecto web completo.

## Descripción
Aplicación web que simula una tienda de juegos como Steam, con front office público y back office para administración.

## Tecnologías
- **Frontend**: HTML, CSS, JavaScript (Bootstrap para diseño responsive)
- **Backend**: Node.js, Express.js, MySQL
- **Base de datos**: MySQL

## Funcionalidades implementadas
- **Front Office**:
  - Lista de juegos con categorías
  - Búsqueda y filtrado
  - Paginación
  - Carrito y favoritos (localStorage)
  - Login básico
  - Diseño responsive

- **Back Office**:
  - CRUD completo para juegos (admin.html)
  - API RESTful con rutas POST, PUT, DELETE

- **API**:
  - GET /api/games (con paginación)
  - GET /api/games/:id
  - POST /api/games
  - PUT /api/games/:id
  - DELETE /api/games/:id

## Instalación
1. Instalar dependencias: `npm install`
2. Configurar DB en .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
3. Ejecutar schema.sql en MySQL
4. Iniciar servidor: `npm start`

## Estructura del proyecto
- `server.js`: Servidor Express y API
- `script.js`: Lógica frontend
- `admin.html`: Panel de administración
- `index.html`: Página principal
- `schema.sql`: Esquema de base de datos

## Próximos pasos
- Persistir carritos/favoritos en DB
- Autenticación JWT
- Documentación completa
- Despliegue en Heroku

  
