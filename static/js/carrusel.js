/* Bandas de productos: arrastre con puntero en escritorio y flechas que
   aparecen solo cuando la pista tiene desborde hacia ese lado.

   La captura del puntero se toma recien cuando el arrastre supera el umbral,
   para que un click simple siga llegando a los elementos de la celda. */

const SELECTOR_PISTA = ".carrusel__pista";
const SELECTOR_INTERRUPTOR = "[role='switch']";
const CLASE_ARRASTRANDO = "carrusel__pista--arrastrando";
const UMBRAL_ARRASTRE = 6;

/* Cinta continua, opcional. Solo se mueve la pista que trae
   data-carrusel-velocidad con su paso en pixeles por segundo: el menu tiene una
   veintena de carruseles y ninguno de esos debe moverse solo.

   El scroll nativo tiene tope, asi que para que la cinta no se corte se clona el
   juego de celdas a los dos lados y se arranca sobre el juego del medio. Cuando
   el desplazamiento se sale del juego del medio se le suma o se le resta un
   ancho de juego de golpe: el salto cae sobre contenido identico, asi que no se
   ve, y sirve igual hacia adelante que hacia atras. Es el barril del revolver,
   que no tiene principio ni fin. */
const ATRIBUTO_VELOCIDAD = "carruselVelocidad";
const CLASE_CLON = "carrusel__celda--clon";
const VELOCIDAD_POR_DEFECTO = 40;

/* Ningun cuadro dura mas de una decima de segundo. Si la pestana estuvo oculta
   el salto de tiempo se descarta: la cinta retoma su paso en vez de pegar un
   tiron de cientos de pixeles. */
const TRANSCURRIDO_MAXIMO = 0.1;

function pasoDeCelda(pista) {
  const celda = pista.querySelector(".carrusel__celda");
  if (!celda) {
    return pista.clientWidth;
  }

  const separacion = parseFloat(getComputedStyle(pista).columnGap) || 0;
  return celda.getBoundingClientRect().width + separacion;
}

function clonarCeldas(pista) {
  const originales = Array.from(pista.children);

  function crearClon(celda) {
    const clon = celda.cloneNode(true);
    clon.classList.add(CLASE_CLON);
    clon.setAttribute("aria-hidden", "true");
    clon.inert = true;

    /* Respaldo para navegadores sin inert: que el clon no sume paradas de
       tabulador ni se pueda enfocar con el teclado. */
    clon.querySelectorAll("button, a").forEach((nodo) => {
      nodo.setAttribute("tabindex", "-1");
    });

    return clon;
  }

  /* Un juego a cada lado. Con uno solo, el desplazamiento hacia atras se topa
     con la primera celda y el bucle queda de un solo sentido. */
  originales.forEach((celda) => {
    pista.insertBefore(crearClon(celda), originales[0]);
  });

  originales.forEach((celda) => {
    pista.appendChild(crearClon(celda));
  });

  return originales;
}

function prepararBucle(pista) {
  const atributo = pista.dataset[ATRIBUTO_VELOCIDAD];
  if (atributo === undefined) {
    return null;
  }

  /* Sin clonar: con movimiento reducido no hay cinta, y una lista triplicada
     solo confundiria al recorrerla a mano. */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  const leida = Number(atributo);
  const velocidad = leida > 0 ? leida : VELOCIDAD_POR_DEFECTO;

  const originales = clonarCeldas(pista);
  const cantidad = originales.length;
  if (!cantidad) {
    return null;
  }

  /* La pista quedo como [clones][originales][clones]: el juego del medio es el
     que se ve, y los de los costados son el mismo contenido repetido para que
     el salto no tenga borde. */
  const primerOriginal = pista.children[cantidad];
  const primerClonPosterior = pista.children[2 * cantidad];

  /* Se mide una vez y se vuelve a medir al cambiar de tamano: leer el layout en
     cada cuadro obligaria al navegador a recalcular la pagina 60 veces por
     segundo. */
  let anchoDeUnJuego = 0;
  let hayBucle = false;

  function medir() {
    anchoDeUnJuego =
      primerClonPosterior.getBoundingClientRect().left -
      primerOriginal.getBoundingClientRect().left;

    /* Hay que poder llegar al juego siguiente y al anterior: si la pista no da
       para eso, el salto invisible no tiene donde caer y es mejor quedarse
       quieto que empujar contra el tope. */
    hayBucle = pista.scrollWidth - pista.clientWidth >= 2 * anchoDeUnJuego;
  }

  medir();

  /* Se arranca sobre el juego del medio para que a la vista queden los
     originales, y no los clones que existen solo para el salto. */
  pista.scrollLeft = anchoDeUnJuego;

  new ResizeObserver(medir).observe(pista);

  /* El unico freno es el interruptor: la cinta no se detiene al pasar el puntero
     ni al enfocar, solo cuando alguien la apaga. */
  let apagado = false;
  let anterior = null;

  function girar(ahora) {
    if (anterior === null) {
      anterior = ahora;
    }

    const transcurrido = Math.min((ahora - anterior) / 1000, TRANSCURRIDO_MAXIMO);
    anterior = ahora;

    if (hayBucle) {
      if (!apagado) {
        /* Avance parejo: sin objetivo ni saltos, un tramo de cinta por cuadro. */
        pista.scrollLeft += transcurrido * velocidad;
      }

      /* El encierro corre siempre, tambien con la cinta detenida: asi el
         arrastre manual tampoco encuentra borde. Los dos limites caen sobre
         contenido identico al del lado opuesto, asi que el salto no se ve. */
      while (pista.scrollLeft >= 2 * anchoDeUnJuego) {
        pista.scrollLeft -= anchoDeUnJuego;
      }

      while (pista.scrollLeft < anchoDeUnJuego) {
        pista.scrollLeft += anchoDeUnJuego;
      }
    }

    window.requestAnimationFrame(girar);
  }

  window.requestAnimationFrame(girar);

  return {
    activar() {
      apagado = false;
      /* Se descarta el tiempo detenido: si no, al reactivar la cinta arrancaria
         con el atraso acumulado. */
      anterior = null;
    },
    desactivar() {
      apagado = true;
    },
  };
}

/* El interruptor vive fuera de la pista, asi que se ata por aria-controls. */
function conectarInterruptores(bucles) {
  document.querySelectorAll(SELECTOR_INTERRUPTOR).forEach((interruptor) => {
    const pista = document.getElementById(interruptor.getAttribute("aria-controls"));
    const bucle = bucles.find((entrada) => entrada.pista === pista);
    if (!bucle) {
      return;
    }

    function aplicar() {
      if (interruptor.getAttribute("aria-checked") === "true") {
        bucle.control.activar();
      } else {
        bucle.control.desactivar();
      }
    }

    /* Un boton ya dispara click con Enter y con Espacio: el teclado queda
       cubierto sin escuchar teclas a mano. */
    interruptor.addEventListener("click", () => {
      const encendido = interruptor.getAttribute("aria-checked") === "true";
      interruptor.setAttribute("aria-checked", String(!encendido));
      aplicar();
    });

    aplicar();
  });
}

function iniciarPista(pista) {
  const ventana = pista.closest(".carrusel__ventana");
  if (!ventana) {
    return null;
  }

  const flechaIzquierda = ventana.querySelector(".carrusel__flecha--izq");
  const flechaDerecha = ventana.querySelector(".carrusel__flecha--der");
  if (!flechaIzquierda || !flechaDerecha) {
    return null;
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

  const control = prepararBucle(pista);

  flechaIzquierda.addEventListener("click", () => avanzar(-1));
  flechaDerecha.addEventListener("click", () => avanzar(1));
  pista.addEventListener("scroll", actualizarFlechas, { passive: true });

  let arrastrando = false;
  let capturado = false;
  let xInicial = 0;
  let xAnterior = 0;
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
    xAnterior = evento.clientX;
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

    /* Se aplica el tramo desde el movimiento anterior y no desde el inicio: si
       fuera desde el inicio, el encierro del bucle quedaria pisado en cada
       cuadro y el arrastre volveria a toparse con los bordes. */
    pista.scrollLeft -= evento.clientX - xAnterior;
    xAnterior = evento.clientX;
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

  return control;
}

export function iniciarCarruseles() {
  const bucles = [];

  document.querySelectorAll(SELECTOR_PISTA).forEach((pista) => {
    const control = iniciarPista(pista);

    if (control) {
      bucles.push({ pista, control });
    }
  });

  conectarInterruptores(bucles);
}
