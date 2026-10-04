/* Navegacion movil. */

export function iniciarNavMovil() {
  const boton = document.getElementById("boton-menu");
  const panel = document.getElementById("nav-movil");
  if (!boton || !panel) {
    return;
  }

  function cerrar() {
    boton.setAttribute("aria-expanded", "false");
    panel.classList.remove("nav-movil--abierto");
  }

  boton.addEventListener("click", function () {
    const abierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", abierto ? "false" : "true");
    panel.classList.toggle("nav-movil--abierto", !abierto);
  });

  panel.querySelectorAll("a").forEach(function (enlace) {
    enlace.addEventListener("click", cerrar);
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      cerrar();
    }
  });
}
