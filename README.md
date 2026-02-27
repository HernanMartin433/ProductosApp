# 📦 Gestión de Productos — Full Stack App

Aplicación completa de gestión de productos con backend .NET 8, frontend React 18, SQL Server y MongoDB.

---

## 🏗️ Arquitectura

```
ProductosApp/
├── Backend/
│   └── API/
│       ├── Controllers/       → ProductosController.cs
│       ├── Services/          → IProductoService + ProductoService
│       ├── Repositories/      → IProductoRepository + ProductoRepository
│       ├── Entities/          → Producto.cs
│       ├── DTOs/              → ProductoDto, CreateProductoDto, UpdateProductoDto
│       ├── Data/              → AppDbContext (EF Core → SQL Server)
│       ├── Logs/              → MongoLogService (MongoDB → historial)
│       ├── Middleware/        → ErrorHandlingMiddleware
│       └── Program.cs         → DI Container + Pipeline
└── Frontend/
    └── src/
        ├── services/          → api.js (HTTP client)
        ├── hooks/             → useProductos.js (estado global)
        ├── App.jsx            → UI principal
        └── index.css          → Estilos
```

### Patrones aplicados
| Patrón | Dónde |
|--------|-------|
| Repository Pattern | `IProductoRepository` / `ProductoRepository` |
| Dependency Injection | `Program.cs` → `AddScoped`, `AddSingleton` |
| DTOs | `ProductoDto`, `CreateProductoDto`, `UpdateProductoDto` |
| Service Layer | `IProductoService` / `ProductoService` |
| Middleware | `ErrorHandlingMiddleware` |
| Custom Hooks | `useProductos` (React) |

---

## 🗄️ Base de datos

### SQL Server (principal)

La tabla `dbo.Productos` ya debe existir:

```sql
CREATE TABLE dbo.Productos (
    Id          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Nombre      NVARCHAR(150)     NOT NULL,
    Descripcion NVARCHAR(500)     NULL,
    Precio      DECIMAL(18,2)     NOT NULL,
    Stock       INT               NOT NULL,
    FechaCreacion DATETIME        NOT NULL DEFAULT GETDATE(),
    Activo      BIT               NOT NULL DEFAULT 1
);
```

### MongoDB (logs / historial)

Colección `Logs` en base `ProductosDB`. Se registra automáticamente cada operación CREATE / UPDATE / DELETE con timestamp UTC.

```json
{
  "_id": "ObjectId",
  "accion": "CREATE",
  "productoId": 5,
  "detalle": "Producto 'Notebook' creado",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔌 API REST — Endpoints

Base URL: `http://localhost:5000/api/v1`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/productos` | Listar productos (`?soloActivos=true/false`) |
| GET    | `/productos/{id}` | Detalle de un producto |
| POST   | `/productos` | Crear producto |
| PUT    | `/productos/{id}` | Editar producto |
| DELETE | `/productos/{id}` | Eliminación lógica (Activo = false) |
| GET    | `/productos/{id}/logs` | Historial MongoDB del producto |

### Ejemplo — Crear producto (POST)
```json
{
  "nombre": "Notebook Lenovo",
  "descripcion": "14 pulgadas, 16GB RAM",
  "precio": 1299.99,
  "stock": 20
}
```

### Ejemplo — Editar producto (PUT)
```json
{
  "nombre": "Notebook Lenovo V2",
  "descripcion": "14 pulgadas, 32GB RAM",
  "precio": 1599.99,
  "stock": 15,
  "activo": true
}
```

### Códigos HTTP

| Código | Cuándo |
|--------|--------|
| 200 | OK — GET, PUT |
| 201 | Created — POST |
| 204 | No Content — DELETE exitoso |
| 400 | Bad Request — validación fallida |
| 404 | Not Found — recurso inexistente |
| 500 | Internal Server Error — error no controlado |

---

## ⚙️ Configuración y ejecución

### 1. Backend

```bash
cd Backend/API
```

Editar `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "SqlServer": "Server=TU_SERVIDOR;Database=ProductosDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "MongoDB": {
    "ConnectionString": "mongodb://localhost:27017",
    "Database": "ProductosDB",
    "Collection": "Logs"
  }
}
```

Ejecutar:
```bash
dotnet restore
dotnet run
```

API disponible en `http://localhost:5000`  
Swagger UI en `http://localhost:5000/swagger`

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

Disponible en `http://localhost:3000`

---

## 🔒 Seguridad implementada

- **Validaciones server-side**: DTOs con validaciones de longitud, tipos y rangos
- **Validaciones client-side**: Formulario React con validación antes de enviar
- **Manejo de errores HTTP**: Middleware global con códigos correctos
- **CORS configurado**: Policy restrictiva (modificar para producción)
- **Eliminación lógica**: Los productos nunca se borran físicamente
- **Inyección de dependencias**: Sin instanciación directa de servicios

### Para producción (Plus opcional)
- Descomentar y configurar JWT Bearer en `Program.cs`
- Restringir CORS a dominios específicos
- Habilitar HTTPS
- Variables de entorno para connection strings

---

## 🎯 Funcionalidades del Frontend

| Feature | Descripción |
|---------|-------------|
| Listado | Grid responsive con búsqueda en tiempo real |
| Filtro activos | Toggle para ver todos o solo activos |
| Alta | Formulario con validación inline |
| Edición | Pre-carga datos existentes |
| Eliminación | Confirmación antes de borrar lógico |
| Detalle | Panel con stats + historial MongoDB |
| Loading | Skeletons + spinners en botones |
| Errores | Alerts con opción de reintentar |
| Toasts | Feedback visual en cada operación |

---

## 📐 Stack técnico

| Capa | Tecnología |
|------|-----------|
| Backend Framework | .NET 8 (ASP.NET Core) |
| ORM | Entity Framework Core 8 |
| Base de datos SQL | SQL Server |
| Base de datos NoSQL | MongoDB |
| MongoDB Driver | MongoDB.Driver 2.24 |
| Documentación API | Swagger / OpenAPI |
| Frontend | React 18 + Vite |
| Estado | React Hooks (`useState`, `useCallback`, `useEffect`) |
| HTTP Client | Fetch API nativa |
| Notificaciones | react-hot-toast |
| Tipografía | Syne + DM Mono (Google Fonts) |
# ProductosApp
