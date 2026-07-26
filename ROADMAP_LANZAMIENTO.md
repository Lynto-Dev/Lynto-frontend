# 🚀 ROADMAP Y MATRIZ DE IMPLEMENTACIÓN DEFINITIVA
## Proyecto: Preventa E-Commerce Suplementos "Lynto"

> **Estado General:** 🟡 **Fase de Integración y Maquetación Final (~68% Global)**  
> **Backend & DevOps:** 🟢 **92% Completado** *(LockService, Cloudflare Edge Worker, Flow Sandbox, webhook /webhook y módulo de correos aprobados)*.  
> **Actualización:** Julio 2026

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

> 📂 **NOTA DRIVE PARA `[F]`:** Para esta sección, debes revisar la carpeta del Drive del cliente. Abre la imagen **`Códigos HEX.png`** para extraer los colores. Además, notarás que hay una gran variedad de logos en el Drive; descarga y utiliza **exclusivamente** los que tienen el sufijo **"sin fondo"** para mantener la limpieza del diseño. Usa la imagen **`Captura de pantalla 2026-07-20 132721.png`** como tu norte visual para la maquetación.

* `[ ] [F] [⚡ HARDCODEADO]` **Configuración Tailwind CSS:** Inyectar la paleta de colores corporativa directamente en el `<head>` del `index.html`:
  ```html
  <!-- Configuración de Marca en el HEAD de index.html -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            lynto: {
              purple: '#[HEX_MORADO_CODIGOS_HEX.PNG]',
              yellow: '#[HEX_AMARILLO_CODIGOS_HEX.PNG]',
            }
          }
        }
      }
    }
  </script>
  ```
* `[ ] [F] [⚡ HARDCODEADO]` **Logotipia y Favicon (Imágenes Transparentes en `assets/img/`):**
  * **Header / Nav:** Usar `Logo morado sin fondo.png` (sobre fondo claro).
  * **Footer:** Usar `Logo amarillo sin fondo.png` (sobre fondo oscuro/morado corporativo).
  * **Favicon:** Usar `Isotipo morado sin fondo.png` o `Isotipo amarillo sin fondo.png`.
  * *(Nota DevOps: Ignorar archivos con recuadro rígido como `Logo amarillo.png` o `Logo morado.png`)*.
* `[ ] [F] [⚡ HARDCODEADO]` **Norte Visual (Mockup):** Maquetar paddings, jerarquía tipográfica y estructura general según la captura entregada (`Captura de pantalla 2026-07-20 132721.png`).

---

## ✍️ 2. Frontend: Contenidos y Textos Oficiales (Copys) `[F]`

> 📂 **NOTA DRIVE PARA `[F]`:** ¡No inventes textos ni uses Lorem Ipsum! Todos los textos persuasivos (H1, Bajada, FAQs, Sección "¿Por qué Iron Girl?") los debes copiar y pegar íntegramente del archivo **`Copys .docx`** que se encuentra en el Drive. Asimismo, toda la redacción legal (Términos, Privacidad y el Disclaimer del MINSAL) debe ser extraída textualmente del archivo **`Legal ecommerce.docx`**.

* `[ ] [F] [⚡ HARDCODEADO]` **Hero Section (`Copys .docx`):**
  * **H1 (Título principal):** *"Domina el ritmo de lo real. Tu biología en su máximo potencial."*
  * **Subtítulo:** *"El desgaste moderno no se combate con fuerza de voluntad, se resuelve con ciencia. Descubre Iron Girl: la primera matriz biotecnológica de minerales esenciales en polvo, diseñada para recuperar tu vitalidad diaria sin pastillas ni molestias."*
  * **CTAs (Botones):** Botón 1: `"Quiero mi Iron Girl en Preventa ⚡"` (`bg-lynto-yellow text-lynto-purple`) | Botón 2: `"Conoce la ciencia detrás"`.
  * **Badges:** `LIBRE DE AZÚCAR` | `RÁPIDA ABSORCIÓN` | `FORMATO SACHET` | `RESPALDO FARMACÉUTICO`.
  * **Banner Urgencia:** *"Forma parte de la primera generación Lynto. Reservando tu Iron Girl hoy, aseguras precio preferencial de preventa y acceso directo a nuestra comunidad VIP de desarrollo."*
* `[ ] [F] [⚡ HARDCODEADO]` **Sección "¿Por qué Iron Girl?" (Descripción):**
  * Maquetar sección descriptiva sobre el déficit de hierro/magnesio basado en el documento de copys (*"Normalizamos vivir cansadas..."*).
* `[ ] [F] [⚡ HARDCODEADO]` **Sección FAQ (Preguntas Frecuentes - `Copys .docx`):**
  * Maquetar acordeón interactivo con las 3 preguntas oficiales (1. Tiempo de efectos, 2. Proceso de Preventa, 3. Sabor metálico).
* `[ ] [F] [⚡ HARDCODEADO]` **Footer Legal y Páginas Secundarias (`Legal ecommerce.docx`):**
  * Inyectar correo de soporte: `lynto.spa@gmail.com` (o alias `contacto@lynto.cl`).
  * Inyectar texto obligatorio MINSAL en Footer y Checkout:
    > *"SUPLEMENTO ALIMENTARIO: Su uso no es recomendable para consumo por menores de 8 años, embarazadas y nodrizas, salvo indicación profesional competente y no reemplaza a una alimentación balanceada."*
  * Maquetar `terminos.html` y `privacidad.html` con las políticas de devolución (reembolso en 5 a 7 días hábiles vía Flow).

---

## ⚙️ 3. Backend: Base de Datos y Variables Comerciales `[B]`

> 📂 **NOTA DRIVE PARA `[B]`:** Revisar el Drive para configurar las hojas de cálculo maestras. Debes sacar los precios, límites y stock base abriendo el archivo **`Catálogo de productos.xlsx`**. Para la tabla nutricional, transcribe exactamente los componentes que aparecen en el PDF **`Ficha Técnica LYNTO - Laboratorio Nextfar.pdf`**.

* `[x] [B] [📊 DINÁMICO EXCEL]` **Estructuración Defensiva:** 🟢 **COMPLETADO (100%)** (`asegurarEncabezados` y `init_db`).
* `[ ] [B] [📊 DINÁMICO EXCEL]` **Producto (`Catálogo.xlsx`):** ID/Código: `Iron Girl` (Doypack 15 sachets - 54g).
* `[ ] [B] [📊 DINÁMICO EXCEL]` **Inventario Inicial (`Catálogo.xlsx`):** Stock: `2000` unidades en preventa.
* `[ ] [B] [📊 DINÁMICO EXCEL]` **Regla de Negocio (`Catálogo.xlsx`):** Límite máximo: `6` unidades por persona.
* `[ ] [B] [📊 DINÁMICO EXCEL]` **Precios (Cálculo Zero-Trust en Servidor - `Catálogo.xlsx`):**
  * **Valor Normal (Tachado en Front):** `$19.990 CLP`.
  * **Valor Preventa (Real a cobrar):** `$16.990 CLP`.
* `[ ] [B] [📊 DINÁMICO EXCEL]` **Ficha Técnica y Tabla Nutricional (`Ficha Técnica...pdf`):**
  * **Sabor & Modo de Uso:** Frambuesa/Limón | Disolver 1 sachet (3,6g) en 250 mL de agua.
  * **Resolución Sanitaria:** Res. Seremi de Salud R.M N°2513672618 del 15/01/2026.
  * **Valores Nutricionales Críticos (Porción):**
    * Magnesio (Citrato): `72 mg` (24% DDR)
    * Hierro (Bisglicinato ferroso): `16 mg` (114% DDR)
    * Vitamina D3: `15 ug` (600 UI) (300% DDR)

---

## 🧠 4. Backend & Frontend: Lógicas Matemáticas y Formularios `[B]` `[F]`

> 📂 **NOTA DRIVE PARA `[B]` y `[F]`:** El código y el porcentaje de descuento exacto están validados en el archivo **`Catálogo de productos.xlsx`** del Drive. Las zonas de envío deberán ingresarse a mano en la pestaña `TarifasEnvio` por las clientas, ya que descartamos plugins externos.

* `[ ] [B] [📊 DINÁMICO EXCEL]` **Lógica de Cupones:** Programar en `obtenerDescuentoCupon` el cálculo para el cupón `PREVENTA` (aplica 15% de descuento sobre el subtotal, bajando el precio unitario a `$14.441 CLP` aprox).
* `[ ] [F] [📊 DINÁMICO EXCEL]` **UI Cupones y Despacho:** Agregar campo HTML *"Ingresar código de descuento"* y desplegable de **Regiones** (RM `$3.500` / Regiones `$5.000`) en el formulario de Checkout.
* `[ ] [F] [⚡ HARDCODEADO]` **Blindaje de Formulario (Anti-XSS):** Sanitizar los inputs (`nombre`, `rut`, `email`, `direccion`) y deshabilitar el botón de compra con spinner de carga durante el proceso `POST`.

---

## 🚚 5. Operaciones, Legales y Despachos `[T]`

> 📂 **NOTA DRIVE PARA `[T]`:** Para configurar los dominios, revisa el usuario y contraseña en el documento **`Acceso NIC.docx`** del Drive. Respecto a los despachos, **ignora** los archivos `Conectar blueexpress con woocomerce.docx` y `manual_WooCommerce_plugin.pdf`; al no integrar WooCommerce, nuestra arquitectura Serverless no los usará.

* `[ ] [T] [⚡ HARDCODEADO]` **Alerta Arquitectura Blue Express (Serverless):** Confirmar con el cliente que, debido a la arquitectura Serverless (GitHub Pages + Apps Script), NO se instalarán plugins de Blue Express. Los despachos se gestionan aplicando la tabla `TarifasEnvio` en Sheets y exportando un CSV desde `Pedidos` para carga manual en el portal web de Blue Express.
* `[ ] [T] [⚡ HARDCODEADO]` **Resguardo de Accesos:** Almacenar de forma segura (fuera de GitHub) las credenciales de `nic.cl` extraídas de `Acceso NIC.docx`.
* `[ ] [T] [⚡ HARDCODEADO]` **Enrutamiento de Correos (Cloudflare / Gmail):** Asegurar alias `contacto@lynto.cl` / `lyntospa@outlook.com` / `lynto.spa@gmail.com`.
* `[ ] [T] [⚡ HARDCODEADO]` **Páginas Legales:** Validar que el Frontend haya maquetado los textos del documento `Legal ecommerce.docx` (Políticas de devolución y reembolso: 5 a 7 días hábiles vía Flow).

---

## 🧪 6. Pruebas Críticas de Producción (Smoke Tests) `[T]` `[B]`

* `[x] [T] [B] [⚡ HARDCODEADO]` **Prueba de Concurrencia (`LockService` & Reserva Atómica):** 🟢 **COMPLETADO (100%)** (`npm run test:concurrencia` -> 10 peticiones simultáneas sobre `Stock = 1`, 1 compra reservada, 9 rechazadas, 0 sobreventas, 0 acaparamientos).
* `[x] [T] [B] [⚡ HARDCODEADO]` **Webhook S2S y Redirección Cloudflare Edge Worker:** 🟢 **COMPLETADO (100%)** (`/return` redirige HTTP 303 a `exito.html` y `/webhook` entrega HTTP 200 OK limpio a Flow).
* `[ ] [B] [📊 DINÁMICO EXCEL]` **Prueba de Newsletter:** Suscribir un correo desde el footer y verificar registro limpio en la pestaña `Suscriptores`.
* `[ ] [T] [⚡ HARDCODEADO]` **Transición a Producción:** Solicitar llaves de Producción a las clientas, cargar en Script Properties `FLOW_API_KEY` / `FLOW_SECRET_KEY`, cambiar `FLOW_MOCK_MODE = false` y ejecutar compra real de `$100 CLP`.
