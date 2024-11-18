/**
 * Author: Suryansh Mishra
 * Simulation of physics bounce effect: collision working w/ gravity
 * Current version focuses only on handling balls as objects for simulation
 */

class Shape {
  holdFPS = 0;
  shouldHoldAtStop = false;

  static SHAPE_TYPES = {
    CIRCLE: 'CIRCLE',
    SQUARE: 'SQUARE',
  };

  constructor(simulator, x, y, r, color) {
    // Handle boundaries
    if (y < r) y = r;
    if (x < r) x = r;
    if (y + r > simulator.height) y = simulator.height - r;
    if (x + r > simulator.width) x = simulator.width - r;

    this.initialY = y;
    this.x = x;
    this.y = y;
    this.dy = 0;
    this.r = r;
    this.color = color;
    this.movement = Simulator.MOVEMENTS.DOWN;
  }

  update(simulator) {
    const a = simulator.gravity;
    const currentDy = this.dy;
    this.dy = currentDy + (a * simulator.units) / simulator.fps;
    const deltaY = (Math.pow(this.dy, 2) - Math.pow(currentDy, 2)) / (2 * a);
    this.y = this.y + deltaY;
    if (
      this.movement === Simulator.MOVEMENTS.DOWN &&
      this.y + this.r >= simulator.height
    ) {
      this.dy = -this.dy;
      this.y = simulator.height - this.r;
      this.movement = Simulator.MOVEMENTS.UP;
    }
    if (this.movement === Simulator.MOVEMENTS.UP && this.y <= this.initialY) {
      this.dy = 0;
      this.y = this.initialY;
      this.movement = Simulator.MOVEMENTS.DOWN;
    }
  }

  drawOnContext(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// Create application class
/**
 * Configure the ctx, init width and setup resize handler
 * Setup event listener for mouse down and mouse up
 * Setup whether size is fixed or we want tap and create different radius balls
 * Set the gravity
 * Set the fps
 * Get different shapes ! SKIP
 * Setup trail? ! Next priority
 * Setup color for simulator
 */

class Simulator {
  shapes = [];
  gravity = 9.8;
  fps = 60; // default
  units = 7.5;
  height = 0;
  width = 0;

  isActive = false;
  canvas = undefined;
  ctx = undefined;

  lastMouseLocation = { x: 0, y: 0 };
  scaleX = 1;
  scaleY = 1;
  canvasOffsetX = 0;
  canvasOffsetY = 0;
  mouseDownTimestamp = 0;
  isColorFixed = false;
  fixedColor = 'red';
  fixedShapeSize = 5;
  isShapeSizeFixed = false;
  background = 'black';

  static MOVEMENTS = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
  };

  interval = undefined;

  constructor(canvasId, fps, units = 7.5) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas)
      throw new Error('Simulator Error: Canvas element not setup');
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) throw new Error('Simulator Error: Canvas context not setup');
    window.addEventListener('resize', this.setCanvasVariables);
    this.setCanvasVariables();
    this.initEventListeners();
    this.fps = fps;
    this.units = units;
    this.isActive = true;
  }

  getRandomColor = () => {
    const h = Math.floor(Math.random() * 360); // Random hue
    const s = Math.floor(Math.random() * 61) + 40; // Saturation: 40% to 100%
    const l = Math.floor(Math.random() * 41) + 50; // Lightness: 50% to 90%
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  setCanvasVariables = () => {
    const { width, height, x, y } = this.canvas.getBoundingClientRect();
    this.canvasOffsetX = x;
    this.canvasOffsetY = y;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.scaleX = this.width / width;
    this.scaleY = this.height / height;
  };

  useFixedColor = (bool) => {
    this.isColorFixed = bool;
  };

  setFixedColor = (color) => {
    this.fixedColor = color;
  };

  useFixedShapeSize = (bool) => {
    this.isShapeSizeFixed = bool;
  };

  setFixedShapeSize = (shapeSize) => {
    this.fixedShapeSize = shapeSize;
  };

  setBackground = (bgColor) => {
    this.background = bgColor;
    this.canvas.style.backgroundColor = this.background;
  };

  handleMouseDown = (e) => {
    this.lastMouseLocation.x = e.clientX;
    this.lastMouseLocation.y = e.clientY;
    this.mouseDownTimestamp = Date.now();
  };

  handleMouseUp = () => {
    const timeDiff = Date.now() - this.mouseDownTimestamp;
    let r = 10;
    r += timeDiff / 10;
    if (r > 100) r = 100;
    const currentColor = this.isColorFixed
      ? this.fixedColor
      : this.getRandomColor();
    this.shapes.push(
      new Shape(
        this,
        (this.lastMouseLocation.x - this.canvasOffsetX) * this.scaleX,
        (this.lastMouseLocation.y - this.canvasOffsetY) * this.scaleY,
        r,
        currentColor
      )
    );
    this.mouseDownTimestamp = 0;
  };

  initEventListeners = () => {
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
  };

  drawShapes = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.shapes.length; i++) {
      const shape = this.shapes[i];
      shape.update(this);
      shape.drawOnContext(this.ctx);
    }
  };

  start = () => {
    if (!this.interval) setInterval(this.drawShapes, 1000 / this.fps);
  };

  stop = () => {
    if (this.interval) clearInterval(this.interval);
  };

  pushShape = (shape) => {
    this.shapes.push(shape);
  };
}

const s = new Simulator('canvas', 75);
s.start();
