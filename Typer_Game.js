/* global performance FPSMeter */
/* eslint-disable no-unused-vars */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const getTime = typeof performance === 'function' ? performance.now : Date.now;
const FRAME_THRESHOLD = 300;
const FRAME_DURATION = 1000 / 58;
let then = getTime();
let acc = 0;
let animation;
let gameLoop;
for (const element of window.document.getElementsByTagName('link')) {
  if (element.href.includes('bootstrap')) {
    FPSMeter.theme.colorful.container.height = '40px';
    break;
  }
}
const meter = new FPSMeter({
  left: canvas.width - 130 + 'px',
  top: 'auto',
  bottom: '12px',
  theme: 'colorful',
  heat: 1,
  graph: 1
});

const label = {
  font: '24px Arial',
  color: '#0095DD',
  margin: 30,
  left: 20,
  right: canvas.width - 120
};

const addPause = () => {
  document.addEventListener('keyup', e => {
    if (e.keyCode === 80) {
      if (animation === undefined) {
        animation = window.requestAnimationFrame(gameLoop);
      } else {
        window.cancelAnimationFrame(animation);
        animation = undefined;
      }
    }
  });
};

const addResize = () => {
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
};

const loop = gameLogic => {
  const now = getTime();
  const ms = now - then;
  let frames = 0;
  then = now;
  if (ms < FRAME_THRESHOLD) {
    acc += ms;
    while (acc >= FRAME_DURATION) {
      frames++;
      acc -= FRAME_DURATION;
    }
  }
  meter.tick();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  gameLogic(frames);
  if (gameLoop === undefined) {
    gameLoop = () => {
      loop(gameLogic);
    };
  }
  animation = window.requestAnimationFrame(gameLoop);
};

const drawCircle = (x, y, radius) => {
  ctx.moveTo(x, y);
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
};

const paintCircle = (x, y, radius, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  drawCircle(x, y, radius);
  ctx.fill();
};

const drawLine = (x1, y1, x2, y2) => {
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
};

const paintLine = (x1, y1, x2, y2, color) => {
  ctx.strokeStyle = color;
  ctx.beginPath();
  drawLine(x1, y1, x2, y2);
  ctx.stroke();
};

const drawRoundRect = (x, y, width, height, arcX, arcY) => {
  ctx.moveTo(x + arcX, y);
  ctx.lineTo(x + width - arcX, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + arcY);
  ctx.lineTo(x + width, y + height - arcY);
  ctx.quadraticCurveTo(x + width, y + height, x + width - arcX, y + height);
  ctx.lineTo(x + arcX, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - arcY);
  ctx.lineTo(x, y + arcY);
  ctx.quadraticCurveTo(x, y, x + arcX, y);
};

const paintRoundRect = (x, y, width, height, arcX, arcY, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  drawRoundRect(x, y, width, height, arcX, arcY);
  ctx.fill();
};

const isIntersectingRectangleWithRectangle = (rect1, width1, height1, rect2, width2, height2) => {
  return rect2.x < rect1.x + width1 && rect2.x + width2 > rect1.x && rect2.y < rect1.y + height1 && rect2.y + height2 > rect1.y;
};

const isIntersectingRectangleWithCircle = (rect, width, height, circle, radius) => {
  const distX = Math.abs(circle.x - rect.x - width / 2);
  const distY = Math.abs(circle.y - rect.y - height / 2);
  if (distX > (width / 2 + radius) || distY > (height / 2 + radius)) {
    return false;
  }
  if (distX <= (width / 2) || distY <= (height / 2)) {
    return true;
  }
  const dX = distX - width / 2;
  const dY = distY - height / 2;
  return dX ** 2 + dY ** 2 <= radius ** 2;
};

const getDistance = (p1, p2) => {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

const generateRandomNumber = (min, max) => {
  return min + Math.random() * (max - min);
};

const generateRandomInteger = range => {
  return Math.floor(Math.random() * range);
};

const generateRandomRgbColor = () => {
  return [generateRandomInteger(255), generateRandomInteger(255), generateRandomInteger(255)];
};

const generateRandomCharCode = (caseSensitive) => {
  const codes = [];
  if (caseSensitive) {
    for (let i = 0; i < 26; i++) {
      codes.push(65 + i);
    }
  }
  for (let i = 0; i < 26; i++) {
    codes.push(97 + i);
  }
  return codes[generateRandomInteger(codes.length)];
};

/* global canvas paintCircle generateRandomNumber generateRandomRgbColor */
/* eslint-disable no-unused-vars */
const particle = {
  decrease: 0.05,
  highestAlpha: 0.8,
  highestRadius: 5,
  highestSpeedX: 5,
  highestSpeedY: 5,
  lowestAlpha: 0.4,
  lowestRadius: 2,
  lowestSpeedX: -5,
  lowestSpeedY: -5,
  total: 100
};

const particles = [];

const paintParticles = () => {
  for (const p of particles) {
    paintCircle(p.x, p.y, p.radius, p.color);
  }
};

const createParticles = (x, y) => {
  for (let i = 0; i < particle.total; i++) {
    const c = generateRandomRgbColor();
    const alpha = generateRandomNumber(particle.lowestAlpha, particle.highestAlpha);
    particles.push({
      x,
      y,
      radius: generateRandomNumber(particle.lowestRadius, particle.highestRadius),
      color: `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`,
      speedX: generateRandomNumber(particle.lowestSpeedX, particle.highestSpeedX),
      speedY: generateRandomNumber(particle.lowestSpeedY, particle.highestSpeedY)
    });
  }
};

const processParticles = frames => {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.speedX * frames;
    p.y += p.speedY * frames;
    p.radius -= particle.decrease;
    if (p.radius <= 0 || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
      particles.splice(i, 1);
    }
  }
};

/* global canvas ctx animation:writable gameLoop label loop paintCircle isIntersectingRectangleWithCircle generateRandomNumber generateRandomCharCode paintParticles createParticles processParticles */
let score = 0;
let lives = 10;
let caseSensitive = true;

const center = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: '#FF0000'
};

const letter = {
  font: '25px Monospace',
  color: '#0095DD',
  width: 15,
  height: 20,
  highestSpeed: 1.6,
  lowestSpeed: 0.6,
  probability: 0.02
};

let letters = [];

ctx.font = label.font;
letter.width = ctx.measureText('0').width;
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
window.addEventListener('resize', resizeHandler);

loop(function (frames) {
  paintCircle(center.x, center.y, center.radius, center.color);
  ctx.font = letter.font;
  ctx.fillStyle = letter.color;
  for (const l of letters) {
    ctx.fillText(String.fromCharCode(l.code), l.x, l.y);
  }
  paintParticles();
  ctx.font = label.font;
  ctx.fillStyle = label.color;
  ctx.fillText('Score: ' + score, label.left, label.margin);
  ctx.fillText('Lives: ' + lives, label.right, label.margin);
  processParticles(frames);
  createLetters();
  removeLetters(frames);
});

function createLetters () {
  if (Math.random() < letter.probability) {
    const x = Math.random() < 0.5 ? 0 : canvas.width;
    const y = Math.random() * canvas.height;
    const dX = center.x - x;
    const dY = center.y - y;
    const norm = Math.sqrt(dX ** 2 + dY ** 2);
    const speed = generateRandomNumber(letter.lowestSpeed, letter.highestSpeed);
    letters.push({
      x,
      y,
      code: generateRandomCharCode(caseSensitive),
      speedX: dX / norm * speed,
      speedY: dY / norm * speed
    });
  }
}

function removeLetters (frames) {
  for (const l of letters) {
    if (isIntersectingRectangleWithCircle({ x: l.x, y: l.y - letter.height }, letter.width, letter.height, center, center.radius)) {
      if (--lives === 0) {
        window.alert('GAME OVER!');
        window.location.reload(false);
      } else if (lives > 0) {
        window.alert('START AGAIN!');
        letters = [];
      }
      break;
    } else {
      l.x += l.speedX * frames;
      l.y += l.speedY * frames;
    }
  }
}

function type (i, l) {
  letters.splice(i, 1);
  score++;
  createParticles(l.x, l.y);
}

window.changeCase = function () {
  caseSensitive = !caseSensitive;
  if (caseSensitive) {
    document.getElementById('change-case-text').innerHTML = '';
  } else {
    document.getElementById('change-case-text').innerHTML = 'in';
  }
};

function keyDownHandler (e) {
  if (animation !== undefined && e.keyCode >= 65 && e.keyCode <= 90) {
    for (let i = letters.length - 1; i >= 0; i--) {
      const l = letters[i];
      if (caseSensitive) {
        if (e.shiftKey) {
          if (e.keyCode === l.code) {
            type(i, l);
            return;
          }
        } else {
          if (e.keyCode + 32 === l.code) {
            type(i, l);
            return;
          }
        }
      } else {
        if (e.keyCode === l.code || e.keyCode + 32 === l.code) {
          type(i, l);
          return;
        }
      }
    }
    score--;
  }
}

function keyUpHandler (e) {
  if (e.keyCode === 27) {
    if (animation === undefined) {
      animation = window.requestAnimationFrame(gameLoop);
    } else {
      window.cancelAnimationFrame(animation);
      animation = undefined;
    }
  }
}

function resizeHandler () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  center.x = canvas.width / 2;
  center.y = canvas.height / 2;
}
