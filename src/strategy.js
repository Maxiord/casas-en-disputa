const {
    obtenerPiezas
} = require("./estado");


// Devuelve las cuatro direcciones posibles en un orden determinístico.
function movimientosValidos() {
    return ["N", "S", "O", "E"];
}


// Calcula dónde termina una pieza tras avanzar exactamente el resultado del dado.
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


// Las fichas propias también pueden usar la casilla inicial de otra ficha
// propia, porque todas se desplazan simultáneamente.
function movimientosValidosParaPieza(tablero, pieza, dado) {
    const jugador = pieza.id[0];
    return movimientosValidos().filter((direccion) => {
        const destino = calcularDestino(pieza.fila, pieza.columna, direccion, dado);
        const ocupante = tablero[destino.fila][destino.columna];
        return posicionLibre(tablero, destino.fila, destino.columna) ||
            (typeof ocupante === "string" && ocupante.startsWith(jugador));
    });
}


function conquistaCasa(tablero, pieza, direccion, dado) {
    const destino = calcularDestino(pieza.fila, pieza.columna, direccion, dado);
    return tablero[destino.fila][destino.columna] === "N";
}


function elegirMovimiento(tablero, pieza, movimientos, dado) {
    return movimientos.find((direccion) => conquistaCasa(tablero, pieza, direccion, dado)) ||
        movimientos[0];
}


// Encuentra una asignación completa de destinos únicos y maximiza las casas
// conquistadas en este turno. Así nunca propone colisiones evitables.
function decidirMovimientos(tablero, jugador, dado) {
    const piezas = obtenerPiezas(tablero, jugador);
    const opciones = piezas.map((pieza) =>
        movimientosValidosParaPieza(tablero, pieza, dado).map((direccion) => ({
            direccion,
            destino: calcularDestino(pieza.fila, pieza.columna, direccion, dado),
            conquista: conquistaCasa(tablero, pieza, direccion, dado)
        }))
    );

    if (opciones.some((movimientos) => movimientos.length === 0)) {
        return {};
    }

    let mejorPuntaje = -1;
    let mejorDecisiones = {};
    const destinosUsados = new Set();
    const decisiones = {};

    function buscar(indice, puntaje) {
        if (indice === piezas.length) {
            if (puntaje > mejorPuntaje) {
                mejorPuntaje = puntaje;
                mejorDecisiones = { ...decisiones };
            }
            return;
        }

        const pieza = piezas[indice];
        for (const opcion of opciones[indice]) {
            const claveDestino = `${opcion.destino.fila},${opcion.destino.columna}`;
            if (destinosUsados.has(claveDestino)) continue;

            destinosUsados.add(claveDestino);
            decisiones[pieza.id] = opcion.direccion;
            buscar(indice + 1, puntaje + (opcion.conquista ? 1 : 0));
            destinosUsados.delete(claveDestino);
            delete decisiones[pieza.id];
        }
    }

    buscar(0, 0);
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
