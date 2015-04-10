function ResourceManager() {
}

ResourceManager.loaderTimer = null;

ResourceManager.sprites = new Array();
ResourceManager.canvases = new Array();
ResourceManager.levels = new Array();
ResourceManager.sound = new Array();

ResourceManager.getSprite = function (imagePath) {
	if (!ResourceManager.sprites.hasOwnProperty(imagePath)) {
		ResourceManager.loadSprite(imagePath);
	}
	return ResourceManager.sprites[imagePath];
};

ResourceManager.loadSprite = function (imagePath) {
	ResourceManager.sprites[imagePath] = new Sprite(Const.path.image + imagePath + Const.format.image);
	ResourceManager.sprites[imagePath].load();
};

ResourceManager.getSound = function (key) {
	if (!ResourceManager.sound.hasOwnProperty(key)) {
		ResourceManager.loadSound(key);
	}
	return ResourceManager.sound[key];
};

ResourceManager.loadSound = function (key) {
	ResourceManager.sound[key] = new Sound(Const.path.sound + key + Const.format.sound);
	ResourceManager.sound[key].load();
};

ResourceManager.getCanvas = function (canvasKey) {
	if (!ResourceManager.canvases.hasOwnProperty(canvasKey)) {
		throw ('Requested canvas does not exist');
	}
	return ResourceManager.canvases[canvasKey];
};

ResourceManager.createCanvas = function (canvasKey, w, h, zIndex) {
	var canvas = document.createElement('canvas');

	canvas.id = canvasKey;
	canvas.width = w;
	canvas.height = h;

	canvas.style = "z-index: " + zIndex + ";";

	ResourceManager.canvases[canvasKey] = canvas;
};

ResourceManager.getLevel = function (levelKey) {
	return ResourceManager.levels[levelKey];
};

ResourceManager.loadLevel = function (levelKey) {
	var request = new XMLHttpRequest();

	ResourceManager.levels[levelKey] = new TileMap();

	request.open("POST", Const.path.map + levelKey + Const.format.map);
	request.onload = function () {
		ResourceManager.levels[levelKey].loaded = true;
		ResourceManager.levels[levelKey].initialize(JSON.parse(request.response));
	};

	request.send();
};

ResourceManager.checkResources = function () {
	for (var i in ResourceManager.sprites) {
		if (!ResourceManager.sprites[i].isLoaded()) {
			return false;
		}
	}

	for (var i in ResourceManager.levels) {
		if (!ResourceManager.levels[i].isLoaded()) {
			return false;
		}
	}

	return true;
};