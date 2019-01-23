// Game Constants (sizes/speeds/colors of things)
var CANVAS_WIDTH             = 600;
var CANVAS_HEIGHT            = 400;
var CANVAS_BACKGROUND_COLOR  = "rgb(0, 16, 64)"; // midnight blue
var CANVAS_DEFAULT_COLOR     = "rgb(255, 0, 0)"; // RED; only used for stuff that fail to set own color
var PADDLE_WIDTH             =  75;
var PADDLE_HEIGHT            =  15;
var PADDLE_SPACER            =   5; // how far above bottom of canvas paddle should hover
var PADDLE_COLOR             = "rgb(232, 166, 62)";
var BALL_RADIUS              =   5;
var BALL_MAX_VELOCITY        =   4; // pixels per frame
var BALL_COLOR               = "rgb(145, 255, 244)";
var BLOCK_WIDTH              =  80;
var BLOCK_HEIGHT             =  20;
var BLOCK_HORIZONTAL_PADDING =   5; // horizontal space between adjacent blocks
var BLOCK_VERTICAL_PADDING   =   5; // vertical space between adjacent blocks
var BLOCK_COLOR              = "rgb(62, 232, 119)";


// Keypad object constructor
function KeypadConstructor() {
	this.left  = false;
	this.right = false;

	this.pressed = function (event) {
		if (event.keyCode == 37) {
			this.left = true;
		}
		if (event.keyCode == 39) {
			this.right = true;
		}
	}

	this.released = function (event) {
		if (event.keyCode == 37) {
			this.left = false;
		}
		if (event.keyCode == 39) {
			this.right = false;
		}
	}

	document.addEventListener("keydown", this.pressed.bind(this), false);
	document.addEventListener("keyup", this.released.bind(this), false);
}


// Paddle object constructor
function PaddleConstructor(context, keypad) {
	this.context = context;
	this.keypad  = keypad;
	this.x       = Math.floor(CANVAS_WIDTH / 2) - Math.floor(PADDLE_WIDTH / 2);
	this.y       = CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_SPACER;
	this.draw    = function() {
		this.context.save();
		this.context.fillStyle = PADDLE_COLOR;
		this.context.fillRect(this.x, this.y, PADDLE_WIDTH, PADDLE_HEIGHT);
		this.context.restore();
	}
	this.move = function() {
		if (this.keypad.left) {
			if (this.x - 5 < 0) {
				this.x = 0;
			} else {
				this.x -= 5;
			}
		}
		if (this.keypad.right) {
			if (this.x + 5 + PADDLE_WIDTH > CANVAS_WIDTH) {
				this.x = CANVAS_WIDTH - PADDLE_WIDTH;
			} else {
				this.x += 5;
			}
		}
	}
}


// Ball object constructor
function BallConstructor(context) {
	this.context = context;
	this.y       = Math.floor(CANVAS_HEIGHT / 2);
	this.x       = Math.floor(CANVAS_WIDTH / 2);
	this.vy      = Math.random() * 2 * BALL_MAX_VELOCITY - BALL_MAX_VELOCITY;
	this.vx      = Math.sqrt(BALL_MAX_VELOCITY ** 2 - this.vy ** 2);
	if (Math.floor(Math.random() * 2) == 0) {
		this.vx *= -1;
	}

	this.draw = function() {
		this.context.save();
		this.context.fillStyle = BALL_COLOR;
		this.context.beginPath();
		this.context.arc(this.x, this.y, BALL_RADIUS, 0, 2 * Math.PI);
		this.context.fill();
		this.context.restore();

	}

	this.move = function() {
		this.x += this.vx;
		this.y += this.vy;
	}
}


// Block object constructor
function BlockConstructor(context, x, y) {
	this.context = context;
	// Location of top-left corner of the block
	this.x = x;
	this.y = y;
	this.draw = function() {
		this.context.save();
		this.context.fillStyle = BLOCK_COLOR;
		this.context.fillRect(this.x, this.y, BLOCK_WIDTH, BLOCK_HEIGHT);
		this.context.restore();
	}
}


function startGame() {
	// Get HTML DOM elements (<canvas id="blocky">) and associated 2D drawing context
	var canvas    = document.getElementById("blocky");
	canvas.width  = CANVAS_WIDTH;  // update HTML <canvas> element's width
	canvas.height = CANVAS_HEIGHT; // update HTML <canvas> element's height
	var context   = canvas.getContext("2d");

	// Create out main game elements (a keypad controller, paddle, ball, and some blocks)
	var keypad    = new KeypadConstructor();
	var paddle    = new PaddleConstructor(context, keypad);
	var ball      = new BallConstructor(context);
	var blocks    = [];
	var rows      = Math.floor(
		(CANVAS_HEIGHT / 2 - BLOCK_VERTICAL_PADDING) / (BLOCK_HEIGHT + BLOCK_VERTICAL_PADDING)
	);
	for (var i = 0; i < rows; i++) {
		var y = BLOCK_VERTICAL_PADDING + (i * (BLOCK_HEIGHT + BLOCK_VERTICAL_PADDING));
		var rowOffset    = Math.floor((BLOCK_WIDTH + BLOCK_HORIZONTAL_PADDING) / 3) * (i % 3);
		var blocksPerRow = Math.floor(
			(CANVAS_WIDTH - BLOCK_HORIZONTAL_PADDING - rowOffset) /
			(BLOCK_WIDTH + BLOCK_HORIZONTAL_PADDING)
		);
		for (var j = 0; j < blocksPerRow; j++) {
			var x = BLOCK_HORIZONTAL_PADDING + rowOffset + (
				j * (BLOCK_WIDTH + BLOCK_HORIZONTAL_PADDING));
			blocks.push(new BlockConstructor(context, x, y));
		}
	}

	// Draw the initial frame with everything at it's starting/default position
	drawFrame(context, paddle, ball, blocks);

	// Process the first action frame (will recursive call itself; redraws after processing)
	nextFrame(context, paddle, ball, blocks);
}


function drawFrame(context, paddle, ball, blocks) {
	// Clear previous frame's drawing and draw/fill our main background color
	context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	context.fillStyle = CANVAS_BACKGROUND_COLOR;
	context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	context.fillStyle = CANVAS_DEFAULT_COLOR;

	// Draw main game objects as they currently are positioned (positioned here on last frame)
	paddle.draw();
	ball.draw();
	for (var i = 0; i < blocks.length; i++) {
		blocks[i].draw();
	}
}


function moveObjects(paddle, ball, blocks) {
	// Move objects according to velocity and keyboard input; calculate collisions; determine
	// resulting game effects (ball bouncing, game ending, etc).
	//
	// If we return true, that indicates to the caller that the game is over. Otherwise the game
	// should continue.
	var partialX, overlapX, overlapY;
	var percentage;
	var sideBounce = 0; // 0 means didn't bounce off wall, -1 means left, 1 means right
	var oldX = ball.x;
	var oldY = ball.y;

	// Just move the paddle now according to keyboard input
	paddle.move();

	// Move the ball optimistically (we'll adjust it's position/velocity if there's a collision)
	ball.move();

	// Calculate actual new x position, taking into account possible wall collisions
	if (ball.x + BALL_RADIUS > CANVAS_WIDTH) {
		// hit right wall; reflect it back
		overlapX   = ball.x + BALL_RADIUS - CANVAS_WIDTH;
		ball.x     = CANVAS_WIDTH - BALL_RADIUS - overlapX;
		ball.vx   *= -1;
		sideBounce =  1;
	} else if (ball.x - BALL_RADIUS < 0) {
		// hit left wall; reflect it back
		overlapX   = BALL_RADIUS - ball.x;
		ball.x     = BALL_RADIUS + overlapX;
		ball.vx   *= -1;
		sideBounce = -1;
	}

	// See if there's any possibility for a paddle collision
	if (ball.y + BALL_RADIUS >= paddle.y) {
		// See if the bottom of the ball went from above paddle top height to below
		// (exactly at it) during this animation frame. If we crossed over that height
		// then we'll definitely need to look at where the paddle was for a collision
		if (oldY + BALL_RADIUS < paddle.y) {
			// Okay, where exactly was the ball (left/right) when it was at the
			// paddle top height?
			overlapY = ball.y + BALL_RADIUS - paddle.y;
			if (overlapY > 0) {
				percentage = ball.vy / overlapY;
				partialX   = oldX + (ball.vx * percentage);
				if (sideBounce != 0) {
					partialX = oldX + (ball.vx * -1 * percentage);
				}
				if (sideBounce > 0 && partialX + BALL_RADIUS > CANVAS_WIDTH) {
					overlapX = partialX + BALL_RADIUS - CANVAS_WIDTH;
					partialX = CANVAS_WIDTH - overlapX;
				} else if (sideBounce < 0 && partialX - BALL_RADIUS < 0) {
					partialX = BALL_RADIUS - partialX;
				}
				if (partialX >= paddle.x && partialX <= paddle.x + PADDLE_WIDTH) {
					// Bounce off paddle and handle Y movement
					ball.y   = paddle.y - overlapY - BALL_RADIUS;
					ball.vy *= -1;
					return false;
				}
			} else { // we expect overlapY to be exactly 0 in this case
				if (ball.x >= paddle.x && ball.x <= paddle.x + PADDLE_WIDTH) {
					// Bounce off paddle
					ball.vy *= -1;
					return false;
				}
			}
		}
	}

	// Calculate actual new y position, taking into account possible wall collisions
	if (ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
		// hit bottom wall: GAME OVER!
		return true;
	} else if (ball.y - BALL_RADIUS < 0) {
		// hit top wall; reflect it back
		overlapY = BALL_RADIUS - ball.y;
		ball.y   = BALL_RADIUS + overlapY;
		ball.vy *= -1;
	}
	return false;
}


function nextFrame(context, paddle, ball, blocks) {
	// Move stuff and calculate any collisions and their consequences
	if (moveObjects(paddle, ball, blocks)) {
		// GAME OVER! Stop animation/program by returning w/out scheduling/requesting
		//            a next animation frame.
		context.textAlign    = "center";
		context.textBaseline = "middle";
		context.font         = "bold 80px sans-serif";
		context.beginPath();
		context.fillText("GAME OVER!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH);
		return;
	}

	// Draw the frame with everything at it's new position
	drawFrame(context, paddle, ball, blocks);

	// Request to draw next frame when browser is ready:
	requestAnimationFrame(nextFrame.bind(this, context, paddle, ball, blocks));
}

