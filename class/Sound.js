function Sound(path) {
	Resource.apply(this);

	this.path = path;
	this.audio = null;
}

Sound.subclass(Resource);

Sound.prototype.load = function () {
	var audio = document.createElement('audio');
	var that = this;

	audio.addEventListener('load', function() {
		that.loaded = true;
	});

	audio.src = this.path;
	this.audio = audio;
};

Sound.prototype.onFinish = function (callback) {
	this.audio.addEventListener('ended', function() { callback(); });
};

Sound.prototype.play = function () {
	this.audio.play();
};