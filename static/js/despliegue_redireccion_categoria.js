/* Despliegue, memoria y redireccion por categoria.
   - Despliegue: el estado abierto/cerrado de cada <details> se guarda en
     localStorage, para que el cliente lo encuentre como lo dejo.
   - Redireccion: si llega con un ancla (#sushi, #burgers, #bar) hay que abrir
     ese <details> y recien ahi desplazar hasta el, porque el auto-despliegue
     nativo no es fiable entre navegadores.
   El ancla manda sobre la memoria: primero se restaura, despues se aplica. */

const SELECTOR_CATEGORIA = "details.catalogo__categoria";
const CLAVE_ALMACEN = "shinesushi:categorias-desplegadas";

/* Estado que sabemos vigente. El evento "toggle" de <details> es asincrono:
   tambien se dispara cuando abrimos por codigo, y llega despues de que el
   bucle de restauracion termino. Un flag sincrono no lo detendria. En cambio,
   si el estado real no se diferencia del que ya conociamos, el evento no viene
   del cliente y no hay nada que guardar. */
let estadoConocido = null;

function leerMemoria() {
  try {
    const guardado = window.localStorage.getItem(CLAVE_ALMACEN);
    return guardado ? JSON.parse(guardado) : {};
  } catch (error) {
    return {};
  }
}

function escribirMemoria(estado) {
  try {
    window.localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(estado));
  } catch (error) {
    /* Sin localStorage disponible (modo privado, cuota llena) se pierde la
       memoria, pero el despliegue sigue funcionando. */
  }
}

function estadoDeLasCategorias(categorias) {
  const estado = {};

  categorias.forEach(function (categoria) {
    if (categoria.id) {
      estado[categoria.id] = categoria.open;
    }
  });

  return estado;
}

function sonIguales(estadoA, estadoB) {
  const clavesA = Object.keys(estadoA);
  const clavesB = Object.keys(estadoB);

  if (clavesA.length !== clavesB.length) {
    return false;
  }

  return clavesA.every(function (clave) {
    return estadoA[clave] === estadoB[clave];
  });
}

function restaurarMemoria(categorias) {
  const guardado = leerMemoria();

  categorias.forEach(function (categoria) {
    if (Object.prototype.hasOwnProperty.call(guardado, categoria.id)) {
      categoria.open = guardado[categoria.id];
    }
  });
}

function recordarEstado(categorias) {
  const estado = estadoDeLasCategorias(categorias);

  if (estadoConocido && sonIguales(estado, estadoConocido)) {
    return;
  }

  estadoConocido = estado;
  escribirMemoria(estado);
}

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
  const categorias = document.querySelectorAll(SELECTOR_CATEGORIA);
  if (!categorias.length) {
    return;
  }

  restaurarMemoria(categorias);
  estadoConocido = estadoDeLasCategorias(categorias);

  categorias.forEach(function (categoria) {
    categoria.addEventListener("toggle", function () {
      recordarEstado(categorias);
    });
  });

  abrirCategoriaDelAncla();
  window.addEventListener("hashchange", abrirCategoriaDelAncla);
}
