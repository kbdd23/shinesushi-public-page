/* Detalle de sucursal: un solo <dialog> que se rellena con la información de la tarjeta pulsada. */

const ID_MAPA = "detalle-mapa";
const ID_MAPA_MARCO = "detalle-mapa-marco";
const ID_MAPA_ENLACE = "detalle-mapa-enlace";

/* La vista previa va por coordenadas y no por la dirección escrita: la tarjeta
   trae lat,lng en data-coordenadas, y con eso el pin cae sobre el local en vez
   de caer donde Google crea que esta la calle. */
const URL_VISTA_PREVIA = "https://maps.google.com/maps?q=";
const PARAMETROS_VISTA_PREVIA = "&z=17&hl=es&output=embed";

/* El enlace abierto lleva la dirección escrita, porque a quien lo pulsa una
   coordenada cruda no le dice nada, y las coordenadas pegadas detras para que
   el pin caiga en el mismo punto que la vista previa. */
const URL_MAPA_ABIERTO = "https://www.google.com/maps/place/";
const PARAMETROS_MAPA_ABIERTO = "/@";
const ZOOM_MAPA_ABIERTO = ",17z";

export function iniciarDetalleSucursal() {
  const dialogo = document.getElementById("dialogo-detalle-sucursal");
  if (!dialogo) {
    return;
  }

  const foto = document.getElementById("detalle-foto");
  const titulo = document.getElementById("detalle-titulo");
  const direccion = document.getElementById("detalle-direccion");
  const acciones = document.getElementById("detalle-acciones");
  const fono = document.getElementById("detalle-fono");
  const whatsapp = document.getElementById("detalle-whatsapp");
  const mapa = document.getElementById(ID_MAPA);
  const mapaMarco = document.getElementById(ID_MAPA_MARCO);
  const mapaEnlace = document.getElementById(ID_MAPA_ENLACE);

  function rellenar(tarjeta) {
    const fotoOrigen = tarjeta.querySelector(".sucursal__foto");
    foto.src = fotoOrigen.src;
    foto.alt = fotoOrigen.alt;

    const zonaOrigen = tarjeta.querySelector(".sucursal__zona");
    titulo.textContent = zonaOrigen.textContent.trim();

    const direccionOrigen = tarjeta.querySelector(".sucursal__direccion");
    direccion.textContent =
      direccionOrigen.dataset.direccionCompleta || direccionOrigen.textContent.trim();

    const enlaceFono = tarjeta.querySelector(
      ".sucursal__accion:not(.sucursal__accion--whatsapp)"
    );
    const enlaceWhatsapp = tarjeta.querySelector(".sucursal__accion--whatsapp");

    fono.hidden = !enlaceFono;
    if (enlaceFono) {
      fono.href = enlaceFono.href;
      fono.textContent = enlaceFono.textContent.trim();
    }

    whatsapp.hidden = !enlaceWhatsapp;
    if (enlaceWhatsapp) {
      whatsapp.href = enlaceWhatsapp.href;
    }

    acciones.hidden = !enlaceFono && !enlaceWhatsapp;

    const coordenadas = tarjeta.dataset.coordenadas;
    const consulta = tarjeta.dataset.mapaConsulta;
    mapa.hidden = !coordenadas;

    if (coordenadas) {
      /* El enlace armado aqui solo centra el mapa: sin la ficha del lugar,
         Google no tiene marcador que poner, y una direccion de calle no es un
         lugar para Google. Por eso las tarjetas que si tienen ficha traen su
         enlace entero en data-mapa-enlace y ese manda. */
      mapaEnlace.href =
        tarjeta.dataset.mapaEnlace ||
        URL_MAPA_ABIERTO +
          encodeURIComponent(consulta || coordenadas) +
          PARAMETROS_MAPA_ABIERTO +
          coordenadas +
          ZOOM_MAPA_ABIERTO;

      /* El src se guarda, no se aplica: el iframe de Google pesa cerca de un
         mega y solo tiene que cargarse cuando el dialogo se abre de verdad. */
      mapaMarco.dataset.src = URL_VISTA_PREVIA + coordenadas + PARAMETROS_VISTA_PREVIA;
    } else {
      mapaEnlace.removeAttribute("href");
      delete mapaMarco.dataset.src;
      mapaMarco.removeAttribute("src");
    }
  }

  /* Delegado en el documento en vez de atar boton por boton: el carrusel de
     sucursales del landing clona sus celdas despues de que este modulo arranca,
     y esos clones tambien tienen que abrir el dialogo. Atados de uno en uno,
     los clones quedaban muertos. */
  document.addEventListener("click", function (evento) {
    const boton = evento.target.closest("[data-abrir-detalle]");
    if (!boton) {
      return;
    }

    if (dialogo.open) {
      return;
    }

    const tarjeta = boton.closest(".sucursal");
    if (!tarjeta) {
      return;
    }

    rellenar(tarjeta);
    dialogo.showModal();

    if (mapaMarco.dataset.src) {
      mapaMarco.src = mapaMarco.dataset.src;
    }
  });

  document.querySelectorAll("[data-cerrar-detalle]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      dialogo.close();
    });
  });

  dialogo.addEventListener("click", function (evento) {
    if (evento.target === dialogo) {
      dialogo.close();
    }
  });

  /* Todo cierre pasa por aca, el de la cruz y el del fondo. Mientras el iframe
     tenga src, Google sigue cargado y con su memoria: se suelta al cerrar. */
  dialogo.addEventListener("close", function () {
    mapaMarco.removeAttribute("src");
  });
}
