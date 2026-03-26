# Sistema de Gestión de Boutique

Este es un sistema de gestión integral para boutiques, desarrollado con una arquitectura Full Stack moderna.

## Tecnologías Utilizadas

### Backend
- **Node.js & Express**: Servidor robusto y escalable.
- **PostgreSQL**: Base de datos relacional para integridad de datos.
- **JWT (JSON Web Tokens)**: Autenticación segura.
- **Joi**: Validación de esquemas de datos.
- **Helmet & Rate Limit**: Seguridad contra ataques comunes.
- **Express Async Errors**: Manejo centralizado de errores asíncronos.

### Frontend
- **React 19**: Interfaz de usuario reactiva y moderna.
- **Zustand**: Gestión de estado global ligera y eficiente.
- **Vite**: Herramienta de construcción ultrarrápida.
- **Lucide React**: Iconografía premium.
- **Glassmorphism UI**: Diseño visual moderno y elegante.

## Estructura del Proyecto

```text
/
├── backend/          # API REST (Node.js/Express)
├── frontend/         # Interfaz de Usuario (React)
└── package.json      # Scripts raíz para orquestación
```

## Instalación y Configuración

1. **Clonar el repositorio.**
2. **Configurar la base de datos**:
   - Ejecuta el script `backend/database.sql` en tu instancia de PostgreSQL.
3. **Configurar variables de entorno**:
   - Crea un archivo `.env` en la carpeta `backend/` con:
     ```env
     PORT=5000
     DATABASE_URL=postgres://usuario:password@localhost:5432/boutique_db
     JWT_SECRET=tu_secreto_super_seguro
     ```
4. **Instalar dependencias**:
   ```bash
   npm run install-all
   ```

## Cómo ejecutar

Para iniciar tanto el backend como el frontend simultáneamente en modo desarrollo:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:5000](http://localhost:5000)

## Características Principales

- **Dashboard**: Vista general con KPIs y alertas de stock.
- **Ventas**: Punto de venta con gestión de métodos de pago.
- **Inventario**: Control de productos y variantes (tallas/colores).
- **Clientes**: Gestión de base de datos de clientes.
- **Gastos**: Registro de egresos para control financiero.
- **Reportes**: Análisis visual de tendencias de venta.
- **Configuración**: Personalización del nombre de la boutique y tasas de impuestos.

usuario
admin@boutique.com
admin
