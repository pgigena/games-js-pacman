var Const = {
	direction: {
		none: -1,
		stopped: 0,
		left: 1,
		right: 2,
		up: 3,
		down: 4
	},
	pacMan: {
		name: 'pacman',
		baseSpeed: 1,
		cornering: {
			up: 4,
			down: 3,
			left: 3,
			right: 4
		}
	},
	ghost: {
		speed: {
			base: 1,
			scared: 0.75,
			returning: 3,
			ghostPen: 0.5
		},
		key: {
			blinky: 0,
			pinky: 1,
			inky: 2,
			clyde: 3
		},
		behavior: {
			chase: 0,
			scatter: 1,
			frightened: 2
		},
		status: {
			normal: 0,
			frightened: 1,
			blinking: 2,
			returning: 3,
			waitSpawn: 4,
			spawning: 5,
			enteringPen: 6
		},
		names: {
			blinky: 'blinky',
			pinky: 'pinky',
			inky: 'inky',
			clyde: 'clyde'
		}
	},
	timer: {
		readyTime: 2000,
		scareTime: 6000,
		scatterTime: 5000,
		chaseTime: 20000,
		fruit: 15000,
		eatingGhost: 500
	},
	targetTiles: {
		ghostPen: {
			x: 14,
			y: 13
		},
		scatter: {
			blinky: {
				x: 24,
				y: 0
			},
			inky: {
				x: 25,
				y: 35
			},
			pinky: {
				x: 3,
				y: 0
			},
			clyde: {
				x: 0,
				y: 35
			}
		}
	},
	gameState: {
		splash: 0,
		ready: 1,
		playing: 2,
		dying: 3,
		paused: 4,
		gameOver: 5,
		endLevel: 6,
		eatingGhost: 7
	},
	board: {
		w: 504,
		h: 648
	},
	tmx: {
		layers: {
			dots: 'Dots',
			limitedIntersection: 'ForbiddenDirections',
			regions: 'Regions'
		},
		properties: {
			collision: 'collidable',
			forbidDir: 'forbidden_direction',
			character: 'character',
			reqDots: 'required_dots',
			fruitOrder: 'order'
		},
		objTypes: {
			startingPos: 'starting_position',
			region: 'region',
			tile: 'tile_object',
			ghostPen: 'ghost_pen',
			energyzer: 'energyzer',
			fruit: 'fruit'
		}
	},
	score: {
		dot: 10,
		energyzer: 50,
		fruit: 1000,
		maxGhostMultiplier: 7,
		ghosts: [ 100, 300, 500, 700, 1000, 3000, 5000, 7000],
		highDefault: 3000
	},
	path: {
		root: document.URL.substring(0, document.URL.lastIndexOf('\/')),
		image: document.URL.substring(0, document.URL.lastIndexOf('\/')) + '/sprite/',
		map: document.URL.substring(0, document.URL.lastIndexOf('\/')) + '/tilemap/',
		sound: document.URL.substring(0, document.URL.lastIndexOf('\/')) + '/sound/'
	},
	format: {
		image: '.png',
		map: '.json',
		sound: '.ogg'
	}
};

var Config = {
	settings: {
		fps: 60,
		allowTurnoverMargin: true,
		turnoverMargin: 5000,
		ghostBoxCollision: false,
		defaultTicsPerSecond: 30,
		missPacMan: false
	},
	debug: {
		tileGrid: false,
		collisionMap: false,
		ghostTargetTile: false,
		characterBounds: false,
		eatenDotCounter: false,
		remainingDotCounter: false
	}
};