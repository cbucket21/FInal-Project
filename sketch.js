let img;
let player;
let circle;
let platforms = [];
let gameState;
let timer;
let score;
let startTime;
let customFont;
let isMouseBtnPressed = false; // Renamed to avoid conflicts

function preload() {
  // Load the font in the preload function
  customFont = loadFont('font.ttf');// Change the path accordingly
  img = loadImage('sea.jpeg');
}

function setup() {
  createCanvas(600, 600);
  initializeGame();

  // Set the font using textFont
  textFont(customFont);
}

function draw() {
  background(237, 125, 26);

  if (gameState === 'start') {
    showStartScreen();
  } else if (gameState === 'play') {
    image(img,0,0, width,height)
    handleGamePlay();
  } else if (gameState === 'gameOver') {
    showGameOverScreen();
  }
}

function initializeGame() {
  player = new Player(width*.5, height*.9, 30, 30);
  platforms = [
    new Platform(width * 0.35, height * 0.97, 200, 20),
    new Platform(width * 0.7, height * 0.9, 100, 20),
    new Platform(width * 0.15, height * 0.8, 125, 20),
    new Platform(width * 0.55, height * 0.75, 50, 20),
    new Platform(width * 0.8, height * 0.65, 75, 20),
    new Platform(width * 0.3, height * 0.55, 100, 20),
    new Platform(width * 0.1, height * 0.4, 100, 20),
    new Platform(width * 0.6, height * 0.5, 75, 20),
    new Platform(width * 0.4, height * 0.3, 100, 20),
    new Platform(width * 0.55, height * 0.15, 75, 20),
    new Platform(width * 0.2, height * 0.15, 75, 20),
    new Platform(width * 0.8, height * 0.35, 75, 20),
  ];
  gameState = 'start';
  timer = 60;
  score = 0;
  generateCircle();
  startTime = millis();
}

function showStartScreen() {
  fill(255);
  textSize(40);
  textAlign(CENTER, CENTER);
  text('Press Start To Play', width * 0.5, height * 0.3);

  fill(0, 255, 0);
  rect(width * 0.42, height * 0.47, 100, 40);
  fill(0);
  textSize(20);
  text('Start', width * 0.5, height * 0.5);
  
  fill(255);
  textSize(30);
  text('Collect the blue circle to gain points,',width*.5,height*.6);
  text(' get as many points as you can in 60 seconds!',width*.5,height*.7);
  text('W-A-D or Arrrow Keys to play!', width*.5,height*.85)
}

function handleGamePlay() {
  for (let platform of platforms) {
    platform.show();
    if (player.isColliding(platform)) {
      player.handleCollision(platform);
    }
  }

  player.update();
  player.show();

  if (circle && player.isCollidingCircle(circle)) {
    generateCircle();
    score++;
  }

  if (circle) {
    fill(0, 0, 255);
    ellipse(circle.x, circle.y, circle.radius * 2);
  }

  player.checkCanvasBoundaries();

  fill(255);
  textSize(20);
  const elapsedTime = millis() - startTime;
  const remainingTime = max(0, 60 - int(elapsedTime / 1000));
  text('Time: ' + remainingTime, 50, 30);

  // Update and check timer
  if (remainingTime <= 0) {
    gameState = 'gameOver';
  }

  // Draw the "Stop" button
  fill(255, 0, 0);
  rect(width * 0.85, height * 0.02, 80, 40);
  fill(255);
  textSize(16);
  text('Stop', width * 0.92, height * 0.05);

  // Check for mouse click on the "Stop" button during the game
  if (isMouseBtnPressed && mouseOverButton(width * 0.92, height * 0.05, 80, 40)) {
    gameState = 'gameOver';
  }
}

function showGameOverScreen() {
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Game Over', width * 0.5, height * 0.35);
  text('Score: ' + score, width * 0.5, height * 0.4);

  fill(0, 255, 0);
  rect(width*.33, height*.58, 80, 40);
  fill(0);
  textSize(16);
  text('Replay', width*.4, height*.61);

  fill(255, 0, 0);
  rect(width*.53, height*.58, 80, 40);
  fill(255);
  text('Save', width*.6, height*.61);
}

function keyPressed() {
  if (gameState === 'play') {
    if (key === 'd' || keyCode === RIGHT_ARROW) {
      player.move(1);
    } else if (key === 'a' || keyCode === LEFT_ARROW) {
      player.move(-1);
    } else if ((key === 'w' || keyCode === UP_ARROW) && !player.isJumping) {
      player.jump();
    }
  }
}

function keyReleased() {
  if ((key == 'd' || keyCode === RIGHT_ARROW) && player.xSpeed > 0) {
    player.move(0);
  } else if ((key == 'a' || keyCode === LEFT_ARROW) && player.xSpeed < 0) {
    player.move(0);
  }
}

function mouseClicked() {
  if (gameState === 'start') {
    // Handle mouse click in the start screen
    if (mouseOverButton(width * 0.42, height * 0.47, 100, 40)) {
      gameState = 'play';
    }
  } else if (gameState === 'gameOver') {
    // Handle mouse click in the game over screen
    if (mouseOverButton(width*.33, height*.58, 80, 40)) {
      initializeGame();
    } else if (mouseOverButton(width*.53, height*.58, 80, 40)) {
      saveCanvas('canvas', 'png');
    }
  } else if (gameState === 'play' && mouseOverButton(width * 0.85, height * 0.05, 80, 40)) {
    // Handle mouse click during the game (e.g., stop button)
    gameState = 'gameOver';
  }
}

function mouseOverButton(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

class Player {
  constructor() {
    this.width = 30;
    this.height = 30;
    this.x = width*.5 - this.width*.5;
    this.y = height - this.height;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.gravity = 0.8;
    this.jumpStrength = -12
    this.isJumping = false;
  }

  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.ySpeed += this.gravity;

    if (this.y > height - this.height) {
      this.y = height - this.height;
      this.ySpeed = 0;
      this.isJumping = false;
    }
  }

  jump() {
    if (!this.isJumping) {
      this.ySpeed = this.jumpStrength;
      this.isJumping = true;
    }
  }

  show() {
    fill(255, 0, 0);
    rect(this.x, this.y, this.width, this.height);
  }

  move(dir) {
    this.xSpeed = dir * 5;
  }

  isColliding(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  handleCollision(platform) {
    if (this.y + this.height > platform.y && this.y < platform.y + platform.height) {
      this.y = platform.y - this.height;
      this.ySpeed = 0;
      this.isJumping = false;
   }else if (this.ySpeed > 0 && this.y + this.height < platform.y) {
    // Allow jumping only when the player is on the ground (not colliding from the top)
    this.isJumping = false;
    }
  }

  isCollidingCircle(circle) {
    const distance = dist(this.x, this.y, circle.x, circle.y);
    return distance < this.width*.5 + circle.radius;
  }

  checkCanvasBoundaries() {
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x + this.width > width) {
      this.x = width - this.width;
    }
  }
}

class Platform {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  show() {
    if (this.y>height*.6){
      fill(255);
    }
    else if (this.y<height*.6 && this.y>height*.3){
      fill(155);
    }
    else {
      fill(0);
    }
    //fill(0, 0, 0);
    
    rect(this.x, this.y, this.width, this.height);
  }
}

function generateCircle() {
  const diameter = 30;
  circle = {
    x: random(diameter, width - diameter),
    y: random(diameter, height - diameter),
    radius: diameter*.5,
  };
}