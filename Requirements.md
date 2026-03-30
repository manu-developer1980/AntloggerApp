# AntLogger SPA — Documento de requerimientos

## 1. Objetivo

Construir una **SPA móvil-first** para registrar observaciones manuales de una colonia de **Messor barbarus** y consultarlas junto con datos ambientales ya almacenados en **Supabase**.

La app debe sustituir el flujo manual actual de:

- escribir observaciones en chat
- transformar a JSON
- generar consultas SQL de inserción
- consolidar por días

La nueva app debe guardar **directamente en Supabase** y mostrar histórico y contexto ambiental sin necesidad de consolidaciones manuales.

---

## 2. Alcance del MVP

### Incluido

- Visualización del estado actual del dispositivo/colonia
- Lectura de sensores actuales desde Supabase
- Listado de eventos del día actual
- Alta manual de eventos etológicos
- Alta manual de eventos de mantenimiento
- Consulta de histórico con filtros básicos
- Asignación automática de `phase_id` cuando exista una fase activa o aplicable
- Generación automática de `tags` a partir del formulario
- UX rápida orientada a uso desde móvil

### Excluido por ahora

- Backend propio
- Consolidaciones manuales por día
- Generación de SQL
- Exportaciones avanzadas
- Multiusuario complejo
- IA para parsear texto libre largo
- Sistema offline
- Adjuntos/fotos
- Notificaciones
- Dashboards analíticos complejos

---

## 3. Stack técnico

### Frontend

- **React**
- **TypeScript**
- **Vite**
- **React Router**
- **TanStack Query**
- **React Hook Form**
- **Zod**
- **Tailwind CSS**
- Componentes simples mobile-first

### Hosting frontend

- **Netlify**

### Datos / BBDD

- **Supabase**
- Sin backend intermedio en esta fase
- La SPA se conecta directamente a Supabase

---

## 4. Contexto funcional

El usuario registra observaciones como:

- exploración en forrajeo
- inspección de tubo
- transporte de semillas o proteína
- limpieza de restos
- excavación / traslado de arena
- ajustes estructurales del montaje (recorte de tubo, elevación de forrajeo, instalación de accesorios)

Además, Supabase ya contiene datos ambientales automáticos desde un ESP8266:

- temperatura
- humedad
- presión
- pendientes/slope
- flags/eventos de sensor

La app no debe duplicar esa captura ambiental. Solo debe **leerla y mostrarla**.

---

## 5. Tablas existentes en Supabase

### `devices`

Campos relevantes:

- `id`
- `created_at`
- `name`
- `device_uid`

Uso en la app:

- identificar el dispositivo/colonia activo
- mostrar nombre del dispositivo

### `colony_phases`

Campos relevantes:

- `id`
- `created_at`
- `device_id`
- `name`
- `description`
- `start_date`
- `end_date`
- `is_active`

Uso en la app:

- detectar la fase activa
- asociar eventos al `phase_id` correcto

### `colony_events`

Campos relevantes:

- `id`
- `created_at`
- `phase_id`
- `device_id`
- `event_type`
- `description`
- `observed_at`
- `intensity`
- `tags`

Uso en la app:

- tabla principal de escritura y lectura de observaciones manuales

### `sensor_readings`

Campos relevantes:

- `id`
- `created_at`
- `device_id`
- `temperature`
- `humidity`
- `pressure`
- `temp_slope_15m`
- `hum_slope_30m`
- `active_window`
- `event_flag`

Uso en la app:

- histórico ambiental si en el futuro se necesita detalle fino
- no es la fuente principal del dashboard inicial

### `latest_device_readings`

Campos relevantes:

- `device_id`
- `created_at`
- `temperature`
- `humidity`
- `pressure`

Uso en la app:

- fuente principal para mostrar las lecturas actuales en dashboard

### `colony_indicators`

Campos relevantes:

- `id`
- `recorded_at`
- `device_id`
- `mortality_count`
- `mold_status`
- `water_system_status`
- `risk_level`
- `notes`

Uso en la app:

- opcional en fase posterior
- no forma parte del flujo principal del MVP

---

## 6. Reglas de negocio

### 6.1 Fuente de verdad

La fuente de verdad será **Supabase**. No habrá consolidaciones diarias manuales ni generación de SQL.

### 6.2 Registro de eventos

Cada observación se guarda como una fila en `colony_events`.

### 6.3 Selección de fase

Al crear un evento, la app debe intentar asignar automáticamente `phase_id`:

1. Buscar fase activa (`is_active = true`) para el `device_id`
2. Si no existe, buscar una fase cuyo rango incluya `observed_at`
3. Si no encuentra ninguna, guardar `phase_id = null`

### 6.4 Event types permitidos

La app debe trabajar con estos valores exactos para `event_type`:

- `OBSERVATION`
- `MAINTENANCE`
- `EXCAVATION`

### 6.5 Intensidad

`intensity` es opcional.
Rango esperado: `1` a `5`.

### 6.6 Tags

Los `tags` deben autogenerarse en gran parte desde la UI.
Deben ser simples, consistentes y reutilizables.

Ejemplos de tags:

- `forrajeo`
- `tubo`
- `rampa`
- `entrada`
- `exploracion`
- `inspeccion`
- `transporte`
- `limpieza`
- `excavacion`
- `proteina`
- `gammarus`
- `semillas`
- `alpiste`
- `quinoa`
- `bluesugar`
- `arena`
- `restos`
- `reclutamiento`
- `ajuste_estructural`
- `bebedero`

### 6.7 Descripción

La `description` debe quedar limpia y legible, construida a partir de:

- acción principal
- zona
- detalle libre

Ejemplo:

- Acción: inspección
- Zona: forrajeo
- Detalle: una obrera revisa la zona
- Resultado: `Inspección en forrajeo. Una obrera revisa la zona.`

---

## 7. UX / enfoque de uso

### 7.1 Prioridad absoluta

La app debe permitir registrar un evento en **menos de 10 segundos** desde móvil.

### 7.2 Principios UX

- Mobile-first
- Una mano / uso rápido
- Botones grandes
- Pocos campos visibles a la vez
- Presets frecuentes
- Fecha y hora automáticas por defecto
- Minimizar escritura libre

### 7.3 No hacer

- formularios largos
- navegación pesada
- pasos innecesarios
- necesidad de editar JSON/SQL/manualidades técnicas

---

## 8. Pantallas del MVP

### 8.1 Dashboard / Hoy

Ruta sugerida: `/`

Debe mostrar:

- nombre del dispositivo activo
- fase activa (si existe)
- última lectura ambiental desde `latest_device_readings`
  - temperatura
  - humedad
  - presión
  - timestamp de la lectura

- lista de eventos del día actual (`colony_events`)
- botón flotante o visible: **Nuevo evento**
- acceso a histórico

### 8.2 Nuevo evento

Ruta sugerida: `/new`

Formulario principal para alta manual rápida.

Campos UI:

- fecha/hora (`observed_at`) pre-rellenada con ahora
- tipo principal de alta:
  - Observación
  - Mantenimiento
  - Excavación

- zona
- acción
- recurso opcional
- detalle libre corto
- intensidad opcional

La app debe traducir eso a:

- `event_type`
- `description`
- `tags`
- `phase_id`
- `device_id`

### 8.3 Histórico

Ruta sugerida: `/history`

Debe permitir:

- ver eventos pasados
- filtrar por rango de fechas
- filtrar por `event_type`
- filtrar por tags
- búsqueda por texto en `description`

### 8.4 Estado / indicadores (opcional, no prioritario)

Ruta sugerida: `/indicators`

Solo si se implementa en fase posterior:

- ver o registrar snapshots en `colony_indicators`

---

## 9. Formulario de eventos

### 9.1 Campos lógicos de UI

Aunque no existan como columnas, la UI debe trabajar con estos conceptos:

- `zona`
- `accion`
- `recurso`
- `detalle`
- `tipo_actividad` interno para construir tags
- `actividad_exterior` opcional solo a nivel visual si se considera útil más adelante

### 9.2 Catálogos recomendados

#### Zonas

- `forrajeo`
- `tubo`
- `tubo_superior`
- `rampa`
- `entrada`
- `nido`
- `puente`
- `conexion_nido_tubo`

#### Acciones

- `inspeccion`
- `exploracion`
- `transporte`
- `limpieza`
- `reclutamiento`
- `retirada`
- `reposicion`
- `patrulla`
- `excavacion`
- `ajuste_estructural`
- `actualizacion_modulo`

#### Recursos

- `proteina`
- `gammarus`
- `semillas`
- `alpiste`
- `quinoa`
- `bluesugar`
- `arena`
- `restos`
- `bebedero`

### 9.3 Presets de alta rápida

Debe haber presets como botones o chips:

- Inspección en forrajeo
- Inspección en tubo
- Transporte de proteína
- Transporte de semillas
- Limpieza de restos
- Excavación / arena
- Reposición de proteína
- Reposición de semillas
- Ajuste estructural
- Cambio de módulo
- Añadir BlueSugar / bebedero

---

## 10. Traducción UI → payload Supabase

### 10.1 Ejemplo de entrada UI

- Tipo: Observación
- Zona: forrajeo
- Acción: inspección
- Recurso: ninguno
- Detalle: una obrera revisa la zona
- Intensidad: 1

### 10.2 Resultado esperado

- `event_type = 'OBSERVATION'`
- `description = 'Inspección en forrajeo. Una obrera revisa la zona.'`
- `tags = ['forrajeo', 'inspeccion', 'exploracion']`
- `observed_at = fecha/hora del formulario`
- `device_id = dispositivo activo`
- `phase_id = fase resuelta automáticamente`
- `intensity = 1`

### 10.3 Ejemplo de mantenimiento

- Tipo: Mantenimiento
- Acción: reposición
- Recurso: gammarus
- Zona: forrajeo
- Detalle: se añaden 2 gammarus

Resultado esperado:

- `event_type = 'MAINTENANCE'`
- `description = 'Reposición en forrajeo. Se añaden 2 gammarus.'`
- `tags = ['reposicion', 'gammarus', 'forrajeo']`

---

## 11. Integración con Supabase

### 11.1 Lecturas necesarias

La app debe implementar consultas para:

- obtener dispositivo activo
- obtener fase activa o fase aplicable por fecha
- obtener lectura actual desde `latest_device_readings`
- obtener eventos del día actual
- obtener histórico de eventos con filtros

### 11.2 Escrituras necesarias

La app debe insertar en `colony_events`.

### 11.3 Sin backend propio

Toda la lógica reside en frontend.
Se usará el cliente de Supabase directamente.

### 11.4 Seguridad

El agente debe dejar preparada la app para trabajar con políticas/RLS de Supabase si están activadas.
No asumir permisos abiertos sin control.

---

## 12. Requisitos funcionales detallados

### RF-01

La app debe permitir seleccionar o fijar un `device_id` activo.

### RF-02

La app debe mostrar la fase activa o aplicable del dispositivo.

### RF-03

La app debe mostrar temperatura, humedad y presión actuales usando `latest_device_readings`.

### RF-04

La app debe mostrar la lista de eventos del día actual ordenada por `observed_at` descendente.

### RF-05

La app debe permitir crear un evento `OBSERVATION`.

### RF-06

La app debe permitir crear un evento `MAINTENANCE`.

### RF-07

La app debe permitir crear un evento `EXCAVATION`.

### RF-08

La app debe generar automáticamente una descripción limpia a partir de los campos del formulario.

### RF-09

La app debe generar automáticamente `tags` a partir de zona, acción y recurso.

### RF-10

La app debe permitir editar un evento ya creado.

### RF-11

La app debe permitir borrar un evento ya creado.

### RF-12

La app debe permitir consultar histórico por rango de fechas.

### RF-13

La app debe permitir filtrar histórico por `event_type`.

### RF-14

La app debe permitir filtrar histórico por tags.

### RF-15

La app debe permitir buscar por texto en `description`.

---

## 13. Requisitos no funcionales

### RNF-01

La app debe estar optimizada para móvil.

### RNF-02

La primera carga debe ser ligera y rápida.

### RNF-03

El flujo principal de crear un evento debe requerir el mínimo número de interacciones.

### RNF-04

La UI debe ser clara, funcional y sin adornos innecesarios.

### RNF-05

El código debe quedar modular y preparado para crecer sin reescrituras grandes.

### RNF-06

El tipado TypeScript debe ser estricto.

### RNF-07

La validación de formularios debe hacerse con Zod.

---

## 14. Estructura sugerida del proyecto

```txt
src/
  app/
    router.tsx
    providers.tsx
  lib/
    supabase.ts
    dates.ts
    utils.ts
  types/
    db.ts
    events.ts
  constants/
    zones.ts
    actions.ts
    resources.ts
    presets.ts
  features/
    devices/
    phases/
    readings/
    events/
      api/
      hooks/
      utils/
      schemas/
      components/
    history/
    indicators/
  pages/
    DashboardPage.tsx
    NewEventPage.tsx
    HistoryPage.tsx
  components/
    ui/
    layout/
```

---

## 15. Tipos de dominio sugeridos

```ts
export type EventType = "OBSERVATION" | "MAINTENANCE" | "EXCAVATION";

export type ColonyEvent = {
  id: string;
  created_at: string;
  phase_id: string | null;
  device_id: string;
  event_type: EventType;
  description: string;
  observed_at: string;
  intensity: number | null;
  tags: string[] | null;
};

export type ColonyPhase = {
  id: string;
  created_at: string;
  device_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean | null;
};

export type LatestDeviceReading = {
  device_id: string;
  created_at: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
};
```

---

## 16. Validación sugerida del formulario

El formulario debe validarse con Zod.

Campos esperados:

- `observedAt`
- `entryKind` (`OBSERVATION | MAINTENANCE | EXCAVATION`)
- `zone`
- `action`
- `resource?`
- `detail`
- `intensity?`

Restricciones:

- `observedAt` obligatorio
- `entryKind` obligatorio
- `zone` obligatorio
- `action` obligatorio
- `detail` puede ser breve pero no vacío en la mayoría de presets
- `intensity` entre 1 y 5 si existe

---

## 17. Lógica utilitaria que el agente debe implementar

### `resolveActiveDevice()`

Obtiene el dispositivo activo.

### `resolvePhaseForDate(deviceId, observedAt)`

Devuelve:

- fase activa
- o fase por rango
- o `null`

### `buildEventDescription(input)`

Construye `description` legible.

### `buildEventTags(input)`

Construye `tags` limpios y consistentes.

### `buildEventPayload(input)`

Devuelve el objeto final listo para insertar en `colony_events`.

---

## 18. MVP entregable esperado

El agente debe entregar una SPA funcional que permita:

1. abrir la app en móvil
2. ver sensores actuales
3. ver eventos de hoy
4. crear evento manual
5. crear mantenimiento manual
6. editar/borrar eventos
7. consultar histórico

No hace falta más para la primera versión.

---

## 19. Criterios de aceptación

### CA-01

Desde móvil, un evento simple se puede registrar en menos de 10 segundos.

### CA-02

Un evento creado aparece inmediatamente en la lista del día.

### CA-03

La app muestra temperatura, humedad y presión actuales del dispositivo.

### CA-04

Los eventos quedan correctamente persistidos en `colony_events`.

### CA-05

`phase_id` se resuelve automáticamente cuando existe una fase válida.

### CA-06

Las descripciones son legibles y los tags consistentes.

### CA-07

El histórico permite filtrar eventos sin necesidad de SQL manual.

---

## 20. Evolución futura deseable (no MVP)

- integración con `colony_indicators`
- gráficos básicos de actividad por día/hora
- correlación simple entre eventos manuales y clima
- vista combinada de sensor + eventos en timeline
- presets editables por el usuario
- parser de texto libre opcional
- PWA / instalación en móvil
- soporte para varias colonias/dispositivos

---

## 21. Resumen ejecutivo para el agente

Construir una SPA móvil-first en React + TypeScript + Vite, desplegable en Netlify, conectada directamente a Supabase, usando las tablas ya existentes. La app debe centrarse en registrar manualmente observaciones etológicas y acciones de mantenimiento en `colony_events`, mostrar la fase activa desde `colony_phases` y mostrar datos ambientales actuales desde `latest_device_readings`. No debe haber backend propio ni consolidaciones manuales. La prioridad absoluta es rapidez de uso desde móvil, simplicidad y persistencia directa en BBDD.

## DISEÑO

Claro. Te dejo un prompt pensado para pasárselo a un agente de diseño/UI o a una IA que genere propuesta visual de la SPA.

---

# Prompt de diseño UI para AntLogger

Diseña la interfaz de una **SPA móvil-first** llamada **AntLogger**, orientada al registro rápido de observaciones manuales de una colonia de **Messor barbarus** y a la consulta de datos ambientales almacenados en Supabase.

## Objetivo del producto

La aplicación debe permitir registrar en pocos segundos observaciones etológicas y acciones de mantenimiento de la colonia, sin necesidad de consolidaciones manuales ni generación de SQL. La fuente de verdad es la base de datos.

## Público y contexto de uso

- Usuario principal: una sola persona
- Uso frecuente desde **móvil**
- Uso ocasional desde escritorio
- Contexto de uso rápido, casi “de campo”, mientras observa la colonia
- El usuario necesita introducir datos con la mínima fricción posible

## Tono del diseño

- **Muy funcional**
- **Claro**
- **Compacto pero no agobiante**
- **Sin adornos innecesarios**
- Estética técnica / dashboard ligero
- Sensación de herramienta especializada, no de app genérica
- Priorizar usabilidad y velocidad frente a espectacularidad visual

## Estilo visual deseado

- Interfaz **oscura** por defecto
- Apariencia limpia y moderna
- Tarjetas con bordes suaves
- Tipografía muy legible
- Jerarquía visual muy clara
- Botones grandes y cómodos para pulgar
- Chips / pills para zonas, acciones, recursos y filtros
- Diseño preparado para uso intensivo en móvil
- Densidad media: mucha información útil, pero bien separada

## Identidad conceptual

La app mezcla:

- registro etológico
- mantenimiento de hormiguero
- telemetría ambiental
- trazabilidad temporal de eventos

La UI debe transmitir:

- observación precisa
- control del sistema
- simplicidad operativa
- sensación de “bitácora técnica viva”

## Estructura principal de la app

Diseñar estas pantallas:

### 1. Dashboard / Hoy

Pantalla principal al abrir la app.

Debe incluir:

- nombre del dispositivo/colonia
- fase activa
- tarjeta con lecturas actuales:
  - temperatura
  - humedad
  - presión
  - timestamp del último dato

- listado de eventos del día
- acceso rápido a crear nuevo evento
- acceso a histórico

Debe sentirse como una mezcla entre:

- panel de control
- timeline diario
- consola rápida

### 2. Nuevo evento

Pantalla o modal de alta rápida.

Debe permitir registrar:

- observación
- mantenimiento
- excavación

Campos visuales:

- fecha y hora
- tipo de evento
- zona
- acción
- recurso opcional
- detalle libre
- intensidad opcional

UX esperada:

- presets rápidos
- chips seleccionables
- mínimos pasos
- pensado para registrar en menos de 10 segundos

### 3. Histórico

Pantalla con:

- lista de eventos pasados
- filtros por fecha
- filtros por tipo
- filtros por tags
- búsqueda por texto

Debe ser clara, rápida y útil, sin complejidad excesiva.

### 4. Indicadores / estado

Pantalla secundaria opcional para mostrar o registrar:

- riesgo
- moho
- sistema de agua
- mortalidad
- notas

## Modelo de interacción

La experiencia debe estar muy optimizada para:

- abrir app
- ver estado actual
- pulsar “nuevo evento”
- seleccionar chips
- escribir un detalle breve
- guardar

Evitar:

- menús profundos
- pantallas recargadas
- formularios largos
- exceso de texto explicativo

## Componentes clave

Quiero que propongas visualmente:

- header compacto
- cards de sensores
- timeline/lista de eventos
- FAB o botón principal para añadir evento
- formulario rápido con chips
- filtros elegantes para histórico
- badges/tags legibles
- estados vacíos útiles
- feedback visual tras guardar

## Información y jerarquía

Prioridad visual:

1. acción rápida para registrar
2. estado ambiental actual
3. eventos del día
4. fase actual
5. histórico y filtros

## Sistema visual sugerido

- layout en una sola columna para móvil
- grid ligero en desktop
- tarjetas apiladas
- botones flotantes o sticky actions
- chips con estados claros de selección
- timeline simple para eventos
- iconografía discreta pero útil

## Colores

- base oscura
- acentos fríos o naturales
- sensación técnica/natural, no corporativa
- evitar colores chillones
- el color debe servir a la legibilidad y al estado

## Inspiración funcional

La interfaz debería sentirse como una mezcla entre:

- app de campo científico
- panel de monitoring ligero
- herramienta de logging especializada
- diario técnico operativo

## Entrega esperada

Genera una propuesta de diseño UI/UX completa para esta SPA, incluyendo:

- dirección visual general
- estructura de navegación
- wireframe conceptual de las pantallas principales
- componentes clave
- decisiones de jerarquía visual
- patrones mobile-first
- propuesta de look and feel

Importante:
No diseñar una app genérica de tareas.
Diseñar una herramienta especializada para observación y mantenimiento de colonia de hormigas con soporte de datos ambientales.
