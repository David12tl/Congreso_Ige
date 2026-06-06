# Configuración de Credenciales - Guía de Setup

## 1. Instalar Dependencias ✅

```bash
npm install pdfkit qrcode resend uuid
npm install --save-dev @types/pdfkit @types/uuid
```

**Estado actual:** ✅ Ya instaladas

---

## 2. Configurar Resend API

### a) Crear cuenta en Resend
1. Ir a [https://resend.com](https://resend.com)
2. Registrarse o iniciar sesión
3. Dashboard → API Keys
4. Copiar la clave

### b) Agregar a `.env.local`

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANTE:** No comitear `.env.local` a Git

### c) Verificar Email "From"

En `src/lib/email/resend-client.ts`, línea 14:

```typescript
from: "congreso@ige.edu.mx", // ← Cambiar al email de tu institución
```

**Nota:** El dominio debe estar verificado en Resend

---

## 3. Configurar Supabase Storage

### a) Crear Bucket

1. Ir a Supabase Dashboard
2. Storage → New Bucket
3. Nombre: **`credentials`**
4. Public: **OFF** (privado, pero URLs públicas)

### b) Configurar Políticas RLS

En SQL Editor de Supabase, ejecutar:

```sql
-- Política para lectura pública (para descargar PDFs)
CREATE POLICY "Public Read Credentials" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'credentials');

-- Política para escritura solo del servidor
CREATE POLICY "Server Only Upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'credentials' 
  AND auth.role() = 'service_role'
);
```

---

## 4. Verificar Campos en BD

Asegurar que la tabla `tickets` tiene:

```sql
-- Campos de asiento (deben existir)
SELECT * FROM information_schema.columns 
WHERE table_name = 'tickets' 
AND column_name IN (
  'asiento_zona',
  'asiento_fila',
  'asiento_numero',
  'asiento_bloque',
  'zone_id',
  'pdf_path',
  'qr_data'
);
```

Si faltan campos, agregarlos:

```sql
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS asiento_zona text,
ADD COLUMN IF NOT EXISTS asiento_fila text,
ADD COLUMN IF NOT EXISTS asiento_numero integer,
ADD COLUMN IF NOT EXISTS asiento_bloque text,
ADD COLUMN IF NOT EXISTS zone_id uuid,
ADD COLUMN IF NOT EXISTS pdf_path text,
ADD COLUMN IF NOT EXISTS qr_data text UNIQUE;
```

---

## 5. Probar Manualmente

### a) En Development Server

```bash
npm run dev
# → http://localhost:3000
```

### b) Crear un Alumno de Prueba

1. Ir a `/register`
2. Rellenar el formulario
3. Enviar

**Esperado:**
- ✅ Usuario creado en Auth
- ✅ Ticket creado en BD
- ✅ Asiento asignado
- ✅ PDF generado
- ✅ Email enviado

### c) Verificar Email

1. Ir a [Resend Dashboard](https://dashboard.resend.com)
2. Emails → Ver último enviado
3. Verificar que llegó correctamente

### d) Descargar PDF

1. Ir a Supabase Dashboard
2. Storage → credentials
3. Descargar el PDF generado
4. Verificar:
   - Datos correctos
   - Asiento visible
   - QR escaneable

---

## 6. Probar Escaneo de QR

### a) Abrir `/dashboard/escaner`

1. Iniciar sesión como staff
2. Navegar a `/dashboard/escaner`
3. Seleccionar "Día 1"

### b) Escanear PDF del Alumno

1. Mostrar el PDF en otra pantalla
2. Apuntar cámara al QR del PDF
3. Debería mostrar: ✅ ACCESO CONCEDIDO
4. Mostrar datos del alumno

---

## 7. Checklist Pre-Producción

- [ ] RESEND_API_KEY configurado
- [ ] Bucket `credentials` creado en Supabase
- [ ] Políticas RLS configuradas
- [ ] Tabla `tickets` con todos los campos
- [ ] Prueba de registro completa
- [ ] Email recibido correctamente
- [ ] PDF descargable
- [ ] QR escaneable
- [ ] Escáner funciona con el QR
- [ ] No hay errores en console

---

## 8. Troubleshooting Rápido

### "Error: RESEND_API_KEY undefined"
→ Agregar a `.env.local` y reiniciar servidor

### "Error: Bucket credentials not found"
→ Crear bucket en Supabase Storage

### "Error al enviar email"
→ Verificar clave Resend en Dashboard

### "El asiento no se asigna"
→ Revisar que `auditorioConfig.ts` está bien configurado

### "El PDF no se genera"
→ Revisar logs en servidor (npm run dev)

---

## 9. Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/lib/credentials/pdf-generator.ts` | Genera PDF |
| `src/lib/credentials/seat-assignment.ts` | Asigna asientos |
| `src/lib/credentials/storage.ts` | Sube a Supabase |
| `src/lib/email/resend-client.ts` | Envía emails |
| `src/app/auth/actions-credentials.ts` | Orquesta todo |
| `src/app/auth/actions.ts` | Integración con registro |
| `src/config/auditorioConfig.ts` | Configuración de zonas |

---

## 10. Monitoreo en Producción

### Logs Recomendados

```typescript
// Agregar en acciones críticas:
console.log(`[CREDENTIAL] Ticket ${ticketId} procesado`);
console.log(`[CREDENTIAL] Asiento asignado: ${seatData}`);
console.log(`[CREDENTIAL] PDF subido: ${pdfUrl}`);
console.log(`[CREDENTIAL] Email enviado a ${email}`);
```

### Alertas Sugeridas

- ⚠️ Si más del 90% de asientos están ocupados
- ⚠️ Si hay fallas repetidas en envío de emails
- ⚠️ Si Storage se está quedando sin espacio

---

## Estado Actual ✅

- ✅ Código implementado
- ✅ TypeScript validado
- ✅ Estructura lista
- ⏳ Aguardando configuración de RESEND_API_KEY
- ⏳ Aguardando setup de Supabase Storage

**Próximo paso:** Configurar RESEND_API_KEY y probar con un registro real

---

**Última actualización:** 2026-06-06
