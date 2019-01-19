// Game Constants (sizes/speeds/colors of things)
var CANVAS_WIDTH             = 600;
var CANVAS_HEIGHT            = 400;
var CANVAS_BACKGROUND_COLOR  = "rgb(0, 16, 64)"; // midnight blue
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
function BallConstructor(context, paddle) {
	this.context = context;
	this.paddle  = paddle;
	this.y       = Math.floor(CANVAS_HEIGHT / 2);
	this.x       = Math.floor(CANVAS_WIDTH / 2);
	this.my      = Math.random() * 2 * BALL_MAX_VELOCITY - BALL_MAX_VELOCITY;
	this.mx      = Math.sqrt(BALL_MAX_VELOCITY ** 2 - this.my ** 2);
	if (Math.floor(Math.random() * 2) == 0) {
		this.mx *= -1;
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
		// Pre-calculate new x/y position of ball assuming no collisions
		newx = this.x + this.mx;
		oldx = this.x;
		newy = this.y + this.my;
		paddleTop = CANVAS_HEIGHT - PADDLE_SPACER - PADDLE_HEIGHT;
		sideBounce = 0; // 0 means didn't bounce off wall, -1 means left, 1 means right

		// Calculate actual new x position, taking into account possible wall collisions
		if (newx + BALL_RADIUS > CANVAS_WIDTH) {
			// hit right wall; reflect it back
			overlap    = newx + BALL_RADIUS - CANVAS_WIDTH;
			this.x     = newx = CANVAS_WIDTH - BALL_RADIUS - overlap;
			this.mx   *= -1;
			sideBounce =  1;
		} else if (newx - BALL_RADIUS < 0) {
			// hit left wall; reflect it back
			overlap    = BALL_RADIUS - newx;
			this.x     = newx = BALL_RADIUS + overlap;
			this.mx   *= -1;
			sideBounce = -1;
		} else {
			this.x = newx;
		}

		// See if there's any possibility for a paddle collision
		if (newy + BALL_RADIUS >= paddleTop) {
			// See if the bottom of the ball went from above paddleTop height to below
			// (exactly at it) during this animation frame. If we crossed over that height
			// then we'll definitely need to look at where the paddle was for a collision
			if (this.y + BALL_RADIUS < paddleTop) {
				// Okay, where exactly was the ball (left/right) when it was at the
				// paddleTop height?
				bottomHeight = newy + BALL_RADIUS;
				overlap      = bottomHeight - paddleTop;
				if (overlap < 0) {
					percentage = this.my / overlap;
					hitx = oldx + (this.mx * percentage);
					if (sideBounce > 0 && hitx + BALL_RADIUS > CANVAS_WIDTH) {
						overlapX = hitx + BALL_RADIUS - CANVAS_WIDTH;
						hitx     = CANVAS_WIDTH - overlapX;
					} else if (sideBounce < 0 && hitx - BALL_RADIUS < 0) {
						hitx = BALL_RADIUS - hitx;
					}
					if (hitx >= this.paddle.x && hitx <= this.paddle.x + PADDLE_WIDTH) {
						// Bounce off paddle and handle Y movement
						this.y   = paddleTop - overlap - BALL_RADIUS;
						this.my *= -1;
						return false;
					}
				} else { // we expect overlap to be exactly 0 in this case
					if (newx >= this.paddle.x && newx <= this.paddle.x + PADDLE_WIDTH) {
						// Bounce off paddle and handle Y movement
						this.y   = newy;
						this.my *= -1;
						return false;
					}
				}
			}
		}

		// Calculate actual new y position, taking into account possible wall collisions
		if (newy + BALL_RADIUS > CANVAS_HEIGHT) {
			// hit bottom wall: GAME OVER!
			return true;
		} else if (newy - BALL_RADIUS < 0) {
			// hit top wall; reflect it back
			overlap  = BALL_RADIUS - newy;
			this.y   = BALL_RADIUS + overlap;
			this.my *= -1;
		} else {
			this.y = newy;
		}
		return false;
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
	context       = canvas.getContext("2d");

	// Create out main game elements (a keypad controller, paddle, ball, and some blocks)
	var keypad    = new KeypadConstructor();
	var paddle    = new PaddleConstructor(context, keypad);
	var ball      = new BallConstructor(context, paddle);
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
	nextFrame(context, paddle, ball, blocks);
}


function nextFrame(context, paddle, ball, blocks) {

	// Clear previous frame's drawing and draw/fill our main background color
	context.fillStyle = CANVAS_BACKGROUND_COLOR;
	context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	context.fillStyle = "rgb(255, 0, 0)";
	paddle.draw();
	ball.draw();
	for (var i = 0; i < blocks.length; i++) {
		blocks[i].draw();
	}

	// Move the paddle
	paddle.move();

	// Move the ball
	if (ball.move()) {
		// GAME OVER! Stop animation/program by returning w/out scheduling/requesting
		//            a next animation frame.
		context.textAlign    = "center";
		context.textBaseline = "middle";
		context.font         = "bold 80px sans-serif";
		context.beginPath();
		context.fillText("GAME OVER!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH);
		return;
	}

	// Request to draw next frame when browser is ready:
	requestAnimationFrame(nextFrame.bind(this, context, paddle, ball, blocks));
}

