const {
    crearEstadoInicial
} = require("../src/estado");

const {
    decidirMovimientos
} = require("../src/strategy");

const {
    procesarTurno,
    comprobarFin,
    obtenerResultadoFinal
} = require("../src/motor");


// Simula una partida completa
function jugarPartida() {

    const estado = crearEstadoInicial();

    while (!comprobarFin(estado)) {

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

test("la partida termina al conquistar las 5 casas", () => {

    const estado = crearEstadoInicial();

    estado.casasConquistadas.A = 5;

    expect(comprobarFin(estado)).toBe(true);
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