const {
    obtenerPiezas
} = require("./estado");

const {
    calcularDestino,
    posicionLibre
} = require("./strategy");


// Valida todos los movimientos del turno
function validarMovimientos(tablero, jugador, decisiones, dado) {

    const piezas = obtenerPiezas(tablero, jugador);

    const destinos = [];

    // Todas las piezas deben tener un movimiento
    if (Object.keys(decisiones).length !== piezas.length) {
        return false;
    }

    for (const pieza of piezas) {

        const direccion = decisiones[pieza.id];

        // La dirección debe ser válida
        if (!["N", "S", "O", "E"].includes(direccion)) {
            return false;
        }

        const destino = calcularDestino(
            pieza.fila,
            pieza.columna,
            direccion,
            dado
        );

        // No puede terminar sobre otra pieza
        if (!posicionLibre(
            tablero,
            destino.fila,
            destino.columna
        )) {
            return false;
        }

        // Dos piezas no pueden terminar en el mismo lugar
        for (const otroDestino of destinos) {

            if (
                otroDestino.fila === destino.fila &&
                otroDestino.columna === destino.columna
            ) {
                return false;
            }
        }

        destinos.push(destino);
    }

    return true;
}


// Ejecuta todos los movimientos del turno
function ejecutarTurno(tablero, jugador, decisiones, dado) {

    const piezas = obtenerPiezas(tablero, jugador);

    const resultados = [];

    for (const pieza of piezas) {

        const direccion = decisiones[pieza.id];

        const destino = calcularDestino(
            pieza.fila,
            pieza.columna,
            direccion,
            dado
        );

        const conquistoCasa =
            tablero[destino.fila][destino.columna] === "N";

        // Quitamos la pieza de su posición anterior
        tablero[pieza.fila][pieza.columna] = "";

        // Colocamos la pieza en el destino
        tablero[destino.fila][destino.columna] = pieza.id;

        resultados.push({
            piezaId: pieza.id,
            direccion: direccion,
            fila: destino.fila,
            columna: destino.columna,
            conquistoCasa: conquistoCasa
        });
    }

    return resultados;
}


// Busca una posición libre cerca de una casa
function buscarPosicionAdyacente(tablero, fila, columna) {

    const posiciones = [
        {
            fila: (fila - 1 + 10) % 10,
            columna: columna
        },
        {
            fila: (fila + 1) % 10,
            columna: columna
        },
        {
            fila: fila,
            columna: (columna - 1 + 10) % 10
        },
        {
            fila: fila,
            columna: (columna + 1) % 10
        }
    ];

    for (const posicion of posiciones) {

        if (tablero[posicion.fila][posicion.columna] === "") {
            return posicion;
        }
    }

    return null;
}


// Crea una nueva pieza
function crearNuevaPieza(
    tablero,
    jugador,
    numeroPieza,
    fila,
    columna
) {

    const id = jugador + numeroPieza;

    if (tablero[fila][columna] === "") {

        tablero[fila][columna] = id;

        return {
            id: id,
            fila: fila,
            columna: columna
        };
    }

    const posicion = buscarPosicionAdyacente(
        tablero,
        fila,
        columna
    );

    if (posicion === null) {
        return null;
    }

    tablero[posicion.fila][posicion.columna] = id;

    return {
        id: id,
        fila: posicion.fila,
        columna: posicion.columna
    };
}


// Guarda las piezas que estarán disponibles
// al comienzo del siguiente turno
function programarNuevasPiezas(
    estado,
    jugador,
    resultados
) {

    for (const resultado of resultados) {

        if (!resultado.conquistoCasa) {
            continue;
        }

        estado.casasConquistadas[jugador]++;

        estado.piezasPendientes[jugador].push({
            fila: resultado.fila,
            columna: resultado.columna
        });
    }
}


// Coloca las piezas pendientes al comenzar el turno
function colocarPiezasPendientes(estado, jugador) {

    const pendientes = estado.piezasPendientes[jugador];

    if (pendientes.length === 0) {
        return;
    }

    let cantidadPiezas = obtenerPiezas(
        estado.tablero,
        jugador
    ).length;

    for (const pendiente of pendientes) {

        cantidadPiezas++;

        crearNuevaPieza(
            estado.tablero,
            jugador,
            cantidadPiezas,
            pendiente.fila,
            pendiente.columna
        );
    }

    estado.piezasPendientes[jugador] = [];
}


// Comprueba si terminó el juego
function comprobarFin(estado) {

    const casasConquistadas =
        estado.casasConquistadas.A +
        estado.casasConquistadas.B;

    if (casasConquistadas >= 5) {
        return true;
    }

    if (estado.turno >= 50) {
        return true;
    }

    if (estado.fallosConsecutivos.A >= 3) {
        return true;
    }

    if (estado.fallosConsecutivos.B >= 3) {
        return true;
    }

    return false;
}


// Determina el resultado final
function obtenerResultadoFinal(estado) {

    // La derrota técnica tiene prioridad
    if (estado.fallosConsecutivos.A >= 3) {
        return "B";
    }

    if (estado.fallosConsecutivos.B >= 3) {
        return "A";
    }

    if (
        estado.casasConquistadas.A >
        estado.casasConquistadas.B
    ) {
        return "A";
    }

    if (
        estado.casasConquistadas.B >
        estado.casasConquistadas.A
    ) {
        return "B";
    }

    return "EMPATE";
}


// Cambia de jugador
function cambiarJugador(estado) {

    if (estado.jugador === "A") {
        estado.jugador = "B";
    } else {
        estado.jugador = "A";
    }
}


// Registra un turno inválido
function registrarFallo(estado, jugador) {

    estado.fallosConsecutivos[jugador]++;

    cambiarJugador(estado);

    estado.turno++;
}


// Registra un turno válido
function registrarTurnoValido(estado, jugador) {

    estado.fallosConsecutivos[jugador] = 0;

    cambiarJugador(estado);

    estado.turno++;
}


// Procesa un turno completo
//
// El bot ya tomó las decisiones.
// El motor se encarga de validarlas,
// ejecutarlas y actualizar el estado.
function procesarTurno(estado, decisiones) {

    const jugador = estado.jugador;

    // Las piezas conquistadas en el turno anterior
    // de este jugador aparecen ahora.
    colocarPiezasPendientes(
        estado,
        jugador
    );

    const valido = validarMovimientos(
        estado.tablero,
        jugador,
        decisiones,
        estado.dado
    );

    // Si no hay una jugada válida
    if (!valido) {

        registrarFallo(
            estado,
            jugador
        );

        return {
            valido: false,
            termino: comprobarFin(estado)
        };
    }

    // Ejecutamos los movimientos
    const resultados = ejecutarTurno(
        estado.tablero,
        jugador,
        decisiones,
        estado.dado
    );

    // Registramos las casas conquistadas
    programarNuevasPiezas(
        estado,
        jugador,
        resultados
    );

    // El turno fue válido
    registrarTurnoValido(
        estado,
        jugador
    );

    return {
        valido: true,
        resultados: resultados,
        termino: comprobarFin(estado)
    };
}


module.exports = {
    validarMovimientos,
    ejecutarTurno,
    buscarPosicionAdyacente,
    crearNuevaPieza,
    programarNuevasPiezas,
    colocarPiezasPendientes,
    comprobarFin,
    obtenerResultadoFinal,
    cambiarJugador,
    registrarFallo,
    registrarTurnoValido,
    procesarTurno
};