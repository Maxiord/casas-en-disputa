const {
    crearEstadoInicial
} = require("../src/estado");

const {
    decidirMovimientos
} = require("../src/strategy");

const {
    procesarTurno,
    validarMovimientos,
    buscarPosicionAdyacente,
    crearNuevaPieza,
    colocarPiezasPendientes,
    obtenerResultadoFinal,
    comprobarFin
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
    expect(estado.turno).toBe(1);
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

test("permite intercambiar simultáneamente dos piezas propias", () => {

    const estado = crearEstadoInicial();

    for (let fila = 0; fila < 10; fila++) {
        for (let columna = 0; columna < 10; columna++) {
            estado.tablero[fila][columna] = "";
        }
    }

    estado.tablero[0][0] = "A1";
    estado.tablero[0][1] = "A2";
    estado.tablero[9][9] = "B1";
    estado.jugador = "A";
    estado.dado = 1;

    const decisiones = { A1: "E", A2: "O" };

    expect(validarMovimientos(estado.tablero, "A", decisiones, 1)).toBe(true);
    const resultado = procesarTurno(estado, decisiones);

    expect(resultado.valido).toBe(true);
    expect(estado.tablero[0][0]).toBe("A2");
    expect(estado.tablero[0][1]).toBe("A1");
});

test("la estrategia evita que dos fichas elijan el mismo destino", () => {

    const estado = crearEstadoInicial();

    for (let fila = 0; fila < 10; fila++) {
        for (let columna = 0; columna < 10; columna++) {
            estado.tablero[fila][columna] = "";
        }
    }

    estado.tablero[0][1] = "A1";
    estado.tablero[1][0] = "A2";
    estado.tablero[9][9] = "B1";
    estado.tablero[0][0] = "N";
    estado.jugador = "A";
    estado.dado = 1;

    const decisiones = decidirMovimientos(estado.tablero, "A", 1);

    expect(Object.keys(decisiones).sort()).toEqual(["A1", "A2"]);
    expect(validarMovimientos(estado.tablero, "A", decisiones, 1)).toBe(true);
});

test("busca una casilla libre más lejana si las adyacentes están ocupadas", () => {

    const tablero = Array.from({ length: 10 }, () => Array(10).fill("X"));
    tablero[5][5] = "A1";
    tablero[5][7] = "";

    expect(buscarPosicionAdyacente(tablero, 5, 5)).toEqual({ fila: 5, columna: 7 });
});

test("no permite terminar sobre una pieza rival, pero permite atravesarla", () => {

    const estado = crearEstadoInicial();
    for (let fila = 0; fila < 10; fila++) {
        estado.tablero[fila].fill("");
    }
    estado.tablero[0][0] = "A1";
    estado.tablero[0][1] = "B1";
    estado.jugador = "A";
    estado.dado = 1;

    expect(validarMovimientos(estado.tablero, "A", { A1: "E" }, 1)).toBe(false);

    estado.dado = 2;
    expect(validarMovimientos(estado.tablero, "A", { A1: "E" }, 2)).toBe(true);
    const resultado = procesarTurno(estado, { A1: "E" });
    expect(resultado.valido).toBe(true);
    expect(estado.tablero[0][1]).toBe("B1");
    expect(estado.tablero[0][2]).toBe("A1");
});

test("pasar por una casa no la conquista", () => {

    const estado = crearEstadoInicial();
    for (let fila = 0; fila < 10; fila++) {
        estado.tablero[fila].fill("");
    }
    estado.tablero[0][0] = "A1";
    estado.tablero[9][9] = "B1";
    estado.tablero[0][1] = "N";
    estado.jugador = "A";
    estado.dado = 2;

    const resultado = procesarTurno(estado, { A1: "E" });

    expect(resultado.valido).toBe(true);
    expect(estado.tablero[0][1]).toBe("N");
    expect(estado.tablero[0][2]).toBe("A1");
    expect(estado.casasConquistadas.A).toBe(0);
    expect(estado.piezasPendientes.A).toHaveLength(0);
});

test("cada ficha puede conquistar una casa distinta en el mismo turno", () => {

    const estado = crearEstadoInicial();
    for (let fila = 0; fila < 10; fila++) {
        estado.tablero[fila].fill("");
    }
    estado.tablero[0][0] = "A1";
    estado.tablero[5][5] = "A2";
    estado.tablero[9][9] = "B1";
    estado.tablero[0][1] = "N";
    estado.tablero[6][5] = "N";
    estado.jugador = "A";
    estado.dado = 1;

    const resultado = procesarTurno(estado, { A1: "E", A2: "S" });

    expect(resultado.valido).toBe(true);
    expect(estado.casasConquistadas.A).toBe(2);
    expect(estado.piezasPendientes.A).toEqual([
        { fila: 0, columna: 1 },
        { fila: 6, columna: 5 }
    ]);
    expect(estado.tablero.flat().filter((celda) => celda === "N")).toHaveLength(0);
});

test("una jugada inválida no mueve fichas y consume el turno", () => {

    const estado = crearEstadoInicial();
    const tableroAntes = estado.tablero.map((fila) => [...fila]);
    estado.dado = 1;

    const resultado = procesarTurno(estado, {});

    expect(resultado.valido).toBe(false);
    expect(estado.tablero).toEqual(tableroAntes);
    expect(estado.fallosConsecutivos.A).toBe(1);
    expect(estado.jugador).toBe("B");
    expect(estado.turno).toBe(1);
});

test("una jugada válida reinicia los fallos consecutivos del jugador", () => {

    const estado = crearEstadoInicial();
    estado.dado = 1;
    procesarTurno(estado, {});

    const jugadaB = decidirMovimientos(estado.tablero, "B", 1);
    expect(procesarTurno(estado, jugadaB).valido).toBe(true);

    const jugadaA = decidirMovimientos(estado.tablero, "A", 1);
    expect(procesarTurno(estado, jugadaA).valido).toBe(true);
    expect(estado.fallosConsecutivos.A).toBe(0);
});

test("tres fallos del mismo jugador provocan derrota técnica pese a la alternancia", () => {

    const estado = crearEstadoInicial();
    estado.dado = 1;

    let ultimoResultado;
    for (let i = 0; i < 5; i++) {
        ultimoResultado = procesarTurno(estado, {});
    }

    expect(estado.fallosConsecutivos.A).toBe(3);
    expect(ultimoResultado.termino).toBe(true);
    expect(obtenerResultadoFinal(estado)).toBe("B");
});

test("la ficha ganada aparece al siguiente turno propio con desempate determinístico", () => {

    const estado = crearEstadoInicial();
    for (let fila = 0; fila < 10; fila++) {
        estado.tablero[fila].fill("");
    }
    estado.tablero[0][0] = "A1";
    estado.tablero[9][9] = "B1";
    estado.tablero[0][1] = "N";
    estado.jugador = "A";
    estado.dado = 1;

    expect(procesarTurno(estado, { A1: "E" }).valido).toBe(true);
    expect(estado.tablero[0][1]).toBe("A1");
    expect(estado.piezasPendientes.A).toEqual([{ fila: 0, columna: 1 }]);

    estado.dado = 1;
    expect(procesarTurno(estado, { B1: "S" }).valido).toBe(true);
    colocarPiezasPendientes(estado, "A");

    expect(estado.tablero[0][1]).toBe("A1");
    expect(estado.tablero[9][1]).toBe("A2");
    expect(estado.piezasPendientes.A).toHaveLength(0);
});

test("rechaza dos piezas que terminan en la misma casilla", () => {

    const estado = crearEstadoInicial();
    for (let fila = 0; fila < 10; fila++) {
        estado.tablero[fila].fill("");
    }
    estado.tablero[0][1] = "A1";
    estado.tablero[1][0] = "A2";
    estado.tablero[9][9] = "B1";

    expect(validarMovimientos(estado.tablero, "A", { A1: "O", A2: "N" }, 1)).toBe(false);
});

test.each([
    ["rechaza una respuesta nula", null, 1],
    ["rechaza una respuesta que no es objeto", [], 1],
    ["rechaza una dirección desconocida", { A1: "NE" }, 1],
    ["rechaza un dado fuera de rango", { A1: "N" }, 0],
    ["rechaza IDs que no pertenecen al jugador", { A1: "N", A2: "S" }, 1]
])("%s", (_nombre, decisiones, dado) => {
    const estado = crearEstadoInicial();
    expect(validarMovimientos(estado.tablero, "A", decisiones, dado)).toBe(false);
});

test("crea una ficha en el origen libre y usa BFS si está ocupado", () => {
    const tablero = Array.from({ length: 10 }, () => Array(10).fill(""));
    expect(crearNuevaPieza(tablero, "A", 2, 4, 4)).toEqual({
        id: "A2",
        fila: 4,
        columna: 4
    });
    expect(tablero[4][4]).toBe("A2");

    tablero[7][7] = "B1";
    expect(crearNuevaPieza(tablero, "A", 3, 7, 7)).toEqual({
        id: "A3",
        fila: 6,
        columna: 7
    });
    expect(tablero[7][7]).toBe("B1");
});

test("conserva una ficha pendiente si no existe ninguna casilla libre", () => {
    const estado = crearEstadoInicial();
    for (let fila = 0; fila < 10; fila++) {
        estado.tablero[fila].fill("X");
    }
    estado.tablero[0][0] = "A1";
    estado.piezasPendientes.A = [{ fila: 1, columna: 1 }];

    colocarPiezasPendientes(estado, "A");

    expect(estado.piezasPendientes.A).toEqual([{ fila: 1, columna: 1 }]);
    expect(estado.tablero.flat().filter((celda) => /^A\d+$/.test(celda))).toEqual(["A1"]);
});

test("la numeración de fichas pendientes tolera IDs existentes fuera del formato esperado", () => {
    const estado = crearEstadoInicial();
    for (let fila = 0; fila < 10; fila++) {
        estado.tablero[fila].fill("");
    }
    estado.tablero[0][0] = "A-invalida";
    estado.tablero[9][9] = "B1";
    estado.piezasPendientes.A = [{ fila: 1, columna: 1 }];

    colocarPiezasPendientes(estado, "A");

    expect(estado.tablero[1][1]).toBe("A1");
    expect(estado.piezasPendientes.A).toHaveLength(0);
});

test("detecta todos los criterios de fin de partida", () => {
    const estado = crearEstadoInicial();
    expect(comprobarFin(estado)).toBe(false);

    estado.fallosConsecutivos.B = 3;
    expect(comprobarFin(estado)).toBe(true);
    estado.fallosConsecutivos.B = 0;

    estado.turno = 50;
    expect(comprobarFin(estado)).toBe(true);
});
