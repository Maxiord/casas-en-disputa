const {
    crearEstadoInicial
} = require("../src/estado");

const {
    decidirMovimientos
} = require("../src/strategy");

const {
    procesarTurno,
    colocarPiezasPendientes,
    comprobarFin,
    obtenerResultadoFinal
} = require("../src/motor");


// Simula una partida completa
function jugarPartida() {

    const estado = crearEstadoInicial();

    while (!comprobarFin(estado)) {

        // El árbitro incorpora las fichas pendientes antes de pedir la jugada.
        colocarPiezasPendientes(estado, estado.jugador);

        const decisiones = decidirMovimientos(
            estado.tablero,
            estado.jugador,
            estado.dado
        );

        procesarTurno(
            estado,
            decisiones
        );

        // Nuevo dado para el siguiente turno
        estado.dado = Math.floor(
            Math.random() * 3
        ) + 1;
    }

    return {
        turnos: estado.turno,
        casasA: estado.casasConquistadas.A,
        casasB: estado.casasConquistadas.B,
        ganador: obtenerResultadoFinal(estado)
    };
}


test("simula una partida completa", () => {

    const resultado = jugarPartida();

    console.log(resultado);

    expect(resultado.turnos).toBeLessThanOrEqual(50);

    expect(
        resultado.casasA + resultado.casasB
    ).toBeLessThanOrEqual(5);

    expect(
        ["A", "B", "EMPATE"].includes(resultado.ganador)
    ).toBe(true);
});

test("la partida termina al completar 50 turnos individuales", () => {

    const estado = crearEstadoInicial();

    estado.turno = 49;
    expect(comprobarFin(estado)).toBe(false);

    estado.turno = 50;
    expect(comprobarFin(estado)).toBe(true);
});

test("gana quien conquista más casas y hay empate si igualan", () => {

    const estado = crearEstadoInicial();
    estado.casasConquistadas.A = 3;
    estado.casasConquistadas.B = 2;
    expect(obtenerResultadoFinal(estado)).toBe("A");

    estado.casasConquistadas.A = 2;
    estado.casasConquistadas.B = 3;
    expect(obtenerResultadoFinal(estado)).toBe("B");

    estado.casasConquistadas.A = 2;
    estado.casasConquistadas.B = 2;
    expect(obtenerResultadoFinal(estado)).toBe("EMPATE");
});

test("la derrota técnica tiene prioridad sobre las casas conquistadas", () => {

    const estado = crearEstadoInicial();
    estado.casasConquistadas.B = 5;
    estado.fallosConsecutivos.B = 3;

    expect(comprobarFin(estado)).toBe(true);
    expect(obtenerResultadoFinal(estado)).toBe("A");
});

test("la partida termina al conquistar las 5 casas", () => {

    const estado = crearEstadoInicial();

    estado.casasConquistadas.A = 5;

    expect(comprobarFin(estado)).toBe(true);
});

test("un jugador pierde por tres fallos consecutivos", () => {

    const estado = crearEstadoInicial();

    estado.fallosConsecutivos.A = 3;

    expect(comprobarFin(estado)).toBe(true);

    expect(
        obtenerResultadoFinal(estado)
    ).toBe("B");
});
