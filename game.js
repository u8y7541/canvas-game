var canvas = document.createElement('canvas')
var ctx = canvas.getContext('2d')
canvas.width = 960
canvas.height = 640
var attrib = document.createAttribute('style')
attrib.value = ' \
-webkit-transform-origin: 0 0; \
-webkit-transform: scale(0.8); \
\
-moz-transform-origin: 0 0; \
-moz-transform: scale(0.8); \
\
-o-transform-origin: 0 0; \
-o-transform: scale(0.8); \
\
transform-origin: 0 0; \
transform: scale(0.8); \
'
canvas.setAttributeNode(attrib)
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
walls.push([0, 400, 960, 240])
walls.push([0, 200, 100, 100])
walls.push([200, 150, 100, 100])
walls.push([350, 150, 100, 100])
walls.push([600, 130, 200, 100])

playerImg = new Image()
playerImg.src = 'images/player.png'

cloud = new Image()
cloud.src = 'images/Cloud_01.png'

cloud_positions = [[50, 100], [600, 200], [300, 300], [800, 50]]

var colors = []
walls.forEach(function (i) {
	for (var j = i[1]; j < i[1] + i[3]; j = j + 10) {
		for (var k = i[0]; k < i[0] + i[2]; k = k + 10) {
			if ((j - i[1]) <= 20) {
				color = Math.floor((Math.random() * 255) + 1)
				colors.push('rgb(0, ' + color + ', 0)')
			}
			else {
				color = Math.floor((Math.random() * 153) + 27)
				colors.push('rgb(' + color + ', 0, 0)')
			}
		}
	}
})

var player = {
	xvel: 0,
	yvel: 0,
	x: 10,
	y: 350,
	rect: new Rect(this.x, this.y, 35, 35),
	topRect: new Rect(this.x + 5, this.y - 8, 30, 5),
	bottomRect: new Rect(this.x + 2.5, this.y + 35, 30, 5),
	wallRight: new Rect(this.x + 32, this.y, 5, 35),
	wallLeft: new Rect(this.x - 2, this.y, 5, 35),
	updateRect: function () {
		this.rect = new Rect(this.x, this.y, 35, 35)
		this.topRect = new Rect(this.x + 2.5, this.y, 30, 5)
		this.bottomRect = new Rect(this.x + 2.5, this.y + 30, 30, 5)
		this.wallRight = new Rect(this.x + 32, this.y + 2.5, 5, 30)
		this.wallLeft = new Rect(this.x - 2, this.y + 2.5, 5, 30)
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
			this.y += 5
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
	ctx.fillStyle = 'rgb(204, 204, 255)'
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	cloud_positions.forEach(function (i) {
		ctx.drawImage(cloud, i[0], i[1])
		i[0] += 1
		if (i[0] > canvas.width) {
			i[0] = -180
		}
	})

	ctx.drawImage(playerImg, player.x, player.y)

	/*ctx.fillStyle = 'rgb(0, 0, 0)'
	rects = [player.bottomRect, player.topRect, player.wallRight, player.wallLeft]
	rects.forEach(function(i) {
		ctx.fillRect(i.x, i.y, i.width, i.height)
	})*/

	var count = 0
	walls.forEach(function (i) {
		for (var j = i[1]; j < i[1] + i[3]; j = j + 10) {
			for (var k = i[0]; k < i[0] + i[2]; k = k + 10, count++) {
				ctx.fillStyle = colors[count]
				ctx.fillRect(k, j, 10, 10)
			}
		}
	})
}

window.onload = function () {
	setInterval(mainLoop, 16)
}