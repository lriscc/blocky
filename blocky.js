function main() {
	var canvas  = document.getElementById("blocky");
	var context = canvas.getContext("2d");
	context.fillStyle = "rgb(255, 0, 0)";

	// Draw the paddle:
	var paddleWidth  = 75;
	var paddleHeight = 15;
	var paddleX      = 20;
	var paddleY      = canvas.height - paddleHeight - 5;
	context.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}
