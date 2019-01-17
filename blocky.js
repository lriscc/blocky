
var canvas;
var context;
var paddle = {
	width : 75,
	height: 15,
	spacer:  5,
	x     : null,
	y     : null,
	init: function() {
		this.y = canvas.height - this.height - this.spacer;
		this.x = canvas.width / 2 - this.width / 2;
	},
	draw: function() {
		context.fillRect(this.x, this.y, this.width, this.height);
	},
	move: function() {
		if (keypad.left) {
			if (this.x - 5 < 0) {
				this.x = 0;
			} else {
				this.x -= 5;
			}
		}
		if (keypad.right) {
			if (this.x + 5 + this.width > canvas.width) {
				this.x = canvas.width - this.width;
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
	init: function() {
		this.y  = canvas.height / 2;
		this.x  = canvas.width / 2;
		this.my = Math.random() * 8 - 4;
		this.mx = Math.sqrt(this.v ** 2 - this.my ** 2)
		if (Math.floor(Math.random() * 2) == 0) {
			this.mx *= -1;
		}
	},
	draw: function() {
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fill();
	},
	move: function() {
		// Pre-calculate new x/y position of ball assuming no collisions
		newx = this.x + this.mx;
		oldx = this.x;
		newy = this.y + this.my;
		paddleTop = canvas.height - paddle.spacer - paddle.height;
		sideBounce = 0; // 0 means didn't bounce off wall, -1 means left, 1 means right

		// Calculate actual new x position, taking into account possible wall collisions
		if (newx + this.radius > canvas.width) {
			// hit right wall; reflect it back
			overlap    = newx + this.radius - canvas.width;
			this.x     = newx = canvas.width - this.radius - overlap;
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
					if (sideBounce > 0 && hitx + this.radius > canvas.width) {
						overlapX = hitx + this.radius - canvas.width;
						hitx     = canvas.width - overlapX;
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
		if (newy + this.radius > canvas.height) {
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

var keypad = {
	left   : false,
	right  : false,
	init   : function() {
		document.addEventListener("keydown", this.pressed.bind(this), false);
		document.addEventListener("keyup", this.released.bind(this), false);
	},
	pressed: function (event) {
		if (event.keyCode == 37) {
			this.left = true;
		}
		if (event.keyCode == 39) {
			this.right = true;
		}
	},
	released: function (event) {
		if (event.keyCode == 37) {
			this.left = false;
		}
		if (event.keyCode == 39) {
			this.right = false;
		}
	},
}

function startGame() {
	canvas  = document.getElementById("blocky");
	context = canvas.getContext("2d");
	paddle.init();
	ball.init();
	keypad.init();
	main();
}

function main() {
	context.fillStyle = "rgb(255, 0, 0)";

	// Clear previous frame's drawing
	context.clearRect(0, 0, canvas.width, canvas.height);

	paddle.draw();
	ball.draw();

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
		context.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2, canvas.width);
		return;
	}

	// Request to draw next frame when browser is ready:
	requestAnimationFrame(main);
}
