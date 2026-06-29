# Frontend Leaflet Pro

Aplicación web para la gestión de lugares geográficos con mapas interactivos, desarrollada con Angular 20, Tailwind CSS 4, DaisyUI 5 y Leaflet.

## Stack

| Tecnología      | Versión |
|----------------|---------|
| Angular        | 20.3    |
| TypeScript     | 5.9     |
| Tailwind CSS   | 4.3     |
| DaisyUI        | 5.6     |
| Leaflet        | 1.9     |
| RxJS           | 7.8     |

## Requisitos

- Node.js 20 o superior
- npm
- Backend Leaflet Pro corriendo (ver README del backend)

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Desarrollo (servidor en http://localhost:4200)
npm start

# Compilar para producción
npm run build
```

El build de producción se genera en `dist/frontend/`.

## Estructura del proyecto

```
src/
  index.html                        # HTML de entrada
  main.ts                           # Bootstrap de la aplicación Angular
  styles.css                        # Estilos globales
  app/
    app.ts / app.html / app.config.ts / app.routes.ts
    core/
      auth.service.ts               # Llamadas API de autenticación
      auth-state.service.ts         # Estado de autenticación reactivo (señales)
      token.service.ts              # Gestión del JWT en localStorage
      places.service.ts             # CRUD de lugares
      users.service.ts              # CRUD de usuarios (admin)
    guards/
      auth.guard.ts                 # Redirige al login si no está autenticado
      role.guard.ts                 # Restringe rutas por rol
    interceptors/
      auth.interceptor.ts           # Adjunta token JWT + refresh automático en 401
      error.interceptor.ts          # Normaliza mensajes de error
    layouts/
      main-layout.component.ts      # Shell principal con sidebar responsive
    features/
      auth/login.component.ts       # Página de inicio de sesión
      dashboard/dashboard.component.ts       # Dashboard con mapa y buscador
      places/places-list.component.ts        # Tabla de lugares
      places/place-detail.component.ts       # Detalle de lugar con mapa
      places/place-form.component.ts         # Formulario crear/editar lugar
      profile/profile.component.ts           # Perfil del usuario
      users/users-list.component.ts          # Tabla de usuarios (admin)
      users/user-form.component.ts           # Formulario crear/editar usuario
      not-found/not-found.component.ts       # Página 404
    map/
      leaflet-map.component.ts      # Componente reutilizable de Leaflet
      map.types.ts                  # Interfaces MapMarker y MapClickEvent
    models/
      api-response.interface.ts     # Envoltorio genérico de respuesta API
      auth-response.interface.ts    # Respuesta de autenticación
      place.interface.ts            # Modelo Place y payloads
      user.interface.ts             # Modelo User, UserRole y payloads
    shared/components/
      loading.component.ts          # Spinner de carga
      toast.component.ts            # Notificación toast
    environments/
      environment.ts                # Variables de entorno (producción)
      environment.development.ts    # Variables de entorno (desarrollo)
```

## Rutas

| Ruta                 | Componente         | Guard         | Descripción                  |
|----------------------|--------------------|---------------|------------------------------|
| `/login`             | LoginComponent     | —             | Inicio de sesión             |
| `/dashboard`         | DashboardComponent | authGuard     | Mapa con todos los lugares   |
| `/places`            | PlacesListComponent| authGuard     | Lista de lugares             |
| `/places/new`        | PlaceFormComponent | authGuard     | Crear nuevo lugar            |
| `/places/:id`        | PlaceDetailComponent| authGuard    | Detalle de lugar             |
| `/places/:id/edit`   | PlaceFormComponent | authGuard     | Editar lugar                 |
| `/profile`           | ProfileComponent   | authGuard     | Perfil del usuario           |
| `/admin/users`       | UsersListComponent | authGuard + roleGuard(ADMIN) | Lista de usuarios |
| `/admin/users/new`   | UserFormComponent  | authGuard + roleGuard(ADMIN) | Crear usuario   |
| `/admin/users/:id/edit` | UserFormComponent | authGuard + roleGuard(ADMIN) | Editar usuario |
| `**`                 | NotFoundComponent  | —             | Página 404                   |

## Funcionalidades

### Autenticación
- Inicio de sesión con email y contraseña
- Persistencia de sesión en localStorage
- Refresco automático de token JWT al expirar
- Restauración de sesión al recargar la página

### Dashboard
- Mapa interactivo con todos los lugares del usuario
- Buscador con autocompletado por nombre, contacto o dirección
- Vuelo (`flyTo`) al lugar seleccionado
- Popups con información detallada (contacto, teléfono, dirección)
- Enlace directo al detalle de cada lugar
- Botón "Mi ubicación" para geolocalización

### Gestión de lugares (CRUD)
- Lista con tabla, coordenadas copiables al portapapeles
- Formulario de creación/edición con:
  - Campos: nombre del negocio, contacto, teléfono, dirección, coordenadas, notas
  - Asistente para pegar coordenadas desde Google Maps (formato `lat, lng`)
  - Mapa interactivo para seleccionar ubicación con marcador arrastrable
  - Validación en cliente y servidor
- Detalle con mapa centrado en el lugar y toda la información

### Administración de usuarios (solo ADMIN)
- Lista de usuarios con estado activo/inactivo
- Creación, edición y eliminación de usuarios
- Asignación de roles (ADMIN / USER)

### Perfil
- Visualización de datos del usuario autenticado
- Cierre de sesión

## Componentes compartidos

- **LoadingComponent:** Spinner de carga con mensaje opcional
- **ToastComponent:** Notificación emergente con tipos: éxito, error, advertencia, información

## Componente de mapa (LeafletMapComponent)

Componente reutilizable que encapsula Leaflet con OpenStreetMap:

| Input           | Tipo                  | Default | Descripción                                  |
|-----------------|-----------------------|---------|----------------------------------------------|
| `markers`       | `MapMarker[]`         | `[]`    | Marcadores a mostrar                         |
| `editable`      | `boolean`             | `false` | Modo edición (clic en mapa coloca marcador)  |
| `locate`        | `boolean`             | `true`  | Geolocalizar al iniciar                      |
| `showLocateBtn` | `boolean`             | `true`  | Mostrar botón "Mi ubicación"                 |
| `initialCoords` | `{lat, lng} \| null` | `null`  | Coordenadas iniciales para el marcador editable |

| Output       | Tipo            | Descripción                                |
|-------------|-----------------|--------------------------------------------|
| `markerClick` | `MapMarker`   | Clic en un marcador                       |
| `mapClick`    | `MapClickEvent` | Clic en el mapa (arrastre de marcador editable) |

| Método público | Parámetros                    | Descripción                             |
|---------------|-------------------------------|-----------------------------------------|
| `flyTo`       | `lat, lng, markerId?`         | Vuelo animado a coordenadas + abre popup|

## Flujo de autenticación

1. El usuario inicia sesión → se almacena JWT y datos del usuario en `localStorage`
2. Cada petición HTTP incluye el token en el header `Authorization: Bearer <token>`
3. Si el servidor responde 401, el interceptor intenta refrescar el token mediante `/api/auth/refresh`
4. Si el refresco falla, se limpia el estado y se redirige al login
5. Al recargar la página, se restaura la sesión desde `localStorage`

## Variables de entorno

| Variable  | Desarrollo                         | Producción                          |
|-----------|-----------------------------------|-------------------------------------|
| `apiUrl`  | `http://localhost:3000/api`       | `http://localhost:3000/api`         |

## Licencia

ISC
