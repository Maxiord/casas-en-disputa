const app = require("../src/app");

let server;
let endpoint;

beforeAll(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    endpoint = `http://127.0.0.1:${server.address().port}/move`;
});

afterAll(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

function crearEstadoValido() {
    const tablero = Array.from({ length: 10 }, () => Array(10).fill(""));
    tablero[0][0] = "A1";
    tablero[9][9] = "B1";
    tablero[1][1] = "N";
    tablero[2][2] = "N";
    tablero[3][3] = "N";
    tablero[4][4] = "N";
    tablero[5][5] = "N";
    return { jugador: "A", dado: 2, tablero };
}

async function enviarEstado(estado) {
    return fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estado)
    });
}

test("responde con una dirección para cada pieza propia en el contrato del árbitro", async () => {
    const respuesta = await enviarEstado(crearEstadoValido());
    const decisiones = await respuesta.json();

    expect(respuesta.status).toBe(200);
    expect(Object.keys(decisiones)).toEqual(["A1"]);
    expect(["N", "S", "O", "E"]).toContain(decisiones.A1);
});

test("rechaza tableros con identificadores de pieza duplicados", async () => {
    const estado = crearEstadoValido();
    estado.tablero[8][8] = "A1";

    const respuesta = await enviarEstado(estado);
    expect(respuesta.status).toBe(400);
});

test.each([
    ["rechaza un dado fuera de rango", (estado) => { estado.dado = 4; }],
    ["rechaza un dado que no es numérico", (estado) => { estado.dado = "2"; }],
    ["rechaza un jugador desconocido", (estado) => { estado.jugador = "C"; }],
    ["rechaza una casilla con tipo inválido", (estado) => { estado.tablero[6][6] = 7; }],
    ["rechaza una casa sobre una esquina inicial", (estado) => {
        estado.tablero[0][1] = "A1";
        estado.tablero[0][0] = "N";
    }],
    ["rechaza más de cinco casas", (estado) => { estado.tablero[6][6] = "N"; }],
    ["rechaza un jugador sin pieza", (estado) => { estado.tablero[9][9] = ""; }],
    ["rechaza una matriz de tamaño incorrecto", (estado) => { estado.tablero.pop(); }],
    ["rechaza una fila que no es una matriz", (estado) => { estado.tablero[0] = null; }],
    ["rechaza una fila de ancho incorrecto", (estado) => { estado.tablero[0].pop(); }],
    ["rechaza un tablero que no es una matriz", (estado) => { estado.tablero = {}; }]
])("%s", async (_descripcion, modificarEstado) => {
    const estado = crearEstadoValido();
    modificarEstado(estado);

    const respuesta = await enviarEstado(estado);
    expect(respuesta.status).toBe(400);
});

test("rechaza un estado nulo", async () => {
    const respuesta = await enviarEstado(null);
    expect(respuesta.status).toBe(400);
});

test("responde 422 cuando ninguna dirección produce un destino legal", async () => {
    const estado = crearEstadoValido();
    estado.dado = 1;
    estado.tablero = Array.from({ length: 10 }, () => Array(10).fill(""));
    estado.tablero[5][5] = "A1";
    estado.tablero[4][5] = "B1";
    estado.tablero[5][6] = "B2";
    estado.tablero[6][5] = "B3";
    estado.tablero[5][4] = "B4";

    const respuesta = await enviarEstado(estado);
    expect(respuesta.status).toBe(422);
});
