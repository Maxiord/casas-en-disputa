# Casas en disputa

Bot para el juego **Casas en disputa**, desarrollado con Node.js, Express y Jest.

El bot recibe el estado actual de una partida y decide qué movimiento realizar con las piezas del jugador.

## ¿Cómo funciona?

El juego tiene un tablero de 10x10, dos jugadores y 5 casas neutrales.

En cada turno:

1. Se recibe el estado actual del juego.
2. El bot analiza sus piezas.
3. Decide hacia dónde mover cada pieza.
4. El motor verifica que los movimientos sean válidos.
5. Se ejecutan los movimientos.
6. Si una pieza cae sobre una casa, esta es conquistada y se genera una nueva pieza para el siguiente turno.

El tablero es toroidal, por lo que al salir por un borde se vuelve a entrar por el lado contrario.

## Estructura del proyecto

```text
casas-en-disputa/
│
├── src/
│   ├── estado.js       # Estado inicial y tablero
│   ├── strategy.js     # Decisiones del bot
│   ├── motor.js        # Reglas y ejecución del juego
│   ├── app.js          # Endpoint HTTP
│   └── server.js       # Inicio del servidor
│
├── test/
│   ├── juego.test.js
│   ├── turno.test.js
│   └── partida.test.js
│
├── package.json
├── package-lock.json
└── .gitignore
