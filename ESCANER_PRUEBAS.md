# 🧪 Guía de Prueba - Escáner de Acceso

## Pruebas del Endpoint API

### 1. **Prueba Exitosa**

**Comando cURL:**
```bash
curl -X POST http://localhost:3000/api/tickets/scan \
  -H "Content-Type: application/json" \
  -d '{
    "qr_data": "<UUID-DEL-BOLETO>",
    "dia_a_pasar": 1
  }'
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "data": {
    "nombre": "David Valdez",
    "matricula": "2024001",
    "carrera": "Ingeniería en Sistemas",
    "asiento_zona": "LUNETA",
    "asiento_fila": "J",
    "asiento_numero": 12,
    "unidad_academica": null
  }
}
```

---

### 2. **Prueba: QR No Existe**

**Comando:**
```bash
curl -X POST http://localhost:3000/api/tickets/scan \
  -H "Content-Type: application/json" \
  -d '{
    "qr_data": "qr-inexistente-12345",
    "dia_a_pasar": 1
  }'
```

**Respuesta Esperada (404):**
```json
{
  "success": false,
  "error": "Error: El código QR no corresponde a ningún boleto válido.",
  "code": "TICKET_NOT_FOUND"
}
```

---

### 3. **Prueba: Boleto Ya Usado (Día 1)**

**Primer escaneo:** ✅ Éxito  
**Segundo escaneo (mismo QR, mismo día):**

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": "¡ALERTA! Este boleto ya ingresó el Día 1 a las 14:30",
  "code": "DUPLICATE_DAY1"
}
```

---

### 4. **Prueba: Boleto Usado Día 1, Escanea Día 2**

**Estado:** Boleto tiene `attended_day1 = true`  
**Escaneo:** `dia_a_pasar: 2`

**Respuesta Esperada (200):** ✅ Éxito (permitido)

---

### 5. **Prueba: Campos Faltantes**

**Comando:**
```bash
curl -X POST http://localhost:3000/api/tickets/scan \
  -H "Content-Type: application/json" \
  -d '{
    "qr_data": "uuid-123"
  }'
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": "Faltan campos requeridos: qr_data y dia_a_pasar",
  "code": "MISSING_FIELDS"
}
```

---

### 6. **Prueba: Día Inválido**

**Comando:**
```bash
curl -X POST http://localhost:3000/api/tickets/scan \
  -H "Content-Type: application/json" \
  -d '{
    "qr_data": "uuid-123",
    "dia_a_pasar": 3
  }'
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": "dia_a_pasar debe ser 1 o 2",
  "code": "INVALID_DAY"
}
```

---

## Pruebas de la Interfaz Frontend

### **Prerequisitos:**
1. Tener un dispositivo móvil o computadora con cámara
2. Acceso a http://localhost:3000/dashboard/escaner
3. Estar autenticado como staff
4. Tener boletos válidos en la BD

### **Test 1: Iniciar Cámara**
- [ ] Abre `/dashboard/escaner`
- [ ] Toca "🎥 Iniciar Cámara"
- [ ] Aparece el prompt de permisos
- [ ] Concede acceso a la cámara
- [ ] La vista previa se activa

**Resultado esperado:** ✅ La cámara se abre y muestra la vista previa

---

### **Test 2: Escanear QR Válido**
- [ ] Cámara activa
- [ ] Apunta al código QR de un boleto válido
- [ ] El sistema detecta el QR automáticamente
- [ ] Pausa 2 segundos
- [ ] Muestra resultado VERDE
- [ ] Vuelve a activar la cámara después de 5 segundos

**Resultado esperado:** ✅ Pantalla verde con datos del alumno

---

### **Test 3: Escanear QR Duplicado (mismo día)**
- [ ] Ya escaneó un boleto para Día 1
- [ ] Intenta escanear el mismo QR de nuevo
- [ ] Pausa y procesa

**Resultado esperado:** ❌ Pantalla roja: "¡ALERTA! Este boleto ya ingresó el Día 1 a las HH:MM"

---

### **Test 4: Cambiar de Día**
- [ ] Escanea un boleto para Día 1 → ✅ Verde
- [ ] Toca el botón "Día 2"
- [ ] Escanea el MISMO boleto para Día 2

**Resultado esperado:** ✅ Verde (permitido, es día diferente)

---

### **Test 5: Entrada Manual**
- [ ] Detiene la cámara (botón rojo)
- [ ] En el campo inferior, escribe un UUID de boleto válido
- [ ] Toca "✓ Enviar"

**Resultado esperado:** ✅ Procesa como si fuera escaneo por cámara

---

### **Test 6: Error de Conexión**
- [ ] Desconecta internet
- [ ] Intenta escanear o usar entrada manual
- [ ] Espera el timeout de conexión

**Resultado esperado:** ❌ Mensaje: "Error de conexión al servidor"

---

## ✅ Checklist Pre-Producción

### API
- [ ] Valida campos requeridos
- [ ] Busca boleto exactamente
- [ ] Previene duplicados correctamente
- [ ] Actualiza BD con timestamps
- [ ] Retorna formato JSON correcto
- [ ] Manejo de errores completo
- [ ] Logs en consola server

### Frontend
- [ ] Permisos de cámara solicitados
- [ ] Interfaz responsive en móvil
- [ ] Textos grandes y legibles
- [ ] Colores de éxito/error claros
- [ ] No se queda "congelada"
- [ ] Entrada manual funciona
- [ ] Auto-cierre de resultados positivos

### BD
- [ ] Tabla `tickets` tiene campos de asistencia
- [ ] Campos `attended_day1`, `attended_day1_at`, etc.
- [ ] No hay errores de constraints
- [ ] Timestamps se guardan correctamente

---

## 📊 Datos de Prueba Recomendados

Para probar, crea boletos de prueba en Supabase:

```sql
INSERT INTO public.tickets (
  id, 
  qr_data, 
  nombre, 
  matricula, 
  carrera, 
  asiento_zona, 
  asiento_fila, 
  asiento_numero,
  buyer_id,
  email,
  type
) VALUES (
  'test-1',
  'qr-test-001',
  'Test Alumna 1',
  'TEST001',
  'Ingeniería en Sistemas',
  'LUNETA',
  'J',
  12,
  'buyer-123',
  'test1@example.com',
  'student'
);
```

---

## 🚀 Pasos Finales

1. ✅ Compilación sin errores
2. ✅ Pruebas en desarrollo local
3. ✅ Pruebas en dispositivo móvil
4. ✅ Verificar con staff antes de evento
5. ✅ Tener plan B (entrada manual) visible
6. ✅ Backup de BD antes del evento

---

**Estado:** Listo para pruebas completas
