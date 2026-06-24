# Users & Guidance Service - Oriéntate+

Este es el microservicio de **Gestión de Usuarios y Orientación** (Users & Guidance Service) para la plataforma **Oriéntate+**. Está construido utilizando una **Arquitectura Hexagonal estricta** en TypeScript con Express y PostgreSQL.

## Estructura de Directorios

- `database/`: Scripts DDL de base de datos.
- `src/domain/`: Capa de Dominio pura (Entidades y Excepciones de negocio), sin dependencias externas.
- `src/application/`: Capa de Aplicación. Contiene los Puertos de Entrada (interfaces de Casos de Uso), los Puertos de Salida (interfaces de Adaptadores) y la lógica de los Casos de Uso.
- `src/infrastructure/`: Capa de Infraestructura. Contiene los adaptadores de base de datos (PostgreSQL) y HTTP (Express controllers/routes).
- `src/core/`: Componentes transversales compartidos (Configuración, Conexión a base de datos, Middlewares globales).

## Requisitos
- Node.js v20+
- PostgreSQL v15+ (o Docker/Docker Compose)

## Instalación y Configuración

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Copia la plantilla de entorno y edítala:
   ```bash
   cp .env.example .env
   ```

3. Levanta la base de datos y la aplicación local usando Docker:
   ```bash
   docker-compose up --build
   ```

## Endpoints

### Estudiantes (STUDENT role required)
- `POST /api/v1/students/profile`: Crear perfil vocacional.
- `GET /api/v1/students/profile`: Obtener perfil vocacional propio.
- `PATCH /api/v1/students/profile`: Actualizar perfil vocacional propio.
- `POST /api/v1/students/join-group`: Unirse a un grupo mediante su `access_code`.

### Orientadores (COUNSELOR role required)
- `POST /api/v1/counselors/groups`: Crear grupo de estudiantes.
- `GET /api/v1/counselors/groups`: Obtener lista de grupos creados por el orientador.
- `GET /api/v1/counselors/groups/:groupId/students`: Obtener alumnos de un grupo específico.
- `GET /api/v1/counselors/students/:studentId/file`: Consultar el expediente completo de un alumno.
- `POST /api/v1/counselors/students/:studentId/sessions`: Registrar/agendar sesión de orientación individual.
- `POST /api/v1/counselors/tasks`: Asignar tarea (puede ser grupal o individual).
