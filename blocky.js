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
var BALL_VELOCITY            =   4; // pixels per frame
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

	this.draw = function() {
		this.context.save();
		this.context.fillStyle = PADDLE_COLOR;
		this.context.fillRect(Math.floor(this.x), Math.floor(this.y),
			PADDLE_WIDTH, PADDLE_HEIGHT);
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
	var startingAngle = Math.random() * 2 * Math.PI; // random angle in radians
	this.context = context;
	this.y       = Math.floor(CANVAS_HEIGHT / 2);
	this.x       = Math.floor(CANVAS_WIDTH / 2);
	this.vy      = Math.sin(startingAngle) * BALL_VELOCITY;
	this.vx      = Math.cos(startingAngle) * BALL_VELOCITY;

	this.draw = function() {
		this.context.save();
		this.context.fillStyle = BALL_COLOR;
		this.context.beginPath();
		this.context.arc(Math.floor(this.x), Math.floor(this.y), BALL_RADIUS, 0, 2 * Math.PI);
		this.context.fill();
		this.context.restore();

	}

	this.move = function() {
		// Optimistically move ball (as if there are no collisions)
		this.x += this.vx;
		this.y += this.vy;
	}

	this.inBounds = function() {
		// Return true if current position is fully within the canvas
		if (this.x - BALL_RADIUS < 0) {
			return false; // outside left boundary
		}
		if (this.x + BALL_RADIUS > CANVAS_WIDTH) {
			return false; // outside right boundary
		}
		if (this.y - BALL_RADIUS < 0) {
			return false; // outside top boundary
		}
		if (this.y + BALL_RADIUS > CANVAS_HEIGHT) {
			return false; // outside bottom boundary
		}
		return true;
	}

	this.touchingPaddle = function(paddle) {
		// Return true if ball touching/intersecting paddle at all
		return circleTouchingRectangle(this.x, this.y, BALL_RADIUS,
			paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
	}

	this.touchingBlocks = function(blocks) {
		// Return array of all blocks that ball is touching/intersecting or null if it's
		// not touching/intersecting any of the blocks
		var touching = [];
		for (var i = 0; i < blocks.length; i++) {
			if (circleTouchingRectangle(this.x, this.y, BALL_RADIUS,
				blocks[i].x, blocks[i].y, BLOCK_WIDTH, BLOCK_HEIGHT)) {
				touching.push(blocks[i]);
			}
		}
		if (touching.length > 0) {
			return touching;
		}
		return null;
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
	var partialX, reboundX, reboundY;
	var percentage;
	var oldX = ball.x;
	var oldY = ball.y;

	// Just move the paddle now according to keyboard input
	paddle.move();

	// Move the ball optimistically (we'll adjust it's position/velocity if there's a collision)
	ball.move();

	// If ball's movement put's it in a clean position, we're done
	var ballInBounds       = ball.inBounds();
	var ballTouchingPaddle = ball.touchingPaddle(paddle);
	var ballTouchingBlocks = ball.touchingBlocks(blocks);
	if (ballInBounds && !ballTouchingPaddle && !ballTouchingBlocks) {
		return false; // no more checking to do; game not over
	}

	// Performce simple wall collision cases
	if (!ballInBounds) {
		// If ball has already hit or crossed the bottom canvas boundary we're _probably_ done
		if (ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
			// If center of ball had already passed paddle's top when frame began, it's over.
			// Otherwise, if we didn't have a paddle collision, it's over.
			if (oldY >= paddle.y || !ballTouchingPaddle) {
				return true; // Game over
			}
			// If we made it here, the ball's starting position this frame had the middle of
			// the ball above the top of the paddle, _and_ we're currently overlapping or
			// touching the paddle. So, process this collision:
			// TODO: perform this collision if/when we care (this is an unlikely event)
			console.log("TODO: edge-case #1; perhaps it's not as unlikely as we thought.");
			return true; // Ending game
		}

		// As we said above, let's only process _simple_ wall collision cases
		if (!ballTouchingPaddle && !ballTouchingBlocks) {
			// Did we collide with one of the side walls?
			if (ball.x + BALL_RADIUS > CANVAS_WIDTH) {
				// hit right wall; reflect it back
				reboundX = ball.x + BALL_RADIUS - CANVAS_WIDTH;
				ball.x  -= reboundX * 2;
				ball.vx *= -1;
			} else if (ball.x - BALL_RADIUS < 0) {
				// hit left wall; reflect it back
				reboundX = BALL_RADIUS - ball.x;
				ball.x  += reboundX * 2;
				ball.vx *= -1;
			}

			// Did we collide with top or bottom walls?
			if (ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
				// hit bottom wall: GAME OVER! (should have been handled above)
				console.log("ERROR: hit unexpected code-path #1; something is weird");
				return true;
			} else if (ball.y - BALL_RADIUS < 0) {
				// hit top wall; reflect it back
				reboundY = BALL_RADIUS - ball.y;
				ball.y  += reboundY * 2;
				ball.vy *= -1;
			}
			return false; // done moving ball; game not over
		}
	}

	// Handle paddle collision
	if (ballTouchingPaddle) {
		if (ballInBounds) { // easy collision; ball only hit paddle (not a wall too)
			if (oldY < paddle.y) {
				// center of ball _was_ above top of paddle
				reboundY = (ball.y + BALL_RADIUS) - paddle.y;
				ball.y  -= reboundY * 2;
				ball.vy *= -1;
				return false; // done moving ball; game not over
			}
			// Looks like we probably just hit the side edge of the paddle
			if (oldX < paddle.x + (PADDLE_WIDTH / 2)) {
				// Hit left side of paddle
				reboundX = (ball.x + BALL_RADIUS) - paddle.x;
				ball.x  -= reboundX * 2;
				ball.vx *= -1;
				if (ball.x - BALL_RADIUS < 0) {
					console.log("TODO: edge-case #2 hit; write code to handle it.");
				}
			} else {
				// Hit right side of paddle
				reboundX = (paddle.x + PADDLE_WIDTH) - (ball.x - BALL_RADIUS);
				ball.x  += reboundX * 2;
				ball.vx *= -1;
				if (ball.x + BALL_RADIUS > CANVAS_WIDTH) {
					console.log("TODO: edge-case #3 hit; write code to handle it.");
				}
			}
			return false; // done moving ball; game not over yet (will be soon)
		}

		// Difficult corner collision; ball simultaneously hit paddle and
		// a wall (!ballInBounds)
		if (oldY < paddle.y) {
			// Whether ball is squashed between paddle and wall or is just a
			// simultanous corner collision, if center of ball _was_ above top of
			// paddle line, make ball bounce up and away from paddle/wall as
			// necessary to free it
			reboundY = (ball.y + BALL_RADIUS) - paddle.y;
			ball.y  -= reboundY * 2;
			ball.vy *= -1;
			if (ball.x - BALL_RADIUS < 0) {
				// Left wall
				reboundX = BALL_RADIUS - ball.x;
				ball.x  += reboundX * 2;
			} else if (ball.x + BALL_RADIUS > CANVAS_WIDTH) {
				// Right wall
				reboundX = (ball.x + BALL_RADIUS) - CANVAS_WIDTH;
				ball.x  -= reboundX * 2;
			}
			ball.vx *= -1;
			return false; // done moving ball; game not over
		}

		// User trapped ball between paddle and wall; "warp" ball w/new position & angle
		// New angle will be upward by at least 45 degrees or more
		var startingAngle = Math.random() * (Math.PI / 2) + (Math.PI / 4);
		ball.y  = Math.floor(CANVAS_HEIGHT / 2);
		ball.x  = Math.floor(CANVAS_WIDTH / 2);
		ball.vy = Math.sin(startingAngle) * BALL_VELOCITY;
		ball.vx = Math.cos(startingAngle) * BALL_VELOCITY;
		return false; // done moving ball; game not over
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

