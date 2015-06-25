function Sound(path) {
	Resource.apply(this);

	this.path = path;
	this.audio = null;
	
	this.hasEventListener = false;
	this.eventListenerMethod = function () {};
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
	var that = this;
	if (!this.hasEventListener) {
		this.audio.addEventListener('ended', function() {
			that.eventListenerMethod();
		});

		this.hasEventListener = true;
	}
	
	this.eventListenerMethod = callback;
};

Sound.prototype.play = function () {
	this.audio.play();
};