function Collidable(x, y, w, h) {
	this.pos = new Vector(x, y);
	this.bounds = new BoundingBox(w, h);
}

Collidable.subclass(Object);

Collidable.prototype.isIntersecting = function (x, y, w, h) {
	if ((this.pos.x + this.bounds.w < x) || (this.pos.x > x + w)
			|| (this.pos.y > y + h) || (this.pos.y + this.bounds.h < y)) {
		return false;
	}

	return true;
};

Collidable.prototype.isColliding = function (collidable) {
	if (!(collidable instanceof Collidable)) {
		throw ("Can't check collision with non-collidable");
	}

	return this.isIntersecting(collidable.pos.x, collidable.pos.y, collidable.bounds.w, collidable.bounds.h);
};