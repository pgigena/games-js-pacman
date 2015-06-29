/* global Ghost, Const, Config */

function Pinky() {
	Ghost.apply(this);
}

Pinky.subclass(Ghost);

Pinky.prototype.initialize = function () {
	this.name = Const.ghost.names.pinky;
	this.spriteOffsetY = 103;
	this.dotCounter = 0;

	Ghost.prototype.initialize.call(this);
};

Pinky.prototype.initAnimations = function (sprite) {
	Ghost.prototype.initAnimations.call(this, sprite, this.spriteOffsetY);
};

Pinky.prototype.draw = function (g) {
	if (Config.debug.ghostTargetTile) {
		var fillStyle = g.fillStyle;
		var strokeStyle = g.strokeStyle;

		g.fillStyle = '#f9c';
		g.strokeStyle = '#fff';

		g.fillRect(this.targetTile.x * 18, this.targetTile.y * 18, this.bounds.w, this.bounds.h);
		g.strokeText('P', (this.targetTile.x * 18) + 5, (this.targetTile.y * 18) + 12);

		g.fillStyle = fillStyle;
		g.strokeStyle = strokeStyle;
	}

	Ghost.prototype.draw.call(this, g);
};