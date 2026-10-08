/* Detalle de producto: un solo <dialog> que se rellena con la celda pulsada. */

const SELECTOR_CELDA = ".carrusel__celda";

export function iniciarDetalleProducto() {
  const dialogo = document.getElementById("dialogo-producto");
  if (!dialogo) {
    return;
  }

  const celdas = document.querySelectorAll(SELECTOR_CELDA);
  if (!celdas.length) {
    return;
  }

  const foto = document.getElementById("producto-foto");
  const titulo = document.getElementById("producto-titulo");
  const descripcion = document.getElementById("producto-descripcion");
  const precio = document.getElementById("producto-precio");

  function textoDe(celda, selector) {
    const nodo = celda.querySelector(selector);
    return nodo ? nodo.textContent.trim() : "";
  }

  function rellenarTitulo(celda) {
    const origen = celda.querySelector(".carrusel__titulo");
    titulo.textContent = "";

    if (!origen) {
      return;
    }

    Array.from(origen.childNodes).forEach(function (nodo) {
      if (
        nodo.nodeType === Node.ELEMENT_NODE &&
        nodo.classList.contains("parentesis")
      ) {
        const parentesis = document.createElement("span");
        parentesis.className = "parentesis";
        parentesis.textContent = nodo.textContent
          .trim()
          .replace("unid", "unidades");
        titulo.appendChild(parentesis);
        return;
      }

      titulo.appendChild(document.createTextNode(nodo.textContent));
    });
  }

  function rellenar(celda) {
    const fotoOrigen = celda.querySelector(".carrusel__foto");
    foto.src = fotoOrigen ? fotoOrigen.src : "";
    foto.alt = fotoOrigen ? fotoOrigen.alt : "";

    rellenarTitulo(celda);

    const textoDescripcion = textoDe(celda, ".carrusel__detalle");
    descripcion.textContent = textoDescripcion;
    descripcion.hidden = !textoDescripcion;

    const textoPrecio = textoDe(celda, ".carrusel__precio");
    precio.textContent = textoPrecio;
    precio.hidden = !textoPrecio;
  }

  function abrir(celda) {
    if (dialogo.open) {
      return;
    }

    rellenar(celda);
    dialogo.showModal();
  }

  celdas.forEach(function (celda) {
    celda.tabIndex = 0;
    celda.setAttribute("role", "button");

    celda.addEventListener("click", function () {
      abrir(celda);
    });

    celda.addEventListener("keydown", function (evento) {
      if (evento.key !== "Enter" && evento.key !== " ") {
        return;
      }

      evento.preventDefault();
      abrir(celda);
    });
  });

  document.querySelectorAll("[data-cerrar-producto]").forEach(function (boton) {
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
