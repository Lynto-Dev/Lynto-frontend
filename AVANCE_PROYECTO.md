# 📊 INFORME MASTER DE AVANCE DE PROYECTO: FRONTEND Y BACKEND

**Proyecto:** Landing Page Preventa Suplemento "Lynto"  
**Estado General:** 🟡 **Base de Datos Parcial | Esqueleto Frontend Básico | Pruebas de Integración Pendientes**  
**Dominio Oficial:** [https://lynto.cl](https://lynto.cl) (HTTPS / SSL Activo en Cloudflare)  
**Plazo:** Lanzamiento Programado para Agosto de 2026  
**Última Actualización:** 24 de Julio de 2026  

---

## 🔍 1. Estado Real de la Base de Datos (Google Sheets / Excel)

La planilla de origen (`docsteam/Sistema_Preventa_Lynto.xlsx`) **NO contiene todas las tablas ni todas las columnas necesarias**. Actualmente solo cuenta con 4 pestañas:

1. **`Inventario`** (`SKU`, `Nombre`, `Precio`, `Stock`)
2. **`Pedidos`** (`ID Pedido`, `Fecha`, `Nombre`, `RUT`, `Email`, `Dirección`, `Cantidad`, `Monto Total`, `Estado`, `Flow Order ID`)
3. **`Configuracion`** (`Clave`, `Valor`, `Descripción`) -> *Incompleta en textos reales.*
4. **`Nutricion`** (`Componente`, `Cantidad`, `DDR`) -> *Incompleta en ingredientes.*

### ⚠️ Consecuencias Directas para el Desarrollo:
* **Para Backend 2:** Faltan las pestañas `Suscriptores`, `Cupones` y `TarifasEnvio` en el documento base del cliente. Si Apps Script intenta escribir suscripciones o consultar cupones/envíos sin que las pestañas existan en la planilla oficial de producción, las funciones `registrarSuscriptor`, `obtenerDescuentoCupon` y `obtenerCostoEnvio` fallarán o lanzarán errores en ejecución.
* **Para Frontend Dev:** No se pueden programar ni probar los componentes de cupones promocionales ni el selector regional de envíos en la interfaz hasta que la estructura de la base de datos esté regularizada.

---

## 🧪 2. Diagnóstico Técnico y Pruebas Pendientes por Realizar

### 🔑 Pasarela de Pagos (Flow API Keys)
* Las credenciales (ApiKey y SecretKey) de Flow **ya fueron entregadas por las clientas**, pero **NO se han probado**. Solo se han ejecutado llamadas de prueba básicas en el entorno Sandbox.

### ❌ Pruebas NO Realizadas (Pendientes de Validación):
1. **Flujo Transaccional en Dos Fases (Intención `doPost` y Webhook S2S):** No se han probado casos de borde, fallos de conexión, cancelaciones o reintentos del webhook en condiciones reales.
2. **Módulo de Newsletter:** El formulario de suscripción del pie de página **NO ha sido probado de punta a punta** (desde el click del usuario hasta el guardado en Sheets).
3. **Reflejo de Mutaciones (Sheets ➔ Web):** No se ha verificado si los cambios editados manualmente en las celdas de Google Sheets se reflejan correctamente y sin errores en la página web.
4. **Calculadoras de Tarifas de Envío y Cupones:** No se han probado las funciones de cálculo de costo regional ni el descuento promocional integrados en el flujo.
5. **Prueba de Concurrencia y Estrés (`LockService`):** No se ha realizado una prueba simulando compras simultáneas en el mismo segundo sobre stock crítico (`Stock = 1`) para garantizar que `LockService` evite sobreventas.
6. **Seguridad Frontend (Inyección de Datos):** El Frontend Dev debe implementar sanitización estricta e inhabilitar la manipulación del DOM/HTML antes de enviar la petición `POST` para prevenir vulnerabilidades de inyección de código (XSS) o alteración de inputs.
7. **Sistema de Correos y Notificaciones:** No se ha configurado el correo corporativo (ej. `contacto@lynto.cl`) ni se ha programado la plantilla de correos que le deben llegar al cliente tras completar la compra.
8. **Diseño CSS y Maquetación:** El frontend actual es únicamente un **esqueleto HTML básico** con placeholders (`[Insertar gancho...]`) y CSS minimalista sin diseño visual definitivo.

---

## 🧑‍💻 3. Desglose Distribuido de Tareas por Desarrollador y Rol

### 👤 Rol 1: Tech Lead & DevOps
**Misión:** Infraestructura, aseguramiento de red, seguridad criptográfica y control de calidad.

* **🟢 Completado:**
  * Repositorios desacoplados `Lynto-frontend` y `Lynto-backend` versionados con Git y `clasp`.
  * Dominio `lynto.cl` en vivo en NIC Chile + Cloudflare DNS (SSL Activo).
  * Cloudflare Edge Worker (`lynto-return-worker`) en `lynto.cl/return*` resolviendo la redirección HTTP 303 a `exito.html` (evitando error 405).
  * Algoritmo HMAC-SHA256 según especificación OpenAPI v3 de Flow.
* **🔴 Desarrollar / Probar:**
  * Ejecutar prueba de concurrencia/estrés simulando compras simultáneas sobre stock `1` para validar `LockService`.
  * Probar la integración de las llaves API de Flow entregadas por las clientas.
  * Configuración de DNS y remitente para correo corporativo (`contacto@lynto.cl`).

---

### 👤 Rol 2: Backend 2
**Misión:** Estructura de Base de Datos, endpoints API, lectura dinámica, notificaciones por correo y calculadoras.

* **🟢 Completado:**
  * Endpoints `doPost` y `doGet` iniciales con validaciones de RUT (Módulo 11), email y cantidad.
  * Lógica atómica de inventario con `LockService`.
* **🔴 Desarrollar / Probar:**
  * **Estructura de Base de Datos:** Crear y estructurar en la planilla oficial del cliente las pestañas y columnas faltantes (`Suscriptores`, `Cupones`, `TarifasEnvio`) para evitar fallos de ejecución.
  * **Programar API `get_config`:** Finalizar en `doGet.js` la lectura de `"Configuracion"` y `"Nutricion"` sirviendo el JSON estructurado al front.
  * **Prueba de Newsletter:** Probar que la suscripción guarde el email correctamente en la pestaña `Suscriptores`.
  * **Prueba de Calculadoras (Envío y Cupones):** Probar el comportamiento de `obtenerCostoEnvio` y `obtenerDescuentoCupon`.
  * **Envío de Correos al Cliente:** Programar plantilla HTML transaccional que se active automáticamente cuando un pedido cambie a `PAGADO`.
  * **Alertas Internas a las Fundadoras:** Enviar correo de notificación ante cada nueva venta.

---

### 👤 Rol 3: Especialista Frontend
**Misión:** Maquetación estética a mano, experiencia de usuario (UI/UX), inyección dinámica y seguridad DOM.

* **🟢 Completado:**
  * Esqueleto HTML5 semántico (`index.html`, `exito.html`, `terminos.html`, `privacidad.html`).
  * Formateador de RUT chileno en vivo y controlador de cantidad.
* **🔴 Desarrollar / Probar:**
  * **Seguridad y Sanitización:** Asegurar que el DOM no pueda ser manipulado antes del envío `POST` y sanitizar todas las entradas para evitar inyecciones XSS / HTML.
  * **Rediseño Estético Visual (CSS):** Escribir la maquetación CSS definitiva en `assets/css/style.css` (Google Fonts, tipografía, paleta HSL, sombras, gradientes y micro-animaciones).
  * **Inyección Dinámica:** Implementar el `fetch` GET a `API_URL?action=get_config` para reemplazar los placeholders del HTML por datos reales de Sheets.
  * **Verificación de Mutaciones:** Probar que cuando se modifiquen los valores en Sheets, la web se actualice sin romper el diseño.
  * **Desglose en Checkout:** Agregar casilla de cupón y selector de región con actualización visual de montos.

---

## 🎯 4. Tareas Organizadas por Prioridad por Cada Desarrollador

### 🟢 PRIORIDAD 1: Tech Lead & DevOps
1. `[ ]` **Prueba de Concurrencia (`LockService`):** Ejecutar script de peticiones simultáneas sobre `Stock = 1` y verificar bloqueo de sobreventa.
2. `[ ]` **Prueba de Llaves API de Flow:** Probar la firma y credenciales entregadas por las clientas.
3. `[ ]` **Configuración de Correo Corporativo:** Habilitar el dominio en el servicio de correo para envíos transaccionales.

### 🟢 PRIORIDAD 1: Backend 2
1. `[ ]` **Estructura de Base de Datos:** Crear en la planilla oficial del cliente las pestañas y columnas faltantes (`Suscriptores`, `Cupones`, `TarifasEnvio`) para no romper el backend.
2. `[ ]` **API `get_config`:** Programar y probar la lectura de `"Configuracion"` y `"Nutricion"` para alimentar el front.
3. `[ ]` **Prueba de Newsletter:** Probar que la suscripción guarde el email correctamente en la pestaña `Suscriptores`.
4. `[ ]` **Prueba de Calculadoras (Envío y Cupones):** Probar el comportamiento de `obtenerCostoEnvio` y `obtenerDescuentoCupon`.
5. `[ ]` **Envío de Correos al Cliente:** Programar plantilla HTML transaccional que se active automáticamente cuando un pedido cambie a `PAGADO`.

### 🟢 PRIORIDAD 1: Especialista Frontend
1. `[ ]` **Seguridad DOM y Sanitización:** Proteger los inputs contra inyección XSS y prevenir la manipulación del DOM antes de enviar el `POST`.
2. `[ ]` **Rediseño Visual CSS:** Diseñar los estilos finales en `assets/css/style.css` (acabado wellness/premium).
3. `[ ]` **Inyección Dinámica de Contenidos:** Implementar `fetch` GET a `get_config` para reemplazar placeholders por datos de Sheets.
4. `[ ]` **Prueba de Mutaciones:** Verificar que cambiar textos o fotos en Sheets actualice la web limpiamente.
