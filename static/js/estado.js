/* Estado de atencion del local. */

const HORARIOS = {
  0: { apertura: 11 * 60, cierre: 23 * 60 }, // domingo
  1: { apertura: 11 * 60, cierre: 23 * 60 }, // lunes
  2: { apertura: 11 * 60, cierre: 23 * 60 }, // martes
  3: { apertura: 11 * 60, cierre: 23 * 60 }, // miercoles
  4: { apertura: 11 * 60, cierre: 23 * 60 }, // jueves
  5: { apertura: 11 * 60, cierre: 23 * 60 + 30 }, // viernes
  6: { apertura: 11 * 60, cierre: 23 * 60 + 30 }, // sabado
};

const NOMBRES_DIA = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function formatearHora(minutosDelDia) {
  const horas24 = Math.floor(minutosDelDia / 60);
  const minutos = minutosDelDia % 60;
  const sufijo = horas24 < 12 ? "am" : "pm";
  const horas12 = horas24 % 12 === 0 ? 12 : horas24 % 12;
  return (
    String(horas12).padStart(2, "0") +
    ":" +
    String(minutos).padStart(2, "0") +
    sufijo
  );
}

function calcularEstado(ahora) {
  const dia = ahora.getDay();
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
  const horarioHoy = HORARIOS[dia];

  if (minutosActuales >= horarioHoy.apertura && minutosActuales < horarioHoy.cierre) {
    return {
      abierto: true,
      texto: "ABIERTO ahora · hasta las " + formatearHora(horarioHoy.cierre),
    };
  }

  if (minutosActuales < horarioHoy.apertura) {
    return {
      abierto: false,
      texto: "CERRADO · abre hoy a las " + formatearHora(horarioHoy.apertura),
    };
  }

  const diaSiguiente = (dia + 1) % 7;
  return {
    abierto: false,
    texto:
      "CERRADO · abre " +
      NOMBRES_DIA[diaSiguiente] +
      " a las " +
      formatearHora(HORARIOS[diaSiguiente].apertura),
  };
}

function pintarEstado() {
  const etiqueta = document.getElementById("estado");
  const texto = document.getElementById("estado-texto");
  if (!etiqueta || !texto) {
    return;
  }

  const estado = calcularEstado(new Date());
  etiqueta.dataset.estado = estado.abierto ? "abierto" : "cerrado";
  etiqueta.classList.toggle("estado--abierto", estado.abierto);
  etiqueta.classList.toggle("estado--cerrado", !estado.abierto);
  texto.textContent = estado.texto;
}

export function iniciarEstado() {
  pintarEstado();
  window.setInterval(pintarEstado, 60000);
}
