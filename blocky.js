var paddle = {
	width : 75,
	height: 15,
	x     : 20,
	y     : null,
	draw  : function(canvas, context) {
		if (this.y === null) {
			this.y = canvas.height - this.height - 5;
		}
		context.fillRect(this.x, this.y, this.width, this.height);
	}
};

function main() {
	var canvas  = document.getElementById("blocky");
	var context = canvas.getContext("2d");
	context.fillStyle = "rgb(255, 0, 0)";

	// Clear previous frame's drawing
	context.clearRect(0, 0, canvas.width, canvas.height);

	paddle.draw(canvas, context);

	// Move paddle to the right for next animation frame:
	paddle.x += 1;

	// Request to draw next frame when browser is ready:
	requestAnimationFrame(main);
}
