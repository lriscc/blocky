
var canvas;
var context;
var paddle = {
	width : 75,
	height: 15,
	x     : null,
	y     : null,
	init: function(canvas) {
		this.y = canvas.height - this.height - 5;
		this.x = canvas.width / 2 - this.width / 2;
	},
	draw: function(canvas, context) {
		context.fillRect(this.x, this.y, this.width, this.height);
	},
	move: function() {
		if (keypad.left) {
			this.x -= 5;
		}
		if (keypad.right) {
			this.x += 5;
		}
	},
};

var ball = {
	radius: 5,
	x     : null,
	y     : null,
	mx    : 3, // velocity in the x direction
	my    : 3, // velocity in the y direction
	init: function(canvas) {
		this.y = canvas.height / 2;
		this.x = canvas.width / 2;
	},
	draw: function(canvas, context) {
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fill();
	},
	move: function() {
		this.x += this.mx;
		this.y += this.my;
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
	paddle.init(canvas);
	ball.init(canvas);
	keypad.init();
	main();
}

function main() {
	context.fillStyle = "rgb(255, 0, 0)";

	// Clear previous frame's drawing
	context.clearRect(0, 0, canvas.width, canvas.height);

	paddle.draw(canvas, context);
	ball.draw(canvas, context);

	// Move the paddle
	paddle.move();

	// Move the ball
	ball.move();

	// Request to draw next frame when browser is ready:
	requestAnimationFrame(main);
}
