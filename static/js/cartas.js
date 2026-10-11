/* Selector de cartas descargables: abre y cierra su <dialog>. (esto es para el menú de opciones de descargas, las cartas disponibles.) */

export function iniciarCartas() {
  const dialogo = document.getElementById("dialogo-cartas");
  if (!dialogo) {
    return;
  }

  document.querySelectorAll("[data-abrir-cartas]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      dialogo.showModal();
    });
  });

  document.querySelectorAll("[data-cerrar-cartas]").forEach(function (boton) {
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
