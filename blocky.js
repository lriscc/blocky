function main() {
	var canvas  = document.getElementById("blocky");
	var context = canvas.getContext("2d");
	context.fillStyle = "rgb(255, 0, 0)";

	// Draw the paddle:
	var paddleWidth  = 75;
	var paddleHeight = 15;
	context.fillRect(20, 20, paddleWidth, paddleHeight);
}
