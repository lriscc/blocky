
var CANVAS_WIDTH             = 600;
var CANVAS_HEIGHT            = 400;
var BLOCK_WIDTH              =  80;
var BLOCK_HEIGHT             =  20;
var BLOCK_HORIZONTAL_PADDING =   5; // horizontal space between adjacent blocks
var BLOCK_VERTICAL_PADDING   =   5; // vertical space between adjacent blocks

// Block object constructor
function BlockConstructor(context, x, y) {
	this.context = context;
	// Location of top-left corner of the block
	this.x = x;
	this.y = y;
	this.draw = function() {
		this.context.fillRect(this.x, this.y, BLOCK_WIDTH, BLOCK_HEIGHT);
	}
}

// Keypad object constructor
function KeypadConstructor() {
	this.left  = false;
	this.right = false;
	this.init  = function() {
		document.addEventListener("keydown", this.pressed.bind(this), false);
		document.addEventListener("keyup", this.released.bind(this), false);
	}
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
}

var paddle = {
	width : 75,
	height: 15,
	spacer:  5,
	x     : null,
	y     : null,
	init: function(context, keypad) {
		this.context = context;
		this.keypad  = keypad;
		this.y = CANVAS_HEIGHT - this.height - this.spacer;
		this.x = Math.floor(CANVAS_WIDTH / 2) - Math.floor(this.width / 2);
	},
	draw: function() {
		this.context.fillRect(this.x, this.y, this.width, this.height);
	},
	move: function() {
		if (this.keypad.left) {
			if (this.x - 5 < 0) {
				this.x = 0;
			} else {
				this.x -= 5;
			}
		}
		if (this.keypad.right) {
			if (this.x + 5 + this.width > CANVAS_WIDTH) {
				this.x = CANVAS_WIDTH - this.width;
			} else {
				this.x += 5;
			}
		}
	},
};

var ball = {
	radius: 5,
	x     : null,
	y     : null,
	v     : 4,    // total constant velocity of the ball
	mx    : null, // velocity in the x direction
	my    : null, // velocity in the y direction
	init: function(context) {
		this.context = context;
		this.y  = Math.floor(CANVAS_HEIGHT / 2);
		this.x  = Math.floor(CANVAS_WIDTH / 2);
		this.my = Math.random() * 8 - 4;
		this.mx = Math.sqrt(this.v ** 2 - this.my ** 2)
		if (Math.floor(Math.random() * 2) == 0) {
			this.mx *= -1;
		}
	},
	draw: function() {
		this.context.beginPath();
		this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		this.context.fill();
	},
	move: function() {
		// Pre-calculate new x/y position of ball assuming no collisions
		newx = this.x + this.mx;
		oldx = this.x;
		newy = this.y + this.my;
		paddleTop = CANVAS_HEIGHT - paddle.spacer - paddle.height;
		sideBounce = 0; // 0 means didn't bounce off wall, -1 means left, 1 means right

		// Calculate actual new x position, taking into account possible wall collisions
		if (newx + this.radius > CANVAS_WIDTH) {
			// hit right wall; reflect it back
			overlap    = newx + this.radius - CANVAS_WIDTH;
			this.x     = newx = CANVAS_WIDTH - this.radius - overlap;
			this.mx   *= -1;
			sideBounce =  1;
		} else if (newx - this.radius < 0) {
			// hit left wall; reflect it back
			overlap    = this.radius - newx;
			this.x     = newx = this.radius + overlap;
			this.mx   *= -1;
			sideBounce = -1;
		} else {
			this.x = newx;
		}

		// See if there's any possibility for a paddle collision
		if (newy + this.radius >= paddleTop) {
			// See if the bottom of the ball went from above paddleTop height to below
			// (exactly at it) during this animation frame. If we crossed over that height
			// then we'll definitely need to look at where the paddle was for a collision
			if (this.y + this.radius < paddleTop) {
				// Okay, where exactly was the ball (left/right) when it was at the
				// paddleTop height?
				bottomHeight = newy + this.radius;
				overlap      = bottomHeight - paddleTop;
				if (overlap < 0) {
					percentage = this.my / overlap;
					hitx = oldx + (this.mx * percentage);
					if (sideBounce > 0 && hitx + this.radius > CANVAS_WIDTH) {
						overlapX = hitx + this.radius - CANVAS_WIDTH;
						hitx     = CANVAS_WIDTH - overlapX;
					} else if (sideBounce < 0 && hitx - this.radius < 0) {
						hitx = this.radius - hitx;
					}
					if (hitx >= paddle.x && hitx <= paddle.x + paddle.width) {
						// Bounce off paddle and handle Y movement
						this.y   = paddleTop - overlap - this.radius;
						this.my *= -1;
						return false;
					}
				} else { // we expect overlap to be exactly 0 in this case
					if (newx >= paddle.x && newx <= paddle.x + paddle.width) {
						// Bounce off paddle and handle Y movement
						this.y   = newy;
						this.my *= -1;
						return false;
					}
				}
			}
		}

		// Calculate actual new y position, taking into account possible wall collisions
		if (newy + this.radius > CANVAS_HEIGHT) {
			// hit bottom wall: GAME OVER!
			return true;
		} else if (newy - this.radius < 0) {
			// hit top wall; reflect it back
			overlap  = this.radius - newy;
			this.y   = this.radius + overlap;
			this.my *= -1;
		} else {
			this.y = newy;
		}
		return false;
	},
};

function startGame() {
	var keypad    = new KeypadConstructor()
	var canvas    = document.getElementById("blocky");
	var blocks    = [];
	canvas.width  = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;
	context       = canvas.getContext("2d");

	// create bricky blocks for blocky
	var rows = Math.floor(
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
	keypad.init();
	paddle.init(context, keypad);
	ball.init(context);
	main(context, paddle, ball, blocks);
}

function main(context, paddle, ball, blocks) {
	context.fillStyle = "rgb(255, 0, 0)";

	// Clear previous frame's drawing
	context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
	requestAnimationFrame(main.bind(this, context, paddle, ball, blocks));
}
