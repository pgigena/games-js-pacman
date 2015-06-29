/* global Config, Ghost, Const */

function Clyde() {
	Ghost.apply(this);
}

Clyde.subclass(Ghost);

Clyde.prototype.initialize = function () {
	this.name = Const.ghost.names.clyde;
	this.spriteOffsetY = 143;
	this.dotCounter = 60;

	Ghost.prototype.initialize.call(this);
};

Clyde.prototype.initAnimations = function (sprite) {
	Ghost.prototype.initAnimations.call(this, sprite, this.spriteOffsetY);
};

Clyde.prototype.draw = function (g) {
	if (Config.debug.ghostTargetTile) {
		var fillStyle = g.fillStyle;
		var strokeStyle = g.strokeStyle;

		g.fillStyle = '#FFA500';
		g.strokeStyle = '#fff';

		g.fillRect(this.targetTile.x * 18, this.targetTile.y * 18, this.bounds.w, this.bounds.h);
		g.strokeText('C', (this.targetTile.x * 18) + 5, (this.targetTile.y * 18) + 12);

		g.fillStyle = fillStyle;
		g.strokeStyle = strokeStyle;
	}

	Ghost.prototype.draw.call(this, g);
};