function Inky() {
	Ghost.apply(this);
}

Inky.subclass(Ghost);

Inky.prototype.initialize = function () {
	this.name = Const.ghost.names.inky;
	this.spriteOffsetY = 123;
	this.dotCounter = 30;

	Ghost.prototype.initialize.call(this);
};

Inky.prototype.initAnimations = function (sprite) {
	Ghost.prototype.initAnimations.call(this, sprite, this.spriteOffsetY);
};

Inky.prototype.draw = function (g) {
	if (Config.debug.ghostTargetTile) {
		var fillStyle = g.fillStyle;
		var strokeStyle = g.strokeStyle;

		g.fillStyle = '#0ff';
		g.strokeStyle = '#fff';

		g.fillRect(this.targetTile.x * 18, this.targetTile.y * 18, this.bounds.w, this.bounds.h);
		g.strokeText('I', (this.targetTile.x * 18) + 6, (this.targetTile.y * 18) + 12);

		g.fillStyle = fillStyle;
		g.strokeStyle = strokeStyle;
	}

	Ghost.prototype.draw.call(this, g);
};