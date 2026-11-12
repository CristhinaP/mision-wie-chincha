
/* ==========================================
   MISIÓN WIE CHINCHA
   JUEGO 2: MISIÓN MATEMÁTICA
   LÓGICA DEL VIDEOJUEGO
========================================== */


/* ==========================================
   1. CONFIGURACIÓN INICIAL
========================================== */

const CONFIG = {

    maximo: 20,
    operacion: "mix",
    retos: 8,
    puntos: 10,
    color: "#263658"

};


/* ==========================================
   2. VARIABLES DEL JUEGO
========================================== */

const $ = id => document.getElementById(id);

let round = 1;
let points = 0;
let answer = 0;
let locked = false;
let done = false;


/* ==========================================
   3. GENERAR NÚMEROS ALEATORIOS
========================================== */

const rand = (a, b) => {

    return Math.floor(
        Math.random() * (b - a + 1)
    ) + a;

};


/* ==========================================
   4. MOSTRAR CONFIGURACIÓN
========================================== */

function showCode() {

    $("code").textContent = `
 // CAMBIA AQUÍ

 maximo = ${CONFIG.maximo};

 operacion = "${CONFIG.operacion}";

 retos = ${CONFIG.retos};

 puntos = ${CONFIG.puntos};
 `;

}


/* ==========================================
   5. GENERAR PREGUNTAS MATEMÁTICAS
========================================== */

function question() {

    locked = false;
    done = false;

    $("next").disabled = true;

    $("next").textContent = "Siguiente reto →";

    $("feedback").textContent = "";

    $("progress").textContent =
        `Reto ${round} / ${CONFIG.retos}`;

    $("points").textContent =
        points + " puntos";


    // Seleccionar operación

    let op = CONFIG.operacion === "mix"

        ? (Math.random() < 0.5 ? "add" : "sub")

        : CONFIG.operacion;


    // Generar números

    let a = rand(1, CONFIG.maximo);

    let b = rand(1, CONFIG.maximo);


    // Multiplicación

    if (op === "mul") {

        a = rand(1, 10);

        b = rand(1, 10);

    }


    // Evitar restas negativas

    if (op === "sub" && b > a) {

        [a, b] = [b, a];

    }


    // Calcular respuesta correcta

    answer = op === "add"

        ? a + b

        : op === "sub"

            ? a - b

            : a * b;


    // Mostrar pregunta

    const simbolo =

        op === "add" ? "+" :

        op === "sub" ? "−" : "×";


    $("question").textContent =
        `${a} ${simbolo} ${b} = ?`;


    /* ======================================
       6. CREAR CUATRO RESPUESTAS
    ====================================== */

    let values = new Set([answer]);

    while (values.size < 4) {

        values.add(

            Math.max(
                0,
                answer + rand(-10, 10)
            )

        );

    }


    // Mezclar respuestas

    const opciones = [...values];

    for (let i = opciones.length - 1; i > 0; i--) {

        const j = rand(0, i);

        [opciones[i], opciones[j]] =
            [opciones[j], opciones[i]];

    }


    // Limpiar respuestas anteriores

    $("choices").replaceChildren();


    /* ======================================
       7. CREAR BOTONES DE RESPUESTA
    ====================================== */

    for (const value of opciones) {

        let btn = document.createElement("button");

        btn.textContent = value;

        btn.style.background = CONFIG.color;


        /* ==================================
           8. VALIDAR RESPUESTA
        ================================== */

        btn.onclick = () => {

            if (locked) {
                return;
            }

            locked = true;


            // Desactivar botones

            document.querySelectorAll(
                "#choices button"
            ).forEach(b => {

                b.disabled = true;

            });


            // Respuesta correcta

            if (value === answer) {

                points += CONFIG.puntos;

                btn.style.background = "#217257";

                $("feedback").textContent =
                    "¡Correcto! Portal activado. +" +
                    CONFIG.puntos + " puntos.";

            }


            // Respuesta incorrecta

            else {

                btn.style.background = "#8e3550";

                $("feedback").textContent =
                    `Buen intento. ${a} ${simbolo} ${b} = ${answer}. ¡Vamos con el siguiente!`;

            }


            // Actualizar puntuación

            $("points").textContent =
                points + " puntos";


            // Habilitar siguiente reto

            $("next").disabled = false;


            // Último reto

            if (round === CONFIG.retos) {

                $("next").textContent =
                    "Ver resultado →";

            }

        };


        // Agregar botón a la pantalla

        $("choices").append(btn);

    }


    // Actualizar código de configuración

    showCode();

}


/* ==========================================
   9. REINICIAR EL JUEGO
========================================== */

function reset() {

    round = 1;

    points = 0;

    $("question").style.fontSize = "";

    question();

}


/* ==========================================
   10. BOTÓN SIGUIENTE RETO
========================================== */

$("next").onclick = () => {


    // Reiniciar si terminó la partida

    if (done) {

        reset();

        return;

    }


    // Mostrar resultado final

    if (round === CONFIG.retos) {

        done = true;

        $("question").textContent =
            "¡Misión cumplida!";

        $("question").style.fontSize = "44px";

        $("choices").replaceChildren();

        $("progress").textContent =
            "Partida completada";

        $("feedback").textContent =
            `Conseguiste ${points} de ${CONFIG.retos * CONFIG.puntos} puntos. Cambia las reglas y prueba otra partida.`;

        $("next").textContent =
            "Jugar otra vez →";

    }


    // Avanzar al siguiente reto

    else {

        round++;

        question();

    }

};


/* ==========================================
   11. BOTÓN REINICIAR
========================================== */

$("reset").onclick = () => {

    reset();

};


/* ==========================================
   12. CAMBIAR DIFICULTAD
========================================== */

$("level").onchange = e => {

    CONFIG.maximo = +e.target.value;

    reset();

};


/* ==========================================
   13. CAMBIAR OPERACIÓN MATEMÁTICA
========================================== */

$("operation").onchange = e => {

    CONFIG.operacion = e.target.value;

    reset();

};


/* ==========================================
   14. CAMBIAR COLOR DE LOS PORTALES
========================================== */

$("accent").oninput = e => {

    CONFIG.color = e.target.value;

    document.querySelectorAll(
        "#choices button"
    ).forEach(b => {

        b.style.background = CONFIG.color;

    });

};


/* ==========================================
   15. INICIAR VIDEOJUEGO
========================================== */

question();
