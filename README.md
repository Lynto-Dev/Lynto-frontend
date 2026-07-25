# 🌿 Lynto Frontend (La Vitrina - UI/UX & Client Logic)

Este es el repositorio del frontend para la landing page de preventa del suplemento alimenticio **Lynto** (`https://lynto.cl`). Está diseñado como un sitio web estático One-Page de alto impacto visual, optimizado para conversión en dispositivos móviles (Mobile-First), velocidad extrema y carga dinámica sin costos fijos de servidor.

---

## 🤖 Protocolo Obligatorio para Agentes de IA (Antigravity, Cursor, Copilot) y Desarrolladores

Para mantener la calidad estética, evitar regresiones en la integración con el backend y prevenir la sobreescritura de código:

1. **Sincronización Previa (`git pull`):**
   * Todo agente de IA o desarrollador DEBE ejecutar `git pull origin develop` antes de realizar modificaciones.
2. **Política Zero-Trust (El Frontend NUNCA Calcula Precios):**
   * El cliente recopila los datos (nombre, RUT, email, dirección, cantidad), pero **JAMÁS calcula ni valida montos en JavaScript**. El backend en Apps Script es la única fuente de la verdad para precios, cupones y despacho.
3. **Protección del DOM y Sanitización (Anti-XSS):**
   * Todas las entradas de usuario deben ser sanitizadas antes de ser procesadas. Se debe inhabilitar la manipulación directa del DOM previa al envío `POST` y deshabilitar botones durante la petición para evitar doble clic.
4. **Verificación de Diffs antes de Commitear:**
   * Ejecutar `git diff` antes de commitear para asegurar que no se borren scripts de redirección (`target="_top"`) ni configuraciones de API.

---

## 🗺️ Roadmap Completo: Lo que se Debe Hacer para Completar el Proyecto

El Frontend Specialist (o el Agente de IA asignado al frontend) debe ejecutar y validar las siguientes tareas clave para llevar la aplicación a un estado listo para producción:

### 1️⃣ Rediseño Estético Visual Premium (CSS & Maquetación)
* **Objetivo:** Transformar el esqueleto HTML actual en una experiencia visual impactante que genere confianza e impulse la compra.
* **Archivos:** `assets/css/style.css` e `index.html`.
* **Lineamientos Estéticos:**
  * **Tipografía:** Importar desde Google Fonts las familias **`Outfit`** (encabezados/títulos) e **`Inter`** (cuerpo/textos).
  * **Paleta de Colores HSL:** Usar colores curados de nutrición y bienestar (tonos esmeralda `#10b981`, verdes menta, fondos oscuros slate `#0b0f19` / `#111827` y acentos dorados suaves).
  * **Glassmorphism & Gradientes:** Incorporar tarjetas con efecto traslúcido (`backdrop-filter: blur(12px)`), bordes sutiles con opacidad y gradientes suaves.
  * **Micro-animaciones:** Efectos hover suaves en botones, estados de foco estilizados en inputs, indicadores de carga (spinners) y animaciones sutiles de entrada (fade-in/pulse).

### 2️⃣ Inyección Dinámica de Contenido desde el Backend (`get_config`)
* **Objetivo:** Eliminar todos los placeholders del HTML (`[Insertar gancho...]`, `[Componente 1]`, etc.) y renderizarlos dinámicamente desde la base de datos de Google Sheets.
* **Archivo:** `assets/js/app.js`.
* **Instrucciones de Implementación:**
  * Al cargar la página (`DOMContentLoaded`), ejecutar una petición HTTP `GET` a `API_URL + "?action=get_config"`.
  * Leer el JSON retornado (`config` y `nutricion`).
  * Inyectar dinámicamente en los elementos correspondientes de `index.html`:
    * `hero_titulo`, `hero_subtitulo`, `disclaimer_legal`, `foto_hero_url`.
    * Precio del suplemento (`$29.990 CLP`), stock disponible y límite máximo por compra (`limite_compra`).
    * Filas de la **Tabla Nutricional** (`Componente`, `Cantidad`, `% DDR`).

### 3️⃣ Componentes de Checkout Ampliados (Cupones y Envío Regional)
* **Objetivo:** Dar soporte visual al motor de promociones y calculadoras regionales del backend.
* **Archivos:** `index.html` y `assets/js/app.js`.
* **Acciones:**
  * Agregar un selector desplegable (`<select>`) de **Regiones de Chile** para seleccionar la zona de despacho (`Región Metropolitana` vs `Regiones`).
  * Agregar un campo de entrada para **Cupón Promocional** (ej. `PREVENTA20`).
  * Mostrar el desglose dinámico estimado: **Subtotal + Despacho - Descuento = Total Final**.

### 4️⃣ Seguridad DOM y Sanitización Anti-Inyección (XSS)
* **Objetivo:** Garantizar que el formulario no sea vulnerable a manipulaciones maliciosas.
* **Archivo:** `assets/js/app.js`.
* **Acciones:**
  * Escapar caracteres especiales (`<`, `>`, `&`, `"`, `'`) en los inputs del usuario antes de estructurar el payload JSON.
  * Congelar la interfaz y mostrar un modal overlay con indicador de carga cuando el usuario presiona "Proceder al Pago".

### 5️⃣ Revisión y Refinamiento del Arte de Correos Transaccionales 🎨
* **Objetivo:** Asegurar que los correos que le llegan al cliente tras la compra mantengan la misma identidad estética premium que la landing page.
* **Ubicación:** El código HTML/CSS de los correos reside en el backend (`Lynto-backend/src/mail.js`).
* **Acciones:**
  * El Frontend Dev debe revisar el arte y la maquetación HTML/CSS del archivo `src/mail.js` del backend.
  * Refinar la tipografía, márgenes, paleta de colores, cabeceras con el logo de Lynto y la tabla del resumen del pedido para que la experiencia post-compra sea 100% coherente con el diseño de la web.

### 6️⃣ Pruebas de Mutación en Vivo
* **Objetivo:** Verificar que cuando las clientas editen textos o fotos en su planilla de Google Sheets, la landing page se actualice limpiamente al recargar, sin desestructurar el diseño CSS.

---

## 🏗️ Arquitectura del Repositorio Frontend

```
├── .gitignore            # Archivos ignorados por Git
├── package.json          # Servidor de desarrollo (Vite) y Prettier/ESLint
├── README.md             # Esta guía de arquitectura y tareas pendientes
├── AVANCE_PROYECTO.md    # Informe máster de avance de proyecto
├── index.html            # Landing page principal y formulario de checkout
├── exito.html            # Pantalla de confirmación de pago exitoso (target="_top")
├── terminos.html         # Términos y condiciones normativos
├── privacidad.html       # Políticas de privacidad
└── assets/
    ├── css/
    │   └── style.css     # Sistema de diseño CSS, variables HSL, fuentes y animaciones
    └── js/
        └── app.js        # Formateador RUT Módulo 11, fetch GET/POST y control del checkout
```

---

## 🚀 Desarrollo Local

```bash
# 1. Instalar dependencias locales
npm install

# 2. Iniciar servidor de desarrollo con recarga rápida (Vite)
npm run dev

# 3. Formatear código antes de commitear
npm run format
```