/* global Resource */

function Sprite(imagePath) {
	Resource.apply(this);

	this.imagePath = imagePath;
	this.image = null;
}

Sprite.subclass(Resource);

Sprite.prototype.load = function () {
	var img = document.createElement('img');
	var that = this;

	img.addEventListener('load', function() {
		that.loaded = true;
	});

	img.src = this.imagePath;
	this.image = img;
};