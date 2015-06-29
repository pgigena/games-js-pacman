/* global Const, Character */

"use strict";

function Ghost(x, y, w, h) {
	Character.apply(this, x, y, w, h);

	this.animationKeys = {
		moveUp: 0,
		moveDown: 1,
		moveLeft: 2,
		moveRight: 3,
		frightened: 4,
		flashing: 5,
		returningUp: 6,
		returningDown: 7,
		returningLeft: 8,
		returningRight: 9
	};

	this.spriteOffsetY = 0;

	this.revertDirectionFlag = false;

	this.name = 'Ghost';

	this.behavior = Const.ghost.behavior;
	this.status = Const.ghost.status.normal;
	this.moveDirection = Const.direction.stopped;

	this.dotCounter = 0;
	this.spawned = false;

	this.targetTile = new Vector();
}

Ghost.subclass(Character);

Ghost.prototype.initialize = function () {
	this.moveSpeed = Const.ghost.speed.base;

	this.bounds.w = 17;
	this.bounds.h = 17;
};

Ghost.prototype.initAnimations = function (sprite, offsetY) {
	var w = 14, h = 14;
	var offsetX = 3, offsetY = offsetY;
	var ghostTicsPerSecond = 10;
	var padding = 6;

	// Offset coordinates for specific common animations
	var returningY = 203;
	var scaredY = 163;

	// Directional animations
	for (var frameDirection = 0; frameDirection < 4; frameDirection++) {
		// All the animations of a ghost are on a single line, so each one is two frames ahead of the previous offset
		var curDirOffsetX = offsetX + ((w + padding) * 2) * frameDirection;

		// Normal animation
		this.animations[frameDirection] = new Animation(sprite, true, true, ghostTicsPerSecond);
		this.animations[frameDirection].initialize(curDirOffsetX, offsetY, w, h, padding, 2);
		this.animations[frameDirection].frameSequence = new Array(0, 1);

		// Returning
		this.animations[frameDirection + 6] = new Animation(sprite, false, true, ghostTicsPerSecond);
		this.animations[frameDirection + 6].initialize(offsetX + (w + padding) * frameDirection, returningY, w, h, padding, 1);
		this.animations[frameDirection + 6].frameSequence[0] = 0;
	}

	// Scared
	this.animations[this.animationKeys.frightened] = new Animation(sprite, true, true, 10);
	this.animations[this.animationKeys.frightened].initialize(offsetX, scaredY, w, h, padding, 2);
	this.animations[this.animationKeys.frightened].frameSequence = new Array(0, 1);

	// Flashing
	this.animations[this.animationKeys.flashing] = new Animation(sprite, true, true, ghostTicsPerSecond);
	this.animations[this.animationKeys.flashing].initialize(offsetX, scaredY, w, h, padding, 4);
	this.animations[this.animationKeys.flashing].frameSequence = new Array(0, 1, 2, 3);
};

Ghost.prototype.changeDirection = function (direction) {
	var animation = Const.direction.none;

	// Only reset the animation if the ghost is not "scared"
	if (this.status !== Const.ghost.status.frightened && this.status !== Const.ghost.status.blinking) {
		switch (direction) {
			case Const.direction.left:
				animation = (this.status === Const.ghost.status.returning ? this.animationKeys.returningLeft : this.animationKeys.moveLeft);
				break;
			case Const.direction.right:
				animation = (this.status === Const.ghost.status.returning ? this.animationKeys.returningRight : this.animationKeys.moveRight);
				break;
			case Const.direction.up:
				animation = (this.status === Const.ghost.status.returning ? this.animationKeys.returningUp : this.animationKeys.moveUp);
				break;
			case Const.direction.down:
				animation = (this.status === Const.ghost.status.returning ? this.animationKeys.returningDown : this.animationKeys.moveDown);
				break;
		}

		if (animation !== Const.direction.none) {
			this.changeAnimation(animation);
		}
	}

	Character.prototype.changeDirection.call(this, direction);
};

Ghost.prototype.isHostile = function () {
	return (this.status === Const.ghost.status.frightened || this.status === Const.ghost.status.blinking ? false : true);
};

Ghost.prototype.isReturning = function () {
	return (this.status === Const.ghost.status.returning ? true : false);
};

Ghost.prototype.startSpawning = function () {
	this.status = Const.ghost.status.spawning;
};

Ghost.prototype.spawn = function () {
	this.changeDirection(Const.direction.left);
	this.status = Const.ghost.status.normal;

	this.spawned = true;
};

Ghost.prototype.changeBehavior = function (behavior) {
	this.behavior = behavior;
	this.moveSpeed = Const.ghost.speed.base;
};

Ghost.prototype.respawn = function () {
	this.status = Const.ghost.status.waitSpawn;
	this.moveSpeed = Const.ghost.speed.ghostPen;
	this.spawned = false;

	switch (this.moveDirection) {
		case Const.direction.up:
			this.changeAnimation(this.animationKeys.moveUp);
			break;
		case Const.direction.down:
			this.changeAnimation(this.animationKeys.moveDown);
			break;
		case Const.direction.left:
			this.changeAnimation(this.animationKeys.moveLeft);
			break;
		case Const.direction.right:
			this.changeAnimation(this.animationKeys.moveRight);
			break;
	}
};

Ghost.prototype.scare = function () {
	if (this.status !== Const.ghost.status.frightened || this.status !== Const.ghost.status.returning) {
		this.status = Const.ghost.status.frightened;
		this.revertDirectionFlag = true;

		this.moveSpeed = Const.ghost.speed.scared;
		this.changeAnimation(this.animationKeys.frightened);
	}
};

Ghost.prototype.blink = function () {
	if (this.status === Const.ghost.status.frightened) {
		this.status = Const.ghost.status.blinking;
		this.changeAnimation(this.animationKeys.flashing);
	}
};

Ghost.prototype.unScare = function () {
	if (this.status === Const.ghost.status.blinking) {
		// Previous behavior
		this.status = Const.ghost.status.normal;
		this.moveSpeed = Const.ghost.speed.base;
		this.changeAnimation(this.moveDirection);
	}
};

Ghost.prototype.die = function () {
	this.status = Const.ghost.status.returning;
	this.moveSpeed = Const.ghost.speed.returning;

	switch (this.moveDirection) {
		case Const.direction.up:
			this.changeAnimation(this.animationKeys.returningUp);
			break;
		case Const.direction.down:
			this.changeAnimation(this.animationKeys.returningDown);
			break;
		case Const.direction.left:
			this.changeAnimation(this.animationKeys.returningLeft);
			break;
		case Const.direction.right:
			this.changeAnimation(this.animationKeys.returningRight);
			break;
	}
};

Ghost.prototype.setTargetTile = function (x, y) {
	this.targetTile = new Vector(x, y);
};

Ghost.prototype.pathfinding = function (tileMap) {
	var currentTiles = tileMap.getCorrespondingTiles(this.pos.x, this.pos.y, this.bounds.w, this.bounds.h);

	if (currentTiles.length > 1) {
		return;
	}

	var currentTile = currentTiles[0];
	if (this.revertDirectionFlag) {
		this.revertDirection();
	}

	// On intersections, the ghost will choose the closest tile to his target
	if (tileMap.hasIntersection(currentTile.x, currentTile.y)) {
		// If the ghost is frightened, it will choose a random direction
		if (this.status !== Const.ghost.status.frightened && this.status !== Const.ghost.status.blinking) {
			this.navigateIntersection(currentTile, tileMap);
		} else {
			this.fleeModeNavigateItersection(currentTile, tileMap);
		}
	} else {
		this.navigate(currentTile, tileMap);
	}

};

Ghost.prototype.fleeModeNavigateItersection = function (currentTile, tileMap) {
	var randomDirection = Math.floor((Math.random() * 4) + 1);

	while (!this.isValidFleeDirection(currentTile, randomDirection, tileMap)) {
		randomDirection = this.getNextClockwiseDirection(randomDirection);
	}

	this.changeDirection(randomDirection);
};

Ghost.prototype.isValidFleeDirection = function (currentTile, direction, tileMap) {
	var tile = this.getInmediateTile(currentTile, direction);

	if (direction === this.getOppositeDirection(this.moveDirection) || tileMap.hasCollision(tile.x, tile.y)) {
		return false;
	}

	return true;
};

Ghost.prototype.navigate = function (currentTile, tileMap) {
	switch (this.moveDirection) {
		case Const.direction.up:
			if (tileMap.hasCollision(currentTile.x, currentTile.y - 1)) {
				if (!tileMap.hasCollision(currentTile.x - 1, currentTile.y)) {
					this.changeDirection(Const.direction.left);
				} else if (!tileMap.hasCollision(currentTile.x + 1, currentTile.y)) {
					this.changeDirection(Const.direction.right);
				}
			}
			break;
		case Const.direction.left:
			if (tileMap.hasCollision(currentTile.x - 1, currentTile.y)) {
				if (!tileMap.hasCollision(currentTile.x, currentTile.y - 1)) {
					this.changeDirection(Const.direction.up);
				} else if (!tileMap.hasCollision(currentTile.x, currentTile.y + 1)) {
					this.changeDirection(Const.direction.down);
				}
			}
			break;
		case Const.direction.down:
			if (tileMap.hasCollision(currentTile.x, currentTile.y + 1)) {
				if (!tileMap.hasCollision(currentTile.x - 1, currentTile.y)) {
					this.changeDirection(Const.direction.left);
				} else if (!tileMap.hasCollision(currentTile.x + 1, currentTile.y)) {
					this.changeDirection(Const.direction.right);
				}
			}
			break;
		case Const.direction.right:
			if (tileMap.hasCollision(currentTile.x + 1, currentTile.y)) {
				if (!tileMap.hasCollision(currentTile.x, currentTile.y - 1)) {
					this.changeDirection(Const.direction.up);
				} else if (!tileMap.hasCollision(currentTile.x, currentTile.y + 1)) {
					this.changeDirection(Const.direction.down);
				}
			}
			break;
	}
};

Ghost.prototype.navigateIntersection = function (currentTile, tileMap) {
	var minDistance = null;
	var closestTiles = new Array();
	var nextTile = null;

	var possibleTiles = tileMap.getValidAdjacentTiles(currentTile.x, currentTile.y);

	for (var i in possibleTiles) {
		// Exclude any tile "behind" the ghost
		if ((this.moveDirection === Const.direction.up && possibleTiles[i].y > currentTile.y)
				|| (this.moveDirection === Const.direction.down && possibleTiles[i].y < currentTile.y)
				|| (this.moveDirection === Const.direction.left && possibleTiles[i].x > currentTile.x)
				|| (this.moveDirection === Const.direction.right && possibleTiles[i].x < currentTile.x)) {
			continue;
		}

		// Exclude forbidden directions
		var forbiddenDirection = tileMap.getLimitedDirection(currentTile.x, currentTile.y);

		if ((possibleTiles[i].y < currentTile.y && forbiddenDirection === Const.direction.up)
				|| (possibleTiles[i].y > currentTile.y && forbiddenDirection === Const.direction.down)
				|| (possibleTiles[i].x < currentTile.x && forbiddenDirection === Const.direction.left)
				|| (possibleTiles[i].x > currentTile.x && forbiddenDirection === Const.direction.right)) {
			continue;
		}

		var y = Math.abs(this.targetTile.y - possibleTiles[i].y);
		var x = Math.abs(this.targetTile.x - possibleTiles[i].x);

		var tileDistance = Math.sqrt(x * x + y * y);

		// Find closest tile(s)
		if ((minDistance === null)) {
			closestTiles[0] = possibleTiles[i];
			minDistance = tileDistance;
		} else if (tileDistance < minDistance) {
			// Clear and set new minimum
			closestTiles.length = 0;
			closestTiles[0] = possibleTiles[i];
			minDistance = tileDistance;
		} else if (tileDistance === minDistance) {
			closestTiles.push(possibleTiles[i]);
		}

	}

	if (closestTiles.length > 1) {
		var orderedDirections = closestTiles.slice(0);

		// Order the tiles counter clockwise
		for (var i = 0, j; i < orderedDirections.length; ++i) {
			var currentDirection = this.getTileDirection(currentTile, orderedDirections[i]);
			for (j = (i - 1); j >= 0 && orderedDirections[j] > currentDirection; --j) {
				orderedDirections[j + 1] = orderedDirections[j];
				closestTiles[j + 1] = closestTiles[j];
			}
			orderedDirections[j + 1] = currentDirection;
			closestTiles[j + 1] = closestTiles[i];
		}

		this.changeDirection(this.convertOrderToDirection(orderedDirections[0]));
	} else {
		nextTile = closestTiles[0];

		if (this.moveDirection != Const.direction.up && nextTile.y < currentTile.y) {
			this.changeDirection(Const.direction.up);
		} else if (this.moveDirection != Const.direction.left && nextTile.x < currentTile.x) {
			this.changeDirection(Const.direction.left);
		} else if (this.moveDirection != Const.direction.down && nextTile.y > currentTile.y) {
			this.changeDirection(Const.direction.down);
		} else if (this.moveDirection != Const.direction.right && nextTile.x > currentTile.x) {
			this.changeDirection(Const.direction.right);
		}
	}
};

Ghost.prototype.getTileDirection = function (origin, destination) {
	if (destination.y < origin.y) {
		return 0;
	} else if (destination.x < origin.x) {
		return 1;
	} else if (destination.y > origin.y) {
		return 2;
	} else {
		return 3;
	}
};

Ghost.prototype.convertOrderToDirection = function (direction) {
	switch (direction) {
		case 0:
			return Const.direction.up;
		case 1:
			return Const.direction.left;
		case 2:
			return Const.direction.down;
		case 3:
			return Const.direction.right;
	}
};

Ghost.prototype.revertDirection = function () {
	this.revertDirectionFlag = false;
	this.changeDirection(this.getOppositeDirection(this.moveDirection));
};


Ghost.prototype.correctPosition = function (correctionMargin) {
	this.prevPos.x = this.pos.x;
	this.prevPos.y = this.pos.y;

	var newPos = new Vector(this.pos.x, this.pos.y);

	var center = new Vector(
		this.pos.x + (this.bounds.w / 2),
		this.pos.y + (this.bounds.h / 2));

	switch (this.moveDirection) {
		case Const.direction.left:
			newPos.x = this.pos.x - correctionMargin;

			if (center.x - correctionMargin < 0) {
				newPos.x = Const.board.w - Math.round(this.bounds.w / 2);
			}
			break;
		case Const.direction.right:
			newPos.x = this.pos.x + correctionMargin;

			if (center.x + correctionMargin > Const.board.w) {
				newPos.x = 0 - Math.round(this.bounds.w / 2);
			}

			break;
		case Const.direction.up:
			newPos.y = this.pos.y - correctionMargin;

			if (center.y - correctionMargin < 0) {
				newPos.y = Const.board.h - Math.round(this.bounds.h / 2);
			}

			break;
		case Const.direction.down:
			newPos.y = this.pos.y + correctionMargin;

			if (center.y + correctionMargin > Const.board.h) {
				newPos.y = 0 - Math.round(this.bounds.h / 2);
			}
			break;
	}

	this.pos.x = newPos.x;
	this.pos.y = newPos.y;
};

Ghost.prototype.getOppositeDirection = function (direction) {
	switch (direction) {
		case Const.direction.up:
			return Const.direction.down;
		case Const.direction.down:
			return Const.direction.up;
		case Const.direction.left:
			return Const.direction.right;
		case Const.direction.right:
			return Const.direction.left;
		default:
			throw ('Invalid direction [' + direction + ']');
	}
};

Ghost.prototype.getNextClockwiseDirection = function (direction) {
	switch (direction) {
		case Const.direction.up:
			return Const.direction.right;
		case Const.direction.right:
			return Const.direction.down;
		case Const.direction.down:
			return Const.direction.left;
		case Const.direction.left:
			return Const.direction.up;
	}
};

Ghost.prototype.getInmediateTile = function (offset, direction) {
	var tile = {
		x: offset.x,
		y: offset.y
	};

	switch (direction) {
		case Const.direction.up:
			tile.y -= 1;
			break;
		case Const.direction.down:
			tile.y += 1;
			break;
		case Const.direction.left:
			tile.x -= 1;
			break;
		case Const.direction.right:
			tile.x += 1;
			break;
	}

	return tile;
};