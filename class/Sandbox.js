/* global Const, ResourceManager */

function Sandbox() {
	this.gameTimer = null;
	this.animation = null;
	this.g = null;
}

Sandbox.subclass(Object);

Sandbox.prototype.initialize = function () {
	ResourceManager.createCanvas('test', Const.board.w, Const.board.h, 0);
	document.body.appendChild(ResourceManager.getCanvas('test'));
	this.g = ResourceManager.getCanvas('test').getContext('2d');

	ResourceManager.loadSprite('pacman');

//	var anim = new Animation(ResourceManager.getSprite('pacman'), false, true, 10);
//	anim.initialize(3, 203, 14, 14, 6, 1);
//	anim.frameSequence[0] = 0;

	var offsetX = 82, offsetY = 3;
	var w = 16, h = 16;
	var paddingH = 4;
	var paddingV = 3;

	// Left
	var currentY = offsetY;
	// Right
	var currentY = offsetY + (h + paddingV);
	// Up
	var currentY = offsetY + (h + paddingV) * 2;
	// Down
	var currentY = offsetY + (h + paddingV) * 3 + 1;

	anim = new Animation(ResourceManager.getSprite('pacman'), true, true, 5);
	anim.initialize(offsetX, currentY, w, h, paddingH, 3);
	anim.frameSequence = new Array(0, 1, 0, 2);

//	var w = 16, h = 16;
//	// Death
//	var anim = new Animation(ResourceManager.getSprite('pacman'), false, true, 5);
//	anim.frames.push(new AnimationFrame(83, 3, w, h));
//	anim.frames.push(new AnimationFrame(83, 23, w, h));
//	anim.frames.push(new AnimationFrame(83, 42, w, h));
//	anim.frames.push(new AnimationFrame(83, 62, w, h));
//	anim.frameSequence = new Array(3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2);

	this.animation = anim;
};

Sandbox.prototype.start = function () {
	var that = this;
	this.animation.startAnimation();
	this.gameTimer = new Interval(function () {
		window.requestAnimationFrame(function () {
			that.mainLoop();
		});
	}, 1000 / Config.settings.fps);
};

Sandbox.prototype.mainLoop = function () {
	var x = 10;
	var y = 10;
	var w = 20;
	var h = 20;

	this.g.clearRect(0, 0, 50, 50);
	this.g.fillRect(0, 0, 50, 50);

	this.animation.draw(x, y, w, h, 0, 0, this.g);
};