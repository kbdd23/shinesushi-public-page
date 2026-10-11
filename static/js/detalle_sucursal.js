/* Detalle de sucursal: un solo <dialog> que se rellena con la información de la tarjeta pulsada. */

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
  }

  document.querySelectorAll("[data-abrir-detalle]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      if (dialogo.open) {
        return;
      }

      const tarjeta = boton.closest(".sucursal");
      if (!tarjeta) {
        return;
      }

      rellenar(tarjeta);
      dialogo.showModal();
    });
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
}
