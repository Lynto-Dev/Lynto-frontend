/**
 * Lynto - Frontend Core Logic
 * Enfoque Zero-Trust y carga optimizada.
 */

// --- CONFIGURACIÓN ---
// Cada desarrollador puede configurar su propia URL de Apps Script en localStorage para no subirla al repo:
// En la consola del navegador: localStorage.setItem('LYNTO_API_URL', 'https://script.google.com/macros/s/.../exec')
const DEFAULT_API_URL =
  "https://script.google.com/macros/s/AKfycbx_TU_EJEMPLO_PRODUCCION/exec";
const API_URL = localStorage.getItem("LYNTO_API_URL") || DEFAULT_API_URL;

// Constantes de negocio (para visualización preliminar, la verdad la tiene el Sheets backend)
const PRODUCT_PRICE = 29990;

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Lynto Frontend inicializado.");
  console.log(`🔌 Conectado a la API: ${API_URL}`);
  if (!localStorage.getItem("LYNTO_API_URL")) {
    console.info(
      '💡 Tip: Puedes configurar tu propia API de pruebas ejecutando:\nlocalStorage.setItem("LYNTO_API_URL", "TU_WEB_APP_URL")',
    );
  }

  // Elementos del DOM
  const form = document.getElementById("checkout-form");
  const rutInput = document.getElementById("rut");
  const emailInput = document.getElementById("email");
  const cantidadInput = document.getElementById("cantidad");
  const btnRestar = document.getElementById("btn-restar");
  const btnSumar = document.getElementById("btn-sumar");

  const displayCantidad = document.getElementById("display-cantidad");
  const displayTotal = document.getElementById("display-total");

  const loadingOverlay = document.getElementById("loading-overlay");
  const errorAlert = document.getElementById("error-alert");
  const errorText = document.getElementById("error-text");

  // --- CONTROL DE CANTIDAD ---
  const actualizarVisualizacionPrecio = () => {
    const cant = parseInt(cantidadInput.value, 10) || 1;
    displayCantidad.innerText = cant;
    const total = PRODUCT_PRICE * cant;
    displayTotal.innerText = `$${total.toLocaleString("es-CL")} CLP`;
  };

  btnRestar.addEventListener("click", () => {
    let current = parseInt(cantidadInput.value, 10) || 1;
    if (current > 1) {
      cantidadInput.value = current - 1;
      actualizarVisualizacionPrecio();
    }
  });

  btnSumar.addEventListener("click", () => {
    let current = parseInt(cantidadInput.value, 10) || 1;
    if (current < 10) {
      // Límite por transacción recomendado en reglas de negocio
      cantidadInput.value = current + 1;
      actualizarVisualizacionPrecio();
    } else {
      mostrarError(
        "Por motivos de seguridad, el límite máximo por compra de preventa es de 10 unidades.",
      );
    }
  });

  // --- FORMATEADOR Y VALIDADOR DE RUT CHILENO ---
  rutInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/[^0-9kK]/g, "");
    if (value.length > 9) {
      value = value.slice(0, 9);
    }

    // Formatear dinámicamente como 12.345.678-9
    if (value.length > 1) {
      const dv = value.slice(-1).toUpperCase();
      const numbers = value.slice(0, -1);

      let formatted = "";
      if (numbers.length > 6) {
        formatted = `${numbers.slice(0, -6)}.${numbers.slice(-6, -3)}.${numbers.slice(-3)}-${dv}`;
      } else if (numbers.length > 3) {
        formatted = `${numbers.slice(0, -3)}.${numbers.slice(-3)}-${dv}`;
      } else {
        formatted = `${numbers}-${dv}`;
      }
      e.target.value = formatted;
    } else {
      e.target.value = value.toUpperCase();
    }
  });

  const validarRut = (rut) => {
    if (!rut) return false;
    const cleanRut = rut.replace(/[^0-9kK]/g, "").toUpperCase();
    if (cleanRut.length < 8) return false;

    const cuerpo = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    let dvEsperado = 11 - (suma % 11);
    if (dvEsperado === 11) dvEsperado = "0";
    else if (dvEsperado === 10) dvEsperado = "K";
    else dvEsperado = dvEsperado.toString();

    return dv === dvEsperado;
  };

  // --- VALIDACIÓN DE EMAIL ---
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // --- MENSAJES DE ERROR EN UI ---
  const mostrarError = (msg) => {
    errorText.innerText = msg;
    errorAlert.classList.remove("hidden");
    // Scroll suave hasta el mensaje de error
    errorAlert.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const ocultarError = () => {
    errorAlert.classList.add("hidden");
  };

  // --- SUBMIT DEL CHECKOUT ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarError();

    const nombre = document.getElementById("nombre").value.trim();
    const rut = rutInput.value.trim();
    const email = emailInput.value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const cantidad = parseInt(cantidadInput.value, 10);

    // Validaciones locales rápidas
    if (!nombre) return mostrarError("Por favor, ingresa tu nombre completo.");
    if (!direccion)
      return mostrarError("Por favor, ingresa una dirección de despacho.");

    if (!validarRut(rut)) {
      return mostrarError("El RUT ingresado no es válido. Ej: 12.345.678-9");
    }

    if (!validarEmail(email)) {
      return mostrarError("El correo electrónico no tiene un formato válido.");
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      return mostrarError("Cantidad inválida.");
    }

    // Activar pantalla de carga
    loadingOverlay.classList.remove("hidden");
    loadingOverlay.classList.add("flex");

    const payload = {
      nombre,
      rut,
      email,
      direccion,
      cantidad,
    };

    try {
      // Como Google Apps Script Web App requiere redirección, fetch maneja esto de fondo.
      // Es posible que el navegador tire error de CORS si el script no está configurado como público (Anyone).
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8", // Evita gatillar preflight OPTIONS en GAS
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} al conectar con el servidor.`);
      }

      const resData = await response.json();
      console.log("Respuesta del servidor:", resData);

      if (resData.success && resData.data && resData.data.url) {
        // Redirigir a Flow o al Simulador
        window.location.href = resData.data.url;
      } else {
        throw new Error(
          resData.message || "Error desconocido al registrar pedido.",
        );
      }
    } catch (err) {
      console.error(err);
      loadingOverlay.classList.add("hidden");
      loadingOverlay.classList.remove("flex");
      mostrarError(
        `No se pudo procesar la compra: ${err.message}. Verifica que la URL del servidor esté activa.`,
      );
    }
  });

  // Inicializar precio al cargar
  actualizarVisualizacionPrecio();
});
