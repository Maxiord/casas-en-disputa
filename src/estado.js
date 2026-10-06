// Crea un tablero vacío de 10x10
function crearTablero() {
    const tablero = [];

    for (let fila = 0; fila < 10; fila++) {
        const nuevaFila = [];

        for (let columna = 0; columna < 10; columna++) {
            nuevaFila.push("");
        }

        tablero.push(nuevaFila);
    }

    return tablero;
}

// Genera números aleatorios usando una semilla
function aleatorioConSemilla(semilla) {
    semilla = Number.isFinite(Number(semilla))
        ? ((Math.floor(Number(semilla)) % 233280) + 233280) % 233280
        : 0;

    return () => {
        semilla = (semilla * 9301 + 49297) % 233280;
        return semilla / 233280;
    };
}

// Genera las 5 casas
// Si se recibe una semilla, se utiliza para obtener
// resultados repetibles en las pruebas.
// Si no se recibe, se utiliza Math.random().
function generarCasas(tablero, semilla) {
    const aleatorio =
        semilla === undefined
            ? Math.random
            : aleatorioConSemilla(semilla);

    if (!Array.isArray(tablero) || tablero.length !== 10 ||
        tablero.some((fila) => !Array.isArray(fila) || fila.length !== 10)) {
        throw new TypeError("El tablero debe tener 10 filas y 10 columnas");
    }

    const esquinasIniciales = new Set(["0,0", "9,9"]);
    const paresSimetricos = [];

    for (let fila = 0; fila < 10; fila++) {
        for (let columna = 0; columna < 10; columna++) {
            const indice = fila * 10 + columna;
            const indiceRotado = 99 - indice;
            if (indice >= indiceRotado) continue;

            const pareja = {
                primera: { fila, columna },
                segunda: {
                    fila: 9 - fila,
                    columna: 9 - columna
                }
            };
            const claves = [
                `${pareja.primera.fila},${pareja.primera.columna}`,
                `${pareja.segunda.fila},${pareja.segunda.columna}`
            ];

            if (
                claves.every((clave) => !esquinasIniciales.has(clave)) &&
                claves.every((clave) => {
                    const [r, c] = clave.split(",").map(Number);
                    return tablero[r][c] === "";
                })
            ) {
                paresSimetricos.push(pareja);
            }
        }
    }

    if (paresSimetricos.length < 2) {
        throw new RangeError("No hay espacio para generar cinco casas equilibradas");
    }

    function tomarAleatorio(lista) {
        return Math.floor(aleatorio() * lista.length);
    }

    for (let i = 0; i < 2; i++) {
        const pareja = paresSimetricos.splice(tomarAleatorio(paresSimetricos), 1)[0];
        tablero[pareja.primera.fila][pareja.primera.columna] = "N";
        tablero[pareja.segunda.fila][pareja.segunda.columna] = "N";
    }

    function distanciaToroidal(fila, columna, destinoFila, destinoColumna) {
        const df = Math.abs(fila - destinoFila);
        const dc = Math.abs(columna - destinoColumna);
        return Math.min(df, 10 - df) + Math.min(dc, 10 - dc);
    }

    const casasEquidistantes = [];
    for (let fila = 0; fila < 10; fila++) {
        for (let columna = 0; columna < 10; columna++) {
            const clave = `${fila},${columna}`;
            if (esquinasIniciales.has(clave) || tablero[fila][columna] !== "") continue;

            const distanciaA = distanciaToroidal(fila, columna, 0, 0);
            const distanciaB = distanciaToroidal(fila, columna, 9, 9);
            if (distanciaA === distanciaB) {
                casasEquidistantes.push({ fila, columna });
            }
        }
    }

    if (casasEquidistantes.length === 0) {
        throw new RangeError("No hay una casilla equidistante para la quinta casa");
    }

    const quintaCasa = casasEquidistantes[tomarAleatorio(casasEquidistantes)];
    tablero[quintaCasa.fila][quintaCasa.columna] = "N";
}

// Tira el dado y devuelve 1, 2 o 3
function tirarDado() {
    return Math.floor(Math.random() * 3) + 1;
}

// Crea el estado inicial del juego
function crearEstadoInicial() {
    const tablero = crearTablero();

    // Posiciones iniciales
    tablero[0][0] = "A1";
    tablero[9][9] = "B1";

    // Las casas se generan aleatoriamente
    generarCasas(tablero);

    return {
        jugador: "A",
        dado: tirarDado(),

        // Cantidad de turnos realizados
        turno: 0,

        casasConquistadas: {
            A: 0,
            B: 0
        },

        fallosConsecutivos: {
            A: 0,
            B: 0
        },

        piezasPendientes: {
            A: [],
            B: []
        },

        tablero: tablero
    };
}

// Busca las piezas de un jugador
function obtenerPiezas(tablero, jugador) {
    const piezas = [];

    for (let fila = 0; fila < 10; fila++) {
        for (let columna = 0; columna < 10; columna++) {
            const celda = tablero[fila][columna];

            if (
                typeof celda === "string" &&
                celda.startsWith(jugador)
            ) {
                piezas.push({
                    id: celda,
                    fila: fila,
                    columna: columna
                });
            }
        }
    }

    return piezas;
}

module.exports = {
    crearTablero,
    aleatorioConSemilla,
    generarCasas,
    tirarDado,
    crearEstadoInicial,
    obtenerPiezas
};
