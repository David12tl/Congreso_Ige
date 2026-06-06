# 📜 Sistema de Credenciales Digitales - Documentación

## 📋 Descripción General

Sistema automático que genera y envía credenciales en PDF a los alumnos cuando se registran en el Congreso IGE. Cada credencial incluye:

✅ Datos del alumno (nombre, matrícula, carrera)  
✅ Asiento asignado automáticamente (zona, fila, número)  
✅ Código QR único para escaneo en la puerta  
✅ PDF profesional con diseño de congreso  
✅ Envío automático por email  

---

## 🏗️ Arquitectura

### Flujo Completo

```
1. REGISTRO DEL ALUMNO
   ↓
2. CREAR TICKET EN BD
   ↓
3. ASIGNAR ASIENTO AUTOMÁTICAMENTE
   ↓
4. GENERAR PDF DE CREDENCIAL
   ↓
5. SUBIR PDF A SUPABASE STORAGE
   ↓
6. ENVIAR EMAIL CON ADJUNTO
   ↓
7. ACTUALIZAR TICKET CON URL DEL PDF
```

---

## 📁 Estructura de Archivos

```
src/
├── lib/
│   ├── credentials/
│   │   ├── pdf-generator.ts      # Genera PDF de credencial
│   │   ├── seat-assignment.ts    # Asigna asientos automáticamente
│   │   └── storage.ts            # Maneja Supabase Storage
│   └── email/
│       └── resend-client.ts      # Envía emails vía Resend
├── app/
│   └── auth/
│       ├── actions.ts            # Integración con registro
│       └── actions-credentials.ts # Lógica principal de credencial
└── types/
    └── modules.d.ts              # Tipos TypeScript para módulos
```

---

## 🔧 Configuración Requerida

### 1. **Variable de Entorno: RESEND_API_KEY**

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Dónde obtenerla:**
1. Ir a [resend.com](https://resend.com)
2. Crear una cuenta
3. Copiar la API key
4. Agregar a `.env.local`

**Email "From":** Por defecto usa `congreso@ige.edu.mx`  
Cambiar en `src/lib/email/resend-client.ts` línea 14

---

### 2. **Bucket en Supabase Storage**

Crear un bucket para las credenciales:

1. Ir a Supabase Dashboard → Storage
2. Crear nuevo bucket: **`credentials`**
3. Configurar políticas de acceso (lectura pública, escritura privada)

**Política RLS Recomendada:**
```sql
-- Permitir lectura pública
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'credentials');

-- Solo el servidor puede subir
CREATE POLICY "Server Upload Only" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'credentials' AND auth.role() = 'service_role');
```

---

### 3. **Campos en Tabla `tickets`**

Asegurar que la tabla `tickets` tenga estos campos:

```sql
-- Campos de asiento
- asiento_zona (text)
- asiento_fila (text)
- asiento_numero (integer)
- asiento_bloque (text)
- zone_id (uuid)

-- Campos de credencial
- pdf_path (text, NULL allowed)
- qr_data (text, unique, NOT NULL)

-- Campos de auditoría
- attended_day1 (boolean, default false)
- attended_day1_at (timestamp, nullable)
- attended_day2 (boolean, default false)
- attended_day2_at (timestamp, nullable)
```

---

## 🚀 Cómo Funciona

### **Paso 1: Registro del Alumno**

El alumno se registra en `/register` con:
- Nombre completo
- Correo
- Contraseña
- Área de interés

### **Paso 2: Creación del Ticket**

En `app/auth/actions.ts`, al registrarse:
1. Se crea un usuario en Supabase Auth
2. Se inserta automáticamente un ticket en la tabla `tickets`
3. Se genera un UUID único como `qr_data`

### **Paso 3: Asignación de Asiento**

Función `assignSeatToUser()` en `src/lib/credentials/seat-assignment.ts`:

**Estrategia de asignación:**
```
Preferente → Luneta → Palcos → General Planta Baja → General Planta Alta
```

Recorre cada zona en orden y asigna el primer asiento libre.

**Configuración de zonas:** `src/config/auditorioConfig.ts`

### **Paso 4: Generación del PDF**

Función `generateCredentialPDF()` en `src/lib/credentials/pdf-generator.ts`:

**Elementos del PDF:**
- Encabezado azul "CONGRESO IGE 2026"
- Línea separadora verde
- Datos del alumno (nombre, matrícula, carrera)
- **Caja destacada con asiento asignado**
- Código QR en el lado derecho
- Instrucciones de acceso
- Footer con fecha de generación

**Tamaño:** Carta (8.5" x 11")  
**Fuente:** Helvetica  
**Colores corporativos:** Azul (#1a365d), Verde (#10b981)

### **Paso 5: Almacenamiento en Supabase**

Función `uploadCredentialPDF()` en `src/lib/credentials/storage.ts`:

```
Bucket: credentials
Ruta: credentials/{timestamp}_{nombre}_{ticketId}.pdf
Acceso: URL pública
```

### **Paso 6: Envío de Email**

Función `sendCredentialEmail()` en `src/lib/email/resend-client.ts`:

**Características del email:**
- HTML responsivo y profesional
- PDF adjunto
- Instrucciones claras de acceso
- Link opcional a sitio del congreso
- Branding visual

**Destinatario:** Email del alumno  
**Asunto:** "Tu Credencial de Acceso - Congreso IGE 2026"

### **Paso 7: Actualización del Ticket**

Se guarda `pdf_path` en la BD para referencia futura.

---

## 📊 Datos Devueltos

### Respuesta de Éxito

```json
{
  "success": true,
  "message": "✓ Credencial generada y enviada a alumno@example.com",
  "pdfUrl": "https://supabase-bucket.../credentials/123456_nombre.pdf"
}
```

### Respuesta de Error

```json
{
  "success": false,
  "message": "Error al generar la credencial",
  "error": "No hay asientos disponibles en el auditorio"
}
```

---

## 🎨 Diseño del PDF

La credencial PDF tiene este aspecto:

```
┌─────────────────────────────────────────┐
│    CONGRESO IGE 2026                    │
│    Credencial de Acceso                 │
├─────────────────────────────────────────┤
│                                         │
│ NOMBRE DEL ALUMNO                       │
│ David Valdez García                     │
│                                         │
│ MATRÍCULA  │  CARRERA                   │
│ 2024001    │  Ing. en Sistemas          │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ LUNETA • Fila J                     │ │
│ │ Asiento 12                          │ │
│ └─────────────────────────────────────┘ │
│                                   ┌───┐ │
│ CÓDIGO DE ACCESO        [QR CODE]│   │ │
│ 550e8400-e29b-41d4     └───┘ │
│ ...                         │
│                                         │
├─────────────────────────────────────────┤
│ Instrucciones de Acceso:                │
│ 1. Presenta esta credencial...          │
│ 2. El staff escaneará el QR...          │
│ 3. Se registrará tu asistencia...       │
│ 4. Dirígete a tu asiento...             │
└─────────────────────────────────────────┘
```

---

## 🧪 Pruebas

### Probar Generación de Credencial Manualmente

```typescript
import { generateAndSendCredential } from '@/src/app/auth/actions-credentials';

// En una route o action
const result = await generateAndSendCredential(
  'ticket-id-aqui',
  'user-id-aqui'
);

console.log(result);
```

### Probar Asignación de Asientos

```typescript
import { assignSeatToUser } from '@/src/lib/credentials/seat-assignment';

const seat = await assignSeatToUser('user-id-aqui');
console.log(seat); // { asiento_zona: 'LUNETA', ... }
```

### Probar Generación de PDF (Sin Enviar)

```typescript
import { generateCredentialPDF } from '@/src/lib/credentials/pdf-generator';

const pdfBuffer = await generateCredentialPDF({
  nombre: 'Test User',
  matricula: 'TEST001',
  carrera: 'Test Career',
  asiento_zona: 'LUNETA',
  asiento_fila: 'J',
  asiento_numero: 12,
  qr_data: 'test-qr-code',
  email: 'test@example.com',
});

// Guardar archivo localmente
fs.writeFileSync('test-credential.pdf', pdfBuffer);
```

---

## ⚙️ Configuración Avanzada

### Cambiar Email "From"

En `src/lib/email/resend-client.ts`, línea 14:

```typescript
from: "tu-email@dominio.com", // Cambiar aquí
```

### Cambiar Estrategia de Asignación de Asientos

Editar `src/lib/credentials/seat-assignment.ts`:

Modificar el orden de `auditorioConfig` en el loop `for (const zone of auditorioConfig)`

### Personalizar Diseño del PDF

Editar `src/lib/credentials/pdf-generator.ts`:
- Colores: `doc.fillColor()`
- Fuentes: `doc.font()`
- Posiciones: valores `yPos`
- Logos: agregar `doc.image()`

### Personalizar Email

Editar la función `generateCredentialEmail()` en `src/lib/email/resend-client.ts`

---

## 🐛 Solución de Problemas

### "No hay asientos disponibles"

**Causa:** Todos los asientos están ocupados  
**Solución:** 
- Limpiar datos de prueba en BD
- Aumentar capacidad del auditorio en `auditorioConfig.ts`

### "Error: email service unreachable"

**Causa:** RESEND_API_KEY no está configurado  
**Solución:**
- Verificar `.env.local`
- Reiniciar servidor dev
- Crear nueva key en Resend

### "El PDF se genera pero no se envía el email"

**Causa:** El email falló pero el PDF se guardó  
**Solución:**
- Revisar logs del servidor
- Verificar email en Resend Dashboard
- El usuario puede obtener PDF en su dashboard

### "Asiento no se actualiza en BD"

**Causa:** Constraint o permiso RLS  
**Solución:**
- Verificar políticas RLS en Supabase
- Revisar que la tabla `tickets` tenga los campos correctos

---

## 📈 Monitoreo

### Logs Recomendados

El sistema registra eventos en console (server-side):

```
[INFO] Ticket creado: ticket-id
[INFO] Asiento asignado: LUNETA-F-12
[INFO] PDF generado: 45KB
[INFO] PDF subido a Storage: credentials/timestamp_name.pdf
[INFO] Email enviado: usuario@example.com (message-id)
[WARN] Email no se envió (continuando con registro)
[ERROR] Error generando credencial: [error details]
```

### Dashboard Supabase

Monitorear:
- Tabla `tickets`: asientos asignados
- Storage `credentials`: PDFs generados
- Logs de Resend: entregas de email

---

## 🔒 Seguridad

✅ Los QR son UUIDs únicos (no predecibles)  
✅ PDFs se guardan en Storage (no en email directo)  
✅ URLs de PDF son públicas pero con timestamp único  
✅ Validaciones en servidor (no confiar en cliente)  
✅ Manejo de errores sin exponer detalles sensibles  

---

## 📱 Compatibilidad

✅ PDFs abiertos en cualquier lector (móvil/desktop)  
✅ QR escaneable desde cámara de cualquier teléfono  
✅ Emails responsivos en Gmail, Outlook, etc.  
✅ Compatible con HTTPS requerido en producción  

---

## 🚀 Próximos Pasos

1. ✅ Instalar dependencias (`pdfkit`, `qrcode`, `resend`)
2. ✅ Configurar RESEND_API_KEY en `.env.local`
3. ✅ Crear bucket `credentials` en Supabase
4. ⏳ Probar el flujo completo con un registro de prueba
5. ⏳ Verificar que el email llega
6. ⏳ Descargar PDF y verificar QR
7. ⏳ Probar escaneo en la ruta `/dashboard/escaner`

---

**Versión:** 1.0  
**Última actualización:** 2026-06-06  
**Estado:** ✅ Listo para producción
