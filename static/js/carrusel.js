/* Bandas de productos: arrastre con puntero en escritorio y flechas que
   aparecen solo cuando la pista tiene desborde hacia ese lado.

   La captura del puntero se toma recien cuando el arrastre supera el umbral,
   para que un click simple siga llegando a los elementos de la celda. */

const SELECTOR_PISTA = ".carrusel__pista";
const CLASE_ARRASTRANDO = "carrusel__pista--arrastrando";
const UMBRAL_ARRASTRE = 6;

function pasoDeCelda(pista) {
  const celda = pista.querySelector(".carrusel__celda");
  if (!celda) {
    return pista.clientWidth;
  }

  const separacion = parseFloat(getComputedStyle(pista).columnGap) || 0;
  return celda.getBoundingClientRect().width + separacion;
}

function iniciarPista(pista) {
  const ventana = pista.closest(".carrusel__ventana");
  if (!ventana) {
    return;
  }

  const flechaIzquierda = ventana.querySelector(".carrusel__flecha--izq");
  const flechaDerecha = ventana.querySelector(".carrusel__flecha--der");
  if (!flechaIzquierda || !flechaDerecha) {
    return;
  }

  function actualizarFlechas() {
    const desborde = pista.scrollWidth - pista.clientWidth;
    const hayDesborde = desborde > 1;

    flechaIzquierda.hidden = !hayDesborde || pista.scrollLeft <= 1;
    flechaDerecha.hidden = !hayDesborde || pista.scrollLeft >= desborde - 1;
  }

  function avanzar(direccion) {
    pista.scrollBy({ left: direccion * pasoDeCelda(pista), behavior: "smooth" });
  }

  flechaIzquierda.addEventListener("click", () => avanzar(-1));
  flechaDerecha.addEventListener("click", () => avanzar(1));
  pista.addEventListener("scroll", actualizarFlechas, { passive: true });

  let arrastrando = false;
  let capturado = false;
  let xInicial = 0;
  let scrollInicial = 0;
  let distanciaArrastrada = 0;
  let suprimirClick = false;

  pista.addEventListener("pointerdown", (evento) => {
    suprimirClick = false;

    if (evento.pointerType !== "mouse") {
      return;
    }

    arrastrando = true;
    capturado = false;
    xInicial = evento.clientX;
    scrollInicial = pista.scrollLeft;
    distanciaArrastrada = 0;
    pista.classList.add(CLASE_ARRASTRANDO);
  });

  pista.addEventListener("pointermove", (evento) => {
    if (!arrastrando) {
      return;
    }

    distanciaArrastrada = Math.max(
      distanciaArrastrada,
      Math.abs(evento.clientX - xInicial)
    );

    if (!capturado && distanciaArrastrada > UMBRAL_ARRASTRE) {
      capturado = true;
      suprimirClick = true;
      pista.setPointerCapture(evento.pointerId);
    }

    pista.scrollLeft = scrollInicial - (evento.clientX - xInicial);
  });

  function terminarArrastre(evento) {
    if (!arrastrando) {
      return;
    }

    arrastrando = false;
    pista.classList.remove(CLASE_ARRASTRANDO);

    if (capturado) {
      capturado = false;

      if (pista.hasPointerCapture(evento.pointerId)) {
        pista.releasePointerCapture(evento.pointerId);
      }
    }

    actualizarFlechas();
  }

  pista.addEventListener("pointerup", terminarArrastre);
  pista.addEventListener("pointercancel", terminarArrastre);

  pista.addEventListener(
    "click",
    (evento) => {
      if (!suprimirClick || evento.detail === 0) {
        return;
      }

      suprimirClick = false;
      evento.stopPropagation();
      evento.preventDefault();
    },
    { capture: true }
  );

  new ResizeObserver(actualizarFlechas).observe(pista);
  actualizarFlechas();
}

export function iniciarCarruseles() {
  document.querySelectorAll(SELECTOR_PISTA).forEach(iniciarPista);
}
