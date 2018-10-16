var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 450;
canvas.height = 450;
document.getElementById("game-container").appendChild(canvas);

const tileSize = 100;
var isPlaying = false;
var arr = [4], copy = [4], old = [4];
for (var i = 0; i < 4; i++) {
	arr[i] = [4];
	copy[i] = [4];
	old[i] = [4];
}
var freeFields = [];
var colors = {
	"0": "rgba(210, 206, 192)",
	"2": "rgba(226, 208, 146)",
	"4": "rgba(212, 186, 100)",
	"8": "rgba(206, 180, 66)",
	"16": "rgba(255, 195, 15)",
	"32": "rgba(255, 179, 15)",
	"64": "rgba(255, 159, 15)",
	"128": "rgba(255, 123, 15)",
	"256": "rgba(255, 99, 15)",
	"512": "rgba(255, 71, 15)",
	"1024": "rgba(255, 27, 15)",
	"2048": "rgba(255, 15, 239)"
};
var score = 0;

$(document).ready( () => {
	!$.cookie('highscore') ? $.cookie("highscore", 0, { expires: 365 }) : null;
	createNewGame();
});

function createNewGame() {
	$.cookie("highscore", Math.max($.cookie("highscore"), score));
	score = 0;
	freeFields.splice(0, freeFields.length);
	for (var y = 0; y < 4; y++) {
		for (var x = 0; x < 4; x++) {
			arr[y][x] = copy[y][x] = 0;
		}
	}
	for (var i = 0; i < 3; i++) {
		generateRandomField();
	}
	isPlaying = true;
	updateOld();
	draw();
}

function getFreeFields() {
	freeFields = [];
	for (var y = 0; y < 4; y++) {
		for (var x = 0; x < 4; x++) {
			if (arr[y][x] == 0) {
				freeFields.push({
					y: y,
					x: x
				});
			}
		}
	}
}

function generateRandomField() {
	getFreeFields();
	var pos = Math.floor(Math.random() * freeFields.length);
	var field = freeFields[pos];
	arr[field.y][field.x] = copy[field.y][field.x] = Math.random() < 0.86 ? 2 : 4;
}

function draw() {
	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "rgba(66, 66, 66)";
	ctx.fill();
	ctx.closePath();

	for (var y = 0; y < 4; y++) {
		for (var x = 0; x < 4; x++) {
			ctx.beginPath();
			ctx.roundRect((x + 1) * 10 + x * tileSize, (y + 1) * 10 + y * tileSize, tileSize, tileSize, 5);
			ctx.fillStyle = colors[arr[y][x]];
			ctx.fill();
			if (arr[y][x] != 0) {
				ctx.textAlign = "center";
				ctx.font = "20px Verdana";
				ctx.fillStyle = "#FFFFFF";
				ctx.fillText(arr[y][x], (x + 1) * 10 + x * tileSize + tileSize / 2, (y + 1) * 10 + y * tileSize + tileSize / 2);
			}
			ctx.closePath();
		}
	}
	
	$.cookie("highscore", Math.max($.cookie("highscore"), score));
	document.getElementById("score").innerHTML = score;
	document.getElementById("highscore").innerHTML = $.cookie("highscore") ? $.cookie("highscore") : "---";
}

function updateField(dir, mode) {
	switch (dir) {
		case "up":
			rotateField(1);
			break;
		case "right":
			break;
		case "down":
			rotateField(3);
			break;
		case "left":
			rotateField(2);
			break;
	}
	calculateField();
	switch (dir) {
		case "up":
			rotateField(3);
			break;
		case "right":
			break;
		case "down":
			rotateField(1);
			break;
		case "left":
			rotateField(2);
			break;
	}
	var changed = isViable();
	if (mode == "test") {
		removeChanges();
		return changed;
	}
	if (changed == true) {
		generateRandomField();
		updateOld();
		draw();
	} else {
		removeChanges();
	}
	return changed;
}

function rotateField(number) {
	for (var i = 0; i < number; i++) {
		for (var y = 0; y < 4; y++) {
			for (var x = 0; x < 4; x++) {
				arr[x][3 - y] = copy[y][x];
			}
		}
		for (var y = 0; y < 4; y++) {
			for (var x = 0; x < 4; x++) {
				copy[y][x] = arr[y][x];
			}
		}
	}
}

function calculateField() {
	for (var y = 0; y < 4; y++) {
		var ans = [];
		for (var x = 3; x >= 0; x--) {
			if (arr[y][x] != 0) {
				if (ans.length > 0 && ans[ans.length - 1].merged == 0 && arr[y][x] == ans[ans.length - 1].value) {
					score += arr[y][x] * 2;
					ans[ans.length - 1] = {
						value: arr[y][x] * 2,
						merged: 1
					};
				} else {
					ans.push({
						value: arr[y][x],
						merged: 0
					});
				}
			}
		}
		for (var x = 3; x >= 0; x--) {
			if (ans.length > 0) {
				arr[y][x] = ans[0].value;
				ans.shift();
			} else {
				arr[y][x] = 0;
			}
			copy[y][x] = arr[y][x];
		}
	}
}

function isViable() {
	for (var y = 0; y < 4; y++) {
		for (var x = 0; x < 4; x++) {
			if (old[y][x] != arr[y][x]) {
				return true;
			}
		}
	}
	return false;
}

function updateOld() {
	for (var y = 0; y < 4; y++) {
		for (var x = 0; x < 4; x++) {
			old[y][x] = arr[y][x];
		}
	}
}

function removeChanges() {
	for (var y = 0; y < 4; y++) {
		for (var x = 0; x < 4; x++) {
			arr[y][x] = copy[y][x] = old[y][x];
		}
	}
}

$(document).bind('keydown', e => {
	if (isPlaying == false) {
		return;
	}
	var key = e.keyCode || e.which;
	var updated = false;
    switch(key) {
		// case 119:											// W
		case 87:											// W
		case 38:											// ArrowUp
			updated = updateField("up", "normal");
            break;
		// case 100:											// D
		case 68:											// D
		case 39:											// ArrowRight
			updated = updateField("right", "normal");
            break;
		// case 115:											// S
		case 83:											// S
		case 40:											// ArrowDown
			updated = updateField("down", "normal");
            break;
		// case 97:											// A
		case 65:											// A
		case 37:											// ArrowLeft
			updated = updateField("left", "normal");
			break;
		default:											// Any other key
			return;
	}
	if (updated == false) {
		updated = updateField("up", "test");
		updated = updated == true ? true : updateField("right", "test");
		updated = updated == true ? true : updateField("down", "test");
		updated = updated == true ? true : updateField("left", "test");
	}
	if (updated == false) {
		isPlaying = false;
		alert("You lost!");
		createNewGame();
	}
});

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;
	this.beginPath();
	this.moveTo(x+r, y);
	this.arcTo(x+w, y,   x+w, y+h, r);
	this.arcTo(x+w, y+h, x,   y+h, r);
	this.arcTo(x,   y+h, x,   y,   r);
	this.arcTo(x,   y,   x+w, y,   r);
	this.closePath();
	return this;
}