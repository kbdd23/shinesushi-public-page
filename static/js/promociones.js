/* Promociones del dia y el riel de dias. */

const PROMOCIONES = {
  0: { dia: "Domingo", descuento: "-10%", detalle: "en Tablas", flyer: "domingo.webp" },
  1: { dia: "Lunes", descuento: "4x3 / 3x2", detalle: "en Roll de Carta", flyer: "lunes.webp" },
  2: { dia: "Martes", descuento: "-10%", detalle: "en Tiraditos y Ceviche", flyer: "martes.webp" },
  3: {
    dia: "Miércoles",
    descuento: "-15%",
    detalle: "en Roll de Carta y Arma Tu Roll",
    flyer: "miercoles-jueves.webp",
  },
  4: {
    dia: "Jueves",
    descuento: "-15%",
    detalle: "en Roll de Carta y Arma Tu Roll",
    flyer: "miercoles-jueves.webp",
  },
  5: { dia: "Viernes", descuento: "-10%", detalle: "en Roll de Carta", flyer: "viernes-sabados.webp" },
  6: { dia: "Sábado", descuento: "-10%", detalle: "en Roll de Carta", flyer: "viernes-sabados.webp" },
};

const CARPETA_FLYERS = "../static/assets/promociones/";

function pintarPromocion(dia) {
  const promocion = PROMOCIONES[dia];
  if (!promocion) {
    return;
  }

  const hoy = new Date().getDay();
  const esHoy = dia === hoy;
  const etiqueta = document.getElementById("promocion-etiqueta");
  const descuento = document.getElementById("promocion-descuento");
  const detalle = document.getElementById("promocion-detalle");
  const imagenCelda = document.getElementById("promocion-imagen");
  const imagenDialogo = document.getElementById("flyer-imagen");

  if (etiqueta) {
    etiqueta.textContent = (esHoy ? "Hoy · " : "") + promocion.dia;
  }
  if (descuento) {
    descuento.textContent = promocion.descuento;
  }
  if (detalle) {
    detalle.textContent = promocion.detalle;
  }

  const ruta = CARPETA_FLYERS + promocion.flyer;
  const descripcion = "Flyer de la promoción del " + promocion.dia.toLowerCase();

  if (imagenCelda) {
    imagenCelda.src = ruta;
    imagenCelda.alt = descripcion;
  }
  if (imagenDialogo) {
    imagenDialogo.src = ruta;
    imagenDialogo.alt = descripcion;
  }

  document.querySelectorAll(".dia").forEach(function (boton) {
    const numeroDia = Number(boton.dataset.dia);
    const activo = numeroDia === dia;

    boton.classList.toggle("dia--activo", activo);
    boton.classList.toggle("dia--hoy", numeroDia === hoy);
    boton.setAttribute("aria-selected", activo ? "true" : "false");
    boton.setAttribute("aria-current", numeroDia === hoy ? "date" : "false");
  });
}

export function iniciarPromociones() {
  const riel = document.getElementById("dias");
  const dialogo = document.getElementById("dialogo-flyer");

  if (!riel && !dialogo) {
    return;
  }

  if (riel) {
    riel.querySelectorAll(".dia").forEach(function (boton) {
      boton.addEventListener("click", function () {
        pintarPromocion(Number(boton.dataset.dia));
      });
    });
  }

  if (dialogo) {
    document.querySelectorAll("[data-abrir-flyer]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        dialogo.showModal();
      });
    });

    document.querySelectorAll("[data-cerrar-flyer]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        dialogo.close();
      });
    });

    dialogo.addEventListener("click", function (evento) {
      if (evento.target === dialogo) {
        dialogo.close();
      }
    });
  }

  pintarPromocion(new Date().getDay());
}
