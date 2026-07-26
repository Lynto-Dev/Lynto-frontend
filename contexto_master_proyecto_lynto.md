# Documento Master de Contexto Integral del Proyecto
## Preventa E-Commerce Suplementos "Lynto"

> **Compilación General del Proyecto:** Documentación técnica exhaustiva basada en la auditoría completa de los repositorios `Lynto-frontend` y `Lynto-backend`, la documentación del cliente (`docsteam`) y los componentes desplegados en la nube.

---

## 📌 1. Ficha Técnica del Proyecto

* **Nombre del Proyecto:** Landing Page Preventa Suplemento Alimenticio "Lynto"
* **Cliente:** Startup Lynto (Nutrición y Bienestar Activo)
* **Presupuesto Acordado:** $149.990 CLP
* **Plazo de Entrega:** 8 Días (Lanzamiento oficial programado para Agosto de 2026)
* **Dominio Oficial:** `https://lynto.cl` (HTTPS / SSL Activo)
* **Modelo Operativo:** **Serverless Puro ($0 Costo Fijo Mensual de Servidores)**
* **Repositorios:**
  * Frontend: `https://github.com/Lynto-Dev/Lynto-frontend.git`
  * Backend: `https://github.com/Lynto-Dev/Lynto-backend.git`

---

## 🏗️ 2. Arquitectura y Stack Tecnológico (No Negociable)

El sistema utiliza una arquitectura **completamente Serverless y desacoplada** para garantizar la propiedad 100% del código para las clientas y la ausencia total de costos fijos de servidor.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                ARQUITECTURA DE INGENIERÍA                              │
│                                                                                        │
│ ┌───────────────────────────┐    HTTP POST (Payload Zero-Trust) ┌────────────────────┐ │
│ │ FRONTEND (GitHub Pages)   ├──────────────────────────────────►│ BACKEND API (GAS)  │ │
│ │ - HTML5 / Vanilla JS      │                                   │ - Google Apps Script│ │
│ │ - lynto.cl (Tailwind CDN) │◄──────────────────────────────────┤ - doPost(e) / doGet│ │
│ └─────────────▲─────────────┘     URL Redirección a Flow        └─────────┬──────────┘ │
│               │                                                           │            │
│               │ HTTP 303 Redirect                                         │ Persistencia│
│               │                                                           ▼            │
│ ┌─────────────┴─────────────┐    Flow Webhook S2S (Token)       ┌────────────────────┐ │
│ │ EDGE WORKER (Cloudflare)  │◄──────────────────────────────────┤ GOOGLE SHEETS (BD) │ │
│ │ - lynto.cl/return*        │                                   │ - 7 Pestañas       │ │
│ └─────────────▲─────────────┘                                   └────────────────────┘ │
│               │                                                                        │
│               │ POST Retorno de Cliente                                                │
│ ┌─────────────┴─────────────┐                                                          │
│ │ PASARELA FLOW API v2      │                                                          │
│ │ - Webpay, Mach, Banco     │                                                          │
│ └───────────────────────────┘                                                          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Tecnologías Utilizadas:
* **Frontend (La Vitrina):** HTML5 Semántico, Vanilla JavaScript (ES6+), Tailwind CSS (vía CDN) y CSS3 nativo. Cero empaquetadores (sin Node.js, React ni Vite). Hosting en **GitHub Pages**.
* **Backend API (El Motor):** **Google Apps Script (GAS)** expuesto como Web App (`doPost` / `doGet`). Serverless puro con ejecución por demanda.
* **Base de Datos (La Bodega):** **Google Sheets** Máster (`1yreX-kjbP6JCEQfM6hPjt5Hx8ADeQxb3TpH7d8uElwI`) autogestionable por las clientas.
* **Pasarela de Pagos:** API Oficial v2 de **Flow.cl** (Webpay, Mach, Transferencias bancarias).
* **Edge Routing & SSL:** **Cloudflare DNS + Proxy 🧡** y **Cloudflare Worker** (`lynto-return-worker`).

---

## 🔎 3. Recorrido Exhaustivo del Repositorio `Lynto-frontend`

El repositorio de la interfaz contiene la landing page estática lista para ser servida globalmente vía GitHub Pages:

### 📄 Archivos del Repositorio:
* **`index.html`:** Landing page principal One-Page.
  * *Estructura:* Navegación responsiva, Sección Hero, Presentación del Suplemento, Tabla Nutricional dinámica, Sección "Nosotras", Formulario de Checkout Zero-Trust y Formulario de Newsletter en el footer.
  * *Estado actual:* Contiene placeholders de texto (`[Insertar gancho de la marca]`, `[Historia...]`) pendientes de ser reemplazados por el fetch dinámico `get_config` o por textos reales.
* **`exito.html`:** Vista de confirmación de compra post-pago.
  * *Estructura:* Diseño limpio de agradecimiento con botón *"Volver al Inicio"* utilizando `target="_top"` para navegación limpia.
* **`terminos.html` y `privacidad.html`:** Vistas normativas y legales obligatorias.
* **`assets/css/style.css`:** Hojas de estilos nativas.
  * *Estado actual:* Contiene maquetación CSS preliminar básica. Pendiente rediseño visual de alto impacto (Google Fonts, paleta HSL wellness, sombras suaves, gradientes y micro-animaciones).
* **`assets/js/app.js`:** Controlador JavaScript Vanilla del cliente.
  * *Funcionalidades:*
    * Configuración dinámica de `API_URL` (soporta `localStorage` para pruebas de desarrolladores).
    * Control de cantidad de producto (Límite 1 a 10 unidades con mensajes).
    * Formateador y validador de RUT chileno en tiempo real (Módulo 11).
    * Manejo de la petición `fetch` POST Zero-Trust hacia Apps Script.
    * Modal overlay con spinner para prevenir el doble clic.
    * Captura de suscripciones al Newsletter del pie de página.

---

## 🔎 4. Recorrido Exhaustivo del Repositorio `Lynto-backend`

El repositorio del servidor contiene las funciones de Apps Script sincronizadas localmente mediante la CLI `clasp`:

### 📄 Archivos del Repositorio:
* **`src/appsscript.json`:** Manifiesto de configuración de la Web App en Google Cloud.
  * *Configuración:* Ejecución como el usuario propietario (`USER_DEPLOYING`) y acceso público (`ANYONE`).
* **`src/config.js`:** Gestor centralizado de configuración.
  * *Funcionalidades:* Getters dinámicos que leen `PropertiesService` (`SPREADSHEET_ID`, `FLOW_API_KEY`, `FLOW_SECRET_KEY`, `FLOW_API_URL`, `FLOW_MOCK_MODE`) con sanitización de mayúsculas/espacios.
* **`src/db.js`:** Capa de abstracción de Base de Datos sobre Google Sheets.
  * *Funcionalidades:*
    * `inicializarEstructuraSheets()`: Crea y verifica las 7 pestañas requeridas.
    * `getProductoBySku()`: Consulta precio y stock oficial.
    * `registrarPedidoPendiente()` y `actualizarFlowOrderId()`: Registro de intenciones de compra.
    * `confirmarPagoYDescontarStock()`: Mutación atómica de inventario protegida con `LockService`.
    * `obtenerDescuentoCupon()` y `obtenerCostoEnvio()`: Funciones de servidor para cálculo de promociones y despachos.
    * `registrarSuscriptor()`: Almacenamiento de correos de newsletter.
* **`src/flow.js`:** Módulo de comunicación con la API de Flow.
  * *Funcionalidades:* `FlowService.crearOrden()` (empaquetado en `application/x-www-form-urlencoded` con firma HMAC-SHA256) y `FlowService.obtenerEstadoPago()`.
* **`src/utils.js`:** Utilidades criptográficas y de validación.
  * *Funcionalidades:* `generateFlowSignature()` (ordenamiento alfabético y concatenación `key1val1key2val2` según especificación OpenAPI v3), `validateRut()`, `validateEmail()` y `generateOrderId()`.
* **`src/doGet.js`:** Manejador de peticiones HTTP `GET`.
  * *Funcionalidades:* Intercepción del retorno del cliente (`action === "client_return"`), simulador `mock_gateway` y página de diagnóstico `renderHealthCheck()`.
* **`src/doPost.js`:** Manejador de peticiones HTTP `POST`.
  * *Funcionalidades:* `procesarIntencionCompra()` (Zero-Trust, validaciones, cálculo de total con cupones/despacho y llamada a Flow), `procesarWebhook()` (validación S2S con token, `LockService` y retorno de `"Webhook recibido"`) y `procesarRetornoCliente()` (redirección ligera `window.location.replace`).

---

## 🌐 5. Infraestructura Cloud, Edge Worker & DNS

Para resolver el problema nativo donde **GitHub Pages rechaza peticiones HTTP `POST` apuntando a archivos estáticos (lanzando `405 Method Not Allowed`)**, se implementó una arquitectura en el Edge con Cloudflare:

```text
1. Cliente paga en Webpay / Flow.
2. Flow redirige vía POST a https://lynto.cl/return
3. Cloudflare Worker (lynto-return-worker) intercepta la petición en el Edge.
4. Extrae el 'token' y responde con un encabezado nativo HTTP 303 See Other.
5. El navegador aterriza limpiamente vía GET en https://lynto.cl/exito.html?token=...
```

* **Cloudflare Worker Script (`lynto-return-worker`):**
  * *Ruta activada:* `lynto.cl/return*` (DNS en Nube Naranja 🧡 Proxied).
  * *Comportamiento:* Si recibe un `POST` o `GET` con `token`, redirige inmediatamente a `https://lynto.cl/exito.html?token=...` usando `Response.redirect(url, 303)`.

---

## 📊 6. Estructura de la Base de Datos (Google Sheets)

La base de datos máster (`1yreX-kjbP6JCEQfM6hPjt5Hx8ADeQxb3TpH7d8uElwI`) debe contar con 7 pestañas:

1. **`Inventario`:** `SKU` | `Nombre` | `Precio` | `Stock`
2. **`Pedidos`:** `ID Pedido` | `Fecha` | `Nombre` | `RUT` | `Email` | `Dirección` | `Cantidad` | `Monto Total` | `Estado` | `Flow Order ID`
3. **`Configuracion`:** `Clave` | `Valor` | `Descripción` *(Textos del Home, fotos, límites)*
4. **`Nutricion`:** `Componente` | `Cantidad` | `DDR` *(Tabla nutricional)*
5. **`Suscriptores`:** `Fecha` | `Email` | `Origen` *(Boletín/Newsletter)*
6. **`Cupones`:** `Codigo` | `PorcentajeDescuento` | `Activo` *(Ej. `PREVENTA20` con 20%)*
7. **`TarifasEnvio`:** `Region` | `Costo` *(Ej. RM `$3.500` / Regiones `$5.000`)*

---

## 🛡️ 7. Reglas Inquebrantables de Seguridad y Concurrencia

1. **Política Zero-Trust (Frontend Tonto):** El cliente jamás calcula precios ni montos en JS. El backend en Apps Script es la única fuente de la verdad.
2. **Concurrencia Estricta (`LockService`):** Uso obligatorio de `LockService.getScriptLock()` antes de mutar el inventario en Sheets para prevenir sobreventas.
3. **Criptografía HMAC-SHA256:** Firma de parámetros ordenada alfabéticamente `key1val1key2val2` con `secretKey` sanitizada contra comillas accidentales.
4. **Seguridad DOM y Sanitización (Frontend Dev):** El Frontend Dev debe sanitizar todas las entradas y prevenir la manipulación del DOM antes de enviar la petición `POST` para evitar inyecciones XSS o alteración de datos.

---

## 🎯 8. Plan de Trabajo Pendiente Organizado por Desarrollador

### 👤 Tech Lead & DevOps (Prioridad 1)
1. `[ ]` **Prueba de Concurrencia (`LockService`):** Ejecutar script de peticiones simultáneas sobre `Stock = 1` y verificar bloqueo de sobreventa.
2. `[ ]` **Prueba de Llaves API de Flow:** Probar la firma y credenciales reales entregadas por las clientas.
3. `[ ]` **Configuración de Correo Corporativo:** Configurar el dominio para envíos de correo oficiales (`contacto@lynto.cl`).

### 👤 Backend 2 (Prioridad 1)
1. `[ ]` **Estructurar Planilla Maestra del Cliente:** Crear en la planilla oficial del cliente las pestañas y columnas faltantes (`Suscriptores`, `Cupones`, `TarifasEnvio`) para evitar fallos en la ejecución de Apps Script.
2. `[ ]` **Completar API `get_config`:** Programar en `doGet.js` la lectura estructurada de `"Configuracion"` y `"Nutricion"` sirviendo el JSON al front.
3. `[ ]` **Prueba de Newsletter:** Validar que la suscripción guarde el email correctamente en la pestaña `Suscriptores`.
4. `[ ]` **Prueba de Calculadoras:** Probar el comportamiento de `obtenerCostoEnvio` y `obtenerDescuentoCupon`.
5. `[ ]` **Envío de Correos al Cliente:** Programar plantilla HTML transaccional que se active automáticamente cuando un pedido cambie a `PAGADO`.

### 👤 Especialista Frontend (Prioridad 1)
1. `[ ]` **Seguridad DOM y Sanitización:** Proteger los inputs contra inyección XSS y prevenir la manipulación del DOM antes de enviar el `POST`.
2. `[ ]` **Rediseño Visual CSS:** Reescribir `assets/css/style.css` para darle un acabado web de alto impacto (wellness/premium).
3. `[ ]` **Inyección Dinámica de Contenidos:** Implementar `fetch` GET a `get_config` para reemplazar placeholders por datos reales de Sheets.
4. `[ ]` **Prueba de Mutaciones:** Verificar que cambiar textos o fotos en Sheets actualice la web limpiamente.
