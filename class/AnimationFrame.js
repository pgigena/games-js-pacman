function AnimationFrame(x, y, w, h) {
	this.offset = {
		x: x,
		y: y
	};

	this.w = w;
	this.h = h;
}

AnimationFrame.subclass(Object);