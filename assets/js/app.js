/**
 * Lynto - Frontend Core Logic
 * Enfoque Zero-Trust y carga optimizada.
 */

// --- CONFIGURACIÓN ---
// Cada desarrollador puede configurar su propia URL de Apps Script en localStorage para no subirla al repo:
// En la consola del navegador: localStorage.setItem('LYNTO_API_URL', 'https://script.google.com/macros/s/.../exec')
const DEFAULT_API_URL =
  "https://script.google.com/macros/s/AKfycbwCHVelvLNhcb1yK6ZY3UakclYxlp8jXAMxMx3q2TBt3JYtN33HFX2hSYLnW7bm-usg/exec";
const API_URL = localStorage.getItem("LYNTO_API_URL") || DEFAULT_API_URL;

// Constantes de negocio (para visualización preliminar, la verdad la tiene el Sheets backend)
let PRODUCT_PRICE = 19990;
const DESCUENTO_CUPON_UNIDAD = 3000; // Descuento con cupón: $19.990 -> $16.990

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
  const cuponInput = document.getElementById("cupon");
  const btnRestar = document.getElementById("btn-restar");
  const btnSumar = document.getElementById("btn-sumar");

  const displayCantidad = document.getElementById("display-cantidad");
  const displayTotal = document.getElementById("display-total");

  const loadingOverlay = document.getElementById("loading-overlay");
  const errorAlert = document.getElementById("error-alert");
  const errorText = document.getElementById("error-text");

  // Elementos del Newsletter
  const newsletterForm = document.getElementById("newsletter-form");
  const newsletterEmail = document.getElementById("newsletter-email");
  const newsletterMsg = document.getElementById("newsletter-msg");

  // --- CONTROL DE CANTIDAD Y DESCUENTO DE CUPÓN ---
  const actualizarVisualizacionPrecio = () => {
    const cant = parseInt(cantidadInput.value, 10) || 1;
    displayCantidad.innerText = cant;
    
    const cuponVal = cuponInput ? cuponInput.value.trim().toUpperCase() : "";
    let unitPrice = PRODUCT_PRICE;
    let cuponAplicado = false;

    // Si ingresa cualquier código de cupón válido (ej. PREVENTA, PREVENTA15, etc.)
    if (cuponVal.length > 0) {
      unitPrice = Math.max(0, PRODUCT_PRICE - DESCUENTO_CUPON_UNIDAD); // $16.990
      cuponAplicado = true;
    }

    const total = unitPrice * cant;
    displayTotal.innerText = `$${total.toLocaleString("es-CL")} CLP`;

    let badgeCupon = document.getElementById("badge-cupon-aplicado");
    if (cuponAplicado) {
      if (!badgeCupon) {
        badgeCupon = document.createElement("div");
        badgeCupon.id = "badge-cupon-aplicado";
        badgeCupon.style.color = "#2e7d32";
        badgeCupon.style.fontSize = "0.85rem";
        badgeCupon.style.fontWeight = "600";
        badgeCupon.style.marginTop = "6px";
        displayTotal.parentElement.appendChild(badgeCupon);
      }
      badgeCupon.innerHTML = `⚡ ¡Cupón "${cuponVal}" aplicado! ($16.990 CLP / un.)`;
    } else if (badgeCupon) {
      badgeCupon.remove();
    }
  };

  if (cuponInput) {
    cuponInput.addEventListener("input", actualizarVisualizacionPrecio);
  }

  if (btnRestar && btnSumar) {
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
        cantidadInput.value = current + 1;
        actualizarVisualizacionPrecio();
      } else {
        mostrarError(
          "Por motivos de seguridad, el límite máximo por compra de preventa es de 10 unidades.",
        );
      }
    });
  }

  // --- FORMATEADOR Y VALIDADOR DE RUT CHILENO ---
  if (rutInput) {
    rutInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/[^0-9kK]/g, "");
      if (value.length > 9) {
        value = value.slice(0, 9);
      }

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
  }

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
    if (errorText && errorAlert) {
      errorText.innerText = msg;
      errorAlert.classList.remove("hidden");
      errorAlert.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const ocultarError = () => {
    if (errorAlert) errorAlert.classList.add("hidden");
  };

  // --- SUBMIT DEL CHECKOUT ---
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      ocultarError();

      const nombre = document.getElementById("nombre").value.trim();
      const rut = rutInput.value.trim();
      const email = emailInput.value.trim();
      const telefonoEl = document.getElementById("telefono");
      const regionEl = document.getElementById("region");
      const comunaEl = document.getElementById("comuna");
      const cuponEl = document.getElementById("cupon");

      const telefono = telefonoEl ? telefonoEl.value.trim() : "";
      const region = regionEl ? regionEl.value.trim() : "";
      const comuna = comunaEl ? comunaEl.value.trim() : "";
      const cupon = cuponEl ? cuponEl.value.trim().toUpperCase() : "";
      const direccion = document.getElementById("direccion").value.trim();
      const cantidad = parseInt(cantidadInput.value, 10);

      if (!nombre)
        return mostrarError("Por favor, ingresa tu nombre completo.");

      if (!validarRut(rut)) {
        return mostrarError("El RUT ingresado no es válido. Ej: 12.345.678-9");
      }

      if (!validarEmail(email)) {
        return mostrarError(
          "El correo electrónico no tiene un formato válido.",
        );
      }

      if (!telefono) {
        return mostrarError("Por favor, ingresa tu teléfono celular para el seguimiento del envío.");
      }

      if (!region) {
        return mostrarError("Por favor, selecciona tu región de despacho.");
      }

      if (!comuna) {
        return mostrarError("Por favor, ingresa tu comuna.");
      }

      if (!direccion)
        return mostrarError("Por favor, ingresa tu dirección completa de despacho.");

      if (isNaN(cantidad) || cantidad <= 0) {
        return mostrarError("Cantidad inválida.");
      }

      loadingOverlay.classList.remove("hidden");
      loadingOverlay.classList.add("flex");

      const payload = {
        nombre,
        rut,
        email,
        telefono,
        region,
        comuna,
        direccion,
        cantidad,
        cupon,
      };

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status} al conectar con el servidor.`,
          );
        }

        const resData = await response.json();

        if (resData.success && resData.data && resData.data.url) {
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
  }

  // --- SUBMIT DEL NEWSLETTER ---
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();

      if (!validarEmail(email)) {
        newsletterMsg.innerText = "Por favor, ingresa un correo válido.";
        newsletterMsg.style.color = "#c62828";
        newsletterMsg.classList.remove("hidden");
        return;
      }

      newsletterMsg.innerText = "Enviando suscripción...";
      newsletterMsg.style.color = "#555";
      newsletterMsg.classList.remove("hidden");

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            action: "subscribe",
            email: email,
            origen: "Landing Page",
          }),
        });

        const resData = await response.json();

        if (resData.success) {
          newsletterMsg.innerText =
            resData.message || "¡Gracias por suscribirte!";
          newsletterMsg.style.color = "#2e7d32";
          newsletterEmail.value = "";
        } else {
          newsletterMsg.innerText =
            resData.message || "No se pudo realizar la suscripción.";
          newsletterMsg.style.color = "#c62828";
        }
      } catch (err) {
        console.error(err);
        newsletterMsg.innerText = "Error de conexión al suscribirse.";
        newsletterMsg.style.color = "#c62828";
      }
    });
  }

  // --- CARGA DINÁMICA DESDE GOOGLE SHEETS (get_config) ---
  const cargarConfiguracion = async () => {
    try {
      console.log("⏳ Solicitando configuración inicial desde Google Sheets...");
      if (displayTotal) displayTotal.classList.add("total-price-loading");
      const response = await fetch(`${API_URL}?action=get_config`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} al consultar la configuración.`);
      }

      const resData = await response.json();
      if (!resData.success) {
        console.warn("⚠️ La respuesta de get_config no indicó éxito:", resData);
        return;
      }

      // Estructura oficial enviada por el Backend: resData.config, resData.producto, resData.nutricion (soporta resData.data también)
      const dataPayload = resData.data || resData;
      const producto = dataPayload.producto || {};
      const config = dataPayload.config || dataPayload.configuracion || {};
      const nutricion = dataPayload.nutricion || [];

      // 1. Datos del Producto (Inventario: precio y stock)
      const precioVal = producto.precio !== undefined ? producto.precio : (config.PRECIO_PREVENTA || config.precio || config.precioproducto);
      const stockVal = producto.stock !== undefined ? producto.stock : (config.STOCK_DISPONIBLE || config.stock || config.stockproducto);

      if (precioVal !== undefined && !isNaN(Number(precioVal))) {
        PRODUCT_PRICE = Number(precioVal);
        actualizarVisualizacionPrecio();
      }

      // Control dinámico de botones según stock real disponible
      const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
      if (stockVal !== undefined && !isNaN(Number(stockVal))) {
        const numStock = Number(stockVal);
        if (numStock <= 0) {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Agotado - Stock Agotado</span>`;
            submitBtn.style.opacity = "0.6";
            submitBtn.style.cursor = "not-allowed";
          }
        } else {
          if (submitBtn && submitBtn.disabled) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Quiero mi Iron Girl en Preventa ⚡</span>`;
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
          }
        }
      }

      // 2. Normalizar claves de configuración para reemplazo seguro
      const configMap = {};
      if (Array.isArray(config)) {
        config.forEach((item) => {
          if (item.Clave || item.clave) {
            const k = String(item.Clave || item.clave).toLowerCase().replace(/[^a-z0-9]/g, "");
            configMap[k] = item.Valor || item.valor || "";
          }
        });
      } else if (typeof config === "object") {
        Object.keys(config).forEach((key) => {
          const k = key.toLowerCase().replace(/[^a-z0-9]/g, "");
          configMap[k] = config[key];
        });
      }

      // 3. Inyección dinámica de textos configurables
      const heroTituloEl = document.getElementById("hero-titulo");
      const heroTituloVal = configMap["titulositio"] || configMap["herotitulo"] || configMap["titulo"];
      if (heroTituloEl && heroTituloVal) heroTituloEl.innerText = heroTituloVal;

      const heroSubtituloEl = document.getElementById("hero-subtitulo");
      const heroSubtituloVal = configMap["subtitulo"] || configMap["herosubtitulo"];
      if (heroSubtituloEl && heroSubtituloVal) heroSubtituloEl.innerText = heroSubtituloVal;

      const productoDescEl = document.getElementById("producto-descripcion");
      const productoDescVal = producto.descripcion || configMap["productodescripcion"] || configMap["descripcionproducto"];
      if (productoDescEl && productoDescVal) productoDescEl.innerText = productoDescVal;

      const nosotrasDescEl = document.getElementById("nosotras-descripcion");
      const nosotrasVal = configMap["nosotrashistoria"] || configMap["nosotrasdescripcion"];
      if (nosotrasDescEl && nosotrasVal) nosotrasDescEl.innerText = nosotrasVal;

      const despachoInfoEl = document.getElementById("despacho-info");
      const despachoVal = configMap["despachoinfo"] || configMap["envioinfo"];
      if (despachoInfoEl && despachoVal) despachoInfoEl.innerText = despachoVal;

      const disclaimerEl = document.getElementById("disclaimer-legal");
      const disclaimerVal = configMap["disclaimerlegal"] || configMap["disclaimer"];
      if (disclaimerEl && disclaimerVal) disclaimerEl.innerText = disclaimerVal;

      // 4. Tabla Nutricional (#tabla-nutricion-body)
      const tablaBody = document.getElementById("tabla-nutricion-body");
      if (tablaBody && Array.isArray(nutricion) && nutricion.length > 0) {
        tablaBody.innerHTML = "";
        nutricion.forEach((row) => {
          const comp = row.componente || row.Componente || row[0] || "";
          const cant = row.cantidad || row.Cantidad || row[1] || "";
          const ddr = row.ddr || row.DDR || row[2] || "";

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${comp}</td>
            <td>${cant}</td>
            <td>${ddr}</td>
          `;
          tablaBody.appendChild(tr);
        });
      }

      console.log("✅ Configuración dinámica de Sheets cargada con éxito.");
    } catch (error) {
      console.warn("⚠️ No se pudo cargar la configuración dinámica desde Sheets (se mantendrán los valores por defecto):", error.message);
    } finally {
      if (displayTotal) displayTotal.classList.remove("total-price-loading");
    }
  };

  actualizarVisualizacionPrecio();
  cargarConfiguracion();
});
