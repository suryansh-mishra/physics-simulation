// As per Defined in HTML (kindly change in both simultaneously)
const WIDTH = 1280,
  HEIGHT = 720;
// Height to units = 10 pixels = 1 unit
const UNITS = 5;
const GRAVITY = 9.8; // Taken in m/s^2
const SHAPES = [];
const FPS = 90;

// Declaring canvas variables and setting it up
const c = document.getElementById('canvas');
const ctx = c.getContext('2d');
let scaleX = 1,
  scaleY = 1,
  canvasOffsetX = 0,
  canvasOffsetY = 0;

const setCanvasVariables = () => {
  const { width, height, x, y } = c.getBoundingClientRect();
  canvasOffsetX = x;
  canvasOffsetY = y;
  scaleX = WIDTH / width;
  scaleY = HEIGHT / height;
};
window.addEventListener('resize', setCanvasVariables);
setCanvasVariables();

let lastLocation = { x: 0, y: 0 };
let mouseDownTimestamp = 0;

function getBrightColor() {
  const h = Math.floor(Math.random() * 360); // Random hue
  const s = Math.floor(Math.random() * 61) + 40; // Saturation: 40% to 100%
  const l = Math.floor(Math.random() * 41) + 50; // Lightness: 50% to 90%
  return `hsl(${h}, ${s}%, ${l}%)`;
}

class Shape {
  constructor(x, y, r, color) {
    this.initialY = y;
    this.x = x;
    this.y = y;
    this.dy = 0;
    this.r = r;
    this.color = color;
  }

  update() {
    if (this.y > HEIGHT - this.r) {
      this.dy = 0;
      return;
    }
    const currentDy = this.dy;
    this.dy = currentDy + (GRAVITY * UNITS) / FPS;
    this.y =
      this.y + (Math.pow(this.dy, 2) - Math.pow(currentDy, 2)) / (2 * GRAVITY);
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
  }
}

const handleMouseDown = (e) => {
  lastLocation.x = e.clientX;
  lastLocation.y = e.clientY;
  mouseDownTimestamp = Date.now();
};

const handleMouseUp = () => {
  const timeDiff = Date.now() - mouseDownTimestamp;
  let r = 10;
  r += timeDiff / 10;
  if (r > 100) r = 100;
  SHAPES.push(
    new Shape(
      (lastLocation.x - canvasOffsetX) * scaleX,
      (lastLocation.y - canvasOffsetY) * scaleY,
      r,
      getBrightColor()
    )
  );
  mouseDownTimestamp = 0;
};

c.addEventListener('mousedown', handleMouseDown);
c.addEventListener('mouseup', handleMouseUp);

const draw = () => {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < SHAPES.length; i++) {
    const shape = SHAPES[i];
    shape.update();
    shape.draw(ctx);
  }
};

setInterval(draw, 1000 / FPS);
