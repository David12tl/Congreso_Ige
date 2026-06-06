# 📱 Escáner de Acceso del Staff - Documentación

## 📋 Descripción General

Sistema completo para control de acceso en el Congreso IGE, permitiendo que el personal de staff escanee códigos QR de boletos para registrar la asistencia de alumnas por día.

---

## 🏗️ Estructura Implementada

### 1. **Endpoint API: `/api/tickets/scan/route.ts`**

**Ruta:** `POST /api/tickets/scan`

**Cuerpo del Solicitud:**
```json
{
  "qr_data": "uuid-del-boleto",
  "dia_a_pasar": 1
}
```

**Parámetros:**
- `qr_data` (string): UUID del código QR del boleto
- `dia_a_pasar` (1 | 2): Día del congreso (1 o 2)

**Lógica de Validación:**

1. **Búsqueda del Boleto** → Si no existe, retorna 404 con mensaje: "Error: El código QR no corresponde a ningún boleto válido."

2. **Validación de Duplicados** → Si el boleto ya fue canjeado para ese día:
   - Retorna 400 con alerta: "¡ALERTA! Este boleto ya ingresó el Día X a las HH:MM"

3. **Actualización de BD** → Si todo está bien:
   - Actualiza `attended_day1 = true` y `attended_day1_at = NOW()` (si `dia_a_pasar === 1`)
   - O `attended_day2 = true` y `attended_day2_at = NOW()` (si `dia_a_pasar === 2`)

4. **Respuesta Exitosa (200):**
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

### 2. **Interfaz del Escáner: `/dashboard/escaner/page.tsx`**

**Ubicación:** Protegida por autenticación Next.js (solo staff)

**Componentes Principales:**

#### **Selector de Día**
- Dos botones: "Día 1" y "Día 2"
- Muestra cuál día está activo con glow azul
- Cambiar día reinicia la interfaz

#### **Lector de QR**
- **Tecnología:** HTML5-QRCode
- **Cámara:** Frontal (environment) del dispositivo
- **FPS:** 10 fotogramas por segundo
- **Detección:** 250x250px de área de enfoque

**Flujo de Lectura:**
1. El usuario toca "Iniciar Cámara"
2. Se solicita permiso de cámara (solo la primera vez)
3. Al detectar un QR:
   - Pausa automáticamente la lectura (2 segundos)
   - Envía la solicitud a `/api/tickets/scan`
   - Muestra el resultado visual
   - Reanuda automáticamente la lectura

#### **Resultados Visuales**

**✅ ACCESO CONCEDIDO (Verde)**
- Fondo verde brillante con glow
- Check gigante (✓)
- Nombre del alumno
- Matrícula, carrera, UA
- **Asiento en grande:** "LUNETA Fila J Asiento 12"
- Se auto-cierra después de 5 segundos

**❌ ACCESO DENEGADO (Rojo)**
- Fondo rojo parpadeante
- Cruz gigante (✕)
- Mensaje exacto del error
- Código de error para referencia del staff
- No se auto-cierra (permite reintentar)

#### **Entrada Manual**
- Campo de texto para escribir el QR manualmente
- Botón "✓ Enviar" para procesar
- Útil si la cámara no enfoca bien

---

## 🚀 Cómo Usar

### **Acceder al Escáner**

1. Iniciar sesión como staff en el dashboard
2. Navegar a `/dashboard/escaner`
3. Seleccionar el día (1 o 2)

### **Escanear un Boleto**

1. Tocar "🎥 Iniciar Cámara"
2. Permitir acceso a la cámara (si se solicita)
3. Apuntar la cámara al código QR del boleto
4. La detección es automática
5. Leer el resultado en pantalla

### **Si no funciona la cámara**

1. Usar la entrada manual en la parte inferior
2. Escribir el UUID del QR
3. Tocar "✓ Enviar"

---

## 🔒 Seguridad

✅ **Validaciones Implementadas:**
- Búsqueda exacta por `qr_data` (no parciales)
- Prevención de duplicados por día
- Timestamps automáticos (zona horaria del servidor)
- Respuestas HTTP apropiadas por caso
- Manejo de errores silenciosos en cliente

---

## 📊 Campos de BD Utilizados

| Campo | Tipo | Propósito |
|-------|------|----------|
| `qr_data` | STRING | Búsqueda del boleto |
| `attended_day1` | BOOLEAN | ¿Asistió Día 1? |
| `attended_day1_at` | TIMESTAMP | Hora de acceso Día 1 |
| `attended_day2` | BOOLEAN | ¿Asistió Día 2? |
| `attended_day2_at` | TIMESTAMP | Hora de acceso Día 2 |
| `nombre` | STRING | Mostrar en pantalla |
| `matricula` | STRING | Mostrar en pantalla |
| `carrera` | STRING | Mostrar en pantalla |
| `asiento_zona` | STRING | Ubicación del asiento |
| `asiento_fila` | STRING | Ubicación del asiento |
| `asiento_numero` | INT | Ubicación del asiento |

---

## 🛠️ Instalación de Dependencias

```bash
npm install html5-qrcode
```

---

## 📱 Compatibilidad

✅ **Dispositivos Soportados:**
- Smartphones Android con cámara
- Tablets iOS con cámara
- Laptops con cámara web

⚠️ **Requisitos:**
- Navegador moderno (Chrome, Safari, Firefox, Edge)
- Permisos de cámara habilitados
- HTTPS en producción (requerido para acceso a cámara)

---

## 🐛 Solución de Problemas

### **"No se pudo acceder a la cámara"**
- Verificar que el navegador tiene permiso para usar la cámara
- Probar con HTTPS (HTTP no permite acceso a cámara en algunos navegadores)
- Reintentar en una pestaña privada

### **"El código QR no corresponde a ningún boleto válido"**
- Verificar que el QR es válido
- Confirmar que el boleto existe en la BD
- Usar la entrada manual si la cámara tiene problemas

### **"¡ALERTA! Este boleto ya ingresó"**
- El alumno ya pasó para este día
- Verificar que es la primera vez que ingresa
- Contactar a administración si hay error

### **Lectura repetida de QRs**
- El sistema pausa 2 segundos automáticamente
- Si sigue detectando el mismo QR, es porque la cámara enfoca el mismo código
- Apartar el dispositivo después del acceso concedido

---

## 📈 Próximas Mejoras Sugeridas

- [ ] Historial de escaneos en tiempo real
- [ ] Reportes por hora/zona/carrera
- [ ] Validación adicional (DNI, foto)
- [ ] Sincronización con lista de espera
- [ ] SMS/Email de confirmación
- [ ] Modo oscuro automático

---

**Versión:** 1.0  
**Última actualización:** 2026-06-06  
**Estado:** ✅ Listo para producción
