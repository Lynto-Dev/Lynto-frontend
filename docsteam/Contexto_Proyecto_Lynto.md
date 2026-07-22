# Contexto del Proyecto: Preventa Suplementos "Lynto"

## 📍 Situación Actual (Día 0)
Acabamos de cerrar la venta de un proyecto web por $150.000 CLP para una startup de mujeres ("Lynto"). El objetivo es lanzar una landing page para la **preventa de un único suplemento alimenticio** en un plazo estricto de **8 días** (lanzamiento en agosto). 

La promesa de valor que nos hizo ganar el proyecto frente a agencias tradicionales es: **Propiedad absoluta del código para las clientas y $0 costo mensual de mantención de servidores.** Actualmente estamos configurando la infraestructura. El cliente está creando las cuentas de Google, GitHub y Flow para darnos los accesos.

## 🏗 Arquitectura y Stack Tecnológico (No Negociable)
El sistema utiliza una arquitectura **Serverless completamente desacoplada**:

* **Frontend (La Vitrina):** HTML5, Vanilla JavaScript y Tailwind CSS (vía CDN). Cero empaquetadores (ni React, ni Vite, ni Node.js). Alojado estáticamente en **GitHub Pages**.
* **Backend API (El Motor):** **Google Apps Script (GAS)** expuesto como una Web App (endpoint `doPost`).
* **Base de Datos (La Bodega):** **Google Sheets** bajo la cuenta corporativa de la clienta (pestañas "Inventario" y "Pedidos").
* **Pasarela de Pagos:** API oficial de **Flow.cl** (Webpay, Mach, Transferencias).

## 🛡️ Reglas de Ingeniería (Inquebrantables)
1.  **Política Zero-Trust (Frontend Tonto):** El frontend solo recolecta datos del formulario (Nombre, RUT, Email, Dirección, Cantidad). **NUNCA** calcula el precio final. El backend manda y es la única fuente de la verdad para consultar precios.
2.  **Concurrencia Estricta:** Como el stock es limitado, el código de Apps Script **DEBE** usar `LockService.getScriptLock()` antes de leer/escribir en la hoja de Inventario para evitar sobreventas si dos personas compran en el mismo milisegundo.
3.  **Transacción en Dos Fases:**
    * *Fase A (Intención):* Front manda POST a GAS -> GAS calcula total, crea orden "PENDIENTE", genera firma HMAC-SHA256 y pide link a Flow -> Front redirige a cliente.
    * *Fase B (Confirmación):* Flow recibe el pago y envía un Webhook (S2S) a GAS -> GAS valida token -> Cambia estado a "PAGADO" y descuenta definitivamente el stock.

## 🧑‍💻 El Equipo (3 Personas)
Trabajamos con repositorios separados (`preventa-frontend` y `preventa-backend` versionado con `clasp`):
* **DevOps / Tech Lead (Yo):** Infraestructura, control de calidad (QA), code review, creación de Sheets, y la lógica del POST criptográfico (HMAC-SHA256) hacia la API de Flow.
* **Chris (Backend 2):** Lógica core en Apps Script, manejo de concurrencia (`LockService`), validaciones del lado del servidor y fetchs.
* **Frontend Dev:** Maquetación One-Page con Tailwind, UI/UX, y conexión Vanilla JS (`fetch`) con el backend.

## 🤖 Instrucciones para el Asistente IA (Antigravity/CLI)
* **Asume el rol de Senior Full-Stack y Consultor Cloud.**
* **Respeta el stack:** No sugieras npm, Node.js, Express, React, Vite ni bases de datos SQL/NoSQL tradicionales. Todo debe resolverse con Vanilla JS en el front y Apps Script (ES6) en el back.
* Considera siempre que el backend no corre continuamente, se despierta con cada petición HTTP (`doGet` / `doPost`).
* Escribe código defensivo, optimizado y listo para copiar/pegar o mergear en el flujo de GitFlow.
