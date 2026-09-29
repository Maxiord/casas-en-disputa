const {
    crearEstadoInicial
} = require("../src/estado");

const {
    decidirMovimientos
} = require("../src/strategy");

const {
    procesarTurno
} = require("../src/motor");


test("procesa un turno completo", () => {

    const estado = crearEstadoInicial();

    const jugadorInicial = estado.jugador;

    const decisiones = decidirMovimientos(
        estado.tablero,
        estado.jugador,
        estado.dado
    );

    const resultado = procesarTurno(
        estado,
        decisiones
    );

    expect(resultado.valido).toBe(true);

    // Después del turno cambia el jugador
    expect(estado.jugador).not.toBe(jugadorInicial);

    // El turno avanza
    expect(estado.turno).toBe(2);
});

test("una casa conquistada genera una pieza para el siguiente turno", () => {

    const estado = crearEstadoInicial();

    // Dejamos solamente A1 en el tablero
    // y colocamos una casa exactamente a 1 casilla.
    for (let fila = 0; fila < 10; fila++) {

        for (let columna = 0; columna < 10; columna++) {

            if (
                estado.tablero[fila][columna] !== "A1" &&
                estado.tablero[fila][columna] !== "B1"
            ) {
                estado.tablero[fila][columna] = "";
            }
        }
    }

    estado.tablero[0][1] = "N";

    // Forzamos el dado a 1
    estado.dado = 1;

    const decisiones = {
        A1: "E"
    };

    const resultado = procesarTurno(
        estado,
        decisiones
    );

    expect(resultado.valido).toBe(true);

    // A conquistó una casa
    expect(estado.casasConquistadas.A).toBe(1);

    // La nueva pieza todavía NO aparece
    expect(
        estado.piezasPendientes.A.length
    ).toBe(1);

    // A1 quedó sobre la casa conquistada
    expect(estado.tablero[0][1]).toBe("A1");

    // Al terminar el turno pasa a B
    expect(estado.jugador).toBe("B");
});
test("todas las piezas se mueven y no terminan en la misma posición", () => {

    const estado = crearEstadoInicial();

    // Limpiamos el tablero
    for (let fila = 0; fila < 10; fila++) {

        for (let columna = 0; columna < 10; columna++) {
            estado.tablero[fila][columna] = "";
        }
    }

    // Colocamos dos piezas de A
    estado.tablero[0][0] = "A1";
    estado.tablero[5][5] = "A2";

    estado.jugador = "A";
    estado.dado = 2;

    const decisiones = {
        A1: "E",
        A2: "S"
    };

    const resultado = procesarTurno(
        estado,
        decisiones
    );

    expect(resultado.valido).toBe(true);

    // A1 avanzó exactamente 2 hacia el Este
    expect(estado.tablero[0][2]).toBe("A1");

    // A2 avanzó exactamente 2 hacia el Sur
    expect(estado.tablero[7][5]).toBe("A2");
});