# 🚀 ROADMAP Y MATRIZ DE IMPLEMENTACIÓN DEFINITIVA
## Proyecto: Preventa E-Commerce Suplementos "Lynto"

> **Estado General:** 🟢 **Fase Final de Transición a Producción (~98% Global)**  
> **Backend & Chilexpress:** 🟢 **100% Completado** *(LockService, Cloudflare Edge Worker, Flow, API get_config, ChilexpressService src/chilexpress.js, generación de OT post-pago, columnas O/P en Sheets y mail con tracking de envío)*.  
> **Frontend:** 🟢 **100% Completado** *(Diseño visual HSL/HEX, Tailwind CSS, Google Fonts, badges, copys oficiales del Drive, checkout con cupones, regiones, sello Chilexpress, sanitización anti-XSS y overlay de carga)*.  
> **Actualización:** 31 de Julio de 2026

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

* `[x] [F] [⚡ HARDCODEADO]` **Configuración Tailwind CSS:** Inyectar la paleta de colores corporativa directamente en el `<head>` del `index.html`.
* `[x] [F] [⚡ HARDCODEADO]` **Logotipia y Favicon (Imágenes Transparentes en `assets/img/`):**
  * **Header / Nav:** Usar `Logo morado sin fondo.png` y `Isotipo morado sin fondo.png`.
  * **Footer:** Usar `Logo amarillo sin fondo.png`.
  * **Favicon:** Usar `Isotipo morado sin fondo.png`.
* `[x] [F] [⚡ HARDCODEADO]` **Norte Visual (Mockup):** Maquetar paddings, jerarquía tipográfica y estructura general según la captura entregada (`Captura de pantalla 2026-07-20 132721.png`).

---

## ✍️ 2. Frontend: Contenidos y Textos Oficiales (Copys) `[F]`

> 📂 **NOTA DRIVE PARA `[F]`:** Todos los textos persuasivos (H1, Bajada, FAQs, Sección "¿Por qué Iron Girl?") fueron copiados e integrados del archivo **`Copys .docx`** y la redacción legal del archivo **`Legal ecommerce.docx`**.

* `[x] [F] [⚡ HARDCODEADO]` **Hero Section (`Copys .docx`):**
  * **H1 (Título principal):** *"Domina el ritmo de lo real. Tu biología en su máximo potencial."*
  * **Subtítulo:** *"El desgaste moderno no se combate con fuerza de voluntad, se resuelve con ciencia. Descubre Iron Girl: la primera matriz biotecnológica de minerales esenciales en polvo, diseñada para recuperar tu vitalidad diaria sin pastillas ni molestias."*
  * **CTAs (Botones):** Botón 1: `"Quiero mi Iron Girl en Preventa ⚡"` | Botón 2: `"Conoce la ciencia detrás"`.
  * **Badges:** `LIBRE DE AZÚCAR` | `RÁPIDA ABSORCIÓN` | `FORMATO SACHET` | `RESPALDO FARMACÉUTICO`.
  * **Banner Urgencia:** *"Forma parte de la primera generación Lynto. Reservando tu Iron Girl hoy, aseguras precio preferencial de preventa y acceso directo a nuestra comunidad VIP de desarrollo."*
* `[x] [F] [⚡ HARDCODEADO]` **Sección "¿Por qué Iron Girl?" (Descripción):** Maquetar sección descriptiva sobre el déficit de hierro/magnesio basado en el documento de copys (*"Normalizamos vivir cansadas..."*).
* `[x] [F] [⚡ HARDCODEADO]` **Sección FAQ (Preguntas Frecuentes - `Copys .docx`):** Maquetar acordeón interactivo con las 3 preguntas oficiales (1. Tiempo de efectos, 2. Proceso de Preventa, 3. Sabor metálico).
* `[x] [F] [⚡ HARDCODEADO]` **Footer Legal y Páginas Secundarias (`Legal ecommerce.docx`):**
  * Inyectar correo de soporte: `contacto@lynto.cl` / `lynto.spa@gmail.com`.
  * Inyectar texto obligatorio MINSAL en Footer y Checkout:
    > *"SUPLEMENTO ALIMENTARIO: Su uso no es recomendable para consumo por menores de 8 años, embarazadas y nodrizas, salvo indicación profesional competente y no reemplaza a una alimentación balanceada."*
  * Maquetar `terminos.html` y `privacidad.html` con las políticas de devolución (reembolso en 5 a 7 días hábiles vía Flow).

---

## ⚙️ 3. Backend: Base de Datos y Variables Comerciales `[B]`

> 📂 **NOTA DRIVE PARA `[B]`:** Configuración de las hojas maestras según el archivo **`Catálogo de productos.xlsx`** y ficha técnica en **`Ficha Técnica LYNTO - Laboratorio Nextfar.pdf`**.

* `[x] [B] [📊 DINÁMICO EXCEL]` **Estructuración Defensiva:** 🟢 **COMPLETADO (100%)** (`inicializarEstructuraSheets` con las 7 pestañas).
* `[x] [B] [📊 DINÁMICO EXCEL]` **Producto (`Catálogo.xlsx`):** ID/Código: `Iron Girl` (Doypack 15 sachets - 54g).
* `[x] [B] [📊 DINÁMICO EXCEL]` **Inventario Inicial (`Catálogo.xlsx`):** Stock: `2000` unidades en preventa.
* `[x] [B] [📊 DINÁMICO EXCEL]` **Regla de Negocio (`Catálogo.xlsx`):** Límite máximo: `6` unidades por persona.
* `[x] [B] [📊 DINÁMICO EXCEL]` **Precios (Cálculo Zero-Trust en Servidor - `Catálogo.xlsx`):**
  * **Valor Normal (Tachado en Front):** `$19.990 CLP`.
  * **Valor Preventa (Real a cobrar):** `$16.990 CLP`.
* `[x] [B] [📊 DINÁMICO EXCEL]` **Ficha Técnica y Tabla Nutricional (`Ficha Técnica...pdf`):**
  * **Sabor & Modo de Uso:** Frambuesa/Limón | Disolver 1 sachet (3,6g) en 250 mL de agua.
  * **Resolución Sanitaria:** Res. Seremi de Salud R.M N°2513672618 del 15/01/2026.
  * **Valores Nutricionales Críticos (Porción):** Magnesio Citrato (`72 mg` / 24%), Hierro Bisglicinato (`16 mg` / 114%), Vitamina D3 (`15 ug` / 300%).

---

## 🧠 4. Backend & Frontend: Lógicas Matemáticas y Formularios `[B]` `[F]`

* `[x] [B] [📊 DINÁMICO EXCEL]` **Lógica de Cupones:** Programar en `obtenerDescuentoCupon` el cálculo para el cupón `PREVENTA` (15% de descuento) y `PREVENTA20` (20% de descuento).
* `[x] [F] [📊 DINÁMICO EXCEL]` **UI Cupones y Despacho:** Agregar campo HTML *"Ingresar código de descuento"* y desplegable de **Regiones** (RM `$3.500` / Regiones `$5.000`) en el formulario de Checkout.
* `[x] [F] [⚡ HARDCODEADO]` **Blindaje de Formulario (Anti-XSS):** Sanitizar los inputs (`nombre`, `rut`, `email`, `direccion`), formateador de RUT en vivo y deshabilitar el botón de compra con spinner de carga durante el proceso `POST`.

---

## 🚚 5. Operaciones, Legales y Despachos `[T]`

* `[x] [T] [⚡ HARDCODEADO]` **Arquitectura de Despachos Chilexpress:** Integración de APIs REST de Chilexpress (`REST Transport-Orders API`, `GeoReference REST API`, `REST Rating API`) para cotización, generación de Orden de Transporte (OT) y seguimiento automatizado post-pago, utilizando además la tabla `TarifasEnvio` en Sheets.
* `[x] [T] [⚡ HARDCODEADO]` **Resguardo de Accesos:** Almacenar de forma segura las credenciales de `nic.cl` y Cloudflare.
* `[x] [T] [⚡ HARDCODEADO]` **Enrutamiento de Correos (Cloudflare / Gmail):** Asegurar alias `contacto@lynto.cl` / `lynto.spa@gmail.com` y plantillas HTML en `src/mail.js`.
* `[x] [T] [⚡ HARDCODEADO]` **Páginas Legales:** Maquetar y validar los textos del documento `Legal ecommerce.docx` en `terminos.html` y `privacidad.html`.

---

## 🧪 6. Pruebas Críticas de Producción (Smoke Tests) `[T]` `[B]`

* `[x] [T] [B] [⚡ HARDCODEADO]` **Prueba de Concurrencia (`LockService` & Reserva Atómica):** 🟢 **COMPLETADO (100%)** (`npm run test:concurrencia` -> 10 peticiones simultáneas sobre `Stock = 1`, 1 compra reservada, 9 rechazadas, 0 sobreventas).
* `[x] [T] [B] [⚡ HARDCODEADO]` **Webhook S2S y Redirección Cloudflare Edge Worker:** 🟢 **COMPLETADO (100%)** (`/return` redirige HTTP 303 a `exito.html` y `/webhook` entrega HTTP 200 OK limpio a Flow).
* `[x] [B] [📊 DINÁMICO EXCEL]` **Prueba de Newsletter:** Suscribir un correo desde el footer y verificar registro limpio en la pestaña `Suscriptores`.
* `[ ] [T] [⚡ HARDCODEADO]` **Transición a Producción:** Solicitar llaves de Producción a las clientas, cargar en Script Properties `FLOW_API_KEY` / `FLOW_SECRET_KEY`, cambiar `FLOW_MOCK_MODE = false` y ejecutar compra real de `$350 CLP`.
