//
// This file just holds code used for collision detection
//

function distance(x1, y1, x2, y2) {
	var result = Math.abs(x1 - x2) ** 2 + Math.abs(y1 - y2) ** 2;
	return Math.sqrt(result);
}


function circleTouchingRectangle(cx, cy, cr, rx, ry, rw, rh) {
	// Return true if the circle is touching or intersecting the rectangle, false otherwise.
	// Parameters:
	//   cx: circle's center x coordinate
	//   cy: circle's center y coordinate
	//   cr: circle's radius
	//   rx: rectangle's top-left corner x coordinate
	//   ry: rectangle's top-left corner y coordinate
	//   rw: rectangle's width
	//   rh: rectangle's height

	// Distance between circle's center and potentially one of the rectangle's corners (or just 0)
	var d = 0;

	// Basic test: weed out cases where circle is clearly not touching rectangle
	if (cx + cr < rx) {
		return false; // circle too far to the left of rectangle to be touching it
	}
	if (cx - cr > rx + rw) {
		return false; // circle too far to the right of rectangle to be touching it
	}
	if (cy + cr < ry) {
		return false; // circle too far above the rectangle to be touching it
	}
	if (cy - cr > ry + rh) {
		return false; // circle too far below the rectangle to be touching it
	}

	// The corners are more complicated since the circle is round; it could still,
	// in theory, _not_ be touching the rectangle but just be very close to a corner
	if (cx < rx) {
		if (cy < ry) {
			// circle may just be very near top-left rectangle corner
			d = distance(cx, cy, rx, ry);
		} else if (cy > ry + rh) {
			// circle may just be very near bottom-left rectangle corner
			d = distance(cx, cy, rx, ry + rh);
		}
	} else if (cx > rx + rw) {
		if (cy < ry) {
			// circle may just be very near top-right rectangle corner
			d = distance(cx, cy, rx + rw, ry);
		} else if (cy > ry + rh) {
			// circle may just be very near bottom-right rectangle corner
			d = distance(cx, cy, rx + rw, ry + rh);
		}
	}
	if (d > cr) {
		return false; // circle is just really close to one of the rectangle corners
	}
	return true; // circle touching/intersecting rectangle
}
