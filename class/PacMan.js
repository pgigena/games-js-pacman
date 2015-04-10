function PacMan(x, y, w, h) {
	Character.apply(this, x, y, w, h);

	this.animationKeys = {
		moveLeft: 0,
		moveRight: 1,
		moveUp: 2,
		moveDown: 3,
		dying: 4,
		starting: 5
	};
}

PacMan.subclass(Character);

PacMan.prototype.initialize = function () {
	this.w = 18;
	this.h = 18;

	this.moveDirection = Const.direction.none;
	this.moveSpeed = Const.pacMan.baseSpeed;
};

PacMan.prototype.initAnimations = function (sprite) {
	var offsetX = 3, offsetY = 3;
	var w = 13, h = 13;
	var padding = 7;

	var closedMouthFrame = new AnimationFrame(43, offsetY, w, h);

	// Animation for standing
	this.animations[this.animationKeys.starting] = new Animation(sprite, false);
	this.animations[this.animationKeys.starting].frames.push(closedMouthFrame);
	this.animations[this.animationKeys.starting].frameSequence[0] = 0;

	// Animation for each direction
	for (var frameDirection = 0; frameDirection < 4; frameDirection++) {
		var currentY = offsetY + (h + padding) * frameDirection;

		this.animations[frameDirection] = new Animation(sprite);
		this.animations[frameDirection].initialize(offsetX, currentY, w, h, padding, 2);
		this.animations[frameDirection].frames.push(closedMouthFrame);
		this.animations[frameDirection].frameSequence = new Array(0, 1, 0, 2);
	}

	// Death Animation
	this.animations[this.animationKeys.dying] = new Animation(sprite, false, true, 10);
	this.animations[this.animationKeys.dying].initialize(3, 245, 13, 13, 7, 12);
	this.animations[this.animationKeys.dying].frameSequence = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);

	// Set default animation
	this.currentAnimation = this.animationKeys.starting;
};

PacMan.prototype.changeDirection = function (direction, noAnimation) {
	if (!this.moveSpeed) {
		this.moveSpeed = Const.pacMan.baseSpeed;
	}

	if (noAnimation == undefined || noAnimation) {
		// Self behavior
		switch (direction) {
			case Const.direction.left:
				this.changeAnimation(this.animationKeys.moveLeft);
				break;
			case Const.direction.right:
				this.changeAnimation(this.animationKeys.moveRight);
				break;
			case Const.direction.up:
				this.changeAnimation(this.animationKeys.moveUp);
				break;
			case Const.direction.down:
				this.changeAnimation(this.animationKeys.moveDown);
				break;
			case Const.direction.stopped:
				this.stop();
				break;
		}
	}

	Character.prototype.changeDirection.call(this, direction);
};

PacMan.prototype.die = function () {
	this.moveSpeed = 0;
	this.changeAnimation(this.animationKeys.dying);
};