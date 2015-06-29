/* global Config */

function Animation(sprite, loopable, fwd, ticsPerSecond) {
	this.sprite = (sprite === undefined ? null : sprite);

	this.loopable = (loopable === undefined ? true : loopable);
	this.forward = (fwd === undefined ? true : fwd);
	this.ticsPerSecond = (ticsPerSecond === undefined ? Config.settings.defaultTicsPerSecond : ticsPerSecond);

	this.frames = new Array();
	this.currentInterval = null;
	this.ended = false;
	this.currentFrame = 0;

	this.frameSequence = new Array();
}

Animation.subclass(Object);

Animation.prototype.initialize = function (offsetX, offsetY, w, h, padding, frameCount, horizontal) {
	if (horizontal === undefined) {
		horizontal = true;
	}

	for (var i = 0; i < frameCount; i++) {
		var x = offsetX;
		var y = offsetY;

		if (horizontal) {
			x += (w + padding) * i;
		} else {
			y += (h + padding) * i;
		}

		this.frames.push(new AnimationFrame(x, y, w, h));
	}
};

Animation.prototype.prevFrame = function () {
	if (this.currentFrame > 0) {
		this.currentFrame--;
	} else {
		if (this.loopable) {
			this.currentFrame = this.frames.length - 1;
		} else {
			this.currentInterval.stop();
			this.ended = true;
		}
	}
};

Animation.prototype.nextFrame = function () {
	if (this.currentFrame < this.frameSequence.length - 1) {
		this.currentFrame++;
	} else if (this.loopable) {
		this.currentFrame = 0;
	} else {
		this.currentInterval.stop();
		this.ended = true;
	}
};

Animation.prototype.startAnimation = function () {
	this.currentFrame = 0;
	var animation = this;

	this.currentInterval = new Interval(function () {
		if (animation.forward) {
			animation.nextFrame();
		} else {
			animation.prevFrame();
		}
	}, 1000 / this.ticsPerSecond);
};

Animation.prototype.endAnimation = function () {
	if (this.currentInterval !== null) {
		this.currentInterval.stop();
		this.currentInterval = null;
	}
	this.ended = true;
};

Animation.prototype.getCurrentFrameIndex = function () {
	return this.frameSequence[this.currentFrame];
};

Animation.prototype.pause = function () {
	this.currentInterval.pause();
};

Animation.prototype.resume = function () {
	this.currentInterval.resume();
};

Animation.prototype.draw = function (x, y, w, h, overflowX, overflowY, g) {
	var frame = this.frames[this.getCurrentFrameIndex()];
	g.drawImage(this.sprite.image, frame.offset.x + overflowX, frame.offset.y + overflowY, frame.w, frame.h, x, y, w, h);
};