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

  // --- CARRUSEL BANNER ELÉCTRICO DEL HERO ---
  const heroTrack = document.getElementById("hero-carousel-track");
  const heroSlides = heroTrack ? heroTrack.querySelectorAll(".hero-carousel-slide") : [];
  const heroDots = document.querySelectorAll("#hero-carousel-dots .dot");
  const btnHeroPrev = document.getElementById("hero-carousel-prev");
  const btnHeroNext = document.getElementById("hero-carousel-next");
  let currentHeroSlide = 0;
  let heroTimer = null;

  const showHeroSlide = (index) => {
    if (!heroSlides.length) return;
    if (index < 0) currentHeroSlide = heroSlides.length - 1;
    else if (index >= heroSlides.length) currentHeroSlide = 0;
    else currentHeroSlide = index;

    heroSlides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentHeroSlide);
    });

    heroDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentHeroSlide);
    });
  };

  const nextHeroSlide = () => showHeroSlide(currentHeroSlide + 1);
  const prevHeroSlide = () => showHeroSlide(currentHeroSlide - 1);

  const startHeroAutoplay = () => {
    stopHeroAutoplay();
    heroTimer = setInterval(nextHeroSlide, 5000);
  };

  const stopHeroAutoplay = () => {
    if (heroTimer) clearInterval(heroTimer);
  };

  if (btnHeroNext) {
    btnHeroNext.addEventListener("click", () => {
      nextHeroSlide();
      startHeroAutoplay();
    });
  }

  if (btnHeroPrev) {
    btnHeroPrev.addEventListener("click", () => {
      prevHeroSlide();
      startHeroAutoplay();
    });
  }

  heroDots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-index"), 10);
      if (!isNaN(idx)) {
        showHeroSlide(idx);
        startHeroAutoplay();
      }
    });
  });

  // Touch Swipe en el Banner del Hero para Celulares
  if (heroTrack) {
    let touchStartX = 0;
    let touchEndX = 0;

    heroTrack.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroTrack.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 40) {
        nextHeroSlide();
        startHeroAutoplay();
      } else if (touchEndX - touchStartX > 40) {
        prevHeroSlide();
        startHeroAutoplay();
      }
    }, { passive: true });

    // Iniciar autoplay
    startHeroAutoplay();
  }

  // --- CONTROL DEL MODAL DE RESUMEN Y CÁLCULO DINÁMICO DE ENVÍO ---
  let TARIFA_RM = 3500;
  let TARIFA_REGIONES = 5000;
  let MAPA_TARIFAS_ENVIO = {};
  let ultimoDescuentoCupon = 0;
  let descuentoPorUnidadCupon = 3000;
  let porcentajeDescuentoCupon = 0;
  let cuponAplicadoExitoso = false;

  const btnAbrirResumen = document.getElementById("btn-abrir-resumen");
  const modalResumen = document.getElementById("modal-resumen");
  const btnCerrarModal = document.getElementById("btn-cerrar-modal");

  const regionSelect = document.getElementById("region");
  const comunaInput = document.getElementById("comuna");
  const direccionInput = document.getElementById("direccion");
  const nombreInput = document.getElementById("nombre");

  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryEnvio = document.getElementById("summary-envio");
  const summaryDescuento = document.getElementById("summary-descuento");
  const rowDescuento = document.getElementById("row-descuento");

  const modalUserName = document.getElementById("modal-user-name");
  const modalUserAddress = document.getElementById("modal-user-address");
  const modalUserRegion = document.getElementById("modal-user-region");
  const modalProductQty = document.getElementById("modal-product-qty");
  const modalProductSubtotalItem = document.getElementById("modal-product-subtotal-item");

  const btnAplicarCupon = document.getElementById("btn-aplicar-cupon");
  const cuponStatusMsg = document.getElementById("cupon-status-msg");

  const aceptoTerminosCheckbox = document.getElementById("acepto-terminos");
  const btnConfirmarPagoFlow = document.getElementById("btn-confirmar-pago-flow");

  // --- MAPA DE COMUNAS POR REGIÓN EN CHILE CON NOMBRES OFICIALES COMPLETOS ---
  const COMUNAS_POR_REGION = {
    "Región Metropolitana": [
      { code: "STGO", name: "Santiago Centro" },
      { code: "LCIS", name: "La Cisterna" },
      { code: "LAFL", name: "La Florida" },
      { code: "LCON", name: "Las Condes" },
      { code: "PROV", name: "Providencia" },
      { code: "MAIP", name: "Maipú" },
      { code: "PALO", name: "Puente Alto" },
      { code: "SBER", name: "San Bernardo" },
      { code: "NUNO", name: "Ñuñoa" },
      { code: "VITA", name: "Vitacura" },
      { code: "LBAR", name: "Lo Barnechea" },
      { code: "PENA", name: "Peñalolén" },
      { code: "MACU", name: "Macul" },
      { code: "LREI", name: "La Reina" },
      { code: "RECO", name: "Recoleta" },
      { code: "INDE", name: "Independencia" },
      { code: "HUEC", name: "Huechuraba" },
      { code: "CONC", name: "Conchalí" },
      { code: "QUIL", name: "Quilicura" },
      { code: "RENC", name: "Renca" },
      { code: "PUDA", name: "Pudahuel" },
      { code: "CNAV", name: "Cerro Navia" },
      { code: "LPRA", name: "Lo Prado" },
      { code: "QNOR", name: "Quinta Normal" },
      { code: "ECEN", name: "Estación Central" },
      { code: "CERR", name: "Cerrillos" },
      { code: "PACE", name: "Pedro Aguirre Cerda" },
      { code: "SMIG", name: "San Miguel" },
      { code: "SJOA", name: "San Joaquín" },
      { code: "LGRA", name: "La Granja" },
      { code: "SRAM", name: "San Ramón" },
      { code: "LPIN", name: "La Pintana" },
      { code: "LESP", name: "Lo Espejo" },
      { code: "EBOS", name: "El Bosque" },
      { code: "SJMA", name: "San José de Maipo" },
      { code: "PIRQ", name: "Pirque" },
      { code: "CTAN", name: "Calera de Tango" },
      { code: "BUIN", name: "Buin" },
      { code: "PAIN", name: "Paine" },
      { code: "COLI", name: "Colina" },
      { code: "LAMP", name: "Lampa" },
      { code: "TILT", name: "Tiltil" },
      { code: "TALA", name: "Talagante" },
      { code: "PENF", name: "Peñaflor" },
      { code: "ISMA", name: "Isla de Maipo" },
      { code: "EMON", name: "El Monte" },
      { code: "PHUR", name: "Padre Hurtado" },
      { code: "MELI", name: "Melipilla" },
      { code: "ALHU", name: "Alhué" },
      { code: "CURA", name: "Curacaví" },
      { code: "MPIN", name: "María Pinto" },
      { code: "SPED", name: "San Pedro" }
    ],
    "Región de Valparaíso": [
      { code: "VALP", name: "Valparaíso" },
      { code: "VINA", name: "Viña del Mar" },
      { code: "CONC", name: "Concón" },
      { code: "QUIL", name: "Quilpué" },
      { code: "VALE", name: "Villa Alemana" },
      { code: "LIMA", name: "Limache" },
      { code: "OLMU", name: "Olmué" },
      { code: "QUIL", name: "Quillota" },
      { code: "LCRU", name: "La Cruz" },
      { code: "CALE", name: "Calera" },
      { code: "HIJU", name: "Hijuelas" },
      { code: "NOGA", name: "Nogales" },
      { code: "LAND", name: "Los Andes" },
      { code: "CLAR", name: "Calle Larga" },
      { code: "RINC", name: "Rinconada" },
      { code: "SEST", name: "San Esteban" },
      { code: "SFEL", name: "San Felipe" },
      { code: "CATE", name: "Catemu" },
      { code: "LLAI", name: "Llaillay" },
      { code: "PANQ", name: "Panquehue" },
      { code: "PUTA", name: "Putaendo" },
      { code: "SMAR", name: "Santa María" },
      { code: "SANT", name: "San Antonio" },
      { code: "ALGA", name: "Algarrobo" },
      { code: "CART", name: "Cartagena" },
      { code: "EQUI", name: "El Quisco" },
      { code: "ETAB", name: "El Tabo" },
      { code: "SDOM", name: "Santo Domingo" },
      { code: "CASA", name: "Casablanca" },
      { code: "LLIG", name: "La Ligua" },
      { code: "CABI", name: "Cabildo" },
      { code: "PAPU", name: "Papudo" },
      { code: "PETO", name: "Petorca" },
      { code: "ZAPA", name: "Zapallar" },
      { code: "PUCH", name: "Puchuncaví" },
      { code: "QUIN", name: "Quintero" },
      { code: "IPAS", name: "Isla de Pascua" },
      { code: "JFER", name: "Juan Fernández" }
    ],
    "Región del Biobío": [
      { code: "CONC", name: "Concepción" },
      { code: "TALC", name: "Talcahuano" },
      { code: "SPAZ", name: "San Pedro de la Paz" },
      { code: "CHIG", name: "Chiguayante" },
      { code: "HUAL", name: "Hualpén" },
      { code: "CORO", name: "Coronel" },
      { code: "LOTA", name: "Lota" },
      { code: "PENC", name: "Penco" },
      { code: "TOME", name: "Tomé" },
      { code: "HUAQ", name: "Hualqui" },
      { code: "FLOR", name: "Florida" },
      { code: "SJUA", name: "Santa Juana" },
      { code: "LANG", name: "Los Ángeles" },
      { code: "ANTU", name: "Antuco" },
      { code: "CABR", name: "Cabrero" },
      { code: "LAJA", name: "Laja" },
      { code: "MULC", name: "Mulchén" },
      { code: "NACI", name: "Nacimiento" },
      { code: "NEGR", name: "Negrete" },
      { code: "QLAC", name: "Quilaco" },
      { code: "QLEC", name: "Quilleco" },
      { code: "SROS", name: "San Rosendo" },
      { code: "SBAR", name: "Santa Bárbara" },
      { code: "TUCA", name: "Tucapel" },
      { code: "YUMB", name: "Yumbel" },
      { code: "ABIO", name: "Alto Biobío" },
      { code: "LEBU", name: "Lebu" },
      { code: "ARAU", name: "Arauco" },
      { code: "CANE", name: "Cañete" },
      { code: "CONT", name: "Contulmo" },
      { code: "CURA", name: "Curanilahue" },
      { code: "LALA", name: "Los Álamos" },
      { code: "TIRU", name: "Tirúa" }
    ],
    "Región de La Araucanía": [
      { code: "TEMU", name: "Temuco" },
      { code: "PLCAS", name: "Padre Las Casas" },
      { code: "CARA", name: "Carahue" },
      { code: "CHOL", name: "Cholchol" },
      { code: "CUNC", name: "Cunco" },
      { code: "CURA", name: "Curarrehue" },
      { code: "FREI", name: "Freire" },
      { code: "GALV", name: "Galvarino" },
      { code: "GORB", name: "Gorbea" },
      { code: "LAUT", name: "Lautaro" },
      { code: "LONC", name: "Loncoche" },
      { code: "MELI", name: "Melipeuco" },
      { code: "NIMP", name: "Nueva Imperial" },
      { code: "PERQ", name: "Perquenco" },
      { code: "PITR", name: "Pitrufquén" },
      { code: "PUCO", name: "Pucón" },
      { code: "SAAV", name: "Saavedra" },
      { code: "TSCH", name: "Teodoro Schmidt" },
      { code: "TOLT", name: "Toltén" },
      { code: "VILC", name: "Vilcún" },
      { code: "VILL", name: "Villarrica" },
      { code: "ANGO", name: "Angol" },
      { code: "COLL", name: "Collipulli" },
      { code: "CURA", name: "Curacautín" },
      { code: "ERCI", name: "Ercilla" },
      { code: "LONQ", name: "Lonquimay" },
      { code: "LSAU", name: "Los Sauces" },
      { code: "LUMA", name: "Lumaco" },
      { code: "PURE", name: "Purén" },
      { code: "RENA", name: "Renaico" },
      { code: "TRAI", name: "Traiguén" },
      { code: "VICT", name: "Victoria" }
    ],
    "Región de Antofagasta": [
      { code: "ANTOF", name: "Antofagasta" },
      { code: "MEJI", name: "Mejillones" },
      { code: "SGOR", name: "Sierra Gorda" },
      { code: "TALT", name: "Taltal" },
      { code: "CALA", name: "Calama" },
      { code: "OLLA", name: "Ollagüe" },
      { code: "SPAT", name: "San Pedro de Atacama" },
      { code: "TOCO", name: "Tocopilla" },
      { code: "MELE", name: "María Elena" }
    ],
    "Región de Coquimbo": [
      { code: "LSER", name: "La Serena" },
      { code: "COQU", name: "Coquimbo" },
      { code: "ANDA", name: "Andacollo" },
      { code: "LHIG", name: "La Higuera" },
      { code: "PAIG", name: "Paiguano" },
      { code: "VICU", name: "Vicuña" },
      { code: "ILLA", name: "Illapel" },
      { code: "CANE", name: "Canela" },
      { code: "LVIL", name: "Los Vilos" },
      { code: "SALA", name: "Salamanca" },
      { code: "OVAL", name: "Ovalle" },
      { code: "COMB", name: "Combarbalá" },
      { code: "MPAT", name: "Monte Patria" },
      { code: "PUNI", name: "Punitaqui" },
      { code: "RHUR", name: "Río Hurtado" }
    ],
    "Región del Maule": [
      { code: "TALC", name: "Talca" },
      { code: "CONS", name: "Constitución" },
      { code: "CURE", name: "Curepto" },
      { code: "EMPE", name: "Empedrado" },
      { code: "MAUL", name: "Maule" },
      { code: "PELA", name: "Pelarco" },
      { code: "PENC", name: "Pencahue" },
      { code: "RCLA", name: "Río Claro" },
      { code: "SCLE", name: "San Clemente" },
      { code: "SRAF", name: "San Rafael" },
      { code: "CAUQ", name: "Cauquenes" },
      { code: "CHAN", name: "Chanco" },
      { code: "PELL", name: "Pelluhue" },
      { code: "CURI", name: "Curicó" },
      { code: "HUAL", name: "Hualañé" },
      { code: "LICA", name: "Licantén" },
      { code: "MOLI", name: "Molina" },
      { code: "RAUC", name: "Rauco" },
      { code: "ROME", name: "Romeral" },
      { code: "SFAM", name: "Sagrada Familia" },
      { code: "TENO", name: "Teno" },
      { code: "VICH", name: "Vichuquén" },
      { code: "LINA", name: "Linares" },
      { code: "COLB", name: "Colbún" },
      { code: "LONG", name: "Longaví" },
      { code: "PARR", name: "Parral" },
      { code: "RETI", name: "Retiro" },
      { code: "SJAV", name: "San Javier" },
      { code: "VALE", name: "Villa Alegre" },
      { code: "YBUE", name: "Yerbas Buenas" }
    ],
    "Región de O'Higgins": [
      { code: "RANC", name: "Rancagua" },
      { code: "CODE", name: "Codegua" },
      { code: "COIN", name: "Coinco" },
      { code: "COLT", name: "Coltauco" },
      { code: "DONI", name: "Doñihue" },
      { code: "GRAN", name: "Graneros" },
      { code: "LCAB", name: "Las Cabras" },
      { code: "MACH", name: "Machalí" },
      { code: "MALL", name: "Malloa" },
      { code: "MOST", name: "Mostazal" },
      { code: "OLIV", name: "Olivar" },
      { code: "PEUM", name: "Peumo" },
      { code: "PICH", name: "Pichidegua" },
      { code: "QTIL", name: "Quinta de Tilcoco" },
      { code: "RENG", name: "Rengo" },
      { code: "REQU", name: "Requínoa" },
      { code: "SVIC", name: "San Vicente" },
      { code: "PICH", name: "Pichilemu" },
      { code: "LEST", name: "La Estrella" },
      { code: "LITU", name: "Litueche" },
      { code: "MARC", name: "Marchihue" },
      { code: "NAVI", name: "Navidad" },
      { code: "PARE", name: "Paredones" },
      { code: "SFER", name: "San Fernando" },
      { code: "CHEP", name: "Chépica" },
      { code: "CHIM", name: "Chimbarongo" },
      { code: "NANC", name: "Nancagua" },
      { code: "PALM", name: "Palmilla" },
      { code: "PERA", name: "Peralillo" },
      { code: "PLAC", name: "Placilla" },
      { code: "PUMA", name: "Pumanque" },
      { code: "SCRU", name: "Santa Cruz" }
    ],
    "Región de Los Lagos": [
      { code: "PMON", name: "Puerto Montt" },
      { code: "CALB", name: "Calbuco" },
      { code: "COCH", name: "Cochamó" },
      { code: "FRES", name: "Fresia" },
      { code: "FRUT", name: "Frutillar" },
      { code: "LMUE", name: "Los Muermos" },
      { code: "MAUL", name: "Maullín" },
      { code: "PVAR", name: "Puerto Varas" },
      { code: "CAST", name: "Castro" },
      { code: "ANCU", name: "Ancud" },
      { code: "CHON", name: "Chonchi" },
      { code: "CVEL", name: "Curaco de Vélez" },
      { code: "DALC", name: "Dalcahue" },
      { code: "PUQU", name: "Puqueldón" },
      { code: "QUEI", name: "Queilén" },
      { code: "QUEL", name: "Quellón" },
      { code: "QUEM", name: "Quemchi" },
      { code: "QUIN", name: "Quinchao" },
      { code: "OSOR", name: "Osorno" },
      { code: "POCT", name: "Puerto Octay" },
      { code: "PURR", name: "Purranque" },
      { code: "PUYE", name: "Puyehue" },
      { code: "RNEG", name: "Río Negro" },
      { code: "SJCO", name: "San Juan de la Costa" },
      { code: "SPAB", name: "San Pablo" },
      { code: "CHAI", name: "Chaitén" },
      { code: "FUTA", name: "Futaleufú" },
      { code: "HUAL", name: "Hualaihué" },
      { code: "PALE", name: "Palena" }
    ],
    "Región de Tarapacá": [
      { code: "IQUI", name: "Iquique" },
      { code: "AHOS", name: "Alto Hospicio" },
      { code: "PALM", name: "Pozo Almonte" },
      { code: "CAMI", name: "Camiña" },
      { code: "COLC", name: "Colchane" },
      { code: "HUAR", name: "Huara" },
      { code: "PICA", name: "Pica" }
    ],
    "Región de Atacama": [
      { code: "COPI", name: "Copiapó" },
      { code: "CALD", name: "Caldera" },
      { code: "TAMA", name: "Tierra Amarilla" },
      { code: "CHAN", name: "Chañaral" },
      { code: "DALM", name: "Diego de Almagro" },
      { code: "VALL", name: "Vallenar" },
      { code: "ACAR", name: "Alto del Carmen" },
      { code: "FREI", name: "Freirina" },
      { code: "HUAS", name: "Huasco" }
    ],
    "Región de Ñuble": [
      { code: "CHIL", name: "Chillán" },
      { code: "CVIE", name: "Chillán Viejo" },
      { code: "BULN", name: "Bulnes" },
      { code: "COBQ", name: "Cobquecura" },
      { code: "COEL", name: "Coelemu" },
      { code: "COIH", name: "Coihueco" },
      { code: "ECAR", name: "El Carmen" },
      { code: "NINH", name: "Ninhue" },
      { code: "NIQU", name: "Ñiquén" },
      { code: "PEMU", name: "Pemuco" },
      { code: "PINT", name: "Pinto" },
      { code: "PORT", name: "Portezuelo" },
      { code: "QUIL", name: "Quillón" },
      { code: "QUIR", name: "Quirihue" },
      { code: "RANQ", name: "Ranquil" },
      { code: "SCAR", name: "San Carlos" },
      { code: "SFAB", name: "San Fabián" },
      { code: "SIGN", name: "San Ignacio" },
      { code: "SNIC", name: "San Nicolás" },
      { code: "TREG", name: "Treguaco" },
      { code: "YUNG", name: "Yungay" }
    ],
    "Región de Los Ríos": [
      { code: "VALD", name: "Valdivia" },
      { code: "CORR", name: "Corral" },
      { code: "LANC", name: "Lanco" },
      { code: "LLAG", name: "Los Lagos" },
      { code: "MAFI", name: "Máfil" },
      { code: "MARI", name: "Mariquina" },
      { code: "PAIL", name: "Paillaco" },
      { code: "PANG", name: "Panguipulli" },
      { code: "LUNI", name: "La Unión" },
      { code: "FUTR", name: "Futrono" },
      { code: "LRAN", name: "Lago Ranco" },
      { code: "RBUE", name: "Río Bueno" }
    ],
    "Región de Arica y Parinacota": [
      { code: "ARIC", name: "Arica" },
      { code: "CAMA", name: "Camarones" },
      { code: "PUTR", name: "Putre" },
      { code: "GLAG", name: "General Lagos" }
    ],
    "Región de Aysén": [
      { code: "COYH", name: "Coyhaique" },
      { code: "LVER", name: "Lago Verde" },
      { code: "AYSE", name: "Aysén" },
      { code: "CISN", name: "Cisnes" },
      { code: "GUAI", name: "Guaitecas" },
      { code: "COCH", name: "Cochrane" },
      { code: "OHIG", name: "O'Higgins" },
      { code: "TORT", name: "Tortel" },
      { code: "CCHI", name: "Chile Chico" },
      { code: "RIBA", name: "Río Ibáñez" }
    ],
    "Región de Magallanes": [
      { code: "PARE", name: "Punta Arenas" },
      { code: "LBLA", name: "Laguna Blanca" },
      { code: "RVER", name: "Río Verde" },
      { code: "SGRE", name: "San Gregorio" },
      { code: "CHOR", name: "Cabo de Hornos" },
      { code: "ANTA", name: "Antártica" },
      { code: "PORV", name: "Porvenir" },
      { code: "PRIM", name: "Primavera" },
      { code: "TIMA", name: "Timaukel" },
      { code: "NATA", name: "Natales" },
      { code: "TPAI", name: "Torres del Paine" }
    ]
  };

  const actualizarComunas = () => {
    if (!regionSelect || !comunaInput) return;
    const regionSeleccionada = regionSelect.value;
    const comunas = COMUNAS_POR_REGION[regionSeleccionada] || [];

    comunaInput.innerHTML = "";

    if (comunas.length > 0) {
      comunaInput.disabled = false;
      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.disabled = true;
      defaultOpt.selected = true;
      defaultOpt.textContent = "Selecciona tu comuna...";
      comunaInput.appendChild(defaultOpt);

      comunas.forEach((item) => {
        const opt = document.createElement("option");
        const name = typeof item === "object" ? item.name : item;
        opt.value = name;
        opt.textContent = name;
        comunaInput.appendChild(opt);
      });
    } else {
      comunaInput.disabled = true;
      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.disabled = true;
      defaultOpt.selected = true;
      defaultOpt.textContent = "Selecciona primero una región...";
      comunaInput.appendChild(defaultOpt);
    }
  };

  if (regionSelect) {
    regionSelect.addEventListener("change", () => {
      actualizarComunas();
      actualizarVisualizacionPrecio();
    });
  }

  if (comunaInput) {
    comunaInput.addEventListener("change", () => {
      actualizarVisualizacionPrecio();
    });
  }

  // Inicializar comunas al cargar
  actualizarComunas();

  // --- FORMATEADOR Y PREFIJO INTERNACIONAL DE TELÉFONO ---
  const prefijoPaisSelect = document.getElementById("prefijo-pais");
  const telefonoInput = document.getElementById("telefono");

  const PHONE_FORMATS = {
    "+56": { placeholder: "9 1234 5678", maxDigits: 9, format: (digits) => {
      if (digits.length <= 1) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
      return `${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5, 9)}`;
    }},
    "+54": { placeholder: "9 11 1234 5678", maxDigits: 11, format: (digits) => {
      if (digits.length <= 1) return digits;
      if (digits.length <= 3) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
      if (digits.length <= 7) return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
    }},
    "+51": { placeholder: "912 345 678", maxDigits: 9, format: (digits) => {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    }},
    "+57": { placeholder: "300 123 4567", maxDigits: 10, format: (digits) => {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    }},
    "+52": { placeholder: "55 1234 5678", maxDigits: 10, format: (digits) => {
      if (digits.length <= 2) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 10)}`;
    }},
    "+1": { placeholder: "(555) 000-0000", maxDigits: 10, format: (digits) => {
      if (digits.length <= 3) return digits.length > 0 ? `(${digits}` : "";
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }},
    "+34": { placeholder: "612 345 678", maxDigits: 9, format: (digits) => {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    }},
    "+55": { placeholder: "11 91234-5678", maxDigits: 11, format: (digits) => {
      if (digits.length <= 2) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }},
    "+598": { placeholder: "99 123 456", maxDigits: 8, format: (digits) => {
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)}`;
    }},
    "+595": { placeholder: "981 123 456", maxDigits: 9, format: (digits) => {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    }},
    "+593": { placeholder: "99 123 4567", maxDigits: 9, format: (digits) => {
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
    }},
    "+591": { placeholder: "7123 4567", maxDigits: 8, format: (digits) => {
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
    }}
  };

  const formatearTelefono = () => {
    if (!telefonoInput) return;
    const prefijo = prefijoPaisSelect ? prefijoPaisSelect.value : "+56";
    const config = PHONE_FORMATS[prefijo] || PHONE_FORMATS["+56"];

    let rawDigits = telefonoInput.value.replace(/\D/g, "");
    if (rawDigits.length > config.maxDigits) {
      rawDigits = rawDigits.slice(0, config.maxDigits);
    }

    telefonoInput.value = config.format(rawDigits);
  };

  const actualizarPlaceholderTelefono = () => {
    if (!prefijoPaisSelect || !telefonoInput) return;
    const prefijo = prefijoPaisSelect.value;
    const config = PHONE_FORMATS[prefijo] || PHONE_FORMATS["+56"];
    telefonoInput.placeholder = config.placeholder;
    formatearTelefono();
  };

  if (prefijoPaisSelect) {
    prefijoPaisSelect.addEventListener("change", actualizarPlaceholderTelefono);
  }

  if (telefonoInput) {
    telefonoInput.addEventListener("input", formatearTelefono);
  }

  const obtenerTelefonoCompleto = () => {
    const prefijo = prefijoPaisSelect ? prefijoPaisSelect.value : "+56";
    const num = telefonoInput ? telefonoInput.value.trim() : "";
    return num ? `${prefijo} ${num}` : "";
  };

  // Control habilitación botón de pago según casilla de términos
  const actualizarEstadoBotonPago = () => {
    if (btnConfirmarPagoFlow) {
      btnConfirmarPagoFlow.disabled = !(aceptoTerminosCheckbox && aceptoTerminosCheckbox.checked);
    }
  };

  if (aceptoTerminosCheckbox) {
    aceptoTerminosCheckbox.addEventListener("change", actualizarEstadoBotonPago);
  }

  const actualizarVisualizacionPrecio = () => {
    const cant = parseInt(cantidadInput.value, 10) || 1;
    if (displayCantidad) displayCantidad.innerText = cant;
    if (modalProductQty) modalProductQty.innerText = `Cantidad: ${cant} ${cant === 1 ? "caja" : "cajas"} (15 sachets / un.)`;

    const subtotal = PRODUCT_PRICE * cant;
    if (summarySubtotal) summarySubtotal.innerText = `$${subtotal.toLocaleString("es-CL")} CLP`;
    if (modalProductSubtotalItem) modalProductSubtotalItem.innerText = `$${subtotal.toLocaleString("es-CL")} CLP`;

    // 1. Recalcular descuento del cupón sobre el carrito total
    let descuentoTotal = 0;
    if (cuponAplicadoExitoso) {
      if (montoFijoDescuentoCupon > 0) {
        descuentoTotal = montoFijoDescuentoCupon;
      } else if (porcentajeDescuentoCupon > 0) {
        descuentoTotal = Math.round((subtotal * porcentajeDescuentoCupon) / 100);
      } else {
        descuentoTotal = 3000;
      }
      ultimoDescuentoCupon = descuentoTotal;
      if (rowDescuento) rowDescuento.classList.remove("hidden");
      if (summaryDescuento) summaryDescuento.innerText = `-$${descuentoTotal.toLocaleString("es-CL")} CLP`;
    } else {
      ultimoDescuentoCupon = 0;
      if (rowDescuento) rowDescuento.classList.add("hidden");
    }

    // 2. Calcular tarifa de envío por región dinámicamente desde Excel / Sheets
    const regionVal = regionSelect ? regionSelect.value : "";
    let costoEnvio = TARIFA_RM;

    if (regionVal) {
      const cleanRegion = String(regionVal).trim().toLowerCase();
      if (MAPA_TARIFAS_ENVIO[cleanRegion] !== undefined) {
        costoEnvio = MAPA_TARIFAS_ENVIO[cleanRegion];
      } else if (cleanRegion.includes("metropolitana") || cleanRegion.includes("santiago") || cleanRegion === "rm") {
        costoEnvio = MAPA_TARIFAS_ENVIO["región metropolitana"] || MAPA_TARIFAS_ENVIO["region metropolitana"] || TARIFA_RM;
      } else {
        costoEnvio = MAPA_TARIFAS_ENVIO["regiones"] || MAPA_TARIFAS_ENVIO["otras regiones"] || TARIFA_REGIONES;
      }
    }

    if (summaryEnvio) summaryEnvio.innerText = `$${costoEnvio.toLocaleString("es-CL")} CLP`;

    // 3. Total Final (Subtotal - Descuento + Envío)
    const totalFinal = Math.max(0, subtotal - descuentoTotal + costoEnvio);
    if (displayTotal) displayTotal.innerText = `$${totalFinal.toLocaleString("es-CL")} CLP`;
  };

  const mostrarAlertaCupon = (mensaje, tipo) => {
    const alertContainer = document.getElementById("alerta-cupon") || document.getElementById("cupon-status-msg");
    if (!alertContainer) return;

    if (!mensaje) {
      alertContainer.style.display = "none";
      alertContainer.innerText = "";
      alertContainer.className = "alert";
      return;
    }

    alertContainer.innerText = mensaje;
    alertContainer.className = `alert alert-${tipo}`;
    alertContainer.style.display = "block";
  };

  let montoFijoDescuentoCupon = 0;

  const aplicarCupon = async () => {
    const codigoCupon = cuponInput ? cuponInput.value.trim().toUpperCase() : "";
    const rutCliente = rutInput ? rutInput.value.trim() : "";
    const cant = parseInt(cantidadInput.value, 10) || 1;
    const subtotal = PRODUCT_PRICE * cant;

    if (!codigoCupon) {
      cuponAplicadoExitoso = false;
      ultimoDescuentoCupon = 0;
      montoFijoDescuentoCupon = 0;
      porcentajeDescuentoCupon = 0;
      actualizarVisualizacionPrecio();
      mostrarAlertaCupon("Por favor ingresa un código de cupón.", "warning");
      return;
    }

    if (btnAplicarCupon) {
      btnAplicarCupon.disabled = true;
      btnAplicarCupon.classList.add("btn-loading");
      btnAplicarCupon.innerHTML = `<span class="spinner-btn-inline" aria-hidden="true"></span> <span>Validando...</span>`;
    }

    try {
      let esValido = false;
      let montoDescuento = 0;
      let mensajeRespuesta = "";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "validar_cupon",
          cupon: codigoCupon,
          subtotal: subtotal,
          rut: rutCliente,
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data && resData.data.valido) {
        esValido = true;
        const backendDescuentoMonto = Number(resData.data.descuentoMonto) || Number(resData.data.descuento) || 0;
        porcentajeDescuentoCupon = Number(resData.data.porcentajeEquivalente || resData.data.porcentaje) || 0;

        if (resData.data.tipo === "FIJO" || backendDescuentoMonto > 0) {
          montoFijoDescuentoCupon = backendDescuentoMonto || 3000;
          montoDescuento = montoFijoDescuentoCupon;
        } else {
          montoFijoDescuentoCupon = 0;
          montoDescuento = Math.round((subtotal * porcentajeDescuentoCupon) / 100);
        }

        mensajeRespuesta = resData.data.mensaje || resData.message || "Cupón aplicado con éxito.";
      } else {
        mensajeRespuesta = resData.message || (resData.data && resData.data.mensaje) || `El cupón "${codigoCupon}" no se puede aplicar.`;
      }

      if (esValido) {
        cuponAplicadoExitoso = true;
        ultimoDescuentoCupon = montoDescuento;
        actualizarVisualizacionPrecio();
        mostrarAlertaCupon(mensajeRespuesta, "success");
      } else {
        cuponAplicadoExitoso = false;
        ultimoDescuentoCupon = 0;
        montoFijoDescuentoCupon = 0;
        porcentajeDescuentoCupon = 0;
        actualizarVisualizacionPrecio();
        mostrarAlertaCupon(mensajeRespuesta, "error");
      }
    } catch (err) {
      console.error("Error al conectar con la API de cupones:", err);
      if (codigoCupon === "PREVENTA" || codigoCupon === "PREVENTA15" || codigoCupon === "LYNTO15") {
        cuponAplicadoExitoso = true;
        montoFijoDescuentoCupon = 3000;
        porcentajeDescuentoCupon = 0;
        ultimoDescuentoCupon = 3000;
        actualizarVisualizacionPrecio();
        mostrarAlertaCupon("Cupón PREVENTA aplicado con éxito (Descuento especial).", "success");
      } else {
        cuponAplicadoExitoso = false;
        ultimoDescuentoCupon = 0;
        montoFijoDescuentoCupon = 0;
        porcentajeDescuentoCupon = 0;
        actualizarVisualizacionPrecio();
        mostrarAlertaCupon("No se pudo verificar el cupón en este momento. Inténtalo de nuevo.", "error");
      }
    } finally {
      if (btnAplicarCupon) {
        btnAplicarCupon.disabled = false;
        btnAplicarCupon.classList.remove("btn-loading");
        btnAplicarCupon.innerHTML = `Aplicar`;
      }
    }
  };

  if (btnAplicarCupon) {
    btnAplicarCupon.addEventListener("click", aplicarCupon);
  }

  if (cuponInput) {
    cuponInput.addEventListener("input", () => {
      cuponAplicadoExitoso = false;
      ultimoDescuentoCupon = 0;
      actualizarVisualizacionPrecio();
      mostrarAlertaCupon("", "none");
    });

    // Al presionar Enter dentro del campo de cupón, ejecutar "Aplicar" en lugar de enviar la compra
    cuponInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (btnAplicarCupon) {
          btnAplicarCupon.click();
        }
      }
    });
  }

  const actualizarResumenModalEnVivo = () => {
    const nombre = nombreInput ? nombreInput.value.trim() : "";
    const region = regionSelect ? regionSelect.value : "";
    const comuna = comunaInput ? comunaInput.value : "";
    const direccion = direccionInput ? direccionInput.value.trim() : "";
    const comunaTexto = comunaInput && comunaInput.selectedIndex >= 0 ? comunaInput.options[comunaInput.selectedIndex].text : comuna;

    if (modalUserName && nombre) modalUserName.innerText = sanitizeInput(nombre);
    if (modalUserAddress && (direccion || comunaTexto)) modalUserAddress.innerText = `${sanitizeInput(direccion)}, ${sanitizeInput(comunaTexto)}`;
    if (modalUserRegion && region) modalUserRegion.innerText = sanitizeInput(region);
  };

  if (nombreInput) nombreInput.addEventListener("input", actualizarResumenModalEnVivo);
  if (direccionInput) direccionInput.addEventListener("input", actualizarResumenModalEnVivo);

  const abrirModalResumen = () => {
    ocultarError();

    const nombre = nombreInput ? nombreInput.value.trim() : "";
    const rut = rutInput ? rutInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const telefonoEl = document.getElementById("telefono");
    const telefono = telefonoEl ? telefonoEl.value.trim() : "";
    const region = regionSelect ? regionSelect.value : "";
    const comuna = comunaInput ? comunaInput.value : "";
    const direccion = direccionInput ? direccionInput.value.trim() : "";

    if (!nombre) return mostrarError("Por favor, ingresa tu nombre completo.", nombreInput);
    if (!rut) return mostrarError("Por favor, ingresa tu RUT.", rutInput);
    if (!validarRut(rut)) return mostrarError("El RUT ingresado no es válido. Formato esperado: 12.345.678-9", rutInput);
    if (!email) return mostrarError("Por favor, ingresa tu correo electrónico.", emailInput);
    if (!validarEmail(email)) return mostrarError("Por favor, ingresa un correo electrónico válido.", emailInput);
    if (!telefono) return mostrarError("Por favor, ingresa tu teléfono celular.", telefonoEl);

    const prefijo = prefijoPaisSelect ? prefijoPaisSelect.value : "+56";
    const config = PHONE_FORMATS[prefijo] || PHONE_FORMATS["+56"];
    const rawDigits = telefono.replace(/\D/g, "");
    if (rawDigits.length < Math.min(7, config.maxDigits - 1)) {
      return mostrarError(`Por favor, ingresa un teléfono válido para ${prefijo} (Ej: ${config.placeholder}).`, telefonoEl);
    }

    if (!region) return mostrarError("Por favor, selecciona tu región de despacho.", regionSelect);
    if (!comuna) return mostrarError("Por favor, selecciona tu comuna.", comunaInput);
    if (!direccion) return mostrarError("Por favor, ingresa tu dirección completa de despacho.", direccionInput);

    if (!form.checkValidity()) {
      form.reportValidity();
      mostrarError("Por favor completa todos los campos obligatorios (*) antes de continuar.");
      return;
    }

    actualizarResumenModalEnVivo();

    // Reiniciar estado de casilla de términos al abrir el modal
    if (aceptoTerminosCheckbox) aceptoTerminosCheckbox.checked = false;
    actualizarEstadoBotonPago();

    // Asegurar recálculo de precios antes de abrir
    // Disparar evento de conversión InitiateCheckout para Meta Pixel
    if (typeof fbq === "function") {
      try {
        const cant = parseInt(cantidadInput ? cantidadInput.value : "1", 10) || 1;
        fbq("track", "InitiateCheckout", {
          content_name: "Iron Girl Preventa",
          content_category: "Suplementos",
          value: PRODUCT_PRICE * cant,
          currency: "CLP",
          num_items: cant,
        });
      } catch (fbErr) {
        console.warn("Nota Meta Pixel:", fbErr.message);
      }
    }

    if (modalResumen) {
      modalResumen.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  };

  const cerrarModalResumen = () => {
    if (modalResumen) {
      modalResumen.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  };

  if (btnAbrirResumen) {
    btnAbrirResumen.addEventListener("click", abrirModalResumen);
  }

  if (btnCerrarModal) {
    btnCerrarModal.addEventListener("click", cerrarModalResumen);
  }

  if (modalResumen) {
    modalResumen.addEventListener("click", (e) => {
      if (e.target === modalResumen) {
        cerrarModalResumen();
      }
    });
  }

  const mostrarAlertaModalResumen = (mensaje, tipo = "warning") => {
    const alertaEl = document.getElementById("alerta-modal-resumen");
    if (!alertaEl) return;
    if (!mensaje) {
      alertaEl.style.display = "none";
      alertaEl.classList.add("hidden");
      alertaEl.innerText = "";
      return;
    }
    alertaEl.innerText = mensaje;
    alertaEl.className = `alert alert-${tipo}`;
    alertaEl.style.display = "flex";
    alertaEl.classList.remove("hidden");
  };

  const ocultarAlertaModalResumen = () => {
    mostrarAlertaModalResumen("");
  };

  if (btnRestar && btnSumar) {
    btnRestar.addEventListener("click", () => {
      let current = parseInt(cantidadInput.value, 10) || 1;
      if (current > 1) {
        cantidadInput.value = current - 1;
        actualizarVisualizacionPrecio();
        ocultarAlertaModalResumen();
      }
    });

    btnSumar.addEventListener("click", () => {
      let current = parseInt(cantidadInput.value, 10) || 1;
      if (current < 10) {
        cantidadInput.value = current + 1;
        actualizarVisualizacionPrecio();
        ocultarAlertaModalResumen();
      } else {
        mostrarAlertaModalResumen(
          "Por motivos de seguridad, el límite máximo por compra de preventa es de 10 unidades.",
          "warning"
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
  const mostrarError = (msg, targetInput = null) => {
    if (errorText && errorAlert) {
      errorText.innerText = msg;
      errorAlert.classList.remove("hidden");
      errorAlert.style.display = "flex";
    }

    if (targetInput) {
      targetInput.classList.add("input-error");
      targetInput.focus();
      setTimeout(() => {
        targetInput.classList.remove("input-error");
      }, 4000);
    }
  };

  const ocultarError = () => {
    if (errorAlert) {
      errorAlert.classList.add("hidden");
      errorAlert.style.display = "none";
    }
  };

  // --- SANITIZACIÓN ANTI-XSS ---
  const sanitizeInput = (str) => {
    if (typeof str !== "string") return "";
    return str
      .replace(/<[^>]*>?/gm, "")
      .trim();
  };

  // --- SUBMIT DEL CHECKOUT ---
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      ocultarError();

      const submitBtn = form.querySelector('button[type="submit"]');

      const nombre = sanitizeInput(document.getElementById("nombre").value.trim());
      const rut = sanitizeInput(rutInput ? rutInput.value.trim() : "");
      const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
      const telefonoEl = document.getElementById("telefono");
      const regionEl = document.getElementById("region");
      const comunaEl = document.getElementById("comuna");
      const cuponEl = document.getElementById("cupon");

      const telefono = sanitizeInput(obtenerTelefonoCompleto());
      const region = sanitizeInput(regionEl ? regionEl.value.trim() : "");
      const comuna = sanitizeInput(comunaEl ? comunaEl.value.trim() : "");
      const cupon = sanitizeInput(cuponEl ? cuponEl.value.trim().toUpperCase() : "");
      const direccion = sanitizeInput(document.getElementById("direccion").value.trim());
      const cantidad = parseInt(cantidadInput ? cantidadInput.value : "1", 10);

      if (!nombre)
        return mostrarError("Por favor, ingresa tu nombre completo.", document.getElementById("nombre"));

      if (!validarRut(rut)) {
        return mostrarError("El RUT ingresado no es válido. Ej: 12.345.678-9", rutInput);
      }

      if (!validarEmail(email)) {
        return mostrarError(
          "El correo electrónico no tiene un formato válido.", emailInput
        );
      }

      if (!telefono) {
        return mostrarError("Por favor, ingresa tu teléfono celular para el seguimiento del envío.", telefonoEl);
      }

      if (!region) {
        return mostrarError("Por favor, selecciona tu región de despacho.", regionEl);
      }

      if (!comuna) {
        return mostrarError("Por favor, selecciona tu comuna.", comunaEl);
      }

      if (!direccion)
        return mostrarError("Por favor, ingresa tu dirección completa de despacho.", document.getElementById("direccion"));

      if (isNaN(cantidad) || cantidad <= 0) {
        return mostrarError("Cantidad inválida.", cantidadInput);
      }

      if (!aceptoTerminosCheckbox || !aceptoTerminosCheckbox.checked) {
        return mostrarError("Debes aceptar los términos y condiciones de preventa para poder realizar el pago.", aceptoTerminosCheckbox);
      }

      // Disparar evento AddPaymentInfo para Meta Pixel al proceder con el pago
      if (typeof fbq === "function") {
        try {
          fbq("track", "AddPaymentInfo", {
            content_name: "Iron Girl Preventa",
            value: PRODUCT_PRICE * cantidad,
            currency: "CLP",
          });
        } catch (fbErr) {
          console.warn("Nota Meta Pixel:", fbErr.message);
        }
      }

      // 1. Cerrar el modal de resumen para mostrar limpiamente la tarjeta de carga
      cerrarModalResumen();

      // 2. Prevenir doble clic deshabilitando el botón mientras dura el envío
      if (submitBtn) submitBtn.disabled = true;
      if (loadingOverlay) {
        loadingOverlay.classList.remove("hidden");
        loadingOverlay.classList.add("flex");
      }

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
        const redirectUrl =
          (resData && resData.data && resData.data.url)
            ? resData.data.url
            : (resData && (resData.url || resData.redirectUrl))
            ? (resData.url || resData.redirectUrl)
            : null;

        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          throw new Error(
            resData.message || "No se pudo obtener la URL de pago seguro de Flow.",
          );
        }
      } catch (err) {
        console.error(err);
        if (submitBtn) submitBtn.disabled = false;
        if (loadingOverlay) {
          loadingOverlay.classList.add("hidden");
          loadingOverlay.classList.remove("flex");
        }

        let userMsg = err.message || "";
        if (userMsg.includes("Failed to fetch") || userMsg.includes("NetworkError") || userMsg.includes("CORS")) {
          userMsg = "No se pudo establecer conexión con el servidor de pagos de Google. Por favor verifica que la versión en script.google.com esté desplegada con acceso para 'Cualquiera' o intenta nuevamente.";
        } else if (userMsg.includes("1620") || userMsg.includes("not valid") || userMsg.includes("userEmail")) {
          userMsg = "El correo electrónico ingresado no ha sido validado por el filtro de seguridad de la pasarela de pagos. Por favor intenta con un correo alternativo (ej. correo institucional o personal secundario).";
        } else {
          userMsg = `No se pudo procesar la compra: ${userMsg}.`;
        }

        mostrarError(userMsg);
      }
    });
  }

  // --- CONTROL DEL MODAL POP-UP DE NEWSLETTER AL INICIAR LA PÁGINA ---
  const modalNewsletter = document.getElementById("modal-newsletter");
  const btnCerrarModalNewsletter = document.getElementById("btn-cerrar-modal-newsletter");
  const btnSkipModalNewsletter = document.getElementById("btn-skip-modal-newsletter");
  const modalNewsletterForm = document.getElementById("modal-newsletter-form");
  const modalNewsletterEmail = document.getElementById("modal-newsletter-email");
  const modalNewsletterMsg = document.getElementById("modal-newsletter-msg");

  const abrirModalNewsletter = () => {
    if (modalNewsletter) {
      modalNewsletter.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  };

  const cerrarModalNewsletter = () => {
    if (modalNewsletter) {
      modalNewsletter.classList.add("hidden");
      document.body.style.overflow = "";
      sessionStorage.setItem("lynto_newsletter_dismissed", "true");
    }
  };

  if (btnCerrarModalNewsletter) {
    btnCerrarModalNewsletter.addEventListener("click", cerrarModalNewsletter);
  }

  if (btnSkipModalNewsletter) {
    btnSkipModalNewsletter.addEventListener("click", cerrarModalNewsletter);
  }

  if (modalNewsletter) {
    modalNewsletter.addEventListener("click", (e) => {
      if (e.target === modalNewsletter) {
        cerrarModalNewsletter();
      }
    });

    // Desplegar modal al iniciar la página si no ha sido descartado en la sesión
    if (!sessionStorage.getItem("lynto_newsletter_dismissed")) {
      setTimeout(() => {
        // Verificar que el modal de resumen de compra no esté abierto
        const modalResumenEl = document.getElementById("modal-resumen");
        const estaResumenAbierto = modalResumenEl && !modalResumenEl.classList.contains("hidden");

        if (!estaResumenAbierto && modalNewsletter.classList.contains("hidden")) {
          abrirModalNewsletter();
        }
      }, 700);
    }
  }

  const btnAbrirModalVip = document.getElementById("btn-abrir-modal-vip");
  if (btnAbrirModalVip) {
    btnAbrirModalVip.addEventListener("click", () => {
      if (modalNewsletterMsg) {
        modalNewsletterMsg.className = "modal-newsletter-alert-slot";
        modalNewsletterMsg.innerText = "";
      }
      abrirModalNewsletter();
    });
  }

  if (modalNewsletterForm) {
    modalNewsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = modalNewsletterEmail ? modalNewsletterEmail.value.trim() : "";

      if (!validarEmail(email)) {
        if (modalNewsletterMsg) {
          modalNewsletterMsg.className = "modal-newsletter-alert-slot active alert-error";
          modalNewsletterMsg.innerText = "Por favor, ingresa un correo válido.";
        }
        return;
      }

      if (modalNewsletterMsg) {
        modalNewsletterMsg.className = "modal-newsletter-alert-slot active alert-info";
        modalNewsletterMsg.innerText = "Enviando suscripción...";
      }

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            action: "subscribe",
            email: email,
            origen: "Modal Popup Inicial",
          }),
        });

        const resData = await response.json();

        const esYaSuscrito =
          resData.alreadySubscribed === true ||
          !resData.success ||
          (resData.message &&
            (resData.message.toLowerCase().includes("ya") ||
              resData.message.toLowerCase().includes("registrado") ||
              resData.message.toLowerCase().includes("suscrito") ||
              resData.message.toLowerCase().includes("existe")));

        if (resData.success && !esYaSuscrito) {
          // ✅ Éxito verdadero (nuevo correo suscrito)
          if (modalNewsletterMsg) {
            modalNewsletterMsg.className = "modal-newsletter-alert-slot active alert-success";
            modalNewsletterMsg.innerText =
              resData.message || "¡Gracias por suscribirte! Revisa tu correo para tu beneficio.";
          }
          if (modalNewsletterEmail) modalNewsletterEmail.value = "";
          sessionStorage.setItem("lynto_newsletter_dismissed", "true");

          setTimeout(() => {
            cerrarModalNewsletter();
            if (modalNewsletterMsg) {
              modalNewsletterMsg.className = "modal-newsletter-alert-slot";
              modalNewsletterMsg.innerText = "";
            }
          }, 2200);
        } else {
          // ❌ Fallo / Correo ya registrado previamente: Alerta roja y NUNCA cerrar el modal
          if (modalNewsletterMsg) {
            modalNewsletterMsg.className = "modal-newsletter-alert-slot active alert-error";
            modalNewsletterMsg.innerText =
              resData.message || "Este correo electrónico ya se encuentra suscrito en nuestra comunidad.";
          }
        }
      } catch (err) {
        console.error(err);
        if (modalNewsletterMsg) {
          modalNewsletterMsg.className = "modal-newsletter-alert-slot active alert-error";
          modalNewsletterMsg.innerText = "Error de conexión al suscribirse.";
        }
      }
    });
  }

  // --- SUBMIT DEL NEWSLETTER EN FOOTER ---
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = newsletterEmail ? newsletterEmail.value.trim() : "";

      if (!validarEmail(email)) {
        if (newsletterMsg) {
          newsletterMsg.innerText = "Por favor, ingresa un correo válido.";
          newsletterMsg.style.color = "#c62828";
          newsletterMsg.classList.remove("hidden");
        }
        return;
      }

      if (newsletterMsg) {
        newsletterMsg.innerText = "Enviando suscripción...";
        newsletterMsg.style.color = "#555";
        newsletterMsg.classList.remove("hidden");
      }

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            action: "subscribe",
            email: email,
            origen: "Footer Integrado",
          }),
        });

        const resData = await response.json();

        if (resData.success) {
          if (typeof fbq === "function") {
            try {
              fbq("track", "Lead", {
                content_name: "Club Lynto VIP",
              });
            } catch (fbErr) {
              console.warn("Nota Meta Pixel Lead:", fbErr.message);
            }
          }
          if (newsletterMsg) {
            newsletterMsg.innerText =
              resData.message || "¡Gracias por suscribirte al Club Lynto!";
            newsletterMsg.style.color = "#2e7d32";
          }
          if (newsletterEmail) newsletterEmail.value = "";
        } else {
          if (newsletterMsg) {
            newsletterMsg.innerText =
              resData.message || "No se pudo realizar la suscripción.";
            newsletterMsg.style.color = "#c62828";
          }
        }
      } catch (err) {
        console.error(err);
        if (newsletterMsg) {
          newsletterMsg.innerText = "Error de conexión al suscribirse.";
          newsletterMsg.style.color = "#c62828";
        }
      }
    });
  }

  // --- CONTROL DE LA TABLA NUTRICIONAL ---
  const nutritionHead = document.getElementById("nutrition-table-head");
  const tableCollapsibleBody = document.getElementById("table-collapsible-body");
  const tableToggleIcon = document.getElementById("table-toggle-icon");
  const tableToggleText = document.getElementById("table-toggle-text");

  if (nutritionHead && tableCollapsibleBody) {
    nutritionHead.addEventListener("click", () => {
      const isCollapsed = tableCollapsibleBody.classList.toggle("collapsed");
      if (tableToggleIcon) {
        tableToggleIcon.classList.toggle("rotated", isCollapsed);
      }
      if (tableToggleText) {
        tableToggleText.innerText = isCollapsed ? "Haz clic para desplegar" : "Haz clic para contraer";
      }
    });
  }

  // --- NAVBAR INTELIGENTE (Smart Sticky: Ocultar al bajar, Mostrar al subir) ---
  const headerElement = document.querySelector(".header");
  let lastScrollTop = 0;

  if (headerElement) {
    window.addEventListener(
      "scroll",
      () => {
        const st = window.pageYOffset || document.documentElement.scrollTop;

        // Activar sombra y fondo refinado si hay scroll
        if (st > 20) {
          headerElement.classList.add("nav-scrolled");
        } else {
          headerElement.classList.remove("nav-scrolled");
        }

        // Lógica de mostrar/ocultar
        if (st <= 70) {
          headerElement.classList.remove("nav-hidden");
        } else if (st > lastScrollTop && st > 100) {
          // Scroll hacia abajo -> Ocultar navbar
          headerElement.classList.add("nav-hidden");
        } else if (st < lastScrollTop) {
          // Scroll hacia arriba -> Mostrar navbar
          headerElement.classList.remove("nav-hidden");
        }

        lastScrollTop = st <= 0 ? 0 : st;
      },
      { passive: true }
    );

    // Al hacer clic en enlaces de navegación, mantener la barra visible
    const navAnchors = document.querySelectorAll(".nav-links a");
    navAnchors.forEach((anchor) => {
      anchor.addEventListener("click", () => {
        headerElement.classList.remove("nav-hidden");
      });
    });
  }

  // --- GALERÍA DE PRODUCTO INTERACTIVA Y LIGHTBOX (#producto) ---
  const mainProductImg = document.getElementById("main-product-img");
  const mainProductBadge = document.getElementById("main-product-badge");
  const thumbBtns = document.querySelectorAll(".thumb-btn");
  const openLightboxTrigger = document.getElementById("open-lightbox-trigger");
  const modalLightbox = document.getElementById("modal-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const btnCerrarLightbox = document.getElementById("btn-cerrar-lightbox");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");

  const galleryItems = [
    { src: "./assets/img/img_producto/img1.PNG", badge: "⚡ Matriz Biotecnológica Mineral" },
    { src: "./assets/img/img_producto/img2.PNG", badge: "🥤 15 Sachets • Frambuesa Limón" },
    { src: "./assets/img/img_producto/img5.PNG", badge: "✨ Comunidad VIP Lynto" },
    { src: "./assets/img/img_producto/img6.PNG", badge: "🌿 Formato Sachet Portable" }
  ];

  let currentGalleryIndex = 0;

  const actualizarLightboxIndex = (index) => {
    currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentGalleryIndex];

    if (lightboxImg) {
      lightboxImg.src = item.src;
      if (lightboxCaption) {
        lightboxCaption.innerText = item.badge;
      }
    }

    if (mainProductImg) {
      mainProductImg.src = item.src;
    }

    if (mainProductBadge) mainProductBadge.innerText = item.badge;
    thumbBtns.forEach((b, idx) => {
      b.classList.toggle("active", idx === currentGalleryIndex);
    });
  };

  if (mainProductImg && thumbBtns.length > 0) {
    thumbBtns.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        actualizarLightboxIndex(index);
      });
    });
  }

  const abrirLightbox = () => {
    if (modalLightbox && lightboxImg && mainProductImg) {
      const currentSrc = mainProductImg.getAttribute("src");
      const foundIdx = galleryItems.findIndex((item) => item.src === currentSrc);
      currentGalleryIndex = foundIdx !== -1 ? foundIdx : 0;

      lightboxImg.src = galleryItems[currentGalleryIndex].src;
      if (lightboxCaption) {
        lightboxCaption.innerText = galleryItems[currentGalleryIndex].badge;
      }
      modalLightbox.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  };

  const cerrarLightbox = () => {
    if (modalLightbox) {
      modalLightbox.classList.add("hidden");
      document.body.style.overflow = "";
    }
  };

  const btnZoomIcon = document.getElementById("btn-zoom-icon");
  if (btnZoomIcon) {
    btnZoomIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      abrirLightbox();
    });
  }

  if (btnCerrarLightbox) {
    btnCerrarLightbox.addEventListener("click", cerrarLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      actualizarLightboxIndex(currentGalleryIndex - 1);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", (e) => {
      e.stopPropagation();
      actualizarLightboxIndex(currentGalleryIndex + 1);
    });
  }

  // --- FUNCIÓN GENÉRICA PARA SOPORTE DE SWIPE TÁCTIL Y ARRASTRE DE MOUSE ---
  const habilitarDeslizamiento = (containerEl, onSwipeLeft, onSwipeRight, onClick) => {
    if (!containerEl) return;

    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let deltaY = 0;
    let isDragging = false;
    let hasMoved = false;
    const SWIPE_THRESHOLD = 35; // Píxeles mínimos recorridos para cambiar imagen

    const images = containerEl.querySelectorAll("img");
    images.forEach((img) => {
      img.addEventListener("dragstart", (e) => e.preventDefault());
    });

    // Touch Events (Móvil / Celular / Tablets)
    containerEl.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      deltaX = 0;
      deltaY = 0;
      isDragging = true;
      hasMoved = false;
    }, { passive: true });

    containerEl.addEventListener("touchmove", (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      deltaX = e.touches[0].clientX - startX;
      deltaY = e.touches[0].clientY - startY;

      if (Math.abs(deltaX) > 10) {
        hasMoved = true;
      }
    }, { passive: true });

    containerEl.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging = false;

      if (hasMoved && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < -SWIPE_THRESHOLD) {
          onSwipeLeft();
        } else if (deltaX > SWIPE_THRESHOLD) {
          onSwipeRight();
        }
      } else if (!hasMoved && typeof onClick === "function") {
        onClick();
      }
    });

    // Mouse Events (PC / Escritorio)
    containerEl.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) return;
      startX = e.clientX;
      startY = e.clientY;
      deltaX = 0;
      deltaY = 0;
      isDragging = true;
      hasMoved = false;
      containerEl.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      deltaX = e.clientX - startX;
      deltaY = e.clientY - startY;

      if (Math.abs(deltaX) > 8) {
        hasMoved = true;
      }
    });

    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      containerEl.style.cursor = "";

      if (hasMoved && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < -SWIPE_THRESHOLD) {
          onSwipeLeft();
        } else if (deltaX > SWIPE_THRESHOLD) {
          onSwipeRight();
        }
      } else if (!hasMoved && typeof onClick === "function") {
        onClick();
      }
    });

    // 3. Trackpad 2-Finger Horizontal Gestures (1 foto por deslizamiento continuo)
    let accumulatedDeltaX = 0;
    let gestureHandled = false;
    let wheelPauseTimer = null;

    containerEl.addEventListener("wheel", (e) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX > absY && absX > 5) {
        e.preventDefault();

        // Al pausar o levantar los dedos (50ms sin eventos), quedar listo inmediatamente para el siguiente gesto
        if (wheelPauseTimer) clearTimeout(wheelPauseTimer);
        wheelPauseTimer = setTimeout(() => {
          gestureHandled = false;
          accumulatedDeltaX = 0;
        }, 50);

        // Si ya se cambió 1 foto en este mismo deslizamiento continuo, ignorar el resto del arrastre
        if (gestureHandled) return;

        accumulatedDeltaX += e.deltaX;

        if (accumulatedDeltaX > 30) {
          gestureHandled = true;
          accumulatedDeltaX = 0;
          onSwipeLeft(); // Cambiar 1 foto a la izquierda (siguiente)
        } else if (accumulatedDeltaX < -30) {
          gestureHandled = true;
          accumulatedDeltaX = 0;
          onSwipeRight(); // Cambiar 1 foto a la derecha (anterior)
        }
      }
    }, { passive: false });
  };

  // 1. Habilitar deslizamiento en Vista Normal (Galería Principal)
  if (openLightboxTrigger) {
    habilitarDeslizamiento(
      openLightboxTrigger,
      () => actualizarLightboxIndex(currentGalleryIndex + 1), // Deslizar a la izquierda -> Siguiente
      () => actualizarLightboxIndex(currentGalleryIndex - 1), // Deslizar a la derecha -> Anterior
      abrirLightbox // Clic / Tap simple -> Abrir modal ampliado
    );
  }

  // 2. Habilitar deslizamiento en Vista Ampliada (Lightbox Modal)
  const lightboxCard = document.querySelector(".lightbox-card");
  if (lightboxCard) {
    habilitarDeslizamiento(
      lightboxCard,
      () => actualizarLightboxIndex(currentGalleryIndex + 1), // Deslizar a la izquierda -> Siguiente
      () => actualizarLightboxIndex(currentGalleryIndex - 1)  // Deslizar a la derecha -> Anterior
    );
  }

  if (modalLightbox) {
    modalLightbox.addEventListener("click", (e) => {
      if (e.target === modalLightbox) {
        cerrarLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!modalLightbox.classList.contains("hidden")) {
        if (e.key === "Escape") {
          cerrarLightbox();
        } else if (e.key === "ArrowLeft") {
          actualizarLightboxIndex(currentGalleryIndex - 1);
        } else if (e.key === "ArrowRight") {
          actualizarLightboxIndex(currentGalleryIndex + 1);
        }
      }
    });
  }

  // --- ACORDEÓN INTERACTIVO DE PREGUNTAS FRECUENTES (FAQ) ---
  const faqHeaders = document.querySelectorAll(".faq-accordion-header");
  faqHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const accordionBody = header.nextElementSibling;
      const isOpen = header.classList.contains("active");

      // Cerrar otros acordeones si están abiertos para mantener pulcritud
      faqHeaders.forEach((otherHeader) => {
        if (otherHeader !== header) {
          otherHeader.classList.remove("active");
          otherHeader.setAttribute("aria-expanded", "false");
          if (otherHeader.nextElementSibling) {
            otherHeader.nextElementSibling.classList.add("collapsed");
          }
        }
      });

      if (isOpen) {
        header.classList.remove("active");
        header.setAttribute("aria-expanded", "false");
        if (accordionBody) accordionBody.classList.add("collapsed");
      } else {
        header.classList.add("active");
        header.setAttribute("aria-expanded", "true");
        if (accordionBody) accordionBody.classList.remove("collapsed");
      }
    });
  });
  // --- CARGA DINÁMICA DESDE GOOGLE SHEETS (get_config) ---
  const aplicarConfiguracion = (resData) => {
    if (!resData || !resData.success) return;

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

    // Control de Ventas Pausadas / Tienda Cerrada
    const pausarVentasVal = configMap["pausarventas"] || configMap["cerrartienda"] || configMap["tiendacerrada"];
    if (pausarVentasVal) {
      const strPausar = String(pausarVentasVal).trim().toLowerCase();
      if (strPausar === "true" || strPausar === "verdadero" || strPausar === "1") {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>🔒 Ventas Pausadas Temporalmente</span>`;
          submitBtn.style.opacity = "0.6";
          submitBtn.style.cursor = "not-allowed";
        }
      }
    }

    // 3. Inyección dinámica de textos e imágenes configurables
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

    const resolucionEl = document.getElementById("resolucion-sanitaria");
    const resolucionVal = configMap["resolucionsanitaria"];
    if (resolucionEl && resolucionVal) resolucionEl.innerText = resolucionVal;

    const saborEl = document.getElementById("sabor-modo-uso");
    const saborVal = configMap["sabormodouso"];
    if (saborEl && saborVal) saborEl.innerText = saborVal;

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

    // 5. Preguntas Frecuentes Dinámicas desde Pestaña FAQ
    const faqWrapper = document.querySelector(".faq-accordion-wrapper");
    const faqList = dataPayload.faq || resData.faq || [];
    if (faqWrapper && Array.isArray(faqList) && faqList.length > 0) {
      faqWrapper.innerHTML = "";
      faqList.forEach((faqItem, idx) => {
        const preg = faqItem.pregunta || faqItem[0] || "";
        const resp = faqItem.respuesta || faqItem[1] || "";
        const isFirst = idx === 0 ? "open" : "";

        if (preg && resp) {
          const detailsEl = document.createElement("details");
          detailsEl.className = "faq-accordion-item";
          if (isFirst) detailsEl.setAttribute("open", "");

          detailsEl.innerHTML = `
            <summary class="faq-accordion-header">
              <span>${preg}</span>
              <span class="faq-accordion-icon">▼</span>
            </summary>
            <div class="faq-accordion-body">
              <p>${resp}</p>
            </div>
          `;
          faqWrapper.appendChild(detailsEl);
        }
      });
    }

    // 6. Carga de Tarifas de Envío Dinámicas por Región (desde Pestaña TarifasEnvio de Sheets)
    const tarifasEnvio = dataPayload.tarifasEnvio || dataPayload.tarifas || resData.tarifasEnvio || resData.tarifas || [];
    if (Array.isArray(tarifasEnvio) && tarifasEnvio.length > 0) {
      tarifasEnvio.forEach((item) => {
        const reg = item.Region || item.region || item.regionName || (Array.isArray(item) ? item[0] : "");
        const cst = Number(item.Costo || item.costo || item.precio || (Array.isArray(item) ? item[1] : NaN));
        if (reg && !isNaN(cst)) {
          const key = String(reg).trim().toLowerCase();
          MAPA_TARIFAS_ENVIO[key] = cst;
          if (key.includes("metropolitana") || key === "rm") {
            TARIFA_RM = cst;
          } else if (key.includes("region") || key.includes("otras") || key.includes("resto")) {
            TARIFA_REGIONES = cst;
          }
        }
      });
    }

    if (configMap["tarifarm"] || configMap["tarifadespachorm"]) {
      const valRm = Number(configMap["tarifarm"] || configMap["tarifadespachorm"]);
      if (!isNaN(valRm)) TARIFA_RM = valRm;
    }
    if (configMap["tarifaregiones"] || configMap["tarifadespachoregiones"]) {
      const valReg = Number(configMap["tarifaregiones"] || configMap["tarifadespachoregiones"]);
      if (!isNaN(valReg)) TARIFA_REGIONES = valReg;
    }

    actualizarVisualizacionPrecio();
  };

  const cargarConfiguracion = async () => {
    // 1. Carga Instantánea a 0 ms desde sessionStorage (Stale-While-Revalidate)
    const cachedConfigRaw = sessionStorage.getItem("LYNTO_CONFIG");
    let hasCache = false;
    if (cachedConfigRaw) {
      try {
        const cachedData = JSON.parse(cachedConfigRaw);
        if (cachedData && cachedData.success) {
          aplicarConfiguracion(cachedData);
          hasCache = true;
          console.log("⚡ Configuración cargada al instante desde sessionStorage (0 ms). Revalidando en segundo plano...");
          if (displayTotal) displayTotal.classList.remove("total-price-loading");
        }
      } catch (e) {
        console.warn("⚠️ No se pudo decodificar el caché de sessionStorage:", e);
      }
    }

    // 2. Revalidación en segundo plano (background fetch no-bloqueante)
    const FETCH_TIMEOUT_MS = 6000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      if (!hasCache) {
        console.log("⏳ Solicitando configuración inicial desde Google Sheets...");
        if (displayTotal) displayTotal.classList.add("total-price-loading");
      }

      const response = await fetch(`${API_URL}?action=get_config`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} al consultar la configuración.`);
      }

      const resData = await response.json();
      if (!resData.success) return;

      // Actualizar el caché de la sesión con los datos más recientes de Sheets
      try {
        sessionStorage.setItem("LYNTO_CONFIG", JSON.stringify(resData));
      } catch (e) {}

      // Aplicar actualización fresca de Sheets a la pantalla
      aplicarConfiguracion(resData);
      console.log("✅ Configuración dinámica revalidada y actualizada desde Sheets.");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.log("Nota al revalidar configuración:", error.message);
      }
    } finally {
      clearTimeout(timeoutId);
      if (displayTotal) displayTotal.classList.remove("total-price-loading");
    }
  };

  actualizarVisualizacionPrecio();
  cargarConfiguracion();
});
