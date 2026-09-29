const {
    crearEstadoInicial
} = require("../src/estado");

const {
    calcularDestino,
    decidirMovimientos
} = require("../src/strategy");

const {
    validarMovimientos
} = require("../src/motor");


test("crea un tablero de 10x10", () => {

    const estado = crearEstadoInicial();

    expect(estado.tablero.length).toBe(10);
    expect(estado.tablero[0].length).toBe(10);
});


test("crea las piezas iniciales", () => {

    const estado = crearEstadoInicial();

    expect(estado.tablero[0][0]).toBe("A1");
    expect(estado.tablero[9][9]).toBe("B1");
});


test("genera 5 casas", () => {

    const estado = crearEstadoInicial();

    let casas = 0;

    for (const fila of estado.tablero) {

        for (const celda of fila) {

            if (celda === "N") {
                casas++;
            }
        }
    }

    expect(casas).toBe(5);
});


test("el movimiento es toroidal", () => {

    const destino = calcularDestino(
        0,
        0,
        "N",
        2
    );

    expect(destino).toEqual({
        fila: 8,
        columna: 0
    });
});


test("el bot decide un movimiento", () => {

    const estado = crearEstadoInicial();

    const decisiones = decidirMovimientos(
        estado.tablero,
        estado.jugador,
        estado.dado
    );

    expect(decisiones.A1).toBeDefined();
});


test("las decisiones del bot son válidas", () => {

    const estado = crearEstadoInicial();

    const decisiones = decidirMovimientos(
        estado.tablero,
        estado.jugador,
        estado.dado
    );

    const valido = validarMovimientos(
        estado.tablero,
        estado.jugador,
        decisiones,
        estado.dado
    );

    expect(valido).toBe(true);
});