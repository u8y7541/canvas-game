// Play music
var music = new Audio('tetrismenu.mp3')
music.loop = true
music.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
music.play()

// Create canvas, align it
var canvas = document.createElement('canvas')
var ctx = canvas.getContext('2d')
canvas.width = 960
canvas.height = 640
var attrib = document.createAttribute('style')
// This shrinks the game by a factor of 0.8
/*attrib.value = ' \
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
'*/
canvas.setAttributeNode(attrib)
document.body.appendChild(canvas)

// Note: Level data is in levels.js.

// All the initializing.
gameLvl = 1 // Change this for dev/testing when you want to test one level.
walls = gameJSON["Level" + gameLvl]["walls"]

playerImg = new Image()
playerImg.src = 'images/player.png'

end = new Image()
end.src = 'images/end.png'
endRect = new Rect(gameJSON["Level" + gameLvl]["end"]["x"], gameJSON["Level" + gameLvl]["end"]["y"], 50, 50)

cloud = new Image()
cloud.src = 'images/Cloud_01.png'

light = new Image()
light.src = 'images/light.png'
smallLight = new Image()
smallLight.src = 'images/smallLight.png'

portal = new Image()
portal.src = 'images/portal.png'

cloud_positions = gameJSON["Level" + gameLvl]["cloudPositions"]
time = gameJSON["Level" + gameLvl]["time"]
isRain = gameJSON["Level" + gameLvl]["rain"]
lights = gameJSON["Level" + gameLvl]["lights"]

portals = gameJSON["Level" + gameLvl]["portals"]
portals.forEach(function (i) {
	i["rectangle"] = new Rect(i["position"][0], i["position"][1], 50, 50)
})

spike = new Image()
spike.src = 'images/spike.png'
spikes = gameJSON["Level" + gameLvl]["spikes"]

// Random terrain color rendering
function generateColors () {
	var colors = []
	walls.forEach(function (i) {
		for (var j = i[1]; j < i[1] + i[3]; j = j + 10) {
			for (var k = i[0]; k < i[0] + i[2]; k = k + 10) {
				if ((j - i[1]) <= 30) {
					color = Math.floor((Math.random() * 255) + 1)
					colors.push('rgb(0, ' + color + ', 0)')
				}
				else {
					color = Math.floor((Math.random() * 153) + 50)
					colors.push('rgb(' + color + ', 0, 0)')
				}
			}
		}
	})
	precanvas = document.createElement('canvas')
	precanvas.width = canvas.width
	precanvas.height = canvas.height
	prectx = precanvas.getContext('2d')
	var count = 0
	walls.forEach(function (i) {
		for (var j = i[1]; j < i[1] + i[3]; j = j + 10) {
			for (var k = i[0]; k < i[0] + i[2]; k = k + 10, count++) {
				prectx.fillStyle = colors[count]
				prectx.fillRect(k, j, 10, 10)
			}
		}
	})
}
generateColors()

// Key detection setup
var keys = {}

addEventListener("keydown", function (key) {
	keys[key.keyCode] = true;
}, false);

addEventListener("keyup", function (key) {
	delete keys[key.keyCode];
}, false);

// Disables arrow key scrolling for a less annoying gameplay.
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

// A smallish object type for easy rectangle collision comparision
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
	this.reassign = function (x, y, width, height) {
		this.x = x, this.y = y, this.width = width, this.height = this.height
	}
};

// Player object (pretty BIG!)
var player = {
	// Init all the stuff
	xvel: 0,
	yvel: 0,
	x: 0,
	y: 0,
	rect: new Rect(this.x, this.y, 35, 35),
	// Platformer bumpers
	topRect: new Rect(this.x + 5, this.y - 8, 30, 5),
	bottomRect: new Rect(this.x + 2.5, this.y + 35, 30, 5),
	wallRight: new Rect(this.x + 32, this.y, 5, 35),
	wallLeft: new Rect(this.x - 2, this.y, 5, 35),
	spikesCollide: function () {
		that = this
		collideSpike = false
		spikes.forEach(function (i) {
			spikeRects = [new Rect(i[0], i[1] - 10, 5, 10), new Rect(i[0] + 5, i[1] - 18.3, 5, 18.3), new Rect(i[0] + 10, i[1] - 26.6, 5, 26.6),
			new Rect(i[0] + 15, i[1] - 35, 5, 35), new Rect(i[0] + 20, i[1] - 26.6, 5, 26.6), new Rect(i[0] + 25, i[1] - 18.3, 5, 18.3),
			new Rect(i[0] + 30, i[1] - 10, 5, 10)]
			spikeRects.forEach(function (j) {
				if (that.rect.collidesWith(j)) {
					collideSpike = true
				}
			})
		})
		return collideSpike
	},
	// Updates the player rect and the bumper rects
	updateRect: function () {
		this.rect.reassign(this.x, this.y, 35, 35)
		this.topRect.reassign(this.x + 2.5, this.y, 30, 5)
		this.bottomRect.reassign(this.x + 2.5, this.y + 30, 30, 5)
		this.wallRight.reassign(this.x + 32, this.y - 2.5, 5, 30)
		this.wallLeft.reassign(this.x - 2, this.y - 2.5, 5, 30)
	},
	// Updates x position after looking at wall collisions and current x velocity.
	updateX: function () {		
		if (this.x <= 0 || this.x >= canvas.width) {
			this.xvel *= -1
		}
		var collideWalls = false
		walls.forEach(function (i) {
			wall = new Rect(i[0], i[1], i[2], i[3])
			if (player.wallRight.collidesWith(wall) || player.wallLeft.collidesWith(wall)) {
				collideWalls = true
				for (j = 0; j < Math.ceil(Math.random() * 10); j++) {
					particles.push(new Particle(player.x + 35, player.y + 17.5, player.xvel * (0 - Math.random() * 0.5), -5, 'rgb(119, 90, 50)', 5))
				}
			}
		})
		if (collideWalls) {
			player.xvel *= -1
		}
		if (player.xvel != 0) {
			player.xvel -= player.xvel / (4 * Math.abs(player.xvel))
		}
	},
	// Updates y position after looking at top and ground collisions and current y velocity.
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
		walls.forEach(function (i) {
			if (player.bottomRect.collidesWith(new Rect(i[0], i[1], i[2], i[3]))) {
				collideBottom = true
			}
		})
		if (collideBottom) {
			player.y -= 0.5
			walls.forEach(function (i) {
				if (player.bottomRect.collidesWith(new Rect(i[0], i[1], i[2], i[3]))) {
					collideBottom = true
				}
			})
			if (!collideBottom) {
				while (!collideBottom) {
					y += 0.1
					walls.forEach(function (i) {
						if (player.bottomRect.collidesWith(new Rect(i[0], i[1], i[2], i[3]))) {
							collideBottom = true
						}
					})
				}
			}
		}
	}
}
player.x = gameJSON["Level" + gameLvl]["startPoint"]["x"]
player.y = gameJSON["Level" + gameLvl]["startPoint"]["y"]

// Will use this for nice effects and stuff.
numParticles = 0
function Particle(x, y, xvel, yvel, color, size) {
	numParticles += 1
	this.x = x;
	this.y = y;
	this.xvel = xvel;
	this.yvel = yvel;
	this.size = size
	this.stopped = false
	this.color = color
	this.rect = new Rect(this.x, this.y, this.size, this.size)
	this.update = function () {
		this.xvel -= this.xvel / (4 * Math.abs(this.xvel))
		this.yvel += 0.5
		this.x += this.xvel
		this.y += this.yvel
		this.rect = new Rect(this.x, this.y, this.size, this.size)
		that = this
		walls.forEach(function (i) {
			if (that.rect.collidesWith(new Rect(i[0], i[1], i[2], i[3]))) {
				that.stopped = true
				numParticles -= 1
			}
		})
	}
	this.render = function () {
		ctx.fillStyle = this.color
		if (!this.stopped) {
			ctx.fillRect(this.x, this.y, this.size, this.size)
		}
	}
}

// Rain object.
function Rain() {
	this.x = Math.floor(Math.random() * 960)
	this.y = Math.floor(Math.random() * -200);
	this.yvel = 0;
	this.stopped = false
	this.rect = new Rect(this.x, this.y, 5, 30)
	this.update = function () {
		if (!this.stopped) {
			this.yvel += 0.5
		}
		this.y += this.yvel
		this.rect = new Rect(this.x, this.y, 5, 30)
		that = this
		walls.forEach(function (i) {
			if (that.rect.collidesWith(new Rect(i[0], i[1], i[2], i[3]))) {
				that.yvel = 0
				that.stopped = true
			}
		})
	}
	this.render = function () {
		ctx.fillStyle = 'rgb(26, 102, 255)'
		if (!this.stopped) {
			ctx.fillRect(this.x, this.y, 5, 30)
		}
		else {
			particles.push(new Particle(this.x, this.y, 5 - Math.floor(Math.random() * 10), -5, 'rgb(0, 0, 255)', 5))
			particles.push(new Particle(this.x, this.y, 5 - Math.floor(Math.random() * 10), -5, 'rgb(0, 0, 255)', 5))
			this.x = Math.floor(Math.random() * 960)
			this.y = Math.floor(Math.random() * -200)
			this.stopped = false
		}
	}
}


rain = []
for (var i = 0; i < 50; i++) {
	rain.push(new Rain())
};
particles = []
// Mainloop.
mainLoop = function () {
	// All the key detection.
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
	// Update player position.	
	player.x += player.xvel
	player.y += player.yvel

	// Update player rectangle.
	player.updateRect()

	// Update xvel and yvel.
	player.updateX()
	player.updateY()

	if (player.rect.collidesWith(endRect)) {
		gameLvl += 1
		// Load next level data
		walls = gameJSON["Level" + gameLvl]["walls"]
		endRect = new Rect(gameJSON["Level" + gameLvl]["end"]["x"], gameJSON["Level" + gameLvl]["end"]["y"], 50, 50)

		// Load cosmetics
		cloud_positions = gameJSON["Level" + gameLvl]["cloudPositions"]
		time = gameJSON["Level" + gameLvl]["time"]
		isRain = gameJSON["Level" + gameLvl]["rain"]
		lights = gameJSON["Level" + gameLvl]["lights"]

		portals = gameJSON["Level" + gameLvl]["portals"]
		portals.forEach(function (i) {
			i["rectangle"] = new Rect(i["position"][0], i["position"][1], 50, 50)
		})

		spikes = gameJSON["Level" + gameLvl]["spikes"]

		player.x = gameJSON["Level" + gameLvl]["startPoint"]["x"]
		player.y = gameJSON["Level" + gameLvl]["startPoint"]["y"]
		player.xvel = 0
		player.yvel = 0

		generateColors()
	}

	portals.forEach(function (i) {
		if (player.rect.collidesWith(i["rectangle"])) {
			player.x = i["endpoint"][0]
			player.y = i["endpoint"][1]
		}
	})
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	
	if (time == "day") {
		ctx.fillStyle = 'rgb(204, 204, 255)'
	}
	if (isRain) {
		ctx.fillStyle = 'rgb(229, 229, 220)'
	}
	if (time == "night") {
		ctx.fillStyle = 'rgb(0, 0, 153)'
	}
	if (time == "dawn") {
		ctx.fillStyle = 'rgb(255, 204, 179)'
	}

	ctx.fillRect(0, 0, canvas.width, canvas.height)

	cloud_positions.forEach(function (i) {
		ctx.drawImage(cloud, i[0], i[1])
		i[0] += 1
		if (i[0] > canvas.width) {
			i[0] = -180
		}
	})

	ctx.drawImage(end, gameJSON["Level" + gameLvl]["end"]["x"], gameJSON["Level" + gameLvl]["end"]["y"])
	ctx.drawImage(playerImg, player.x, player.y)

	if (isRain) {
		rain.forEach(function (i) {
			i.update()
			i.render()
		})
	}

	particles.forEach(function (i) {
		i.update()
		i.render()
	})
	if (numParticles > 100) {
		particles = particles.slice(0, 100)
		numParticles = 0
	}
	lights.forEach(function (i) {
		if (i[2] == "small") {
			ctx.drawImage(smallLight, i[0], i[1])
		}
		else {
			ctx.drawImage(light, i[0], i[1])
		}
	})
	if (player.spikesCollide()) {
		player.xvel = 0
		player.yvel = 0
		player.x = gameJSON["Level" + gameLvl]["startPoint"]["x"]
		player.y = gameJSON["Level" + gameLvl]["startPoint"]["y"]
	}
	portals.forEach(function (i) {
		ctx.drawImage(portal, i["position"][0], i["position"][1])
	})
	spikes.forEach(function (i) {
		ctx.drawImage(spike, i[0], i[1])
	})

	// If you uncomment this, it displays the player bumpers. Use for dev/debugging.
	/*ctx.fillStyle = 'rgb(0, 0, 0)'
	rects = [player.bottomRect, player.topRect, player.wallRight, player.wallLeft]
	rects.forEach(function(i) {
		ctx.fillRect(i.x, i.y, i.width, i.height)
	})*/

	ctx.drawImage(precanvas, 0, 0)
}

window.onload = function () {
	setInterval(mainLoop, 16)
}
