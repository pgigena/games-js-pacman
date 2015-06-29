function MsPacMan(x, y, w, h) {
	PacMan.apply(this, x, y, w, h);
}

MsPacMan.subclass(PacMan);

MsPacMan.prototype.initialize = function () {
	this.w = 17;
	this.h = 17;
};

MsPacMan.prototype.initAnimations = function (sprite) {
	var offsetX = 83, offsetY = 3;
	var w = 16, h = 16;
	var paddingH = 4, paddingV = 3;

	// Animation for standing
	this.animations[this.animationKeys.starting] = new Animation(sprite, false);
	this.animations[this.animationKeys.starting].frames.push(new AnimationFrame(122, offsetY, w, h));
	this.animations[this.animationKeys.starting].frameSequence[0] = 0;

	var offsetsY = new Array(
		offsetY,
		offsetY + (h + paddingV),
		offsetY + (h + paddingV) * 2,
		offsetY + (h + paddingV) * 3 + 1);

	// Animation for each direction
	for (var frameDirection = 0; frameDirection < 4; frameDirection++) {
		this.animations[frameDirection] = new Animation(sprite);
		this.animations[frameDirection].initialize(offsetX, offsetsY[frameDirection], w, h, paddingH, 3);
		this.animations[frameDirection].frameSequence = new Array(0, 1, 0, 2);
	}

	// Death Animation
	this.animations[this.animationKeys.dying] = new Animation(sprite, false, true, 4);
	this.animations[this.animationKeys.dying].frames.push(new AnimationFrame(offsetX, 3, w, h));
	this.animations[this.animationKeys.dying].frames.push(new AnimationFrame(offsetX, 23, w, h));
	this.animations[this.animationKeys.dying].frames.push(new AnimationFrame(offsetX, 42, w, h));
	this.animations[this.animationKeys.dying].frames.push(new AnimationFrame(offsetX, 62, w, h));
	this.animations[this.animationKeys.dying].frameSequence = new Array(3, 0, 2, 1, 3, 0, 2);

	// Set default animation
	this.currentAnimation = this.animationKeys.starting;
};