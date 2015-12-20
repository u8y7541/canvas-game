var canvas = document.createElement('canvas')
var ctx = canvas.getContext('2d')
canvas.width = 960
canvas.height = 640
document.body.appendChild(canvas)

var collideBottom = false

var keys = {}

addEventListener("keydown", function (key) {
	keys[key.keyCode] = true;
}, false);

addEventListener("keyup", function (key) {
	delete keys[key.keyCode];
}, false);

var walls = []
walls.push([0, 400, 960, 140])
walls.push([0, 200, 100, 100])
walls.push([200, 150, 100, 100])
walls.push([350, 150, 100, 100])

playerImg = new Image()
playerImg.src = 'images/player.bmp'

var player = {
	xvel: 0,
	yvel: 0,
	x: 10,
	y: 350,
	rect: new Rect(this.x, this.y, 35, 35),
	topRect: new Rect(this.x, this.y - 5, 5, 35),
	bottomRect: new Rect(this.x, this.y + 5, 5, 35),
	wallRight: new Rect(this.x + 2, this.y, 35, 5),
	wallLeft: new Rect(this.x - 2, this.y, 35, 5),
	updateRect: function () {
		this.rect = new Rect(this.x, this.y, 35, 35)
		this.topRect = new Rect(this.x, this.y - 5, 5, 35)
		this.bottomRect = new Rect(this.x, this.y + 5, 5, 35)
		this.wallRight = new Rect(this.x + 2, this.y, 35, 5)
		this.wallLeft = new Rect(this.x - 2, this.y, 35, 5)
	},
	updateX: function () {
		if (this.x <= 0 || this.x >= canvas.width) {
			this.xvel *= -1
		}
		var collideWalls = false
		walls.forEach(function (i) {
			if (player.wallRight.collidesWith(new Rect(i[0], i[1], i[2], i[3])) || player.wallLeft.collidesWith(new Rect(i[0], i[1], i[2], i[3]))) {
				collideWalls = true
			}
		})
		if (collideWalls) {
			player.xvel *= -1
		}
		if (player.xvel != 0) {
			player.xvel -= player.xvel / (4 * Math.abs(player.xvel))
		}
	},
	updateY: function () {
		var collideBottom = false
		var collideTop = false
		walls.forEach(function (i) {
			if (player.bottomRect.collidesWith(new Rect(i[0], i[1], i[2], i[3]))) {
				collideBottom = true
			}
		})
		if (collideBottom) {
			this.yvel = 0
			this.y -= 0.5
		}
		else {
			this.yvel += 0.5
		}
		walls.forEach(function (i) {
			if (player.topRect.collidesWith(new Rect(i[0], i[1], i[2], i[3]))) {
				collideTop = true
			}
		})
		if (collideTop) {
			this.yvel *= -1
		}
	}
}

function Rect(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.collidesWith = function (other) {
		return this.x < other.x + other.width &&
		this.x + this.width > other.x &&
		this.y < other.y + other.height &&
		this.y + this.height > other.y;
	};
};

mainLoop = function () {
	if (39 in keys) {
		player.xvel += 0.5
	}
	if (37 in keys) {
		player.xvel -= 0.5
	}
	collideBottom = false
	walls.forEach(function (i) {
		if (player.bottomRect.collidesWith(new Rect(i[0], i[1], i[2], i[3]))) {
			collideBottom = true
		}
	})
	if (38 in keys && collideBottom) {
		player.yvel -= 10
	}
	player.x += player.xvel
	player.y += player.yvel

	player.updateRect()

	player.updateX()
	player.updateY()

	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = 'rgb(0, 0, 0)'

	walls.forEach(function(i) {
		ctx.fillRect(i[0], i[1], i[2], i[3])
	})
	ctx.drawImage(playerImg, player.x, player.y)
}

window.onload = function () {
	setInterval(mainLoop, 16)
}