# ✅ Tasks - Corrección de Errores + Unificación de Roles

## 🔴 Error 1A: Monitoreo de Mapa - `estatus_pago` no existe
- [x] Eliminar `estatus_pago` de interface `TicketSeatRow`
- [x] Eliminar `estatus_pago` del `.select()` y agregar `purchase_id`
- [x] Derivar `estatusPago` desde `purchase_id` (not null → 'pagado', null → 'pre-registro')
- [x] Actualizar `getSeatStatusMap` para usar la nueva lógica

## 🔴 Error 1B: Carga de Asistentes por UA
- [x] Cambiar filtro de `unidad_academica` (string) a `unidad_academica_id` (FK numérica)
- [x] Obtener UA ID desde el perfil del encargado (no desde su ticket)
- [x] Agregar `console.error` con `JSON.stringify` para diagnóstico

## 🔵 Unificación de Roles 2.1: Sidebar
- [x] Agregar accesos de Encargado al rol Admin en el Sidebar (mi-ua, usuarios-ua, tickets-gestion, generar-tokens, asignacion-asientos)

## 🔵 Unificación de Roles 2.2: Middleware/Seguridad
- [x] Actualizar middleware para permitir Admin (id_rol=1) en rutas compartidas
- [x] Corregir path `/dashboard/encargado` → `/dashboard/encargados` en middleware

## 🔵 Unificación de Roles 2.3: Compilación
- [x] Build exitoso con `npm run build` - 0 errores de TypeScript
- [x] Todas las rutas se compilaron correctamente (30 páginas generadas)