# 🚀 ROADMAP Y MATRIZ DE IMPLEMENTACIÓN DEFINITIVA
## Proyecto: Preventa E-Commerce Suplementos "Lynto"

> **Estado General:** 🟢 **Fase Final de Transición a Producción (~98% Global)**  
> **Backend & DevOps:** 🟢 **98% Completado** *(LockService, Cloudflare Edge Worker, Flow Sandbox, webhook /webhook, API get_config, módulo de correos y cupones/tarifas aprobados)*.  
> **Frontend:** 🟢 **100% Completado** *(Diseño visual HSL/HEX, Tailwind CSS, Google Fonts, badges, copys oficiales del Drive, checkout con cupones, regiones, sanitización anti-XSS y overlay de carga)*.  
> **Actualización:** 27 de Julio de 2026

---

## 🏷️ Convención de Roles y Origen de Datos

### 👤 Roles del Equipo:
* **`[T]`** ➔ **Tech Lead / DevOps**
* **`[F]`** ➔ **Especialista Frontend (UI/UX)**
* **`[B]`** ➔ **Backend 2 (Lógica, BD y Calculadoras)**

### 📊 Origen de Datos en la Arquitectura:
* **`[📊 DINÁMICO EXCEL]`** ➔ Se edita en Google Sheets y el Frontend lo consulta dinámicamente vía `fetch(API_URL + "?action=get_config")`.
* **`[⚡ HARDCODEADO CÓDIGO]`** ➔ Fijo en el código HTML / CSS / JS / Backend para rendimiento, cumplimiento legal o identidad visual.

---

## 🎨 1. Frontend: Diseño e Identidad Visual `[F]`

> 📂 **NOTA DRIVE PARA `[F]`:** Para esta sección, se revisó la carpeta del Drive del cliente. Se extrajeron los códigos de color (`#FEFCE1`, `#DCA1FF`, `#7a1fb8`) y logos con transparente (`Isotipo morado sin fondo.png`, `Logo morado sin fondo.png`, `Logo amarillo sin fondo.png`).

* `[x] [F] [⚡ HARDCODEADO]` **Configuración Tailwind CSS:** 🟢 **COMPLETADO (100%)** Inyectada la paleta corporativa y tipografías (`Plus Jakarta Sans`, `Inter`, `Varela Round`) en `index.html` y `assets/css/style.css`.
* `[x] [F] [⚡ HARDCODEADO]` **Logotipia y Favicon (Imágenes Transparentes en `assets/img/`):** 🟢 **COMPLETADO (100%)**
  * **Header / Nav:** `Logo morado sin fondo.png` y `Isotipo morado sin fondo.png`.
  * **Footer:** `Logo amarillo sin fondo.png`.
  * **Favicon:** `Isotipo morado sin fondo.png`.
* `[x] [F] [⚡ HARDCODEADO]` **Norte Visual (Mockup):** 🟢 **COMPLETADO (100%)** Maquetación responsiva, glassmorphism, micro-animaciones y sombras suaves según maqueta entregada.

---

## ✍️ 2. Frontend: Contenidos y Textos Oficiales (Copys) `[F]`

> 📂 **NOTA DRIVE PARA `[F]`:** Todos los textos persuasivos (H1, Bajada, FAQs, Sección "¿Por qué Iron Girl?") fueron integrados íntegramente del archivo **`Copys .docx`** y la redacción legal de **`Legal ecommerce.docx`**.

* `[x] [F] [⚡ HARDCODEADO]` **Hero Section (`Copys .docx`):** 🟢 **COMPLETADO (100%)**
  * **H1:** *"Domina el ritmo de lo real. Tu biología en su máximo potencial."*
  * **Subtítulo:** *"El desgaste moderno no se combate con fuerza de voluntad, se resuelve con ciencia. Descubre Iron Girl: la primera matriz biotecnológica de minerales esenciales en polvo..."*
  * **CTAs:** `"Quiero mi Iron Girl en Preventa ⚡"` y `"Conoce la ciencia detrás"`.
  * **Badges:** `LIBRE DE AZÚCAR` | `RÁPIDA ABSORCIÓN` | `FORMATO SACHET` | `RESPALDO FARMACÉUTICO`.
  * **Banner Urgencia:** *"Forma parte de la primera generación Lynto..."*
* `[x] [F] [⚡ HARDCODEADO]` **Sección "¿Por qué Iron Girl?" (Descripción):** 🟢 **COMPLETADO (100%)** Maquetada la narrativa sobre el déficit invisible de hierro y magnesio.
* `[x] [F] [⚡ HARDCODEADO]` **Sección FAQ (Preguntas Frecuentes - `Copys .docx`):** 🟢 **COMPLETADO (100%)** Acordeón interactivo con las 3 preguntas oficiales.
* `[x] [F] [⚡ HARDCODEADO]` **Footer Legal y Páginas Secundarias (`Legal ecommerce.docx`):** 🟢 **COMPLETADO (100%)**
  * Soporte: `contacto@lynto.cl` | `lynto.spa@gmail.com`.
  * Texto obligatorio MINSAL en Footer y Checkout.
  * Páginas `terminos.html` y `privacidad.html` maquetadas con políticas de reembolso.

---

## ⚙️ 3. Backend: Base de Datos y Variables Comerciales `[B]`

> 📂 **NOTA DRIVE PARA `[B]`:** Configuración de hojas maestras según **`Catálogo de productos.xlsx`** y ficha técnica en **`Ficha Técnica LYNTO - Laboratorio Nextfar.pdf`**.

* `[x] [B] [📊 DINÁMICO EXCEL]` **Estructuración Defensiva:** 🟢 **COMPLETADO (100%)** (`inicializarEstructuraSheets` con las 7 pestañas).
* `[x] [B] [📊 DINÁMICO EXCEL]` **Producto (`Catálogo.xlsx`):** 🟢 **COMPLETADO (100%)** `Iron Girl` (Doypack 15 sachets - 54g).
* `[x] [B] [📊 DINÁMICO EXCEL]` **Inventario Inicial (`Catálogo.xlsx`):** 🟢 **COMPLETADO (100%)** Stock de `2000` unidades en preventa.
* `[x] [B] [📊 DINÁMICO EXCEL]` **Regla de Negocio (`Catálogo.xlsx`):** 🟢 **COMPLETADO (100%)** Límite de `6` unidades por persona.
* `[x] [B] [📊 DINÁMICO EXCEL]` **Precios (Cálculo Zero-Trust en Servidor):** 🟢 **COMPLETADO (100%)**
  * **Valor Normal:** `$19.990 CLP`.
  * **Valor Preventa:** `$16.990 CLP`.
* `[x] [B] [📊 DINÁMICO EXCEL]` **Ficha Técnica y Tabla Nutricional:** 🟢 **COMPLETADO (100%)**
  * Endpoint `get_config` expone la tabla nutricional y configuración dinámica desde Sheets (`obtenerNutricionDeSheet` y `obtenerConfiguracionDeSheet`).

---

## 🧠 4. Backend & Frontend: Lógicas Matemáticas y Formularios `[B]` `[F]`

* `[x] [B] [📊 DINÁMICO EXCEL]` **Lógica de Cupones:** 🟢 **COMPLETADO (100%)** `obtenerDescuentoCupon` procesa el cupón `PREVENTA` (15% de descuento).
* `[x] [F] [📊 DINÁMICO EXCEL]` **UI Cupones y Despacho:** 🟢 **COMPLETADO (100%)** Campo de cupón con actualización dinámica de subtotal y selector regional de envíos (RM `$3.500` / Regiones `$5.000`).
* `[x] [F] [⚡ HARDCODEADO]` **Blindaje de Formulario (Anti-XSS):** 🟢 **COMPLETADO (100%)** Sanitización de inputs, formateador de RUT chileno en vivo (Módulo 11) y modal spinner de carga anti doble clic.

---

## 🚚 5. Operaciones, Legales y Despachos `[T]`

* `[x] [T] [⚡ HARDCODEADO]` **Alerta Arquitectura Blue Express (Serverless):** 🟢 **COMPLETADO (100%)** Gestión vía tabla `TarifasEnvio` en Sheets y exportación CSV de `Pedidos` para carga masiva manual.
* `[x] [T] [⚡ HARDCODEADO]` **Resguardo de Accesos:** 🟢 **COMPLETADO (100%)** Credenciales de `nic.cl` y Cloudflare almacenadas de forma segura.
* `[x] [T] [⚡ HARDCODEADO]` **Enrutamiento de Correos:** 🟢 **COMPLETADO (100%)** Alias `contacto@lynto.cl` enrutado y plantillas de correo HTML transaccionales programadas en `src/mail.js`.
* `[x] [T] [⚡ HARDCODEADO]` **Páginas Legales:** 🟢 **COMPLETADO (100%)** Vistas `terminos.html` y `privacidad.html` verificadas y activas.

---

## 🧪 6. Pruebas Críticas de Producción (Smoke Tests) `[T]` `[B]`

* `[x] [T] [B] [⚡ HARDCODEADO]` **Prueba de Concurrencia (`LockService` & Reserva Atómica):** 🟢 **COMPLETADO (100%)** Script `npm run test:concurrencia` validó reserva atómica contra sobreventas.
* `[x] [T] [B] [⚡ HARDCODEADO]` **Webhook S2S y Redirección Cloudflare Edge Worker:** 🟢 **COMPLETADO (100%)** Edge Worker `lynto-return-worker` respondiendo HTTP 303 Redirect a `exito.html` y Webhook `/webhook` procesando confirmaciones.
* `[x] [B] [📊 DINÁMICO EXCEL]` **Prueba de Newsletter:** 🟢 **COMPLETADO (100%)** `registrarSuscriptor` guardando registros limpios en la pestaña `Suscriptores`.
* `[ ] [T] [⚡ HARDCODEADO]` **Transición a Producción (Paso Final Pendiente):** Solicitar llaves de Producción a las clientas, cargar en Script Properties `FLOW_API_KEY` / `FLOW_SECRET_KEY`, cambiar `FLOW_MOCK_MODE = false` y ejecutar compra real de `$350 CLP`.
