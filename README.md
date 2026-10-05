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
```

## ¿Cómo instalarlo?

Primero instalar las dependencias:

```bash
npm install
```

## ¿Cómo ejecutarlo?

Iniciar el servidor:

```bash
npm start
```

El bot queda disponible en:

```text
http://localhost:3000
```

## ¿Cómo conectarlo con el árbitro?

Para probar el bot junto con el árbitro del juego:

1. Iniciar el bot con:

```bash
npm start
```

2. Iniciar el árbitro en su propio proyecto.

3. Abrir la interfaz del árbitro en:

```text
http://localhost:3150
```

4. En la configuración del bot, indicar como endpoint:

```text
http://localhost:3000/move
```

El árbitro enviará el estado actual de la partida al bot mediante `POST /move`.

El bot analizará el estado y devolverá los movimientos que debe realizar cada pieza.

No es necesario realizar ninguna otra configuración de conexión.

## ¿Cómo probar el bot?

El bot recibe los estados mediante:

```text
POST /move
```

Por ejemplo, se puede enviar un estado como:

```json
{
  "jugador": "A",
  "dado": 2,
  "tablero": [
    ["A1","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","N","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","",""],
    ["","","","","","","","","","B1"]
  ]
}
```

El bot responde indicando el movimiento de cada pieza:

```json
{
    "A1": "N"
}
```

Las direcciones posibles son:

- `N` → Norte
- `S` → Sur
- `O` → Oeste
- `E` → Este

## ¿Cómo ejecutar los tests?

Para ejecutar todas las pruebas:

```bash
npm test
```

Los tests verifican:

- creación del tablero;
- piezas iniciales;
- casas neutrales;
- movimientos;
- movimiento toroidal;
- turnos;
- conquista de casas;
- creación de nuevas piezas;
- varias piezas;
- finalización de la partida;
- derrota técnica.

## Tecnologías utilizadas

- Node.js
- JavaScript
- Express
- Jest