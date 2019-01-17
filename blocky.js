
var canvas;
var context;
var paddle = {
	width : 75,
	height: 15,
	x     : 20,
	y     : null,
	init  : function(canvas) {
		this.y = canvas.height - this.height - 5;
	},
	draw  : function(canvas, context) {
		context.fillRect(this.x, this.y, this.width, this.height);
	},
};

function startGame() {
	canvas  = document.getElementById("blocky");
	context = canvas.getContext("2d");
	paddle.init(canvas);
	main();
}

function main() {
	context.fillStyle = "rgb(255, 0, 0)";

	// Clear previous frame's drawing
	context.clearRect(0, 0, canvas.width, canvas.height);

	paddle.draw(canvas, context);

	// Move paddle to the right for next animation frame:
	paddle.x += 1;

	// Request to draw next frame when browser is ready:
	requestAnimationFrame(main);
}
