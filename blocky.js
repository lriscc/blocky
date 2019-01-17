var paddleX = 20;

function main() {
	var canvas  = document.getElementById("blocky");
	var context = canvas.getContext("2d");
	context.fillStyle = "rgb(255, 0, 0)";

	// Clear previous frame's drawing
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the paddle:
	var paddleWidth  = 75;
	var paddleHeight = 15;
	//var paddleX      = 20;
	var paddleY      = canvas.height - paddleHeight - 5;
	context.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);

	// Move paddle to the right for next animation frame:
	paddleX += 1;

	// Request to draw next frame when browser is ready:
	requestAnimationFrame(main);
}
