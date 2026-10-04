/* Acordeones del catalogo: los <details> se abren y cierran solos, pero si el
   cliente llega con un ancla (#sushi, #burgers, #bar) hay que desplegarlo. */

export function iniciarAcordeones() {
  const acordeones = document.querySelectorAll("details.acordeon");
  if (!acordeones.length) {
    return;
  }

  function abrirElDelAncla() {
    const id = window.location.hash.slice(1);
    if (!id) {
      return;
    }

    const acordeon = document.getElementById(id);
    if (!acordeon || acordeon.tagName !== "DETAILS") {
      return;
    }

    acordeon.open = true;
    acordeon.scrollIntoView();
  }

  abrirElDelAncla();
  window.addEventListener("hashchange", abrirElDelAncla);
}
