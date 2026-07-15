# Lynto Frontend (La Vitrina)

Este es el repositorio de frontend para la landing page de la preventa del suplemento de **Lynto**. Está diseñado como un sitio estático One-Page optimizado para rendimiento extremo, velocidad de carga y conversión de ventas, enfocado en dispositivos móviles (Mobile-First).

---

## 🏗️ Arquitectura del Repositorio

El frontend sigue una política de **Zero-Trust (Frontend Tonto)**: la interfaz recopila los datos del cliente, pero **nunca** calcula precios finales. El backend manda y es el único validador y emisor de montos.

```
├── .gitignore            # Archivos ignorados por Git
├── package.json          # Servidor de desarrollo (Vite) y formateadores (Prettier, ESLint)
├── README.md             # Esta guía de inicio
├── index.html            # Landing page principal y formulario de checkout
├── exito.html            # Pantalla de confirmación de pago exitoso
├── terminos.html         # Términos y condiciones con Disclaimer obligatorio
├── privacidad.html       # Políticas de privacidad y tratamiento de datos
└── assets/
    ├── css/
    │   └── style.css     # Estilos a medida, variables de diseño y animaciones
    └── js/
        └── app.js        # Lógica de checkout, formateador de RUT y fetch a la API
```

---

## 🛠️ Tecnologías Empleadas

Para cumplir con la promesa de **$0 costo de mantención** y velocidad máxima:
1. **Estructura**: HTML5 semántico y accesible.
2. **Estilo**: Tailwind CSS (vía CDN oficial de alto rendimiento) junto a Vanilla CSS en `style.css` para variables, fuentes, efectos de glassmorphism y micro-animaciones premium.
3. **Lógica**: Vanilla JavaScript moderno (sin empaquetadores complejos, compatible 100% con hosting estático).
4. **Hosting de Producción**: GitHub Pages (con dominio propio).

---

## 🚀 Cómo Empezar a Desarrollar YA (Sin esperar accesos ni la API real)

Para evitar cuellos de botella mientras las clientas nos dan los accesos al Excel corporativo y la cuenta de Flow, hemos configurado un **sistema de pruebas desacoplado** usando el backend en **Mock Mode**.

### Paso 1: Levantar el Servidor de Desarrollo Local
Aunque el sitio es estático, para habilitar la recarga en vivo (hot reload) y evitar problemas de políticas de seguridad locales del navegador, usamos Vite como servidor de desarrollo:

1. **Instalar dependencias de desarrollo**:
   ```bash
   npm install
   ```
2. **Iniciar servidor local**:
   ```bash
   npm run dev
   ```
3. Abre en tu navegador la dirección indicada (usualmente `http://localhost:5173`).

---

## 🔌 Conexión con el Backend en Apps Script

Para que cada desarrollador (Tú, Chris o el Frontend Dev) pueda probar de manera independiente sin pisar la configuración de los demás ni alterar archivos del Git, `app.js` lee la URL de la API desde el almacenamiento local del navegador (`localStorage`).

### Cómo enlazar con tu Apps Script de Pruebas:
1. Copia la URL de la Web App obtenida de tu despliegue de Apps Script en tu Drive (ver pasos en el README del backend).
2. Abre la consola de desarrollo de tu navegador (`F12` o `Cmd+Option+I`) en el sitio local de la landing (`http://localhost:5173`).
3. Ejecuta el siguiente comando con tu URL de pruebas:
   ```javascript
   localStorage.setItem('LYNTO_API_URL', 'AQUÍ_PEGA_TU_URL_DE_WEB_APP_APPS_SCRIPT');
   ```
4. Recarga la página. Verás un log en consola confirmando la conexión:
   `🔌 Conectado a la API: https://script.google.com/macros/s/...`
5. ¡Listo! Al llenar el formulario y darle a "Proceder al Pago", la petición POST se enviará a tu script personal, el cual simulará el pago en la pasarela de Flow (Mock Mode) y te redirigirá automáticamente a la pantalla de éxito.

---

## 🧑‍💻 Flujo de Trabajo del Equipo (3 Devs)

1. **Ramas de Trabajo**:
   - `main` es la rama sagrada. Nunca subas cambios directos aquí.
   - Crea ramas secundarias descriptivas: `feature/nombre-de-la-seccion`.
2. **Calidad de Código**:
   - Antes de abrir un PR, formatea tus archivos:
     ```bash
     npm run format
     ```
   - Abre un Pull Request en GitHub para que el **Tech Lead** revise y apruebe antes de fusionar a `main`.