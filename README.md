# AntLogger SPA

Una aplicación móvil-first para registrar observaciones manuales de colonias de **Messor barbarus** y consultar datos ambientales desde Supabase.

## Características

- ✅ **Mobile-first**: Diseñado para uso rápido desde móvil
- ✅ **Registro rápido**: Eventos en menos de 10 segundos
- ✅ **Datos ambientales**: Lecturas en tiempo real de sensores
- ✅ **Fases automáticas**: Asignación automática de fases activas
- ✅ **Filtros avanzados**: Búsqueda por fecha, tipo y texto
- ✅ **Diseño oscuro**: Interfaz moderna y legible

## Tecnología

- **Frontend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Estado**: React Query (TanStack Query)
- **Formularios**: React Hook Form + Zod
- **Base de datos**: Supabase (directo desde frontend)
- **Notificaciones**: Sonner

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [url-del-repo]
   cd antlogger-spa
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Luego edita `.env` y agrega tus credenciales de Supabase:
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

```
src/
├── app/                 # Configuración de la aplicación
│   ├── router.tsx      # Rutas de React Router
│   └── providers.tsx   # Proveedores de React Query y otros
├── components/         # Componentes reutilizables
├── constants/          # Constantes y configuraciones
│   ├── zones.ts       # Zonas del hormiguero
│   ├── actions.ts     # Acciones posibles
│   ├── resources.ts   # Recursos/tipos de alimento
│   └── presets.ts     # Presets rápidos de eventos
├── features/          # Funcionalidades por dominio
│   ├── devices/       # Gestión de dispositivos
│   ├── phases/        # Gestión de fases de colonia
│   ├── readings/      # Lecturas de sensores
│   ├── events/        # Eventos y observaciones
│   └── history/       # Historial y filtros
├── lib/               # Utilidades y configuraciones
│   ├── supabase.ts    # Cliente de Supabase
│   ├── dates.ts       # Utilidades de fechas
│   └── utils.ts       # Utilidades generales
├── pages/             # Páginas principales
│   ├── DashboardPage.tsx
│   ├── NewEventPage.tsx
│   └── HistoryPage.tsx
└── types/             # Definiciones de TypeScript
    ├── db.ts          # Tipos de base de datos
    └── events.ts      # Tipos de eventos
```

## Uso

### Dashboard Principal
- Muestra lecturas ambientales actuales
- Lista los eventos del día
- Acceso rápido a crear nuevos eventos

### Crear Evento
- **Presets rápidos**: Botones para eventos comunes
- **Formulario inteligente**: Campos organizados por tipo
- **Vista previa**: Muestra cómo quedará el evento
- **Auto-fase**: Asigna automáticamente la fase activa

### Historial
- **Filtros por fecha**: Rango de fechas personalizable
- **Filtros por tipo**: Observación, Mantenimiento, Excavación
- **Búsqueda por texto**: Busca en descripciones
- **Tags**: Filtrado por etiquetas

## Flujo de Datos

1. **Lecturas de sensores**: Se obtienen desde `latest_device_readings`
2. **Eventos manuales**: Se guardan en `colony_events`
3. **Fases de colonia**: Se resuelven automáticamente desde `colony_phases`
4. **Dispositivos**: Se obtienen desde `devices`

## Reglas de Negocio

### Asignación de Fases
1. Busca fase activa (`is_active = true`)
2. Si no existe, busca fase que incluya la fecha
3. Si no encuentra, asigna `null`

### Generación de Descripciones
- Formato: `[Acción] en [Zona] [de Recurso]. [Detalle]`
- Ejemplo: `Inspección en forrajeo. Una obrera revisa la zona.`

### Generación de Tags
- Incluye: zona, acción, recurso
- Tags adicionales según el tipo de actividad
- Sin duplicados

## Despliegue

### Netlify (Recomendado)
1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno
3. El build se ejecuta automáticamente

### Build Manual
```bash
npm run build
```

Los archivos estáticos se generan en `dist/`

## Seguridad

- Usa solo el **anon key** de Supabase en el frontend
- El **service role key** debe usarse solo en backend
- Las políticas RLS deben configurarse apropiadamente

## Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

Este proyecto es privado y no tiene licencia pública.