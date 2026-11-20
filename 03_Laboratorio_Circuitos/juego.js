
/* ==========================================
   MISIÓN WIE CHINCHA
   JUEGO 3: LABORATORIO DE CIRCUITOS
   LÓGICA JAVASCRIPT
========================================== */


/* ==========================================
   1. CONFIGURACIÓN INICIAL
========================================== */

const CONFIG = {
    color: "#ffdc38",
    puntos: 10
};


/* ==========================================
   2. EXPERIMENTOS PROGRAMADOS
========================================== */

const MISIONES = [

    {
        tipo: "serie",
        a: false,
        b: false
    },

    {
        tipo: "serie",
        a: true,
        b: false
    },

    {
        tipo: "serie",
        a: true,
        b: true
    },

    {
        tipo: "paralelo",
        a: false,
        b: false
    },

    {
        tipo: "paralelo",
        a: true,
        b: false
    },

    {
        tipo: "paralelo",
        a: false,
        b: true
    }

];


/* ==========================================
   3. VARIABLES DEL VIDEOJUEGO
========================================== */

const $ = id => document.getElementById(id);

let i = 0;
let points = 0;

let a = false;
let b = false;

let tipo = "serie";

let prediction = null;
let tested = false;

let free = false;
let finished = false;


/* ==========================================
   4. FUNCIONAMIENTO DEL CIRCUITO
========================================== */

function on() {

    if (tipo === "serie") {

        // En serie ambos interruptores
        // deben estar cerrados.

        return a && b;

    } else {

        // En paralelo basta con que
        // uno de los interruptores
        // esté cerrado.

        return a || b;

    }

}


/* ==========================================
   5. DIBUJAR Y ACTUALIZAR CIRCUITO
========================================== */

function render() {

    // La bombilla se enciende si
    // el experimento fue probado
    // y existe un camino cerrado.

    const powered = tested && on();


    /* ======================================
       5.1 DIBUJAR CABLES
    ====================================== */

    $("wire").setAttribute(

        "d",

        tipo === "serie"

            ? "M210 70 H310 M380 70 H500"

            : "M140 70 V200 H160 M230 70 H440 V200 H500 V70 M140 200 H160 M230 200 H440"

    );


    /* ======================================
       5.2 INTERRUPTOR A
    ====================================== */

    $("sa").setAttribute(

        "d",

        a
            ? "M140 70 H210"
            : "M140 70 L200 42"

    );


    /* ======================================
       5.3 INTERRUPTOR B
    ====================================== */

    $("sb").setAttribute(

        "d",

        tipo === "serie"

            ? (
                b
                    ? "M310 70 H380"
                    : "M310 70 L370 42"
            )

            : (
                b
                    ? "M160 200 H230"
                    : "M160 200 L220 172"
            )

    );


    /* ======================================
       5.4 CONEXIÓN EN PARALELO
    ====================================== */

    if (tipo === "paralelo") {

        $("sa").setAttribute(

            "d",

            a
                ? "M160 70 H230"
                : "M160 70 L220 42"

        );

    }


    /* ======================================
       5.5 POSICIÓN DE ETIQUETAS
    ====================================== */

    $("labelA").setAttribute(

        "x",

        tipo === "serie" ? 160 : 180

    );

    $("labelB").setAttribute(

        "x",

        tipo === "serie" ? 330 : 180

    );

    $("labelB").setAttribute(

        "y",

        tipo === "serie" ? 40 : 240

    );


    /* ======================================
       5.6 ENCENDER O APAGAR BOMBILLA
    ====================================== */

    $("bulb").setAttribute(

        "fill",

        powered
            ? CONFIG.color
            : "#273653"

    );


    /* ======================================
       5.7 EFECTO DE LUZ
    ====================================== */

    $("glow").setAttribute(

        "fill",

        CONFIG.color

    );

    $("glow").setAttribute(

        "opacity",

        powered ? ".24" : "0"

    );


    /* ======================================
       5.8 ACTUALIZAR INTERRUPTORES
    ====================================== */

    $("a").textContent =
        "A: " + (a ? "cerrado" : "abierto");

    $("b").textContent =
        "B: " + (b ? "cerrado" : "abierto");


    // En misiones guiadas los interruptores
    // no se pueden modificar.

    $("a").disabled = !free;
    $("b").disabled = !free;


    // Mostrar interruptores activos.

    $("a").classList.toggle("active", a);

    $("b").classList.toggle("active", b);


    /* ======================================
       5.9 ACTUALIZAR PUNTUACIÓN
    ====================================== */

    $("points").textContent =
        points + " puntos";


    /* ======================================
       5.10 MOSTRAR CONFIGURACIÓN
    ====================================== */

    $("code").textContent = `
// CAMBIA AQUÍ

conexion = "${tipo}";

interruptorA = ${a};

interruptorB = ${b};

color = "${CONFIG.color}";
`;

}


/* ==========================================
   6. LIMPIAR EXPERIMENTO
========================================== */

function clear() {

    prediction = null;

    tested = false;

    $("feedback").textContent = "";

    $("test").disabled = true;

    $("yes").disabled = false;

    $("no").disabled = false;

    $("yes").classList.remove("active");

    $("no").classList.remove("active");

    $("next").disabled = true;

    render();

}


/* ==========================================
   7. CARGAR EXPERIMENTO
========================================== */

function load() {

    finished = false;


    // Cargar una misión guiada.

    if (!free) {

        ({
            a,
            b,
            tipo
        } = MISIONES[i]);

        $("type").value = tipo;

    }


    /* ======================================
       7.1 MOSTRAR PROGRESO
    ====================================== */

    $("progress").textContent = free

        ? "Exploración libre"

        : `Experimento ${i + 1} / ${MISIONES.length}`;


    /* ======================================
       7.2 MOSTRAR PREGUNTA
    ====================================== */

    $("task").textContent = free

        ? "Construye tu hipótesis"

        : "¿Se encenderá la bombilla?";


    /* ======================================
       7.3 MOSTRAR DESCRIPCIÓN
    ====================================== */

    $("setup").textContent =

        `Conexión en ${tipo}. ` +

        (
            free

                ? "Abre y cierra los interruptores para investigar."

                : "Los interruptores están preparados: observa sus posiciones."
        );


    /* ======================================
       7.4 CONFIGURAR BOTÓN SIGUIENTE
    ====================================== */

    $("next").textContent =
        "Siguiente experimento →";

    $("next").hidden = free;


    clear();

}


/* ==========================================
   8. SELECCIONAR HIPÓTESIS
========================================== */

function choose(value) {

    if (tested) {
        return;
    }

    prediction = value;


    // Marcar la respuesta elegida.

    $("yes").classList.toggle(
        "active",
        value
    );

    $("no").classList.toggle(
        "active",
        !value
    );


    // Habilitar la prueba.

    $("test").disabled = false;

}


/* ==========================================
   9. BOTONES DE PREDICCIÓN
========================================== */

$("yes").onclick = () => {

    choose(true);

};

$("no").onclick = () => {

    choose(false);

};


/* ==========================================
   10. PROBAR EL CIRCUITO
========================================== */

$("test").onclick = () => {

    if (tested || prediction === null) {
        return;
    }


    // Registrar que se realizó la prueba.

    tested = true;


    // Comprobar si la hipótesis
    // coincide con el circuito.

    let right = prediction === on();


    /* ======================================
       10.1 SUMAR PUNTOS
    ====================================== */

    if (right && !free) {

        points += CONFIG.puntos;

    }


    /* ======================================
       10.2 MOSTRAR RESULTADO
    ====================================== */

    $("feedback").textContent =

        (
            right

                ? "¡Tu hipótesis fue correcta! "

                : "Tu hipótesis cambió con el experimento. "
        )

        +

        (
            on()

                ? "La bombilla se enciende: existe un camino cerrado."

                : "La bombilla queda apagada: no existe un camino cerrado."
        )

        +

        (
            tipo === "serie"

                ? " En serie deben cerrarse los dos interruptores."

                : " En paralelo basta un camino cerrado."
        );


    /* ======================================
       10.3 BLOQUEAR RESPUESTAS
    ====================================== */

    $("test").disabled = true;

    $("yes").disabled = true;

    $("no").disabled = true;


    // Habilitar siguiente experimento.

    $("next").disabled = false;


    // Actualizar circuito.

    render();

};


/* ==========================================
   11. SIGUIENTE EXPERIMENTO
========================================== */

$("next").onclick = () => {


    /* ======================================
       11.1 REINICIAR MISIONES
    ====================================== */

    if (finished) {

        i = 0;

        points = 0;

        load();

        return;

    }


    /* ======================================
       11.2 FINALIZAR INVESTIGACIÓN
    ====================================== */

    if (i === MISIONES.length - 1) {

        finished = true;

        $("task").textContent =
            "¡Investigación completada!";

        $("progress").textContent =
            "6 experimentos completados";

        $("feedback").textContent =

            `Conseguiste ${points} de ` +

            `${MISIONES.length * CONFIG.puntos} puntos. ` +

            "Ahora prueba el laboratorio libre " +

            "y explica la diferencia entre serie y paralelo.";


        $("next").textContent =
            "Repetir misiones →";

    }


    /* ======================================
       11.3 AVANZAR AL SIGUIENTE RETO
    ====================================== */

    else {

        i++;

        load();

    }

};


/* ==========================================
   12. INTERRUPTOR A
========================================== */

$("a").onclick = () => {

    a = !a;

    clear();

};


/* ==========================================
   13. INTERRUPTOR B
========================================== */

$("b").onclick = () => {

    b = !b;

    clear();

};


/* ==========================================
   14. CAMBIAR MODO DE TRABAJO
========================================== */

$("mode").onchange = e => {

    free = e.target.value === "free";


    // Solo permitir modificar conexión
    // cuando se trabaja en modo libre.

    $("type").disabled = !free;


    // Reiniciar progreso.

    i = 0;

    points = 0;


    // Cargar el modo seleccionado.

    load();

};


/* ==========================================
   15. CAMBIAR TIPO DE CONEXIÓN
========================================== */

$("type").onchange = e => {

    tipo = e.target.value;

    load();

};


/* ==========================================
   16. CAMBIAR COLOR DE LA LUZ
========================================== */

$("light").oninput = e => {

    CONFIG.color = e.target.value;

    render();

};


/* ==========================================
   17. INICIAR EL VIDEOJUEGO
========================================== */

load();
