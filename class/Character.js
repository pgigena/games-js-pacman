function Character(x, y, w, h) {
	Collidable.apply(this, x, y, w, h);
	this.prevPos = new Vector();

	this.prevMoveDirection = null;

	this.moveDirection = Const.direction.stopped;
	this.moveSpeed = 1;
	this.animations = new Array();
	this.currentAnimation = -1;

	this.paused = false;
}

Character.subclass(Collidable);

Character.prototype.updatePosition = function () {
	if (this.paused) {
		return;
	}

	this.prevPos.x = this.pos.x;
	this.prevPos.y = this.pos.y;

	var newPos = new Vector(this.pos.x, this.pos.y)

	var center = {
		x: this.pos.x + (this.bounds.w / 2),
		y: this.pos.y + (this.bounds.h / 2)
	};

	switch (this.moveDirection) {
		case Const.direction.left:
			newPos.x = this.pos.x - this.moveSpeed;

			if (center.x - this.moveSpeed < 0) {
				newPos.x = Const.board.w - Math.round(this.bounds.w / 2);
			}
			break;
		case Const.direction.right:
			newPos.x = this.pos.x + this.moveSpeed;

			if (center.x + this.moveSpeed > Const.board.w) {
				newPos.x = 0 - Math.round(this.bounds.w / 2);
			}

			break;
		case Const.direction.up:
			newPos.y = this.pos.y - this.moveSpeed;

			if (center.y - this.moveSpeed < 0) {
				newPos.y = Const.board.h - Math.round(this.bounds.h / 2);
			}

			break;
		case Const.direction.down:
			newPos.y = this.pos.y + this.moveSpeed;

			if (center.y + this.moveSpeed > Const.board.h) {
				newPos.y = 0 - Math.round(this.bounds.h / 2);
			}
			break;
		case Const.direction.stopped:
			break;
	}

	this.pos.x = newPos.x;
	this.pos.y = newPos.y;
};

Character.prototype.revertPosition = function () {
	this.pos.x = this.prevPos.x;
	this.pos.y = this.prevPos.y;
};

Character.prototype.revertDirection = function () {
	this.moveDirection = this.prevMoveDirection;
};

Character.prototype.changeDirection = function (moveDirection) {
	this.prevMoveDirection = this.moveDirection;
	this.moveDirection = moveDirection;
};

Character.prototype.draw = function (g) {
	var overflowX = 0, overflowY = 0;
	var bounds = {
		left: this.pos.x,
		right: this.pos.x + this.bounds.w,
		top: this.pos.y,
		bottom: this.pos.y + this.bounds.h
	};

	if (bounds.left <= 0) {
		overflowX = 0 - bounds.left;
	}

	if (bounds.right >= Const.board.w) {
		overflowX = bounds.right - Const.board.w;
	}

	if (bounds.top <= 0) {
		overflowY = 0 - bounds.top;
	}

	if (bounds.bottom >= Const.board.h) {
		overflowY = bounds.bottom - Const.board.h;
	}

	if (Config.debug.characterBounds) {
		g.strokeStyle = '#FFFFFF';
		g.strokeRect(this.pos.x * Config.settings.scale, this.pos.y * Config.settings.scale, this.bounds.w * Config.settings.scale, this.bounds.h * Config.settings.scale);
	}

//	this.animations[this.currentAnimation].draw(this.pos.x, this.pos.y, this.bounds.w, this.bounds.h, overflowX, overflowY, g);
	this.animations[this.currentAnimation].draw(this.pos.x * Config.settings.scale, this.pos.y * Config.settings.scale, this.bounds.w * Config.settings.scale, this.bounds.h * Config.settings.scale, overflowX, overflowY, g);
};

Character.prototype.changeAnimation = function (animationIndex) {
	if (this.currentAnimation !== animationIndex) {
		if (this.animations.hasOwnProperty(this.currentAnimation)) {
			this.animations[this.currentAnimation].endAnimation();
		}
		this.currentAnimation = animationIndex;

		this.animations[this.currentAnimation].startAnimation();
	}
};

Character.prototype.stop = function () {
	this.animations[this.currentAnimation].endAnimation();
	this.moveSpeed = 0;
};

Character.prototype.pause = function () {
	this.paused = true;
	this.animations[this.currentAnimation].pause();
};

Character.prototype.resume = function () {
	this.paused = false;
	this.animations[this.currentAnimation].resume();
};