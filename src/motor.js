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
    const idsPiezas = new Set(piezas.map((pieza) => pieza.id));

    if (
        !decisiones ||
        typeof decisiones !== "object" ||
        Array.isArray(decisiones) ||
        ![1, 2, 3].includes(dado)
    ) {
        return false;
    }

    const destinos = [];

    // Todas las piezas deben tener un movimiento
    const idsDecididos = Object.keys(decisiones);
    if (
        idsDecididos.length !== piezas.length ||
        idsDecididos.some((id) => !idsPiezas.has(id))
    ) {
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

        const esOrigenPropio = piezas.some((otraPieza) =>
            otraPieza.fila === destino.fila &&
            otraPieza.columna === destino.columna
        );

        // Una ficha propia puede dejar libre su origen durante esta jugada
        // simultánea; las fichas rivales siguen bloqueando el destino.
        if (!posicionLibre(tablero, destino.fila, destino.columna) && !esOrigenPropio) {
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

    const resultados = piezas.map((pieza) => {

        const direccion = decisiones[pieza.id];

        const destino = calcularDestino(
            pieza.fila,
            pieza.columna,
            direccion,
            dado
        );

        const conquistoCasa =
            tablero[destino.fila][destino.columna] === "N";

        return {
            piezaId: pieza.id,
            direccion: direccion,
            fila: destino.fila,
            columna: destino.columna,
            conquistoCasa: conquistoCasa
        };
    });

    // Se levantan todas primero para permitir intercambios simultáneos.
    for (const pieza of piezas) {
        tablero[pieza.fila][pieza.columna] = "";
    }

    for (const resultado of resultados) {
        tablero[resultado.fila][resultado.columna] = resultado.piezaId;
    }

    return resultados;
}


// Busca la casilla libre más cercana a la casa con desempate N, E, S, O.
function buscarPosicionAdyacente(tablero, fila, columna) {
    const cola = [{ fila, columna }];
    const visitadas = new Set([`${fila},${columna}`]);

    // El mismo orden determinístico del árbitro: N, E, S, O.
    const desplazamientos = [
        { fila: -1, columna: 0 },
        { fila: 0, columna: 1 },
        { fila: 1, columna: 0 },
        { fila: 0, columna: -1 }
    ];

    while (cola.length > 0) {
        const actual = cola.shift();

        for (const desplazamiento of desplazamientos) {
            const siguiente = {
                fila: (actual.fila + desplazamiento.fila + 10) % 10,
                columna: (actual.columna + desplazamiento.columna + 10) % 10
            };
            const clave = `${siguiente.fila},${siguiente.columna}`;
            if (visitadas.has(clave)) continue;
            visitadas.add(clave);

            if (tablero[siguiente.fila][siguiente.columna] === "") {
                return siguiente;
            }

            // Las casas se pueden atravesar al buscar, pero nunca se usan
            // como posición de aparición: quedan reservadas para conquistar.
            cola.push(siguiente);
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

    const piezas = obtenerPiezas(estado.tablero, jugador);
    let numeroPieza = piezas.reduce((maximo, pieza) => {
        const coincidencia = pieza.id.match(/^[AB](\d+)$/);
        return coincidencia ? Math.max(maximo, Number(coincidencia[1])) : maximo;
    }, 0);
    const pendientesRestantes = [];

    for (const pendiente of pendientes) {
        const siguienteNumero = numeroPieza + 1;
        const creada = crearNuevaPieza(
            estado.tablero,
            jugador,
            siguienteNumero,
            pendiente.fila,
            pendiente.columna
        );

        if (creada) {
            numeroPieza = siguienteNumero;
        } else {
            pendientesRestantes.push(pendiente);
        }
    }

    estado.piezasPendientes[jugador] = pendientesRestantes;
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
