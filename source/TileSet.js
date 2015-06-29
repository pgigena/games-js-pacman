/* global Const */

function TileSet() {
	this.sprite = null;

	this.name = 0;
	this.firstGid = 0;

	this.margin = 0;
	this.spacing = 0;

	this.tileWidth = 0;
	this.tileHeight = 0;

	this.tilesPerRow = 0;
	this.tilesPerColumn = 0;

	this.tileCount = 0;
	this.tileProperties = null;

	this.tileCollisions = Array();
}

TileSet.subclass(Object);

TileSet.prototype.initialize = function (sprite, tilesetData) {
	this.sprite = sprite;

	this.name = tilesetData.name;
	this.firstGid = tilesetData.firstgid;

	this.margin = tilesetData.margin;
	this.spacing = tilesetData.spacing;

	this.tileWidth = tilesetData.tilewidth;
	this.tileHeight = tilesetData.tileheight;

	this.tilesPerRow = (tilesetData.imagewidth - tilesetData.margin) / (tilesetData.tilewidth + tilesetData.spacing);
	this.tilesPerColumn = (tilesetData.imageheight - tilesetData.margin) / (tilesetData.tileheight + tilesetData.spacing);

	this.tileCount = this.tilesPerRow * this.tilesPerColumn - 1;

	if (tilesetData.hasOwnProperty('tileproperties')) {
		this.tileProperties = tilesetData.tileproperties;
	}

	for (var i = 0; i < this.tileCount; i++) {
		if (!tilesetData.hasOwnProperty('tileproperties')) {
			this.tileCollisions[i] = false;
		} else {
			if (tilesetData.tileproperties.hasOwnProperty(i) && tilesetData.tileproperties[i].hasOwnProperty(Const.tmx.properties.collision)) {
				this.tileCollisions[i] = true;
			} else {
				this.tileCollisions[i] = false;
			}
		}
	}
};

TileSet.prototype.getTileCollision = function (gId) {
	if (!this.inTileset(gId)) {
		return false;
	}

	return this.tileCollisions[gId - this.firstGid];
};

TileSet.prototype.inTileset = function (gId) {
	if (gId > (this.firstGid + this.tileCount) || gId < this.firstGid) {
		return false;
	}
	return true;
};

TileSet.prototype.getTileImageOffset = function (gId) {
	if (!this.inTileset(gId)) {
		return false;
	}

	var tileImageOffset = {
		x: (((gId - this.firstGid) % this.tilesPerRow) | 0) * (this.tileWidth + this.spacing) + this.margin,
		y: (((gId - this.firstGid) / this.tilesPerRow) | 0) * (this.tileHeight + this.spacing) + this.margin
	};

	return tileImageOffset;
};