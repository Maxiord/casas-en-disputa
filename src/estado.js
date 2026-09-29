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

    return () => {

        semilla = (semilla * 9301 + 49297) % 233280;

        return semilla / 233280;
    };
}


// Genera las 5 casas
function generarCasas(tablero, semilla = 10) {

    const aleatorio = aleatorioConSemilla(semilla);

    let casas = 0;

    while (casas < 5) {

        const fila = Math.floor(aleatorio() * 10);
        const columna = Math.floor(aleatorio() * 10);

        if (tablero[fila][columna] === "") {

            tablero[fila][columna] = "N";

            casas++;
        }
    }
}


// Tira el dado y devuelve 1, 2 o 3
function tirarDado() {

    return Math.floor(Math.random() * 3) + 1;
}


// Crea el estado inicial del juego
function crearEstadoInicial() {

    const tablero = crearTablero();

    tablero[0][0] = "A1";
    tablero[9][9] = "B1";

    generarCasas(tablero);

    return {
        jugador: "A",

        dado: tirarDado(),

        turno: 1,

        casasConquistadas: {
            A: 0,
            B: 0
        },

        fallosConsecutivos: {
            A: 0,
            B: 0
        },

        // Casas conquistadas que generan una pieza
        // disponible para el siguiente turno
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