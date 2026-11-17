
const {
    obtenerPiezas
} = require("./estado");

// Devuelve las cuatro direcciones posibles.
function movimientosValidos() {
    return ["N", "S", "O", "E"];
}

// Calcula dónde termina una pieza tras avanzar el dado.
function calcularDestino(fila, columna, direccion, dado) {
    let nuevaFila = fila;
    let nuevaColumna = columna;

    for (let i = 0; i < dado; i++) {
        if (direccion === "N") nuevaFila = (nuevaFila - 1 + 10) % 10;
        if (direccion === "S") nuevaFila = (nuevaFila + 1) % 10;
        if (direccion === "O") nuevaColumna = (nuevaColumna - 1 + 10) % 10;
        if (direccion === "E") nuevaColumna = (nuevaColumna + 1) % 10;
    }

    return { fila: nuevaFila, columna: nuevaColumna };
}

// Una casilla puede ocuparse si está vacía o contiene una casa neutral.
function posicionLibre(tablero, fila, columna) {
    return tablero[fila][columna] === "" || tablero[fila][columna] === "N";
}

// Obtiene los movimientos válidos para una pieza.
function movimientosValidosParaPieza(tablero, pieza, dado) {
    const jugador = pieza.id[0];

    return movimientosValidos().filter((direccion) => {
        const destino = calcularDestino(
            pieza.fila,
            pieza.columna,
            direccion,
            dado
        );

        const ocupante = tablero[destino.fila][destino.columna];

        return posicionLibre(tablero, destino.fila, destino.columna) ||
            (typeof ocupante === "string" && ocupante.startsWith(jugador));
    });
}

// Comprueba si un movimiento conquista una casa.
function conquistaCasa(tablero, pieza, direccion, dado) {
    const destino = calcularDestino(
        pieza.fila,
        pieza.columna,
        direccion,
        dado
    );

    return tablero[destino.fila][destino.columna] === "N";
}

// Elige un movimiento que capture una casa si es posible.
function elegirMovimiento(tablero, pieza, movimientos, dado) {
    return movimientos.find((direccion) =>
        conquistaCasa(tablero, pieza, direccion, dado)
    ) || movimientos[0];
}

// Busca la mejor combinación de movimientos para todas las piezas.
function decidirMovimientos(tablero, jugador, dado) {
    const piezas = obtenerPiezas(tablero, jugador);

    // Localiza todas las casas neutrales.
    const casas = [];

    for (let f = 0; f < 10; f++) {
        for (let c = 0; c < 10; c++) {
            if (tablero[f][c] === "N") {
                casas.push({ fila: f, columna: c });
            }
        }
    }

    // Calcula las opciones y su distancia a la casa más cercana.
    const opciones = piezas.map((pieza) =>
        movimientosValidosParaPieza(tablero, pieza, dado).map((direccion) => {
            const destino = calcularDestino(
                pieza.fila,
                pieza.columna,
                direccion,
                dado
            );

            const conquista = tablero[destino.fila][destino.columna] === "N";

            const distancia = casas.length
                ? Math.min(...casas.map((casa) => {
                    const df = Math.abs(destino.fila - casa.fila);
                    const dc = Math.abs(destino.columna - casa.columna);

                    return Math.min(df, 10 - df) + Math.min(dc, 10 - dc);
                }))
                : 0;

            return { direccion, destino, conquista, distancia };
        })
    );

    if (opciones.some((movimientos) => movimientos.length === 0)) {
        return {};
    }

    let mejorPuntaje = -Infinity;
    let mejorDecisiones = {};

    const destinosUsados = new Set();
    const decisiones = {};

    // Prueba combinaciones evitando que dos piezas ocupen el mismo destino.
    function buscar(indice, capturas, distanciaTotal) {
        if (indice === piezas.length) {
            const puntaje = capturas * 100 - distanciaTotal;

            if (puntaje > mejorPuntaje) {
                mejorPuntaje = puntaje;
                mejorDecisiones = { ...decisiones };
            }

            return;
        }

        const pieza = piezas[indice];

        for (const opcion of opciones[indice]) {
            const clave = `${opcion.destino.fila},${opcion.destino.columna}`;

            if (destinosUsados.has(clave)) continue;

            destinosUsados.add(clave);
            decisiones[pieza.id] = opcion.direccion;

            buscar(
                indice + 1,
                capturas + (opcion.conquista ? 1 : 0),
                distanciaTotal + opcion.distancia
            );

            destinosUsados.delete(clave);
            delete decisiones[pieza.id];
        }
    }

    buscar(0, 0, 0);

    return mejorDecisiones;
}

module.exports = {
    movimientosValidos,
    calcularDestino,
    posicionLibre,
    movimientosValidosParaPieza,
    conquistaCasa,
    elegirMovimiento,
    decidirMovimientos
};
