# 📊 INFORME MASTER DE AVANCE DE PROYECTO: FRONTEND Y BACKEND

**Proyecto:** Landing Page Preventa Suplemento "Lynto"  
**Estado General:** 🟢 **Avance Global del Proyecto: ~68% | Backend y Notificaciones al 92% | Pendiente Rediseño CSS e Inyección Dinámica**  
**Dominio Oficial:** [https://lynto.cl](https://lynto.cl) (HTTPS / SSL Activo en Cloudflare + Edge Worker)  
**Plazo:** Lanzamiento Programado para Agosto de 2026  
**Última Actualización:** 25 de Julio de 2026  

---

## 🔍 1. Resumen Ejecutivo y Porcentajes Reales de Progreso

Se realizó un recorrido completo archivo por archivo sobre ambos repositorios (`Lynto-backend` y `Lynto-frontend`). La arquitectura del servidor, la pasarela de pagos y el sistema de correos transaccionales están prácticamente concluidos, mientras que el área visual del frontend y la carga dinámica de contenidos desde Google Sheets representan el mayor trabajo pendiente.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                PROGRESO REAL POR MÓDULOS                         │
│                                                                                  │
│ [===================================>            ]  68%  AVANCE GLOBAL TOTAL    │
│                                                                                  │
│  - BACKEND CORE & ESTRUCTURA DB:       🟢 92%  (Pestañas autogeneradas y seguras) │
│  - SISTEMA DE NOTIFICACIONES Y EMAIL: 🟢 95%  (Módulo mail.js HTML transaccional)│
│  - PASARELA FLOW (SANDBOX):            🟢 90%  (Firma HMAC v3 y Worker Edge ok)   │
│  - FRONTEND ARQUITECTURA & JS:         🟡 60%  (RUT, fetch, checkout preliminar)  │
│  - BASE DE DATOS Y CONTENIDOS:        🟡 70%  (7 pestañas ok, falta datos clientas)│
│  - FRONTEND UI/UX & DISEÑO CSS:        🔴 25%  (Esqueleto HTML básico)            │
│  - PRUEBAS DE ESTRÉS Y SEGURIDAD:      🔴 20%  (Pendiente concurrencia y XSS)     │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ 2. Recorrido por Módulos e Implementaciones

### 2.1. Backend (`Lynto-backend`) ➔ 🟢 **92% Implementado**
* **`src/config.js` (100%):** Getters dinámicos que leen `PropertiesService` en tiempo real (`SPREADSHEET_ID`, `FLOW_API_KEY`, `FLOW_SECRET_KEY`, `FLOW_API_URL`, `FLOW_MOCK_MODE`) con sanitización de mayúsculas y espacios.
* **`src/db.js` (95%):**
  * `inicializarEstructuraSheets()`: Escanea y auto-crea defensivamente las 7 pestañas (`Inventario`, `Pedidos`, `Configuracion`, `Nutricion`, `Suscriptores`, `Cupones`, `TarifasEnvio`) mediante `asegurarEncabezados()`.
  * `confirmarPagoYDescontarStock()`: Mutación atómica con `LockService` y disparo automático de notificaciones por email.
  * `obtenerConfiguracionDeSheet()` y `obtenerNutricionDeSheet()`: Carga dinámica para `get_config`.
  * Calculadoras de servidor `obtenerDescuentoCupon()` y `obtenerCostoEnvio()`.
* **`src/mail.js` (95%):** *(Módulo de correos agregado por Backend 2)*
  * `enviarCorreoConfirmacionCliente(pedido)`: Email HTML de confirmación al cliente post-pago con resumen completo de la orden en CLP y aviso de despacho.
  * `enviarAlertaFundadoras(pedido)`: Email de notificación automática al equipo de Lynto tras cada venta.
  * Disparo automático al pasar un pedido al estado `PAGADO`.
* **`src/flow.js` (100%):** Integración oficial Flow API v2 (`/payment/create` en `application/x-www-form-urlencoded` y `/payment/getStatus`).
* **`src/utils.js` (100%):** Firma HMAC-SHA256 especificación OpenAPI v3 (`key1val1key2val2`), validadores RUT Módulo 11 y Email.
* **`src/doGet.js` y `src/doPost.js` (95%):** Enrutador `GET` (`get_config`, `init_db`, `client_return`, `renderHealthCheck`) y `POST` (`procesarIntencionCompra` Zero-Trust, `procesarWebhook` S2S).

---

### 2.2. Frontend (`Lynto-frontend`) ➔ 🟡 **45% Implementado**
* **`index.html` (40%):** Esqueleto HTML5 semántico con secciones Hero, Producto, Nutrición, Nosotras, Checkout y Newsletter.  
  * 🔴 *Pendiente:* Reemplazar placeholders (`[Insertar gancho...]`, `[Componente 1]`) mediante la llamada dinámica `get_config`.
  * 🔴 *Pendiente:* Agregar selector de región para envío y casilla de cupones promocionales.
* **`assets/css/style.css` (25%):** Maquetación CSS preliminar básica.  
  * 🔴 *Pendiente:* Rediseño estético visual completo de alto impacto (Google Fonts `Outfit`/`Inter`, paleta HSL wellness, sombras suaves, glassmorphism, gradientes, animaciones y acabados responsive premium).
* **`assets/js/app.js` (60%):** Formateador y validador de RUT Módulo 11 en tiempo real, controlador de cantidad (1 a 10), fetch POST Zero-Trust e inhabilitador de doble clic.  
  * 🔴 *Pendiente:* Implementar `fetch` GET a `action=get_config` para inyectar contenidos dinámicos.  
  * 🔴 *Pendiente:* Sanitización de entradas y protección contra inyección de código (XSS) y manipulación del DOM antes del POST.
* **`exito.html`, `terminos.html`, `privacidad.html` (90%):** Vistas normativas y de confirmación post-pago con navegación limpia `target="_top"`.

---

### 2.3. Infraestructura Edge & Cloud ➔ 🟢 **95% Implementado**
* **Cloudflare Worker (`lynto-return-worker`):** En `lynto.cl/return*`, intercepta `POST` de Flow y responde `HTTP 303 See Other` directo a `exito.html?token=...`, eliminando el error `405 Method Not Allowed`.
* **Cloudflare DNS & SSL:** Dominio `lynto.cl` activo con Proxy Nube Naranja 🧡.

---

## 🧑‍💻 3. Desglose Distribuido de Tareas por Desarrollador y Rol

### 👤 Rol 1: Tech Lead & DevOps (Infraestructura, QA y Seguridad)
* **🟢 Completado:**
  * Repositorios desacoplados `Lynto-frontend` y `Lynto-backend` versionados con Git y `clasp`.
  * Dominio `lynto.cl` en vivo en NIC Chile + Cloudflare DNS con SSL/HTTPS activo.
  * Cloudflare Edge Worker (`lynto-return-worker`) activo en `lynto.cl/return*` (HTTP 303).
  * Firma HMAC-SHA256 conforme a especificación OpenAPI v3 de Flow.
  * Pruebas de integración End-to-End aprobadas en Webpay Sandbox (`597020000540`).
* **🔴 Pendiente por Ejecutar:**
  * **Prueba de Concurrencia y Estrés (`LockService`):** Ejecutar script que simule 5 a 10 compras simultáneas en el mismo segundo sobre `Stock = 1` para comprobar que `LockService` evite sobreventas.
  * **Prueba de Llaves de Producción:** Probar credenciales reales de Flow cuando sean entregadas por las clientas.
  * **Configuración de Correo Corporativo:** Configurar DNS y remitente para correo corporativo (`contacto@lynto.cl`).

---

### 👤 Rol 2: Backend 2 (BD, APIs, Correos y Calculadoras)
* **🟢 Completado:**
  * Auto-estructuración defensiva de Google Sheets (`asegurarEncabezados`).
  * Endpoint dinámico `GET ?action=get_config` (`obtenerConfiguracionDeSheet` y `obtenerNutricionDeSheet`).
  * Módulo de notificaciones por correo electrónico transaccional y alertas internas (`src/mail.js`).
  * Enrutador manual de base de datos `GET ?action=init_db`.
* **🔴 Pendiente por Ejecutar:**
  * **Prueba de Newsletter de Punta a Punta:** Probar que la suscripción guarde el correo correctamente en `Suscriptores`.
  * **Prueba Integrada de Calculadoras:** Validar `obtenerCostoEnvio` y `obtenerDescuentoCupon` con casos reales.
  * **Verificación de Mutaciones:** Probar que editar celdas en Sheets se refleje en `get_config` sin errores.

---

### 👤 Rol 3: Especialista Frontend (Diseño UI/UX, CSS y Seguridad DOM)
* **🟢 Completado:**
  * Esqueleto HTML5 semántico (`index.html`, `exito.html`, `terminos.html`, `privacidad.html`).
  * Formateador de RUT chileno en tiempo real (Módulo 11) y controlador de cantidad.
  * Petición `fetch` POST Zero-Trust hacia Apps Script.
* **🔴 Pendiente por Ejecutar:**
  * **Seguridad DOM y Sanitización:** Asegurar que el DOM no pueda ser manipulado antes del envío `POST` y sanitizar todas las entradas para evitar inyecciones XSS / HTML.
  * **Rediseño Estético Visual (CSS):** Reescribir `assets/css/style.css` para darle un acabado web de alto impacto (wellness/premium).
  * **Inyección Dinámica de Contenidos:** Implementar `fetch` GET a `get_config` para reemplazar placeholders por datos reales de Sheets.
  * **Desglose en Checkout:** Agregar casilla de cupón y selector de región con actualización visual de montos.

---

## 🎯 4. Tareas Organizadas por Prioridad por Cada Desarrollador

### 🟢 PRIORIDAD 1: Tech Lead & DevOps
1. `[ ]` **Prueba de Concurrencia (`LockService`):** Ejecutar script de peticiones simultáneas sobre `Stock = 1` y verificar bloqueo de sobreventa.
2. `[ ]` **Prueba de Llaves API de Flow:** Probar credenciales reales de producción entregadas por las clientas.
3. `[ ]` **Configuración de Correo Corporativo:** Habilitar el dominio en el servicio de correo para envíos transaccionales.

### 🟢 PRIORIDAD 1: Backend 2
1. `[ ]` **Prueba de Newsletter:** Probar que la suscripción guarde el email correctamente en la pestaña `Suscriptores`.
2. `[ ]` **Prueba de Calculadoras (Envío y Cupones):** Probar el comportamiento de `obtenerCostoEnvio` y `obtenerDescuentoCupon`.
3. `[ ]` **Verificación de Mutaciones:** Comprobar que cambios manuales en celdas de Sheets se reflejen limpiamente en `get_config`.

### 🟢 PRIORIDAD 1: Especialista Frontend
1. `[ ]` **Seguridad DOM y Sanitización:** Proteger los inputs contra inyección XSS y prevenir la manipulación del DOM antes de enviar el `POST`.
2. `[ ]` **Rediseño Visual CSS:** Diseñar los estilos finales en `assets/css/style.css` (acabado wellness/premium).
3. `[ ]` **Inyección Dinámica de Contenidos:** Implementar `fetch` GET a `get_config` para reemplazar placeholders por datos de Sheets.
