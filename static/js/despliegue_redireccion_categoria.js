/* Despliegue y redireccion por categoria: si el cliente llega con un ancla
   (#sushi, #burgers, #bar) hay que abrir ese <details> y recien ahi desplazar
   hasta el, porque el auto-despliegue nativo no es fiable entre navegadores. */

const SELECTOR_CATEGORIA = "details.catalogo__categoria";

function abrirCategoriaDelAncla() {
  const id = window.location.hash.slice(1);
  if (!id) {
    return;
  }

  const categoria = document.getElementById(id);
  if (!categoria || categoria.tagName !== "DETAILS") {
    return;
  }

  categoria.open = true;
  requestAnimationFrame(() => categoria.scrollIntoView());
}

export function iniciarDespliegueRedireccionCategoria() {
  if (!document.querySelector(SELECTOR_CATEGORIA)) {
    return;
  }

  abrirCategoriaDelAncla();
  window.addEventListener("hashchange", abrirCategoriaDelAncla);
}
