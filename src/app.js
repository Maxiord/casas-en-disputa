const express = require("express");

const {
    decidirMovimientos
} = require("./strategy");

const {
    validarMovimientos
} = require("./motor");


const app = express();

app.use(express.json());


// Comprueba que el tablero tenga el formato correcto
function tableroValido(tablero) {

    if (!Array.isArray(tablero)) {
        return false;
    }

    if (tablero.length !== 10) {
        return false;
    }

    for (const fila of tablero) {

        if (!Array.isArray(fila)) {
            return false;
        }

        if (fila.length !== 10) {
            return false;
        }
    }

    return true;
}


// Recibe el estado y devuelve la decisión del bot
app.post("/move", (req, res) => {

    const estado = req.body;

    // Validamos los datos básicos del estado
    if (
        !estado ||
        !["A", "B"].includes(estado.jugador) ||
        typeof estado.dado !== "number" ||
        ![1, 2, 3].includes(estado.dado) ||
        !tableroValido(estado.tablero)
    ) {

        return res.status(400).json({
            error: "Estado inválido"
        });
    }


    // El bot decide qué hacer
    const decisiones = decidirMovimientos(
        estado.tablero,
        estado.jugador,
        estado.dado
    );


    // El motor comprueba que la decisión sea válida
    const valido = validarMovimientos(
        estado.tablero,
        estado.jugador,
        decisiones,
        estado.dado
    );


    if (!valido) {

        return res.status(422).json({
            error: "No existe una jugada válida"
        });
    }


    // Devolvemos solamente la decisión del bot
    return res.json(decisiones);
});


module.exports = app;