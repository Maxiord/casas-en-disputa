const {
    crearEstadoInicial,
    crearTablero,
    generarCasas,
    aleatorioConSemilla
} = require("../src/estado");

const {
    calcularDestino,
    decidirMovimientos,
    elegirMovimiento
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

test("distribuye las casas con pares simétricos y una equidistante de ambas esquinas", () => {

    const estado = crearEstadoInicial();
    const casas = [];

    for (let fila = 0; fila < 10; fila++) {
        for (let columna = 0; columna < 10; columna++) {
            if (estado.tablero[fila][columna] === "N") {
                casas.push({ fila, columna });
            }
        }
    }

    const coordenadas = new Set(casas.map(({ fila, columna }) => `${fila},${columna}`));
    expect(coordenadas.has("0,0")).toBe(false);
    expect(coordenadas.has("9,9")).toBe(false);

    const casasConParSimetrico = casas.filter((casa) =>
        coordenadas.has(`${9 - casa.fila},${9 - casa.columna}`)
    );
    expect(casasConParSimetrico).toHaveLength(4);

    const distancia = (fila, columna, destinoFila, destinoColumna) => {
        const df = Math.abs(fila - destinoFila);
        const dc = Math.abs(columna - destinoColumna);
        return Math.min(df, 10 - df) + Math.min(dc, 10 - dc);
    };

    expect(casas.some(({ fila, columna }) =>
        distancia(fila, columna, 0, 0) === distancia(fila, columna, 9, 9)
    )).toBe(true);
});

test("la semilla reproduce la misma distribución de casas", () => {
    const tableroA = crearTablero();
    const tableroB = crearTablero();
    generarCasas(tableroA, 12345);
    generarCasas(tableroB, 12345);

    expect(tableroA).toEqual(tableroB);
});

test("rechaza tableros inválidos o sin espacio para distribuir cinco casas", () => {
    expect(() => generarCasas([], 1)).toThrow(TypeError);

    const sinPares = Array.from({ length: 10 }, () => Array(10).fill("X"));
    expect(() => generarCasas(sinPares, 1)).toThrow(RangeError);

    const sinQuintaCasa = Array.from({ length: 10 }, () => Array(10).fill("X"));
    for (const [fila, columna] of [[1, 1], [8, 8], [1, 2], [8, 7]]) {
        sinQuintaCasa[fila][columna] = "";
    }
    expect(() => generarCasas(sinQuintaCasa, 1)).toThrow(RangeError);
});

test("la selección seeded normaliza semillas negativas e inválidas", () => {
    const negativaA = aleatorioConSemilla(-3);
    const negativaB = aleatorioConSemilla(-3);
    expect(negativaA()).toBe(negativaB());

    const invalidaA = aleatorioConSemilla("no-numérica");
    const invalidaB = aleatorioConSemilla("no-numérica");
    expect(invalidaA()).toBe(invalidaB());
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

test.each([
    [0, 4, "N", 3, 7, 4],
    [9, 4, "S", 2, 1, 4],
    [4, 0, "O", 1, 4, 9],
    [4, 9, "E", 3, 4, 2]
])("mueve exactamente %i %i %s %i casillas con wrap", (fila, columna, direccion, dado, filaEsperada, columnaEsperada) => {
    expect(calcularDestino(fila, columna, direccion, dado)).toEqual({
        fila: filaEsperada,
        columna: columnaEsperada
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

test("elegirMovimiento toma la casa si está disponible y si no una salida válida", () => {
    const tablero = crearTablero();
    const pieza = { id: "A1", fila: 0, columna: 0 };
    tablero[0][1] = "N";

    expect(elegirMovimiento(tablero, pieza, ["N", "E"], 1)).toBe("E");
    expect(elegirMovimiento(tablero, pieza, ["N", "S"], 1)).toBe("N");
});

test("encuentra jugada legal para dos fichas en todas las posiciones iniciales y dados", () => {

    for (let primera = 0; primera < 100; primera++) {
        for (let segunda = primera + 1; segunda < 100; segunda++) {
            for (const dado of [1, 2, 3]) {
                const tablero = crearTablero();
                tablero[Math.floor(primera / 10)][primera % 10] = "A1";
                tablero[Math.floor(segunda / 10)][segunda % 10] = "A2";

                const decisiones = decidirMovimientos(tablero, "A", dado);
                if (!validarMovimientos(tablero, "A", decisiones, dado)) {
                    throw new Error(
                        `Sin jugada válida para casillas ${primera}, ${segunda} y dado ${dado}`
                    );
                }
            }
        }
    }
});
