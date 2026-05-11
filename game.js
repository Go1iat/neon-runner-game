const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajustamos el tamaño del lienzo
canvas.width = 800;
canvas.height = 400;

// Propiedades del Jugador
let jugador = {
    x: 50,
    y: 300,
    ancho: 40,
    alto: 40,
    color: '#38bdf8', // Tu azul neón
    dy: 0,            // Velocidad en el eje Y (vertical)
    salto: 12,        // Fuerza de salto
    gravedad: 0.6,    // Fuerza que lo empuja hacia abajo
    enSuelo: false
};

let obstaculos = [];
let frameCount = 0; // Para contar el tiempo y saber cuándo sacar un enemigo
let puntos = 0;

function dibujarJugador() {
    // Efecto de brillo (neón)
    ctx.shadowBlur = 15;
    ctx.shadowColor = jugador.color;
    
    ctx.fillStyle = jugador.color;
    ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
    
    // Resetear brillo para que no afecte a otras cosas
    ctx.shadowBlur = 0;
}

function actualizar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    // 1. Crear obstáculos cada 100 frames (aprox 1.5 segundos)
    if (frameCount % 100 === 0) {
        let altoObstaculo = Math.floor(Math.random() * 50) + 30; // Altura aleatoria
        obstaculos.push({
            x: canvas.width,
            y: canvas.height - altoObstaculo,
            ancho: 30,
            alto: altoObstaculo,
            color: '#ff0055' // Color rojo neón para los enemigos
        });
    }

    // 2. Dibujar y mover obstáculos
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        let o = obstaculos[i];
        o.x -= 6; // Velocidad del enemigo

        // Dibujar enemigo con brillo rojo
        ctx.shadowBlur = 10;
        ctx.shadowColor = o.color;
        ctx.fillStyle = o.color;
        ctx.fillRect(o.x, o.y, o.ancho, o.alto);

        // 3. DETECTAR COLISIÓN
        if (
            jugador.x < o.x + o.ancho &&
            jugador.x + jugador.ancho > o.x &&
            jugador.y < o.y + o.alto &&
            jugador.y + jugador.alto > o.y
        ) {
            sonidoChoque.play(); // <--- AGREGA ESTO
            
            document.getElementById('puntuacion-final').innerText = puntos;
            document.getElementById('pantalla-game-over').style.display = 'block';
            
            cancelAnimationFrame(actualizar); 

            setTimeout(() => {
                location.reload();
            }, 4000);
            
            return;
        }

        // Borrar obstáculos que ya salieron de la pantalla para no gastar memoria
        if (o.x + o.ancho < 0) {
            obstaculos.splice(i, 1);
            puntos++;
            document.getElementById('score').innerText = puntos;
        }
    }

    // Gravedad y dibujo del jugador (lo que ya tenías)
    jugador.dy += jugador.gravedad;
    jugador.y += jugador.dy;
    if (jugador.y + jugador.alto > canvas.height) {
        jugador.y = canvas.height - jugador.alto;
        jugador.dy = 0;
        jugador.enSuelo = true;
    }

    dibujarJugador();
    requestAnimationFrame(actualizar);
}

// Cargar sonidos
const sonidoSalto = new Audio('audio_salto.mp3');
const sonidoChoque = new Audio('perder.mp3');

// Iniciar el juego
actualizar();

// Escuchar cuando el usuario presiona una tecla
window.addEventListener('keydown', (evento) => {
    if (evento.code === 'Space' && jugador.enSuelo) {
        sonidoSalto.play(); // <--- AGREGA ESTO
        jugador.dy = -jugador.salto;
        jugador.enSuelo = false;
    }
});