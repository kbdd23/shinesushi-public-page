/* Selector de sucursal. */

export function iniciarSucursales() {
  const dialogo = document.getElementById("dialogo-sucursal");
  if (!dialogo) {
    return;
  }

  document.querySelectorAll("[data-abrir-sucursal]").forEach(function (boton) {
    boton.addEventListener("click", function (evento) {
      evento.preventDefault();
      dialogo.showModal();
    });
  });

  document.querySelectorAll("[data-cerrar-sucursal]").forEach(function (boton) {
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
