# Casas en disputa

Bot para el juego **Casas en disputa**, desarrollado con Node.js, Express y Jest.

## Descripción

El proyecto implementa un bot que recibe el estado actual de una partida mediante una petición HTTP `POST /move` y devuelve las decisiones de movimiento de sus piezas.

La lógica está separada en diferentes módulos para mantener una arquitectura clara:

- `estado.js`: creación y representación del estado de la partida.
- `strategy.js`: estrategia y decisiones del bot.
- `motor.js`: validación y ejecución de las reglas del juego.
- `app.js`: comunicación HTTP y endpoint del bot.
- `server.js`: inicio del servidor.

## Tecnologías

- Node.js
- JavaScript
- Express
- Jest

## Estructura

```text
casas-en-disputa/
│
├── src/
│   ├── estado.js
│   ├── strategy.js
│   ├── motor.js
│   ├── app.js
│   └── server.js
│
├── test/
│   ├── juego.test.js
│   ├── turno.test.js
│   └── partida.test.js
│
├── .gitignore
├── package.json
└── package-lock.json
