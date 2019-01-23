//
// This file just holds code used for collision detection
//

function distance(x1, y1, x2, y2) {
       var result = Math.abs(x1 - x2) ** 2 + Math.abs(y1 - y2) ** 2;
       return Math.sqrt(result);
}
