# 📊 INFORME DE AVANCE DE PROYECTO: FRONTEND Y BACKEND

**Proyecto:** Landing Page Preventa Suplemento "Lynto"  
**Estado General:** 🟢 **Dominio NIC Chile en Vivo | Google Sheets Parcialmente Configurado**  
**Dominio Oficial:** [https://lynto.cl](https://lynto.cl) (HTTPS / SSL Activo)  
**Plazo:** Estricto de 8 días (Lanzamiento programado para Agosto de 2026)  
**Última Actualización:** 21 de Julio de 2026  

---

## 🔍 Resumen Ejecutivo

El proyecto ha entrado a la fase de **Integración Real en Producción**. El dominio oficial **`lynto.cl`** está 100% vinculado a GitHub Pages vía Cloudflare con candado de seguridad SSL activo. La planilla maestra de Google Sheets ha sido creada y parcialmente configurada en el Drive de las clientas.

El foco técnico actual se divide de la siguiente manera:
1.  **DevOps / Tech Lead (Tú):** Coordinación de pruebas de integración en vivo en `https://lynto.cl`, seguimiento del llenado de celdas por parte de las clientas y configuración de llaves de producción de Flow.
2.  **Backend 2 (Chris):** Desarrollo del endpoint `get_config` en `doGet.js` para la lectura de la pestaña `"Configuracion"` y `"Nutricion"`.
3.  **Frontend Dev:** Maquetación manual en CSS e inyección dinámica desde la API.

---

## ⚙️ Especificación Técnica: Las 5 Pestañas del Google Sheet Maestro

El documento de Google Sheets actuará como la base de datos transaccional y el panel de autogestión para las clientas. Las 5 pestañas están creadas y en proceso de llenado:

### 1. Pestaña `"Inventario"` (Control de Stock Maestro) - 🟢 Creada
*   **Fila 1 (Encabezados):** `SKU` | `Nombre` | `Precio` | `Stock`
*   **Fila 2 (Datos iniciales):** `SUP-LYNTO-01` | `Suplemento Preventa Lynto` | `29990` | `100`

### 2. Pestaña `"Pedidos"` (Registro Transaccional) - 🟢 Creada
*   **Fila 1 (Encabezados):** `ID Pedido` | `Fecha` | `Nombre` | `RUT` | `Email` | `Dirección` | `Cantidad` | `Monto Total` | `Estado` | `Flow Order ID`

### 3. Pestaña `"Configuracion"` (Panel de Autogestión) - 🟡 Parcialmente Configurada
*   **Fila 1 (Encabezados):** `Clave` | `Valor` | `Descripción`
*   **Estado:** Pestaña inicializada. *Pendiente que las clientas terminen de ingresar los textos reales del Home, disclaimer y URL de fotos.*

### 4. Pestaña `"Nutricion"` (Tabla Nutricional Dinámica) - 🟡 Parcialmente Configurada
*   **Fila 1 (Encabezados):** `Componente` | `Cantidad` | `DDR`
*   **Estado:** Pestaña inicializada. *Pendiente que las clientas ingresen la lista completa e ingredientes oficiales.*

### 5. Pestaña `"Suscriptores"` (Boletín / Newsletter) - 🟢 Creada
*   **Fila 1 (Encabezados):** `Fecha` | `Email` | `Origen`
*   *(Almacena automáticamente las suscripciones enviadas desde la landing page).*

---

## 🧑‍💻 Desglose de Tareas por Rol y Desarrollador

### 1. Backend 1: Tech Lead & DevOps (Tú)
**Misión:** Infraestructura, provisión de Base de Datos, credenciales, QA y pasarela de pagos.

*   **🟢 Completado:**
    *   Configuración e inicialización de repositorios desacoplados (`Lynto-frontend` y `Lynto-backend`).
    *   **Dominio en Vivo:** Configuración de DNS en NIC Chile + Cloudflare apuntando a GitHub Pages. Certificado HTTPS / SSL emitido y forzado para `lynto.cl`.
    *   **Provisión de Sheets:** Documento maestro creado en Drive e inicialización de las 5 pestañas (`Inventario`, `Pedidos`, `Configuracion`, `Nutricion`, `Suscriptores`) usando `inicializarEstructuraSheets()`.
    *   **Propiedades del Script:** `SPREADSHEET_ID`, `CLIENT_RETURN_URL` (`https://lynto.cl/exito.html`) y `CLIENT_CANCEL_URL` (`https://lynto.cl/index.html`) configurados en Apps Script.
    *   Arquitectura Zero-Trust y seguridad criptográfica HMAC-SHA256 para Flow.
*   **🟡 En Progreso:**
    *   **Configuración Flow Producción:** Reemplazar llaves de Sandbox por llaves de producción (`FLOW_API_KEY`, `FLOW_SECRET_KEY`, `FLOW_MOCK_MODE = false`) en cuanto las clientas entreguen las credenciales.
*   **🔴 Pendiente:**
    *   **Documentación Técnica Fase 2:** Redactar manuales de uso del Sheets y arquitectura de traspaso.
    *   **QA & Code Review:** Aprobar los PRs asegurando `LockService` y confirmación S2S.

---

### 2. Backend 2: (Lógica Core y Concurrencia)
**Misión:** Programación de consultas en Apps Script, API de configuración, transacciones y Newsletter.

*   **🟢 Completado:**
    *   Endpoints `doPost` y `doGet` simulados con respuesta JSON.
    *   Módulo de suscripción a Newsletter (`action === 'subscribe_newsletter'`) almacenando en la pestaña `"Suscriptores"`.
    *   Protección contra sobreventas mediante `LockService.getScriptLock()`.
    *   Validaciones de servidor de RUT, Email y Stock.
*   **🔴 Desarrollar (Lógica en Código):**
    *   **API `get_config`:** Programar en `doGet.js` la lectura de las pestañas `"Configuracion"` y `"Nutricion"` y retornar el JSON estructurado para el front.
    *   **Lógica de Envíos y Cupones (Si se aprueban):** Si las clientas eligen selector de envío o cupones de descuento, sumar costo de envío y aplicar porcentaje de descuento al `montoTotal` en `procesarIntencionCompra`.

---

### 3. Especialista Frontend
**Misión:** Maquetación CSS manual, renderizado dinámico e interfaz de conversión.

*   **🟢 Completado:**
    *   Esqueleto HTML5 semántico en vivo en `https://lynto.cl` (`index.html`, `exito.html`, `terminos.html`, `privacidad.html`).
    *   Sección y formulario de suscripción a Boletín / Newsletter (`#newsletter-form`).
    *   Validación y formateador de RUT chileno en vivo (Módulo 11) y correo electrónico.
    *   Controlador de cantidad e inhabilitador de doble clic (`#loading-overlay`).
*   **🔴 Desarrollar (Lógica Pendiente):**
    *   **Inyección Dinámica:** Implementar el `fetch` GET a `API_URL?action=get_config` al cargar la página para inyectar los textos, fotos, disclaimer y filas de la tabla nutricional.
    *   **Casilla de Cupones / Selector de Envíos:** Si se aprueban, agregar el input de código promocional o el desplegable de regiones en el formulario de checkout.
    *   **Maquetación CSS a Mano:** Escribir los estilos visuales finales en `assets/css/style.css`.

---

## 🔴 4. Decisiones y Bloqueos Pendientes del Cliente

*   [ ] **Llenado Final de Sheets:** Que las clientas terminen de ingresar los textos reales en `"Configuracion"` e ingredientes en `"Nutricion"`.
*   [ ] **Estructura de Despacho:** Definir si se agregará un selector de regiones con tarifa fija o modalidad "Por Pagar".
*   [ ] **Cupones de Descuento:** Definir si se utilizarán códigos promocionales.
*   [ ] **Activos de Marca:** Logotipos en alta calidad, paleta de colores/fuentes y fotografías del producto.
*   [ ] **Llaves API de Flow:** Entregar `API_KEY` y `SECRET_KEY` de producción de Flow.cl.

---

*Nota: Este documento debe ser actualizado a medida que las clientas entreguen las llaves de Flow y definan las reglas de envío/cupones.*
