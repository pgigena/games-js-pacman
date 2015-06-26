function Blinky() {
	Ghost.apply(this);

	this.aggresiveMode = false;
}

Blinky.subclass(Ghost);

Blinky.prototype.initialize = function () {
	this.name = Const.ghost.names.blinky;
	this.status = Const.ghost.status.normal;
	this.spriteOffsetY = 83;
	this.spawned = true;

	Ghost.prototype.initialize.call(this);
};

Blinky.prototype.initAnimations = function (sprite) {
	Ghost.prototype.initAnimations.call(this, sprite, this.spriteOffsetY);
};

Blinky.prototype.draw = function (g) {

	if (Config.debug.ghostTargetTile) {
		var fillStyle = g.fillStyle;
		var strokeStyle = g.strokeStyle;

		g.fillStyle = '#f00';
		g.strokeStyle = '#fff';

		g.fillRect(this.targetTile.x * 18, this.targetTile.y * 18, this.bounds.w, this.bounds.h);
		g.strokeText('B', (this.targetTile.x * 18) + 5, (this.targetTile.y * 18) + 12);

		g.fillStyle = fillStyle;
		g.strokeStyle = strokeStyle;
	}

	Ghost.prototype.draw.call(this, g);
};