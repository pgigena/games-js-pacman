function Collidable(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

Collidable.subclass(Object);

Collidable.prototype.setX = function (x) {
	this.x = x;
};

Collidable.prototype.setY = function (y) {
	this.y = y;
};

Collidable.prototype.setW = function (x) {
	this.x = x;
};

Collidable.prototype.setH = function (y) {
	this.y = y;
};

Collidable.prototype.isColliding = function (c) {
	if (!(c instanceof Collidable)) {
		throw ("Can't check collision with non-collidable");
	}

	var myBounds = {
		left: this.x,
		right: this.x + this.w,
		top: this.y,
		bottom: this.y + this.h
	};

	var theirBounds = {
		left: c.x,
		right: c.x + c.w,
		top: c.y,
		bottom: c.y + c.h
	};

	if ((myBounds.right < theirBounds.left) || (myBounds.left > theirBounds.right)
			|| (myBounds.top > theirBounds.bottom) || (myBounds.bottom < theirBounds.top)) {
		return false;
	}

	return true;
};

Collidable.prototype.getIntersection = function (c) {
	if (!(c instanceof Collidable)) {
		throw ("Can't intersect with non-collidable");
	}

	if (!this.isColliding(c)) {
		return null;
	}
};