function TileLayer() {
	this.x = 0;
	this.y = 0;

	this.w = 0;
	this.h = 0;

	this.tiles = new Array();

	this.visible = true;
	this.opacity = 1;
	this.name = name;
	this.type = null;
}

TileLayer.subclass(Object);

TileLayer.prototype.initialize = function (layerData) {
	this.x = layerData.x;
	this.y = layerData.y;

	this.w = layerData.width;
	this.h = layerData.height;

	this.name = layerData.name;
	this.opacity = layerData.opacity;
	this.visible = layerData.visible;

	for (var row = 0; row < this.h; row++) {
		var currentRow = Array();

		for (var column = 0; column < this.w; column++) {
			currentRow[column] = new Tile(layerData.data[(row * this.w) + column]);
		}
		this.tiles[row] = currentRow;
	}
};

TileLayer.prototype.tileAt = function (x, y) {
	return this.elements[y][x];
};