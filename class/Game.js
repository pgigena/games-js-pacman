function Game() {
	this.graphics = null;
	this.hudGraphics = null;

	this.pacMan = (Config.settings.missPacMan ? new MsPacMan() : new PacMan());
	this.skipPacmanFrame = true;

	this.ghosts = new Array();

	this.ghosts[Const.ghost.key.blinky] = new Blinky();
	this.ghosts[Const.ghost.key.pinky] = new Pinky();
	this.ghosts[Const.ghost.key.inky] = new Inky();
	this.ghosts[Const.ghost.key.clyde] = new Clyde();

	this.stateTimer = null;
	this.state = Const.gameState.splash;
	this.prevState = null;

	this.tileMap = null;
	this.mapList = ['classic', 'ms_pacman', 'custom1'];
	this.activeMap = 0;

	this.loaderTimer = null;

	this.eatingGhostTimer = null;
	this.ghostScareTimer = null;
	this.ghostBehaviorTimer = null;

	this.ghostBehavior = null;

	this.dirChangeTimer = null;
	this.dirChangeDirection = Const.direction.none;

	this.activeGhostCounter = null;
	this.eatenDots = 0;

	this.highScoreReached = false;
	this.score = 0;
	this.ghostMultiplier = 0;
	this.highScore = 0;

	this.playerLives = 0;

	this.gameTimer = null;
}

Game.subclass(Object);

Game.prototype.initializeMap = function () {
	this.eatenDots = 0;

	if (this.tileMap !== null) {
		this.tileMap.resetDots();
		this.tileMap.initializeFruits();
	}

	this.tileMap = ResourceManager.getLevel(this.mapList[this.activeMap]);
};

Game.prototype.initialize = function () {
	var that = this;
	this.initializeKeyboardInput();
	this.loadResources();
	this.playerLives = 3;
	if (localStorage.hasOwnProperty('pm_high')) {
		this.highScore = localStorage.pm_high;
	} else {
		this.highScore = Const.score.highDefault;
	}

	ResourceManager.loaderTimer = setInterval(function () {
		if (ResourceManager.checkResources()) {
			that.initCanvases();
			that.initializeCharacters();
			clearInterval(ResourceManager.loaderTimer);
		}
	}, 100);
};

Game.prototype.initializeLevel = function () {
	this.initializeMap();
	this.resetCounters();
	this.resetCharacters();
	this.removeFruit();
	this.showReadyScreen();

	this.drawMap();
};

Game.prototype.start = function () {
	var that = this;
	this.initializeLevel();

	this.gameTimer = new Interval(function () {

		window.requestAnimationFrame(function () {
			that.mainLoop();
		});
	}, 1000 / Config.settings.fps);
};

Game.prototype.pause = function () {
	this.prevState = this.state;
	this.state = Const.gameState.paused;

	if (this.ghostScareTimer !== null) {
		this.ghostScareTimer.pause();
	} else if (this.ghostBehaviorTimer !== null) {
		this.ghostBehaviorTimer.pause();
	}

	this.pauseCharacters();
};

Game.prototype.unpause = function () {
	if (this.state !== Const.gameState.paused) {
		return;
	}

	if (this.ghostScareTimer !== null) {
		this.ghostScareTimer.resume();
	} else if (this.ghostBehaviorTimer !== null) {
		this.ghostBehaviorTimer.resume();
	}

	this.state = this.prevState;
	this.unpauseCharacters();
};

Game.prototype.pauseCharacters = function () {
	this.pacMan.pause();

	for (var index in this.ghosts) {
		this.ghosts[index].pause();
	}
};

Game.prototype.unpauseCharacters = function () {
	this.pacMan.resume();

	for (var index in this.ghosts) {
		this.ghosts[index].resume();
	}
};

Game.prototype.initializeKeyboardInput = function () {
	var that = this;
	window.addEventListener('keydown', function (evt) {
		that.keyHandler(evt.keyCode);

		switch (evt.keyCode) {
			case 38:	/* Up */
			case 40:	/* Down */
			case 37:	/* Left */
			case 39:	/* Right */
				evt.preventDefault();
		}
	});
};

Game.prototype.loadResources = function () {
	ResourceManager.loadSound('beginning');
	ResourceManager.loadSound('eatghost');
	ResourceManager.loadSound('eatfruit');
	ResourceManager.loadSound('chomp');
	ResourceManager.loadSound('death');

	ResourceManager.loadSprite('pacman');

	ResourceManager.loadLevel(this.mapList[0]);
	ResourceManager.loadLevel(this.mapList[1]);
	ResourceManager.loadLevel(this.mapList[2]);
};

Game.prototype.initCanvases = function () {
	ResourceManager.createCanvas('map', Const.board.w, Const.board.h, 0);
	ResourceManager.createCanvas('game', Const.board.w, Const.board.h, 1);
	ResourceManager.createCanvas('hud', Const.board.w, Const.board.h, 2);

	document.body.appendChild(ResourceManager.getCanvas('map'));
	document.body.appendChild(ResourceManager.getCanvas('game'));
	document.body.appendChild(ResourceManager.getCanvas('hud'));
	var that = this;

	document.getElementById('hud').addEventListener('click', function (evt) {
//		var tile = that.tileMap.getCorrespondingTile(evt.x, evt.y);
		that.ghosts[Const.ghost.key.blinky].setTargetTile(tile.x, tile.y);
	});

	this.graphics = ResourceManager.getCanvas('game').getContext('2d');
	this.hudGraphics = ResourceManager.getCanvas('hud').getContext('2d');
};

Game.prototype.initializeCharacters = function () {
	this.pacMan.initialize();
	this.pacMan.initAnimations(ResourceManager.getSprite('pacman'));

	for (var index in this.ghosts) {
		this.ghosts[index].initialize();
		this.ghosts[index].initAnimations(ResourceManager.getSprite('pacman'));
	}

};

Game.prototype.resetCharacters = function () {
	// Starting positions
	var startingPosLayer = this.tileMap.findObjectLayer(Const.tmx.layers.regions);
	var startingTile = startingPosLayer.findItemByProperty(Const.tmx.properties.character, Const.pacMan.name);

	this.pacMan.x = startingTile.x;
	this.pacMan.y = startingTile.y;

	for (var index in this.ghosts) {
		startingTile = startingPosLayer.findItemByProperty(Const.tmx.properties.character, this.ghosts[index].name);

		this.ghosts[index].x = startingTile.x;
		this.ghosts[index].y = startingTile.y;
	}

	// Starting directions
	this.pacMan.changeDirection(Const.direction.none);
	this.pacMan.changeDirection(Const.direction.left);

	this.ghosts[Const.ghost.key.blinky].status = Const.ghost.status.normal;
	this.ghosts[Const.ghost.key.blinky].changeDirection(Const.direction.none);
	this.ghosts[Const.ghost.key.blinky].changeDirection(Const.direction.left);
	this.ghosts[Const.ghost.key.blinky].speed = Const.ghost.speed.base;

	this.ghosts[Const.ghost.key.inky].changeDirection(Const.direction.none);
	this.ghosts[Const.ghost.key.inky].changeDirection(Const.direction.up);
	this.ghosts[Const.ghost.key.inky].respawn();

	this.ghosts[Const.ghost.key.pinky].changeDirection(Const.direction.none);
	this.ghosts[Const.ghost.key.pinky].changeDirection(Const.direction.down);
	this.ghosts[Const.ghost.key.pinky].respawn();

	this.ghosts[Const.ghost.key.clyde].changeDirection(Const.direction.none);
	this.ghosts[Const.ghost.key.clyde].changeDirection(Const.direction.up);
	this.ghosts[Const.ghost.key.clyde].respawn();
};

Game.prototype.resetCounters = function () {
	this.ghosts[Const.ghost.key.pinky].dotCounter = 0;
	this.ghosts[Const.ghost.key.inky].dotCounter = 30;
	this.ghosts[Const.ghost.key.clyde].dotCounter = 60;
};

Game.prototype.drawMap = function () {
	this.tileMap.draw(ResourceManager.getCanvas('map').getContext('2d'));
};

Game.prototype.showReadyScreen = function () {
	this.state = Const.gameState.ready;

	this.pauseCharacters();

	var beginSong = ResourceManager.getSound('beginning');
	var that = this;

	// Bind song finish
	beginSong.onFinish(function () {
		that.startLevel();
	});
	beginSong.play();
};

Game.prototype.startLevel = function () {
	this.activeGhostCounter = Const.ghost.key.inky;

	this.unpauseCharacters();
	this.state = Const.gameState.playing;

	// Start other timers
	this.setGhostMode(Const.ghost.behavior.chase);
};

Game.prototype.mainLoop = function () {
	switch (this.state) {
		case Const.gameState.playing:
			this.updatePositions();
			
			this.checkCollisions();
			this.checkRemainingDots();
			this.draw();
			break;
		case Const.gameState.eatingGhost:
			// Draw score over ghost
			this.drawHud();
			break;
		case Const.gameState.ready:
			this.draw();
			break;
		case Const.gameState.paused:
			this.draw();
			break;
		case Const.gameState.dying:
			this.draw();
		case Const.gameState.gameOver:
			this.draw();
			break;
		case Const.gameState.endLevel:
			this.drawHud();
			break;
	}
};

Game.prototype.checkPacmanWallCollisions = function () {
	var center = {
		x: this.pacMan.x + this.pacMan.w / 2,
		y: this.pacMan.y + this.pacMan.h / 2
	};

	var tileMap = this.tileMap;
	var tile = tileMap.getCorrespondingTile(center.x, center.y);

	switch (this.pacMan.moveDirection) {
		case Const.direction.up:
			if ((center.y <= (tile.y * tileMap.tileH) + 6) && tileMap.hasCollision(tile.x, tile.y - 1)) {
				return true;
			}
			break;
		case Const.direction.down:
			if ((center.y >= (tile.y * tileMap.tileH) + tileMap.tileH - 7) && tileMap.hasCollision(tile.x, tile.y + 1)) {
				return true;
			}
			break;
		case Const.direction.left:
			if ((center.x <= (tile.x * tileMap.tileW) + 6) && tileMap.hasCollision(tile.x - 1, tile.y)) {
				return true;
			}
			break;
		case Const.direction.right:
			if ((center.x >= (tile.x * tileMap.tileW) + tileMap.tileW - 7) && tileMap.hasCollision(tile.x + 1, tile.y)) {
				return true;
			}
			break;

	}

	return false;
};

Game.prototype.checkGhostWallCollisions = function (character) {
	var tileMap = this.tileMap;
	var collidingTiles = tileMap.getCorrespondingTiles(character.x, character.y, character.w, character.h);

	for (var i in collidingTiles) {
		if (tileMap.hasCollision(collidingTiles[i].x, collidingTiles[i].y)) {
			return true;
		}
	}

	return false;

};

Game.prototype.checkCollisions = function () {
	var ghosts = this.ghosts;
	var pacManTile = this.tileMap.getCorrespondingTile(this.pacMan.x + this.pacMan.w / 2, this.pacMan.y + this.pacMan.h / 2);

	for (var index in ghosts) {
		if (!Config.settings.ghostBoxCollision) {
			var ghostTile = this.tileMap.getCorrespondingTile(ghosts[index].x + ghosts[index].w / 2, ghosts[index].y + ghosts[index].h / 2);
		}

		if (Config.settings.ghostBoxCollision && this.pacMan.isColliding(ghosts[index])
				|| (!Config.settings.ghostBoxCollision && (pacManTile.x === ghostTile.x && pacManTile.y === ghostTile.y))) {

			if (!ghosts[index].isHostile()) {

				if (this.maxGhostMultiplier < Const.score.maxGhostMultiplier) {
					this.ghostMultiplier++;
				}
				this.addScore(Const.score.ghosts[this.ghostMultiplier]);

				var ghostEat = ResourceManager.getSound('eatghost');

				ghosts[index].die();

				// Timer
				this.state = Const.gameState.eatingGhost;
				this.ghostScareTimer.pause();
				var that = this;
				// Show score
				//Const.score.ghosts[this.ghostMultiplier]

				ghostEat.onFinish(function () {
					that.state = Const.gameState.playing;
					that.ghostScareTimer.resume();
				});
				ghostEat.play();
			} else if (!ghosts[index].isReturning()) {
				// @TODO: UNCOMMENT!
				this.killPacMan();
			}
		}
	}
};

Game.prototype.checkDotCollisions = function () {
	var correspondingTiles = this.tileMap.getCorrespondingTiles(this.pacMan.x, this.pacMan.y, this.pacMan.w, this.pacMan.h);

	if (this.tileMap.fruitVisible && this.pacMan.isColliding(this.tileMap.currentFruit)) {
		ResourceManager.getSound('eatfruit').play();
		this.addScore(Const.score.fruit);

		this.tileMap.removeFruit();
	}

	for (var i in correspondingTiles) {

		var currentDot = this.tileMap.dotsCollisionMap[correspondingTiles[i].x][correspondingTiles[i].y];
		if (currentDot !== null && currentDot.visible && this.pacMan.isColliding(currentDot)) {
			this.eatenDots++;
			this.checkFruitRequirement();

			switch (this.activeGhostCounter) {
				case Const.ghost.key.inky:
					this.ghosts[Const.ghost.key.inky].dotCounter--;
					break;
				case Const.ghost.key.clyde:
					this.ghosts[Const.ghost.key.clyde].dotCounter--;
					break;
//				case -1:
					// TODO: NO GHOSTS IN PEN
//					break;

			}
// @TODO Check
//ResourceManager.getSound('chomp').play();
			this.skipPacmanFrame = true;

			if (currentDot.type == Const.tmx.objTypes.energyzer) {
				this.addScore(Const.score.energyzer);
				this.scareGhosts();
			} else {
				this.addScore(Const.score.dot);
			}

			this.tileMap.removeDot(correspondingTiles[i].x, correspondingTiles[i].y);
		}
	}
};

Game.prototype.scareGhosts = function () {
	if (this.ghostScareTimer != null) {
		this.ghostScareTimer.stop();
		this.ghostScareTimer = null;
	}

	this.ghostBehaviorTimer.pause();

	for (var index in this.ghosts) {
		if (this.ghosts[index].status === Const.ghost.status.normal || this.ghosts[index].status === Const.ghost.status.blinking) {
			this.ghosts[index].scare();
		}
	}

	var that = this;

	this.ghostScareTimer = new Timer(function () {
		that.blinkGhosts();
	}, Const.timer.scareTime);
};

Game.prototype.unScareGhosts = function () {
	this.ghostMultiplier = 0;
	this.ghostBehaviorTimer.resume();

	for (var index in this.ghosts) {
		this.ghosts[index].unScare();
	}
};

Game.prototype.blinkGhosts = function () {
	var that = this;

	for (var index in this.ghosts) {
		if (this.ghosts[index].status === Const.ghost.status.frightened) {
			this.ghosts[index].blink();
		}
	}

	this.ghostScareTimer = new Timer(function () {
		that.unScareGhosts();
	}, 1700);
};

Game.prototype.keyHandler = function (keyCode) {
	switch (keyCode) {
		case 38:  /* Up */
			Config.settings.allowTurnoverMargin ? this.startDirectionChange(Const.direction.up) : this.pacMan.changeDirection(Const.direction.up);
			break;
		case 40:  /* Down */
			Config.settings.allowTurnoverMargin ? this.startDirectionChange(Const.direction.down) : this.pacMan.changeDirection(Const.direction.down);
			break;
		case 37:  /* Left */
			Config.settings.allowTurnoverMargin ? this.startDirectionChange(Const.direction.left) : this.pacMan.changeDirection(Const.direction.left);
			break;
		case 39:  /* Right */
			Config.settings.allowTurnoverMargin ? this.startDirectionChange(Const.direction.right) : this.pacMan.changeDirection(Const.direction.right);
			break;
	}
};

Game.prototype.checkDirectionChange = function () {
	var center = {
		x: this.pacMan.x + this.pacMan.w / 2,
		y: this.pacMan.y + this.pacMan.h / 2
	};

	var tile = this.tileMap.getCorrespondingTile(center.x, center.y);
	var targetTile = tile;
	var validMargin = false;
	var tileCenter = {
		x: tile.x * this.tileMap.tileW + this.tileMap.tileW / 2,
		y: tile.y * this.tileMap.tileH + this.tileMap.tileH / 2
	};

	if ((this.dirChangeDirection === Const.direction.up || this.dirChangeDirection === Const.direction.down) &&
		(center.x < tileCenter.x + Const.pacMan.cornering.right) && (center.x > tileCenter.x - Const.pacMan.cornering.left)) {
		validMargin = true;
	} else if ((this.dirChangeDirection === Const.direction.left || this.dirChangeDirection === Const.direction.right) &&
		(center.y < tileCenter.y + Const.pacMan.cornering.down) && (center.y > tileCenter.y - Const.pacMan.cornering.up)) {
		validMargin = true;
	}

	if (!validMargin) {
		return;
	}

	switch (this.dirChangeDirection) {
		case Const.direction.up:
			targetTile.y -= 1;
			break;
		case Const.direction.down:
			targetTile.y += 1;
			break;
		case Const.direction.left:
			targetTile.x -= 1;
			break;
		case Const.direction.right:
			targetTile.x += 1;
			break;
	}

	if (!this.tileMap.hasCollision(targetTile.x, targetTile.y)) {
		this.endDirectionChange(true);
	}

/*
	// @TODO: CHANGE METHOD FOR CHECKING THIS
	// Use current tile and compare center to character center?
	var newDir = this.dirChangeDirection;
	var prevDir = this.pacMan.moveDirection;
	var prevSpeed = this.pacMan.moveSpeed;

	this.pacMan.moveDirection = newDir;
	this.pacMan.moveSpeed = Const.pacMan.baseSpeed;
	this.pacMan.updatePosition();

	if (!this.checkWallCollisions(this.pacMan)) {
		this.endDirectionChange(true);
	} else {
		this.pacMan.revertPosition();
		this.pacMan.moveDirection = prevDir;
		this.pacMan.moveSpeed = prevSpeed;
	}*/
};

Game.prototype.startDirectionChange = function (direction) {
	// Don't allow turnover when the direction is the same
	if (direction === this.pacMan.moveDirection) {
		return;
	}

	var that = this;
	this.dirChangeDirection = direction;
	this.dirChangeTimer = new Timer(function () {
		that.endDirectionChange(false);
	}, Config.settings.turnoverMargin);
};

Game.prototype.endDirectionChange = function (success) {
	if (success) {
		this.pacMan.changeDirection(this.dirChangeDirection);
	}

	this.dirChangeDirection = Const.direction.none;
	this.dirChangeTimer.stop();
};

Game.prototype.updatePositions = function () {

	if (this.dirChangeDirection != Const.direction.none) {
		this.checkDirectionChange();
	}

	if (this.skipPacmanFrame) {
		this.skipPacmanFrame = false;
	} else {
		this.pacMan.updatePosition();

		if (this.checkPacmanWallCollisions()) {
			this.pacMan.revertPosition();
			this.pacMan.stop();
		}
		this.correctPacmanLane();

		this.checkDotCollisions();
	}
	this.ghostManager();

	for (var index in this.ghosts) {

		if (this.ghosts[index].spawned) {
			this.ghosts[index].pathfinding(this.tileMap);
		}

		this.ghosts[index].updatePosition();

		// Horrible patch to correct positions when ghosts would go through a wall
		// @TODO: Create a better movement speed logic
		if ((this.ghosts[index].status === Const.ghost.status.normal || this.ghosts[index].status === Const.ghost.status.frightened
				|| this.ghosts[index].status === Const.ghost.status.returning) && this.checkGhostWallCollisions(this.ghosts[index])) {
			do {
				this.ghosts[index].correctPosition(-0.5);
			} while (this.checkGhostWallCollisions(this.ghosts[index]));
		}
	}
};

Game.prototype.ghostManager = function () {
	for (var i in Const.ghost.key) {
		var ghostKey = Const.ghost.key[i];

		if (this.ghosts[ghostKey].status === Const.ghost.status.waitSpawn) {
			if (!this.spawnConditionsMet(ghostKey)) {
				this.waitSpawn(ghostKey);
			} else {
				this.ghosts[ghostKey].startSpawning();
			}

			continue;
		} else if (this.ghosts[ghostKey].status === Const.ghost.status.spawning) {
			this.spawnGhost(ghostKey);
			continue;
		} else if (this.ghosts[ghostKey].status === Const.ghost.status.returning) {
			this.returnMode(ghostKey);
			continue;
		} else if (this.ghosts[ghostKey].status === Const.ghost.status.enteringPen) {
			this.enterPen(ghostKey);
			continue;
		}

		switch (this.ghostBehavior) {
			case Const.ghost.behavior.chase:
				this.ghostChaseMode(ghostKey);
				break;
			case Const.ghost.behavior.scatter:
				this.ghostScatterMode(ghostKey);
				break;
		}
	}
};

Game.prototype.waitSpawn = function (ghostKey) {
	var ghost = this.ghosts[ghostKey];
	ghost.moveSpeed = Const.ghost.speed.ghostPen;

	// Move the ghost up and down as long as it is waiting to spawn
	if (ghost.moveDirection === Const.direction.up && ghost.y <= this.tileMap.ghostPen.y) {
		ghost.changeDirection(Const.direction.down);
	} else if (ghost.moveDirection === Const.direction.down && ghost.y + ghost.h >= this.tileMap.ghostPen.y + this.tileMap.ghostPen.h) {
		ghost.changeDirection(Const.direction.up);
	}
};

Game.prototype.spawnGhost = function (ghostKey) {
	var ghost = this.ghosts[ghostKey];
	var ghostCenterX = ghost.x + (ghost.w / 2);
	var ghostPenCenterX = this.tileMap.ghostPen.x + (this.tileMap.ghostPen.w / 2);

	if (ghostCenterX >= ghostPenCenterX - 0.75 && ghostCenterX <= ghostPenCenterX + 0.75) {
		if (ghost.moveDirection !== Const.direction.up) {
			ghost.changeDirection(Const.direction.up);
		} else {
			var currentTile = this.tileMap.getCorrespondingTile(ghost.x, ghost.y + ghost.h);

			if (currentTile.y === Const.targetTiles.ghostPen.y) {

				if (ghostKey === Const.ghost.key.inky && this.activeGhostCounter === Const.ghost.key.inky) {
					this.activeGhostCounter = Const.ghost.key.clyde;
				} else if (ghostKey === Const.ghost.key.clyde && this.activeGhostCounter === Const.ghost.key.clyde) {
					this.activeGhostCounter = -1;
				}

				ghost.spawn();
				ghost.changeBehavior(this.ghostBehavior, false);
			}
		}
	} else if (ghostCenterX < ghostPenCenterX && ghost.moveDirection !== Const.direction.right) {
		ghost.changeDirection(Const.direction.right);
	} else if (ghostCenterX > ghostPenCenterX && ghost.moveDirection !== Const.direction.left) {
		ghost.changeDirection(Const.direction.left);
	}
};

Game.prototype.spawnConditionsMet = function (ghostKey) {
	// @TODO: Add additional timers and conditions
	if (this.ghosts[ghostKey].dotCounter > 0) {
		return false;
	} else {

		switch (ghostKey) {
			case Const.ghost.key.clyde:
				if (!this.ghosts[Const.ghost.key.inky].spawned) {
					return false;
				}
				break;
			case Const.ghost.key.inky:
				if (!this.ghosts[Const.ghost.key.pinky].spawned) {
					return false;
				}
				break;
			case Const.ghost.key.pinky:
				if (!this.ghosts[Const.ghost.key.blinky].spawned) {
					return false;
				}
				break;
		}

		return true;
	}
};

Game.prototype.ghostChaseMode = function (ghostKey) {
	var pacManTile = this.tileMap.getCorrespondingTile(this.pacMan.x + (this.pacMan.w / 2), this.pacMan.y + (this.pacMan.h / 2));
	var targetTile = null;

	switch (ghostKey) {
		case Const.ghost.key.blinky:
			targetTile = this.getBlinkyChaseTile(pacManTile);
			break;
		case Const.ghost.key.inky:
			targetTile = this.getInkyChaseTile(pacManTile);
			break;
		case Const.ghost.key.pinky:
			targetTile = this.getPinkyChaseTile(pacManTile);
			break;
		case Const.ghost.key.clyde:
			targetTile = this.getClydeChaseTile(pacManTile);
			break;
	}

	this.ghosts[ghostKey].setTargetTile(targetTile.x, targetTile.y);
};

Game.prototype.getBlinkyChaseTile = function (pacManTile) {
	return {
		x: pacManTile.x,
		y: pacManTile.y
	};
};

Game.prototype.getInkyChaseTile = function (pacManTile) {
	var blinky = this.ghosts[Const.ghost.key.blinky];
	var blinkyTile = this.tileMap.getCorrespondingTile(blinky.x + blinky.w / 2, blinky.y + blinky.h / 2);

	var tile = {
		x: pacManTile.x,
		y: pacManTile.y
	};

	switch (this.pacMan.moveDirection) {
		case Const.direction.up:
			tile.y -= 2;
			// Reproduce original game bug (Not intended?)
			tile.x -= 2;
			break;
		case Const.direction.down:
			tile.y += 2;
			break;
		case Const.direction.left:
			tile.x -= 2;
			break;
		case Const.direction.right:
			tile.x += 2;
			break;
	}

	tile.x += pacManTile.x - blinkyTile.x;
	tile.y += pacManTile.y - blinkyTile.y;

	return tile;
};

Game.prototype.getPinkyChaseTile = function (pacManTile) {
	var tile = {
		x: pacManTile.x,
		y: pacManTile.y
	};

	switch (this.pacMan.moveDirection) {
		case Const.direction.up:
			tile.y -= 4;
			// Reproduce original game bug (Not intended?)
			tile.x -= 4;
			break;
		case Const.direction.down:
			tile.y += 4;
			break;
		case Const.direction.left:
			tile.x -= 4;
			break;
		case Const.direction.right:
			tile.x += 4;
			break;
	}

	return tile;
};

Game.prototype.getClydeChaseTile = function (pacManTile) {
	var clyde = this.ghosts[Const.ghost.key.clyde];

	var clydeTile = this.tileMap.getCorrespondingTile(clyde.x + (clyde.w / 2), clyde.y + (clyde.h / 2));
	var clydeDistance = Math.abs(pacManTile.x - clydeTile.x) + Math.abs(pacManTile.y - clydeTile.y);

	var tile = {
		x: pacManTile.x,
		y: pacManTile.y
	};

	if (clydeDistance < 8) {
		tile.x = Const.targetTiles.scatter.clyde.x;
		tile.y = Const.targetTiles.scatter.clyde.y;
	}

	return tile;
};

Game.prototype.changeGhostBehavior = function (behavior) {
	this.ghostBehavior = behavior;

	for (var i in this.ghosts) {
		this.ghosts[i].revertDirectionFlag = true;

		if (this.ghosts[i].status === Const.ghost.status.normal) {
			this.ghosts[i].changeBehavior(behavior);
		}
	}
};

Game.prototype.ghostScatterMode = function (ghostKey) {
	var targetTile = null;

	switch (ghostKey) {
		case Const.ghost.key.blinky:
			if (this.ghosts[Const.ghost.key.blinky].aggresiveMode) {
				this.ghostChaseMode(Const.ghost.key.blinky);
				return;
			} else {
				targetTile = {
					x: Const.targetTiles.scatter.blinky.x,
					y: Const.targetTiles.scatter.blinky.y
				};
			}
			break;
		case Const.ghost.key.inky:
			targetTile = {
				x: Const.targetTiles.scatter.inky.x,
				y: Const.targetTiles.scatter.inky.y
			};
			break;
		case Const.ghost.key.pinky:
			targetTile = {
				x: Const.targetTiles.scatter.pinky.x,
				y: Const.targetTiles.scatter.pinky.y
			};
			break;
		case Const.ghost.key.clyde:
			targetTile = {
				x: Const.targetTiles.scatter.clyde.x,
				y: Const.targetTiles.scatter.clyde.y
			};
			break;
	}

	this.ghosts[ghostKey].setTargetTile(targetTile.x, targetTile.y);
};

Game.prototype.returnMode = function (ghostKey) {
	var currentGhost = this.ghosts[ghostKey];
	var ghostTile = this.tileMap.getCorrespondingTile(currentGhost.x + currentGhost.w / 2, currentGhost.y + currentGhost.h / 2);

	// Enter pen when within the area inmediately above the gate
	if (((currentGhost.moveDirection === Const.direction.right && ghostTile.x === Const.targetTiles.ghostPen.x)
			|| (currentGhost.moveDirection === Const.direction.left && ghostTile.x === Const.targetTiles.ghostPen.x - 1))
			&& ghostTile.y === Const.targetTiles.ghostPen.y) {
		currentGhost.changeDirection(Const.direction.down);
		currentGhost.status = Const.ghost.status.enteringPen;
	} else {
		currentGhost.setTargetTile(Const.targetTiles.ghostPen.x, Const.targetTiles.ghostPen.y);
	}
};

Game.prototype.enterPen = function (ghostKey) {
	var currentGhost = this.ghosts[ghostKey];

	if (currentGhost.y >= (this.tileMap.ghostPen.y + this.tileMap.ghostPen.h / 2)) {
		currentGhost.respawn();
	}
};

Game.prototype.draw = function () {
	this.clear();

	this.tileMap.drawObjectLayers(this.graphics);

	if (this.state !== Const.gameState.gameOver) {
		if (this.state !== Const.gameState.dying) {
			this.ghosts[Const.ghost.key.blinky].draw(this.graphics);
			this.ghosts[Const.ghost.key.pinky].draw(this.graphics);
			this.ghosts[Const.ghost.key.inky].draw(this.graphics);
			this.ghosts[Const.ghost.key.clyde].draw(this.graphics);
		}

		this.pacMan.draw(this.graphics);
	}
	this.drawHud();
};

Game.prototype.clear = function () {
	this.graphics.clearRect(0, 0, this.graphics.canvas.width, this.graphics.canvas.height);
};

Game.prototype.addScore = function (score) {
	this.score += score;

	// Check the high scores
	if (this.score >= this.highScore) {
		this.highScoreReached = true;
		this.highScore = this.score;
		localStorage.pm_high = this.highScore;
	}

	if (this.score % 3000 === 0) {
		this.playerLives++;
	}
};

Game.prototype.drawHud = function () {
	var g = this.hudGraphics;

	g.clearRect(0, 0, g.canvas.width, g.canvas.height);
	g.strokeStyle = '#FFF';
	g.textAlign = 'center';

	g.strokeText('1UP', Const.board.w / 8, 10);
	g.strokeText(this.score, Const.board.w / 8, 20);

	g.strokeText('HIGH SCORE', Const.board.w / 2, 10);
	g.strokeText(this.highScore, Const.board.w / 2, 20);

	// Draw the lives counter
	var drawingLife = 0;
	var lifeSprite = ResourceManager.getSprite('pacman');
	var currentX = 5;

	while (drawingLife < this.playerLives) {
		if (Config.settings.missPacMan) {
			g.drawImage(lifeSprite.image, 83, 3, 15, 15, currentX + (20 * drawingLife), Const.board.h - 50, 17, 17);
		} else {
			g.drawImage(lifeSprite.image, 3, 3, 13, 13, currentX + (20 * drawingLife), Const.board.h - 50, 17, 17);
		}
		
		drawingLife++;
	}

	// Ready sign
	if (this.state === Const.gameState.ready) {
		g.drawImage(lifeSprite.image, 203, 2, 46, 7, Const.board.w / 2 - 46, Const.board.h / 2 + 20, 92, 14);
	} else if (this.state === Const.gameState.gameOver) {
		g.drawImage(lifeSprite.image, 13, 192, 79, 7, Const.board.w / 2 - 79, Const.board.h / 2 + 20, 158, 14);
	}

	var debugText = new Array();

	if (Config.debug.eatenDotCounter) {
		debugText.push('Eaten Dots: ' + this.eatenDots);
	}

	if (Config.debug.remainingDotCounter) {
		debugText.push('Remaining Dots: ' + this.tileMap.dotCount);
	}

	for (var i in debugText) {
		g.strokeStyle = '#0F0';
		g.textAlign = 'left';
		g.strokeText(debugText[i], Const.board.w - 100, 10 + (10 * i));
	}
};

Game.prototype.checkRemainingDots = function () {
	if (this.tileMap.dotCount === 0) {
		this.state = Const.gameState.endLevel;
		this.nextLevel();
	}
};

Game.prototype.killPacMan = function () {
	var deathSound = ResourceManager.getSound('death');
	var callback = null;
	var that = this;

	this.state = Const.gameState.dying;
	this.playerLives--;

	this.removeFruit();

	// When lives reach zero, game over man
	if (this.playerLives) {
		callback = function () {
			that.stateTimer = null;
			that.resetLevel();
		};
	} else {
		callback = function () {
			that.stateTimer = null;
			that.gameOver();
		};
	}

	deathSound.onFinish( function () {
		that.stateTimer = new Timer(function () {
			callback();
		}, 1000);
	});

	deathSound.play();
	this.pacMan.die();
};

Game.prototype.resetLevel = function () {
	this.resetCharacters();
	this.showReadyScreen();
};

Game.prototype.nextLevel = function () {
	var that = this;
	this.ghostBehaviorTimer.stop();
	this.ghostBehaviorTimer = null;
	this.stateTimer = new Timer(function () {
		that.initializeLevel();
	}, 1000);

	this.activeMap++;

	if (this.activeMap >= this.mapList.length) {
		this.activeMap = 0;
	}

	this.clear();
};

Game.prototype.gameOver = function () {
	this.state = Const.gameState.gameOver;

	var that = this;
	this.stateTimer = new Timer(function () {
		that.playerLives = 3;
		that.activeMap = 0;
		that.score = 0;
		that.initializeLevel();
	}, 3000);
};

Game.prototype.setGhostMode = function (mode) {
	var that = this;
	this.ghostBehavior = mode;

	if (mode === Const.ghost.behavior.scatter) {
		this.ghostBehaviorTimer = new Timer(function () {
			that.setGhostMode(Const.ghost.behavior.chase);
		}, Const.timer.scatterTime);
	} else if (mode === Const.ghost.behavior.chase) {
		this.ghostBehaviorTimer = new Timer(function () {
			that.setGhostMode(Const.ghost.behavior.scatter);
		}, Const.timer.chaseTime);
	}
};

Game.prototype.checkFruitRequirement = function () {
	if (this.eatenDots === this.tileMap.fruitDotRequirement) {
		this.tileMap.enableFruit();
	}
};

Game.prototype.removeFruit = function () {
	if (this.tileMap.fruitVisible) {
		this.tileMap.removeFruit();
	}
};

Game.prototype.correctPacmanLane = function () {
	var currentTile = this.tileMap.getCorrespondingTile(this.pacMan.x, this.pacMan.y);
	switch (this.pacMan.moveDirection) {
		case Const.direction.up:
		case Const.direction.down:
			var currentTileCenterX = currentTile.x * this.tileMap.tileW + (this.tileMap.tileW / 2);
			var pacManCenterX = this.pacMan.x + this.pacMan.w / 2;
			currentTileCenterX += 1;

			if (pacManCenterX < currentTileCenterX && pacManCenterX > currentTileCenterX - Const.pacMan.cornering.left) {
				this.pacMan.x++;
			} else if (pacManCenterX > currentTileCenterX && pacManCenterX < currentTileCenterX + Const.pacMan.cornering.right) {
				this.pacMan.x--;
			}

			break;
		case Const.direction.left:
		case Const.direction.right:
			var currentTileCenterY = currentTile.y * this.tileMap.tileH + (this.tileMap.tileH / 2);
			var pacManCenterY = this.pacMan.y + this.pacMan.h / 2;

			if (pacManCenterY < currentTileCenterY && pacManCenterY > currentTileCenterY - Const.pacMan.cornering.up) {
				this.pacMan.y++;
			} else if (pacManCenterY > currentTileCenterY && pacManCenterY < currentTileCenterY + Const.pacMan.cornering.down) {
				this.pacMan.y--;
			}

			break;
	}
};