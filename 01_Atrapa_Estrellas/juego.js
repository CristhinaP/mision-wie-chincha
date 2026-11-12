/* ==========================================================
   CAMBIA AQUÍ: CONFIGURACIÓN PARA EL TALLER

   personaje: "🚀", "🛸" o "🤖"
   velocidad: de 3 a 12
   dificultad: "easy", "normal" o "hard"
   fondo: color hexadecimal
   duracion: tiempo de la partida en segundos
   ========================================================== */

const CONFIG = {
  personaje: "🚀",
  velocidad: 6,
  dificultad: "normal",
  fondo: "#111b3b",
  duracion: 45
};

/* ==========================================================
   ELEMENTOS DE LA PÁGINA
   ========================================================== */

function obtenerElemento(id) {
  return document.getElementById(id);
}

const lienzo = obtenerElemento("board");
const contexto = lienzo.getContext("2d");

/* ==========================================================
   ESTADO DE LA PARTIDA
   ========================================================== */

let partidaActiva = false;
let enPausa = false;

let puntuacion = 0;
let vidas = 3;
let tiempoRestante = CONFIG.duracion;

let posicionJugador = 380;

let objetos = [];
let particulas = [];

let tiempoHastaNuevoObjeto = 0;
let tiempoAnterior = 0;
let tiempoDeProteccion = 0;

const teclasPresionadas = new Set();

/* Estrellas pequeñas que decoran el fondo. */
const estrellasDelFondo = Array.from(
  { length: 75 },
  () => ({
    x: Math.random() * lienzo.width,
    y: Math.random() * lienzo.height,
    radio: Math.random() * 1.8 + 0.3
  })
);

/* ==========================================================
   PANEL DEL MODO CREADOR
   ========================================================== */

function actualizarCodigoVisible() {
  obtenerElemento("character").value = CONFIG.personaje;

  obtenerElemento("speed").value = CONFIG.velocidad;
  obtenerElemento("speedValue").textContent = CONFIG.velocidad;

  obtenerElemento("difficulty").value = CONFIG.dificultad;

  obtenerElemento("code").textContent = [
    "// CAMBIA AQUÍ",
    `personaje: "${CONFIG.personaje}"`,
    `velocidad: ${CONFIG.velocidad}`,
    `dificultad: "${CONFIG.dificultad}"`,
    `fondo: "${CONFIG.fondo}"`
  ].join("\n");

  document.querySelectorAll(".swatch").forEach((boton) => {
    const seleccionado = boton.dataset.color === CONFIG.fondo;

    boton.setAttribute(
      "aria-pressed",
      String(seleccionado)
    );
  });
}

obtenerElemento("character").addEventListener(
  "change",
  (evento) => {
    CONFIG.personaje = evento.target.value;
    actualizarCodigoVisible();
  }
);

obtenerElemento("speed").addEventListener(
  "input",
  (evento) => {
    CONFIG.velocidad = Number(evento.target.value);
    actualizarCodigoVisible();
  }
);

obtenerElemento("difficulty").addEventListener(
  "change",
  (evento) => {
    CONFIG.dificultad = evento.target.value;
    actualizarCodigoVisible();
  }
);

document.querySelectorAll(".swatch").forEach((boton) => {
  boton.addEventListener("click", () => {
    CONFIG.fondo = boton.dataset.color;
    actualizarCodigoVisible();
  });
});

/* ==========================================================
   MARCADORES Y MENSAJES
   ========================================================== */

function actualizarMarcadores() {
  obtenerElemento("score").textContent = puntuacion;

  obtenerElemento("time").textContent =
    Math.ceil(tiempoRestante) + " s";

  obtenerElemento("lives").textContent =
    "♥ ".repeat(vidas) + "♡ ".repeat(3 - vidas);
}

function mostrarMensaje(titulo, descripcion, textoBoton) {
  obtenerElemento("overlay").classList.remove("hidden");

  obtenerElemento("message").textContent = titulo;
  obtenerElemento("description").textContent = descripcion;
  obtenerElemento("start").textContent = textoBoton;
}

function ocultarMensaje() {
  obtenerElemento("overlay").classList.add("hidden");
}

/* ==========================================================
   INICIO, PAUSA Y FINAL
   ========================================================== */

function iniciarPartida() {
  /* El mismo botón permite continuar una partida pausada. */
  if (enPausa) {
    enPausa = false;

    obtenerElemento("pause").textContent = "Ⅱ";
    ocultarMensaje();

    return;
  }

  puntuacion = 0;
  vidas = 3;
  tiempoRestante = CONFIG.duracion;

  posicionJugador = lienzo.width / 2;

  objetos = [];
  particulas = [];

  tiempoHastaNuevoObjeto = 0;
  tiempoDeProteccion = 0;

  teclasPresionadas.clear();

  partidaActiva = true;

  actualizarMarcadores();
  ocultarMensaje();
}

function alternarPausa() {
  if (!partidaActiva) {
    return;
  }

  enPausa = !enPausa;
  teclasPresionadas.clear();

  obtenerElemento("pause").textContent =
    enPausa ? "▶" : "Ⅱ";

  if (enPausa) {
    mostrarMensaje(
      "Misión en pausa",
      "Toma un respiro. Tu misión continúa cuando estés listo.",
      "Continuar →"
    );
  } else {
    ocultarMensaje();
  }
}

function terminarPartida() {
  partidaActiva = false;
  enPausa = false;

  teclasPresionadas.clear();

  obtenerElemento("pause").textContent = "Ⅱ";

  obtenerElemento("symbol").textContent =
    vidas > 0 ? "🏆" : "🌌";

  const titulo = vidas > 0
    ? "¡Misión completada!"
    : "¡Volvamos a intentarlo!";

  mostrarMensaje(
    titulo,
    `Conseguiste ${puntuacion} puntos. ` +
      "Cambia una variable y descubre si puedes mejorar.",
    "Volver a jugar →"
  );
}

obtenerElemento("start").addEventListener(
  "click",
  iniciarPartida
);

obtenerElemento("pause").addEventListener(
  "click",
  alternarPausa
);

/* ==========================================================
   CONTROLES DEL TECLADO
   ========================================================== */

window.addEventListener("keydown", (evento) => {
  const elementoActivo = document.activeElement.tagName;

  /* No interrumpir la edición de los controles del panel. */
  if (
    elementoActivo === "INPUT" ||
    elementoActivo === "SELECT"
  ) {
    return;
  }

  /* La barra espaciadora conserva su función en los botones. */
  if (
    evento.key === " " &&
    elementoActivo === "BUTTON"
  ) {
    return;
  }

  const tecla = evento.key.toLowerCase();

  const teclasPermitidas = [
    "arrowleft",
    "arrowright",
    "a",
    "d",
    " "
  ];

  if (!teclasPermitidas.includes(tecla)) {
    return;
  }

  evento.preventDefault();

  if (tecla === " ") {
    if (!evento.repeat) {
      alternarPausa();
    }

    return;
  }

  teclasPresionadas.add(tecla);
});

window.addEventListener("keyup", (evento) => {
  teclasPresionadas.delete(
    evento.key.toLowerCase()
  );
});

/* Pausar cuando el usuario cambia de ventana. */
window.addEventListener("blur", () => {
  teclasPresionadas.clear();

  if (partidaActiva && !enPausa) {
    alternarPausa();
  }
});

/* ==========================================================
   BOTONES DE DIRECCIÓN
   ========================================================== */

const botonesDeMovimiento = [
  ["left", "arrowleft"],
  ["right", "arrowright"]
];

botonesDeMovimiento.forEach(([id, tecla]) => {
  const boton = obtenerElemento(id);

  boton.addEventListener("pointerdown", (evento) => {
    evento.preventDefault();

    boton.setPointerCapture(evento.pointerId);
    teclasPresionadas.add(tecla);
  });

  function soltarBoton() {
    teclasPresionadas.delete(tecla);
  }

  boton.addEventListener("pointerup", soltarBoton);
  boton.addEventListener("pointercancel", soltarBoton);
  boton.addEventListener("lostpointercapture", soltarBoton);
});

/* ==========================================================
   CONTROLES SOBRE EL LIENZO
   ========================================================== */

function actualizarPosicionDelJugador(evento) {
  if (!partidaActiva || enPausa) {
    return;
  }

  const rectangulo = lienzo.getBoundingClientRect();

  const posicionEnLienzo =
    (evento.clientX - rectangulo.left) *
    lienzo.width /
    rectangulo.width;

  posicionJugador = Math.max(
    25,
    Math.min(lienzo.width - 25, posicionEnLienzo)
  );
}

lienzo.addEventListener("pointerdown", (evento) => {
  lienzo.setPointerCapture(evento.pointerId);
  actualizarPosicionDelJugador(evento);
});

lienzo.addEventListener("pointermove", (evento) => {
  if (lienzo.hasPointerCapture(evento.pointerId)) {
    actualizarPosicionDelJugador(evento);
  }
});

/* ==========================================================
   DIBUJOS DEL JUEGO
   ========================================================== */

function dibujarPoligono(
  puntos,
  colorRelleno,
  colorBorde = "#ffffff"
) {
  contexto.beginPath();

  puntos.forEach(([x, y], indice) => {
    if (indice === 0) {
      contexto.moveTo(x, y);
    } else {
      contexto.lineTo(x, y);
    }
  });

  contexto.closePath();

  contexto.fillStyle = colorRelleno;
  contexto.fill();

  contexto.strokeStyle = colorBorde;
  contexto.lineWidth = 2;
  contexto.stroke();
}

function dibujarEstrella(x, y) {
  contexto.save();
  contexto.translate(x, y);

  contexto.shadowColor = "#ffce32";
  contexto.shadowBlur = 20;

  const puntos = Array.from(
    { length: 10 },
    (_, indice) => {
      const angulo =
        -Math.PI / 2 + indice * Math.PI / 5;

      const radio = indice % 2 === 0 ? 23 : 10;

      return [
        Math.cos(angulo) * radio,
        Math.sin(angulo) * radio
      ];
    }
  );

  dibujarPoligono(
    puntos,
    "#ffdc38",
    "#fff4b3"
  );

  contexto.shadowBlur = 0;
  contexto.fillStyle = "#fffbe5";

  contexto.beginPath();
  contexto.arc(-4, -6, 3, 0, Math.PI * 2);
  contexto.fill();

  contexto.restore();
}

function dibujarNave() {
  /* Fuego de la nave. */
  dibujarPoligono(
    [[-10, 22], [0, 39], [10, 22]],
    "#ffbf37",
    "#ffed8d"
  );

  /* Aletas. */
  dibujarPoligono(
    [[-12, 2], [-26, 24], [-9, 20]],
    "#ff577e"
  );

  dibujarPoligono(
    [[12, 2], [26, 24], [9, 20]],
    "#ff577e"
  );

  /* Cuerpo principal. */
  dibujarPoligono(
    [
      [0, -30],
      [-13, -7],
      [-12, 23],
      [12, 23],
      [13, -7]
    ],
    "#63e0ff"
  );

  /* Punta. */
  dibujarPoligono(
    [[0, -30], [-9, -14], [9, -14]],
    "#ff577e"
  );

  /* Ventana. */
  contexto.fillStyle = "#163171";

  contexto.beginPath();
  contexto.arc(0, 0, 7, 0, Math.PI * 2);
  contexto.fill();

  contexto.strokeStyle = "#ffffff";
  contexto.stroke();
}

function dibujarPlatillo() {
  /* Cúpula. */
  contexto.fillStyle = "#6af0d2";

  contexto.beginPath();
  contexto.ellipse(
    0, -5, 17, 17, 0, Math.PI, 0
  );
  contexto.fill();

  contexto.strokeStyle = "#ffffff";
  contexto.stroke();

  /* Base. */
  contexto.fillStyle = "#b69bff";

  contexto.beginPath();
  contexto.ellipse(
    0, 8, 31, 12, 0, 0, Math.PI * 2
  );
  contexto.fill();
  contexto.stroke();

  /* Luces. */
  for (let x = -18; x <= 18; x += 12) {
    contexto.fillStyle = "#ffe054";

    contexto.beginPath();
    contexto.arc(x, 9, 3, 0, Math.PI * 2);
    contexto.fill();
  }
}

function dibujarRobot() {
  /* Cabeza. */
  contexto.fillStyle = "#5fe1f3";
  contexto.fillRect(-22, -19, 44, 40);

  contexto.strokeStyle = "#ffffff";
  contexto.strokeRect(-22, -19, 44, 40);

  /* Pantalla. */
  contexto.fillStyle = "#23376d";
  contexto.fillRect(-16, -11, 32, 16);

  /* Ojos. */
  contexto.fillStyle = "#ffe054";
  contexto.fillRect(-12, -7, 6, 7);
  contexto.fillRect(6, -7, 6, 7);

  /* Boca, brazos, piernas y antena. */
  contexto.fillStyle = "#ff678b";

  contexto.fillRect(-9, 12, 18, 4);
  contexto.fillRect(-31, -7, 7, 21);
  contexto.fillRect(24, -7, 7, 21);
  contexto.fillRect(-15, 24, 10, 7);
  contexto.fillRect(5, 24, 10, 7);
  contexto.fillRect(-2, -29, 4, 10);
}

function dibujarPersonaje(x, y) {
  contexto.save();
  contexto.translate(x, y);

  contexto.shadowColor = "#39d5ff";
  contexto.shadowBlur = 18;

  if (CONFIG.personaje === "🚀") {
    dibujarNave();
  } else if (CONFIG.personaje === "🛸") {
    dibujarPlatillo();
  } else {
    dibujarRobot();
  }

  contexto.restore();
}

function dibujarMeteorito(x, y) {
  contexto.save();
  contexto.translate(x, y);

  contexto.shadowColor = "#ff6d5e";
  contexto.shadowBlur = 15;

  dibujarPoligono(
    [
      [-11, -13],
      [7, -19],
      [21, -5],
      [17, 13],
      [0, 20],
      [-20, 7]
    ],
    "#ff795b",
    "#ffd8ad"
  );

  contexto.shadowBlur = 0;
  contexto.fillStyle = "#a53838";

  const crateres = [
    [-5, -4, 5],
    [8, 7, 4],
    [-8, 10, 3]
  ];

  crateres.forEach(([xCrater, yCrater, radio]) => {
    contexto.beginPath();

    contexto.arc(
      xCrater,
      yCrater,
      radio,
      0,
      Math.PI * 2
    );

    contexto.fill();
  });

  contexto.restore();
}

function dibujarFondo() {
  contexto.fillStyle = CONFIG.fondo;

  contexto.fillRect(
    0,
    0,
    lienzo.width,
    lienzo.height
  );

  estrellasDelFondo.forEach((estrella) => {
    contexto.globalAlpha =
      0.35 + estrella.radio / 3;

    contexto.fillStyle = "#dce6ff";

    contexto.beginPath();

    contexto.arc(
      estrella.x,
      estrella.y,
      estrella.radio,
      0,
      Math.PI * 2
    );

    contexto.fill();
  });

  contexto.globalAlpha = 1;
  contexto.strokeStyle = "#ffffff0c";

  for (let x = 0; x < lienzo.width; x += 50) {
    contexto.beginPath();
    contexto.moveTo(x, 0);
    contexto.lineTo(x, lienzo.height);
    contexto.stroke();
  }

  contexto.fillStyle = "#ffffff04";

  contexto.beginPath();
  contexto.arc(690, 75, 115, 0, Math.PI * 2);
  contexto.fill();
}

/* ==========================================================
   REGLAS DE DIFICULTAD
   ========================================================== */

function obtenerDificultad() {
  const niveles = {
    easy: {
      intervalo: 0.75,
      velocidad: 100,
      probabilidadMeteorito: 0.18
    },

    normal: {
      intervalo: 0.55,
      velocidad: 150,
      probabilidadMeteorito: 0.30
    },

    hard: {
      intervalo: 0.35,
      velocidad: 220,
      probabilidadMeteorito: 0.43
    }
  };

  return niveles[CONFIG.dificultad];
}

/* ==========================================================
   MOVIMIENTO Y CREACIÓN DE OBJETOS
   ========================================================== */

function moverJugador(deltaTiempo) {
  let direccion = 0;

  if (
    teclasPresionadas.has("arrowright") ||
    teclasPresionadas.has("d")
  ) {
    direccion += 1;
  }

  if (
    teclasPresionadas.has("arrowleft") ||
    teclasPresionadas.has("a")
  ) {
    direccion -= 1;
  }

  posicionJugador +=
    direccion * CONFIG.velocidad * 65 * deltaTiempo;

  posicionJugador = Math.max(
    25,
    Math.min(lienzo.width - 25, posicionJugador)
  );
}

function crearObjetos(deltaTiempo) {
  const dificultad = obtenerDificultad();

  tiempoHastaNuevoObjeto -= deltaTiempo;

  if (tiempoHastaNuevoObjeto > 0) {
    return;
  }

  objetos.push({
    x: 30 + Math.random() * 700,
    y: -25,

    esMeteorito:
      Math.random() < dificultad.probabilidadMeteorito,

    velocidad:
      dificultad.velocidad *
      (0.8 + Math.random() * 0.6)
  });

  tiempoHastaNuevoObjeto = dificultad.intervalo;
}

function crearParticulas(objeto) {
  for (let indice = 0; indice < 10; indice++) {
    particulas.push({
      x: objeto.x,
      y: objeto.y,

      velocidadX: (Math.random() - 0.5) * 180,
      velocidadY: (Math.random() - 0.5) * 180,

      vida: 0.5,

      color: objeto.esMeteorito
        ? "#ff8d9c"
        : "#ffe198"
    });
  }
}

/* ==========================================================
   COLISIONES Y PUNTUACIÓN
   ========================================================== */

function actualizarObjetos(deltaTiempo) {
  for (
    let indice = objetos.length - 1;
    indice >= 0;
    indice--
  ) {
    const objeto = objetos[indice];

    objeto.y += objeto.velocidad * deltaTiempo;

    const tocaJugador =
      Math.abs(objeto.x - posicionJugador) < 32 &&
      Math.abs(objeto.y - 385) < 30;

    if (tocaJugador) {
      if (
        objeto.esMeteorito &&
        tiempoDeProteccion > 0
      ) {
        objetos.splice(indice, 1);
        continue;
      }

      if (objeto.esMeteorito) {
        vidas -= 1;
        tiempoDeProteccion = 1.2;
      } else {
        /* CAMBIA AQUÍ si quieres otro puntaje por estrella. */
        puntuacion += 10;
      }

      crearParticulas(objeto);
      objetos.splice(indice, 1);
    } else if (objeto.y > lienzo.height + 30) {
      objetos.splice(indice, 1);
    }
  }
}

function actualizarParticulas(deltaTiempo) {
  for (
    let indice = particulas.length - 1;
    indice >= 0;
    indice--
  ) {
    const particula = particulas[indice];

    particula.vida -= deltaTiempo;

    particula.x +=
      particula.velocidadX * deltaTiempo;

    particula.y +=
      particula.velocidadY * deltaTiempo;

    if (particula.vida <= 0) {
      particulas.splice(indice, 1);
    }
  }
}

/* ==========================================================
   DIBUJO DE OBJETOS Y PARTÍCULAS
   ========================================================== */

function dibujarObjetos() {
  objetos.forEach((objeto) => {
    if (objeto.esMeteorito) {
      dibujarMeteorito(objeto.x, objeto.y);
    } else {
      dibujarEstrella(objeto.x, objeto.y);
    }
  });
}

function dibujarParticulas() {
  particulas.forEach((particula) => {
    contexto.globalAlpha = particula.vida * 2;
    contexto.fillStyle = particula.color;

    contexto.fillRect(
      particula.x,
      particula.y,
      4,
      4
    );
  });

  contexto.globalAlpha = 1;
}

function dibujarJugador(tiempoActual) {
  /* Sombra debajo del personaje. */
  contexto.fillStyle = "#b49aff22";

  contexto.beginPath();

  contexto.ellipse(
    posicionJugador,
    418,
    32,
    6,
    0,
    0,
    Math.PI * 2
  );

  contexto.fill();

  /* Parpadeo temporal después de recibir daño. */
  const debeMostrarse =
    tiempoDeProteccion <= 0 ||
    Math.floor(tiempoActual / 90) % 2 === 0;

  if (debeMostrarse) {
    dibujarPersonaje(posicionJugador, 385);
  }
}

/* ==========================================================
   BUCLE PRINCIPAL DEL VIDEOJUEGO
   ========================================================== */

function dibujarFotograma(tiempoActual) {
  const deltaTiempo = Math.min(
    (tiempoActual - tiempoAnterior) / 1000,
    0.04
  );

  tiempoAnterior = tiempoActual;

  if (partidaActiva && !enPausa) {
    tiempoRestante = Math.max(
      0,
      tiempoRestante - deltaTiempo
    );

    tiempoDeProteccion = Math.max(
      0,
      tiempoDeProteccion - deltaTiempo
    );

    moverJugador(deltaTiempo);
    crearObjetos(deltaTiempo);
    actualizarObjetos(deltaTiempo);
    actualizarParticulas(deltaTiempo);

    actualizarMarcadores();

    if (vidas <= 0 || tiempoRestante <= 0) {
      terminarPartida();
    }
  }

  dibujarFondo();
  dibujarObjetos();
  dibujarParticulas();
  dibujarJugador(tiempoActual);

  requestAnimationFrame(dibujarFotograma);
}

/* ==========================================================
   PREPARACIÓN INICIAL
   ========================================================== */

actualizarCodigoVisible();
actualizarMarcadores();

obtenerElemento("description").textContent =
  "Atrapa estrellas, esquiva meteoritos y consigue " +
  `todos los puntos que puedas en ${CONFIG.duracion} segundos.`;

requestAnimationFrame(dibujarFotograma);