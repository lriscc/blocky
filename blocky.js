
var canvas;
var context;
var paddle = {
	width : 75,
	height: 15,
	x     : null,
	y     : null,
	init  : function(canvas) {
		this.y = canvas.height - this.height - 5;
		this.x = canvas.width / 2 - this.width / 2;
	},
	draw  : function(canvas, context) {
		context.fillRect(this.x, this.y, this.width, this.height);
	},
};

var rightPressed = false;
var leftPressed = false;

function keyDownHandler(event) {
	if (event.keyCode == 37) {
		leftPressed = true;
	}
	if (event.keyCode == 39) {
		rightPressed = true;
	}
}

function keyUpHandler(event) {
	if (event.keyCode == 37) {
		leftPressed = false;
	}
	if (event.keyCode == 39) {
		rightPressed = false;
	}
}

function startGame() {
	canvas  = document.getElementById("blocky");
	context = canvas.getContext("2d");
	paddle.init(canvas);
	document.addEventListener('keydown', keyDownHandler, false);
	document.addEventListener('keyup', keyUpHandler, false);
	main();
}

function main() {
	context.fillStyle = "rgb(255, 0, 0)";

	// Clear previous frame's drawing
	context.clearRect(0, 0, canvas.width, canvas.height);

	paddle.draw(canvas, context);

	// Move paddle to the right for next animation frame:
	if (leftPressed) {
		paddle.x -= 5;
	}
	if (rightPressed) {
		paddle.x += 5;
	}

	// Request to draw next frame when browser is ready:
	requestAnimationFrame(main);
}
