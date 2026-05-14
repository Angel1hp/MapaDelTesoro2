const WIDTH = 400;
const HEIGHT = 400;

let $map = document.querySelector('#map');
let $distance = document.querySelector('#distance');
let $fullscreenBtn = document.querySelector('#fullscreen-btn');

let clicks = 0;
let gameActive = false;
let target = createTarget();
let audioContext = null;

function createTarget() {

const mapWidth = $map ? $map.clientWidth : WIDTH;
const mapHeight = $map ? $map.clientHeight : HEIGHT;

return {
x: getRandomNumber(mapWidth),
y: getRandomNumber(mapHeight)
};

}

function getAudioContext() {

const AudioContext =
window.AudioContext || window.webkitAudioContext;

if (!AudioContext) {
return null;
}

if (!audioContext) {
audioContext = new AudioContext();
}

return audioContext;

}

function playTone(startFrequency, endFrequency, duration, volume) {

const context = getAudioContext();

if (!context) {
return;
}

if (context.state === 'suspended') {
context.resume();
}

const oscillator = context.createOscillator();
const gain = context.createGain();

oscillator.type = 'triangle';

oscillator.frequency.setValueAtTime(
startFrequency,
context.currentTime
);

oscillator.frequency.exponentialRampToValueAtTime(
endFrequency,
context.currentTime + duration * 0.55
);

gain.gain.setValueAtTime(0.001, context.currentTime);

gain.gain.exponentialRampToValueAtTime(
volume,
context.currentTime + 0.02
);

gain.gain.exponentialRampToValueAtTime(
0.001,
context.currentTime + duration
);

oscillator.connect(gain);
gain.connect(context.destination);

oscillator.start();

oscillator.stop(context.currentTime + duration + 0.02);

}

function playStartSound() {
playTone(392, 784, 0.35, 0.25);
}

function playSearchSound(distance) {

if (distance < 40) {

playTone(880, 1180, 0.12, 0.2);

} else if (distance < 100) {

playTone(620, 760, 0.12, 0.18);

} else if (distance < 180) {

playTone(420, 520, 0.13, 0.16);

} else {

playTone(210, 170, 0.16, 0.15);

}

}

function playWinSound() {

playTone(523, 784, 0.18, 0.22);

setTimeout(function () {

playTone(784, 1046, 0.24, 0.24);

}, 140);

}

function showTreasureCelebration() {

let $celebration =
document.querySelector('#treasure-celebration');

if (!$celebration) {

$celebration = document.createElement('div');

$celebration.id = 'treasure-celebration';

document.body.appendChild($celebration);

}

$celebration.innerHTML = `
<span class="coin coin-1"></span>
<span class="coin coin-2"></span>
<span class="coin coin-3"></span>
<span class="coin coin-4"></span>
<span class="coin coin-5"></span>
<span class="coin coin-6"></span>
`;

$celebration.classList.add('is-visible');

}

function hideTreasureCelebration() {

const $celebration =
document.querySelector('#treasure-celebration');

if ($celebration) {
$celebration.classList.remove('is-visible');
}

}

function showGameMessage(
title,
text,
primaryText,
primaryAction,
secondaryText,
secondaryAction,
showChest
) {

let $message = document.querySelector('#game-message');

if (!$message) {

$message = document.createElement('div');

$message.id = 'game-message';

$message.innerHTML = `
<div class="game-message__box">

<div class="game-message__mark">X</div>

<div class="treasure-chest" aria-hidden="true">

<div class="treasure-chest__lid"></div>

<div class="treasure-chest__body">
<span class="treasure-chest__lock"></span>
</div>

</div>

<h2></h2>

<p></p>

<div class="game-message__actions">

<button type="button"
class="game-message__primary">
</button>

<button type="button"
class="game-message__secondary">
</button>

</div>

</div>
`;

document.body.appendChild($message);

}

$message.querySelector('h2').textContent = title;
$message.querySelector('p').textContent = text;

$message.classList.toggle(
'has-treasure',
Boolean(showChest)
);

const $primary =
$message.querySelector('.game-message__primary');

const $secondary =
$message.querySelector('.game-message__secondary');

$primary.textContent = primaryText;
$secondary.textContent = secondaryText;

$primary.onclick = function () {

$message.classList.remove('is-visible');

primaryAction();

};

$secondary.onclick = function () {

$message.classList.remove('is-visible');

secondaryAction();

};

$message.classList.add('is-visible');

}

function startNewGame() {

target = createTarget();

clicks = 0;

gameActive = true;

$distance.innerHTML = '';

hideTreasureCelebration();

playStartSound();

}

function exitGame() {

gameActive = false;

$distance.innerHTML = '<h1>Juego finalizado</h1>';

window.location.href = 'https://www.google.com/';

}

showGameMessage(
'Mapa del Tesoro',

'Haz clic en el mapa para buscar el tesoro. Las pistas te diran si estas frio, caliente o muy cerca. Presiona iniciar para comenzar la busqueda.',

'Iniciar juego',

startNewGame,

'Salir',

exitGame
);

if ($fullscreenBtn) {

$fullscreenBtn.addEventListener('click', function () {

if (!document.fullscreenElement) {

document.documentElement.requestFullscreen();

$fullscreenBtn.textContent =
'Salir de pantalla completa';

} else {

document.exitFullscreen();

$fullscreenBtn.textContent =
'Pantalla completa';

}

});

document.addEventListener(
'fullscreenchange',
function () {

$fullscreenBtn.textContent =
document.fullscreenElement
? 'Salir de pantalla completa'
: 'Pantalla completa';

if (gameActive) {

setTimeout(function () {

target = createTarget();

clicks = 0;

$distance.innerHTML =
'<h1>Nueva posicion del tesoro</h1>';

}, 100);

}

});

}

$map.addEventListener('click', function (e) {

if (!gameActive) {
return;
}

clicks++;

let distance = getDistance(e, target);

let distanceHint = getDistanceHint(distance);

playSearchSound(distance);

$distance.innerHTML = `<h1>${distanceHint}</h1>`;

if (distance < 20) {

gameActive = false;

playWinSound();

showTreasureCelebration();

showGameMessage(
'Encontraste el tesoro',

`Lo lograste en ${clicks} clicks. Quieres continuar con un nuevo juego o salir?`,

'Nuevo juego',

startNewGame,

'Salir',

exitGame,

true
);

}

});