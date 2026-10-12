/* Bandas de productos: arrastre con puntero en escritorio y flechas que
   aparecen solo cuando la pista tiene desborde hacia ese lado.

   La captura del puntero se toma recien cuando el arrastre supera el umbral,
   para que un click simple siga llegando a los elementos de la celda. */

const SELECTOR_PISTA = ".carrusel__pista";
const SELECTOR_INTERRUPTOR = "[role='switch']";
const CLASE_ARRASTRANDO = "carrusel__pista--arrastrando";
const UMBRAL_ARRASTRE = 6;

/* Bucle por pasos, opcional. Solo gira la pista que trae data-carrusel-bucle
   con su intervalo en milisegundos: el menu tiene una veintena de carruseles y
   ninguno de esos debe moverse solo.

   El scroll nativo tiene tope, asi que para que el giro no se corte se clona el
   juego de celdas a los dos lados y se arranca sobre el juego del medio. Cuando
   el desplazamiento se sale del juego del medio se le suma o se le resta un
   ancho de juego de golpe: el salto cae sobre contenido identico, asi que no se
   ve, y sirve igual hacia adelante que hacia atras. Es el barril del revolver,
   que no tiene principio ni fin. */
const ATRIBUTO_BUCLE = "carruselBucle";
const CLASE_CLON = "carrusel__celda--clon";
const INTERVALO_POR_DEFECTO = 4000;

/* Fraccion de la distancia que se cubre por cuadro al acercarse al objetivo.
   Con 60 cuadros por segundo, la celda queda asentada en medio segundo. */
const SUAVIZADO = 0.12;

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
  const atributo = pista.dataset[ATRIBUTO_BUCLE];
  if (atributo === undefined) {
    return null;
  }

  /* Sin clonar: con movimiento reducido no hay giro, y una lista triplicada
     solo confundiria al recorrerla a mano. */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  const leida = Number(atributo);
  const intervalo = leida > 0 ? leida : INTERVALO_POR_DEFECTO;

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
  let paso = 0;

  function medir() {
    anchoDeUnJuego =
      primerClonPosterior.getBoundingClientRect().left -
      primerOriginal.getBoundingClientRect().left;

    /* Un juego son todas las celdas: el paso de una es el juego repartido. */
    paso = anchoDeUnJuego / cantidad;

    /* Hay que poder llegar al juego siguiente y al anterior: si la pista no da
       para eso, el salto invisible no tiene donde caer y es mejor quedarse
       quieto que empujar contra el tope. */
    if (pista.scrollWidth - pista.clientWidth < 2 * anchoDeUnJuego) {
      paso = 0;
    }
  }

  medir();

  /* Se arranca sobre el juego del medio para que a la vista queden los
     originales, y no los clones que existen solo para el salto. */
  pista.scrollLeft = anchoDeUnJuego;

  new ResizeObserver(medir).observe(pista);

  /* Apagado es cosa del interruptor; pausado es momentaneo (puntero encima,
     foco, pestana oculta). El giro necesita los dos en verde. */
  let apagado = false;
  let pausado = false;
  let anterior = null;
  let objetivo = pista.scrollLeft;
  let acumulado = 0;

  function girar(ahora) {
    if (anterior === null) {
      anterior = ahora;
    }

    const transcurrido = (ahora - anterior) / 1000;
    anterior = ahora;

    if (anchoDeUnJuego > 0) {
      if (!apagado && !pausado) {
        acumulado += transcurrido * 1000;

        if (acumulado >= intervalo) {
          acumulado = 0;
          objetivo += paso;
        }

        /* Se llega al objetivo acercandose, no de un salto seco. */
        const distancia = objetivo - pista.scrollLeft;
        if (Math.abs(distancia) < 1) {
          pista.scrollLeft = objetivo;
        } else {
          pista.scrollLeft += distancia * SUAVIZADO;
        }
      } else {
        /* Sin giro, el objetivo solo acompaña a la pista: al reactivar no debe
           devolverla de un tiron. */
        objetivo = pista.scrollLeft;
      }

      /* El encierro corre siempre, tambien con el avance apagado: asi el
         arrastre manual tampoco encuentra borde. Los dos limites caen sobre
         contenido identico al del lado opuesto, asi que el salto no se ve. */
      while (pista.scrollLeft >= 2 * anchoDeUnJuego) {
        pista.scrollLeft -= anchoDeUnJuego;
        objetivo -= anchoDeUnJuego;
      }

      while (pista.scrollLeft < anchoDeUnJuego) {
        pista.scrollLeft += anchoDeUnJuego;
        objetivo += anchoDeUnJuego;
      }
    }

    window.requestAnimationFrame(girar);
  }

  function reanudar() {
    /* Se descarta el tiempo detenido: si no, al volver arrancaria de golpe. */
    anterior = null;
    acumulado = 0;
  }

  function detener() {
    pausado = true;
  }

  function seguir() {
    pausado = false;
    reanudar();
  }

  pista.addEventListener("pointerenter", detener);
  pista.addEventListener("pointerleave", seguir);
  pista.addEventListener("focusin", detener);
  pista.addEventListener("focusout", seguir);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      detener();
    } else {
      seguir();
    }
  });

  window.requestAnimationFrame(girar);

  return {
    activar() {
      apagado = false;
      reanudar();
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
