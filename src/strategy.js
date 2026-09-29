const {
    obtenerPiezas
} = require("./estado");


// Devuelve las cuatro direcciones posibles
function movimientosValidos() {

    return ["N", "S", "O", "E"];
}


// Calcula dónde termina una pieza
function calcularDestino(fila, columna, direccion, dado) {

    let nuevaFila = fila;
    let nuevaColumna = columna;

    for (let i = 0; i < dado; i++) {

        if (direccion === "N") {
            nuevaFila = (nuevaFila - 1 + 10) % 10;
        }

        if (direccion === "S") {
            nuevaFila = (nuevaFila + 1) % 10;
        }

        if (direccion === "O") {
            nuevaColumna = (nuevaColumna - 1 + 10) % 10;
        }

        if (direccion === "E") {
            nuevaColumna = (nuevaColumna + 1) % 10;
        }
    }

    return {
        fila: nuevaFila,
        columna: nuevaColumna
    };
}


// Comprueba si una posición puede ser destino
function posicionLibre(tablero, fila, columna) {

    return tablero[fila][columna] === "" ||
           tablero[fila][columna] === "N";
}


// Busca los movimientos posibles para una pieza
function movimientosValidosParaPieza(tablero, pieza, dado) {

    const movimientos = movimientosValidos();

    const movimientosDisponibles = [];

    for (const direccion of movimientos) {

        const destino = calcularDestino(
            pieza.fila,
            pieza.columna,
            direccion,
            dado
        );

        if (posicionLibre(
            tablero,
            destino.fila,
            destino.columna
        )) {

            movimientosDisponibles.push(direccion);
        }
    }

    return movimientosDisponibles;
}


// Comprueba si un movimiento conquista una casa
function conquistaCasa(
    tablero,
    pieza,
    direccion,
    dado
) {

    const destino = calcularDestino(
        pieza.fila,
        pieza.columna,
        direccion,
        dado
    );

    return tablero[destino.fila][destino.columna] === "N";
}


// Elige un movimiento disponible
//
// Primero intenta conquistar una casa.
// Si no puede, elige el primer movimiento válido.
function elegirMovimiento(
    tablero,
    pieza,
    movimientos,
    dado
) {

    for (const direccion of movimientos) {

        if (
            conquistaCasa(
                tablero,
                pieza,
                direccion,
                dado
            )
        ) {
            return direccion;
        }
    }

    return movimientos[0];
}


// Decide el movimiento de todas las piezas
function decidirMovimientos(tablero, jugador, dado) {

    const piezas = obtenerPiezas(
        tablero,
        jugador
    );

    const decisiones = {};

    for (const pieza of piezas) {

        const movimientos =
            movimientosValidosParaPieza(
                tablero,
                pieza,
                dado
            );

        if (movimientos.length > 0) {

            decisiones[pieza.id] =
                elegirMovimiento(
                    tablero,
                    pieza,
                    movimientos,
                    dado
                );
        }
    }

    return decisiones;
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