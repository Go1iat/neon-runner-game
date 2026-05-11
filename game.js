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
    color: '#38bdf8', // Color inicial azul neón
    dy: 0,
    salto: 12,
    gravedad: 0.6,
    enSuelo: false
};

// --- VARIABLES DE CONTROL ---
let velocidadMundo = 6;
let obstaculos = [];
let frameCount = 0;
let puntos = 0;
// Recuperamos el récord guardado en la memoria del navegador (si no existe, es 0)
let recordMaximo = localStorage.getItem('maxScoreGo1iat') || 0;

// Cargar sonidos (Asegúrate de que los nombres coincidan con tus archivos)
const sonidoSalto = new Audio('audio_salto.mp3');
const sonidoChoque = new Audio('perder.mp3');

function dibujarJugador() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = jugador.color;
    ctx.fillStyle = jugador.color;
    ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
    ctx.shadowBlur = 0;
}

function actualizar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    // Dibujar el récord en pantalla (opcional, si no tienes el elemento en HTML)
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "16px Arial";
    ctx.fillText("Récord: " + recordMaximo, canvas.width - 120, 30);

    // 1. Crear obstáculos cada 100 frames
    if (frameCount % 100 === 0) {
        let altoObstaculo = Math.floor(Math.random() * 50) + 30;
        obstaculos.push({
            x: canvas.width,
            y: canvas.height - altoObstaculo,
            ancho: 30,
            alto: altoObstaculo,
            color: '#ff0055'
        });
    }

    // 2. Dibujar y mover obstáculos
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        let o = obstaculos[i];
        o.x -= velocidadMundo; // Usamos la velocidad variable

        ctx.shadowBlur = 10;
        ctx.shadowColor = o.color;
        ctx.fillStyle = o.color;
        ctx.fillRect(o.x, o.y, o.ancho, o.alto);
        ctx.shadowBlur = 0;

        // 3. DETECTAR COLISIÓN
        if (
            jugador.x < o.x + o.ancho &&
            jugador.x + jugador.ancho > o.x &&
            jugador.y < o.y + o.alto &&
            jugador.y + jugador.alto > o.y
        ) {
            sonidoChoque.play();
            
            // Lógica de Récord Máximo
            if (puntos > recordMaximo) {
                localStorage.setItem('maxScoreGo1iat', puntos);
                recordMaximo = puntos;
            }

            document.getElementById('puntuacion-final').innerText = puntos;
            document.getElementById('pantalla-game-over').style.display = 'block';
            
            cancelAnimationFrame(actualizar); 

            setTimeout(() => {
                location.reload();
            }, 4000);
            
            return;
        }

        // Borrar obstáculos y aumentar dificultad
        if (o.x + o.ancho < 0) {
            obstaculos.splice(i, 1);
            puntos++;
            document.getElementById('score').innerText = puntos;

            // CAMBIO: Aumentar velocidad cada 5 puntos
            if (puntos % 5 === 0) {
                velocidadMundo += 0.7; // Se pone más difícil rápido
            }
        }
    }

    // Gravedad y físicas
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

// Funciones de control
function saltar() {
    if (jugador.enSuelo) {
        sonidoSalto.play();
        jugador.dy = -jugador.salto;
        jugador.enSuelo = false;
    }
}

// Función para cambiar de color (Skin)
function cambiarColor() {
    const colores = ['#38bdf8', '#4ade80', '#fb7185', '#facc15', '#a855f7'];
    jugador.color = colores[Math.floor(Math.random() * colores.length)];
}

// EVENTOS
window.addEventListener('keydown', (evento) => {
    if (evento.code === 'Space') {
        saltar();
    }
    // Si presionas la tecla "C" cambias de color
    if (evento.code === 'KeyC') {
        cambiarColor();
    }
});

window.addEventListener('touchstart', (evento) => {
    evento.preventDefault(); 
    saltar();
    // Opcional: si tocas con dos dedos, cambia de color
    if (evento.touches.length > 1) {
        cambiarColor();
    }
}, { passive: false });

// Iniciar
actualizar();