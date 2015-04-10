function TileMap() {
	Resource.apply(this);

	this.w = 0;
	this.h = 0;

	this.tileW = 0;
	this.tileH = 0;

	this.layers = new Array();
	this.tileSets = new Array();

	this.collisionMap = new Array();
	this.intersectionMap = new Array();
	this.dotsCollisionMap = new Array();
	this.limitedIntersectionsMap = new Array();

	this.firstFruit = null;
	this.fruitItemIndexes = new Array();
	this.fruitDotRequirement = 0;
	this.currentFruitIndex = null;
	this.currentFruit = null;
	this.fruitDisappearTimer = null;
	this.fruitVisible = false;

	this.ghostPen = null;

	this.dotCount = 0;

	this.jsonTmxData = null;
}

TileMap.subclass(Resource);

TileMap.prototype.initialize = function (tmxMap) {
	this.jsonTmxData = tmxMap;

	this.w = tmxMap.width;
	this.h = tmxMap.height;

	this.tileW = tmxMap.tilewidth;
	this.tileH = tmxMap.tileheight;

	// Initialize tileSets
	for (var i in tmxMap.tilesets) {
		var imgPath = tmxMap.tilesets[i].image;
		var filenameStart = imgPath.lastIndexOf('\/') + 1;
		var filenameLength = imgPath.lastIndexOf('.') - filenameStart;

		imgPath = imgPath.substr(filenameStart, filenameLength);

		var sprite = ResourceManager.getSprite(imgPath);
		var tileSet = new TileSet();
		tileSet.initialize(sprite, tmxMap.tilesets[i]);

		this.tileSets.push(tileSet);
	}

	for (var i in tmxMap.layers) {
		if (tmxMap.layers[i].type == 'tilelayer') {
			var layer = new TileLayer();
			layer.initialize(tmxMap.layers[i]);
		} else if (tmxMap.layers[i].type == 'objectgroup') {
			var layer = new ObjectLayer();
			layer.initialize(tmxMap.layers[i]);
		}

		this.layers.push(layer);
	}

	this.buildCollisionMap();
	this.buildDotMap();
	this.initializeFruits();
	this.buildIntersectionMap();
	this.buildLimitedIntersectionsMap();
	this.buildGhostPenBounds();
};

TileMap.prototype.draw = function (g) {
	var layerIndex = this.layers.length + 1;

	while (--layerIndex) {
		var currentLayer = this.layers[layerIndex - 1];

		if (currentLayer instanceof TileLayer) {
			this.drawTileLayer(g, currentLayer);
		}
	}
};

TileMap.prototype.clear = function (g) {
	g.clearRect(0, 0, g.canvas.width, g.canvas.height);
};

TileMap.prototype.drawObjectLayers = function (g) {
	var layerIndex = this.layers.length + 1;
	while (--layerIndex) {
		var currentLayer = this.layers[layerIndex - 1];

		if (currentLayer instanceof ObjectLayer && currentLayer.visible) {
			this.drawObjectLayer(g, currentLayer);
		}
	}
};

TileMap.prototype.drawTileLayer = function (g, layer) {
	for (var rowNumber = 0; rowNumber < layer.h; rowNumber++) {
		for (var tileIndex = 0; tileIndex < layer.w; tileIndex++) {
			var tile = layer.tiles[rowNumber][tileIndex];
			var tileOffset, tileW, tileH, sprite;

			for (var i in this.tileSets) {
				var tileSet = this.tileSets[i];
				tileOffset = tileSet.getTileImageOffset(tile.gId);

				tileW = tileSet.tileWidth;
				tileH = tileSet.tileHeight;
				sprite = tileSet.sprite;

				if (tileOffset) {
					break;
				}
			}

			g.drawImage(sprite.image, tileOffset.x, tileOffset.y, tileW, tileH, (tileIndex * tileW), (rowNumber * tileH), tileW, tileH);

			if (Config.debug.collisionMap) {
				if (this.hasCollision(tileIndex, rowNumber)) {
					g.fillStyle = '#FF0000';
				} else {
					g.fillStyle = '#0000FF';
				}
				g.fillRect((tileIndex * this.tileW), (rowNumber * this.tileH), this.tileW, this.tileH);
			}

			if (Config.debug.tileGrid) {
				g.strokeStyle = '#00FF00';
				g.strokeRect((tileIndex * this.tileW), (rowNumber * this.tileH), this.tileW, this.tileH);
			}
		}
	}
};

TileMap.prototype.drawObjectLayer = function (g, layer) {
	for (var i in layer.items) {
		if (layer.items[i].visible) {
			this.drawTile(g, layer.items[i].gId, layer.items[i].x, layer.items[i].y);
		}
	}
};

TileMap.prototype.drawTile = function (g, gId, x, y) {
	var tileOffset, tileW, tileH, sprite;

	for (var i in this.tileSets) {
		var tileSet = this.tileSets[i];
		tileOffset = tileSet.getTileImageOffset(gId);

		tileW = tileSet.tileWidth;
		tileH = tileSet.tileHeight;
		sprite = tileSet.sprite;

		if (tileOffset) {
			break;
		}
	}

	g.drawImage(sprite.image, tileOffset.x, tileOffset.y, tileW, tileH, x, y, tileW, tileH);
};

TileMap.prototype.getCorrespondingTile = function (x, y) {
	var correspondingTiles = this.getCorrespondingTiles(x, y, 1, 1);
	return correspondingTiles[0];
};

TileMap.prototype.getCorrespondingTiles = function (x, y, w, h) {
	var response = new Array();

	var topLeftTile = {
		x: (x / this.tileW) | 0,
		y: (y / this.tileH) | 0
	};

	var bottomRightTile = {
		x: ((x + w) / this.tileW) | 0,
		y: ((y + h) / this.tileH) | 0
	};

	for (var row = topLeftTile.y; row <= bottomRightTile.y; row++) {
		for (var column = topLeftTile.x; column <= bottomRightTile.x; column++) {
			var tile = {
				x: column,
				y: row
			};

			// Wrap the right edge of the map back to the left
			if (column >= this.w) {
				tile.x = 0;
			}

			// Wrap the bottom edge of the map back to the top
			if (row >= this.h) {
				tile.y = 0;
			}

			response.push(tile);
		}
	}

	return response;
};

TileMap.prototype.findObjectLayer = function (name) {
	for (var i in this.layers) {
		if (this.layers[i].name == name) {
			return this.layers[i];
		}
	}
};

TileMap.prototype.buildCollisionMap = function () {
	for (var j = 0; j < this.h; j++) {
		this.collisionMap[j] = new Array();

		for (var i = 0; i < this.w; i++) {
			this.collisionMap[j][i] = this.findLayersCollision(j, i);
		}
	}
};

TileMap.prototype.findLayersCollision = function (tileRow, tileColumn) {
	for (var i in this.layers) {
		if (this.layers[i] instanceof TileLayer) {
			var tile = this.layers[i].tiles[tileRow][tileColumn];

			for (var j in this.tileSets) {
				if (this.tileSets[j].getTileCollision(tile.gId)) {
					return true;
				}
			}
		}
	}

	return false;
};

TileMap.prototype.hasCollision = function (x, y) {
	return this.collisionMap[y][x];
};

TileMap.prototype.findIntersection = function (x, y) {
	var validDirections = 0;

	var above = {x: x, y: y - 1};
	var left = {x: x - 1, y: y};
	var below = {x: x, y: y + 1};
	var right = {x: x + 1, y: y};

	if (above.y < 0) {
		above.y = this.h - 1;
	}

	if (left.x < 0) {
		left.x = this.w - 1;
	}

	if (below.y > this.h - 1) {
		below.y = 0;
	}

	if (right.x > this.w - 1) {
		right.x = 0;
	}

	if (!this.hasCollision(above.x, above.y)) {
		validDirections++;
	}

	if (!this.hasCollision(left.x, left.y)) {
		validDirections++;
	}

	if (!this.hasCollision(below.x, below.y)) {
		validDirections++;
	}

	if (!this.hasCollision(right.x, right.y)) {
		validDirections++;
	}

	return (validDirections > 2);
};

TileMap.prototype.getValidAdjacentTiles = function (x, y) {
	var validTiles = new Array();

	if (!this.hasCollision(x, y - 1)) {
		validTiles.push({x: x, y: y - 1});
	}

	if (!this.hasCollision(x - 1, y)) {
		validTiles.push({x: x - 1, y: y});
	}

	if (!this.hasCollision(x, y + 1)) {
		validTiles.push({x: x, y: y + 1});
	}

	if (!this.hasCollision(x + 1, y)) {
		validTiles.push({x: x + 1, y: y});
	}

	return validTiles;
};

TileMap.prototype.buildDotMap = function () {

	for (var j = 0; j < this.w; j++) {
		this.dotsCollisionMap[j] = new Array();
		for (var i = 0; i < this.h; i++) {
			this.dotsCollisionMap[j][i] = null;
		}
	}

	var layer = this.findObjectLayer(Const.tmx.layers.dots);

	for (var i in layer.items) {
		if (layer.items[i].type === Const.tmx.objTypes.fruit) {
			continue;
		}
		var currentTile = this.getCorrespondingTiles(layer.items[i].x, layer.items[i].y, layer.items[i].w, layer.items[i].h);
		this.dotsCollisionMap[currentTile[0].x][currentTile[0].y] = layer.items[i];
		this.dotCount++;
	}
};

TileMap.prototype.initializeFruits = function () {
	var layer = this.findObjectLayer(Const.tmx.layers.dots);
	this.firstFruit = null;
	this.fruitItemIndexes = new Array();

	for (var i in layer.items) {
		if (layer.items[i].type === Const.tmx.objTypes.fruit) {
			var fruitOrder = parseInt(layer.items[i].properties[Const.tmx.properties.fruitOrder]);

			if (this.firstFruit === null || fruitOrder < this.firstFruit) {
				this.firstFruit = fruitOrder;
			}

			this.fruitItemIndexes[fruitOrder] = i;
			layer.items[i].visible = false;
			continue;
		}
	}

	this.setCurrentFruit(this.firstFruit);
};

TileMap.prototype.buildIntersectionMap = function () {
	for (var y = 0; y < this.h; y++) {
		this.intersectionMap[y] = new Array();

		for (var x = 0; x < this.w; x++) {
			this.intersectionMap[y][x] = this.findIntersection(x, y);
		}
	}
};

TileMap.prototype.hasIntersection = function (x, y) {
	return this.intersectionMap[y][x];
};

TileMap.prototype.buildLimitedIntersectionsMap = function () {
	var intersectionLayer = this.findObjectLayer(Const.tmx.layers.limitedIntersection);

	for (var y = 0; y < this.h; y++) {
		this.limitedIntersectionsMap[y] = new Array();

		for (var x = 0; x < this.w; x++) {
			this.limitedIntersectionsMap[y][x] = false;
		}
	}

	if (intersectionLayer === undefined) {
		return;
	}

	for (var index in intersectionLayer.items) {
		var tile = this.getCorrespondingTile(intersectionLayer.items[index].x, intersectionLayer.items[index].y);
		var invalidDirection = null;

		switch (intersectionLayer.items[index].properties[Const.tmx.properties.forbidDir]) {
			case 'up':
				invalidDirection = Const.direction.up;
				break;
			case 'left':
				invalidDirection = Const.direction.left;
				break;
			case 'down':
				invalidDirection = Const.direction.down;
				break;
			case 'right':
				invalidDirection = Const.direction.right;
				break;
		}

		this.limitedIntersectionsMap[tile.y][tile.x] = invalidDirection;
	}
};

TileMap.prototype.getLimitedDirection = function (x, y) {
	return this.limitedIntersectionsMap[y][x];
};

TileMap.prototype.buildGhostPenBounds = function () {
	var regionLayer = this.findObjectLayer(Const.tmx.layers.regions);

	for (var i in regionLayer.items) {
		if (regionLayer.items[i].type === Const.tmx.objTypes.ghostPen) {
			this.ghostPen = regionLayer.items[i];
		}
	}
};

TileMap.prototype.removeDot = function (x, y) {
	this.dotsCollisionMap[x][y].visible = false;
	this.dotCount--;
};

TileMap.prototype.resetDots = function () {
	this.dotCount = 0;

	for (var x in this.dotsCollisionMap) {
		for (var y in this.dotsCollisionMap[x]) {
			if (this.dotsCollisionMap[x][y] !== null) {
				this.dotsCollisionMap[x][y].visible = true;
				this.dotCount++;
			}
		}
	}
};

TileMap.prototype.setCurrentFruit = function (order) {
	var fruitIndex = this.fruitItemIndexes[order];
	var dotLayer = this.findObjectLayer(Const.tmx.layers.dots);

	this.fruitDotRequirement = parseInt(dotLayer.items[fruitIndex].properties[Const.tmx.properties.reqDots]);
	this.currentFruitIndex = order;
};

TileMap.prototype.enableFruit = function () {
	var dotLayer = this.findObjectLayer(Const.tmx.layers.dots);

	this.currentFruit = dotLayer.items[this.fruitItemIndexes[this.currentFruitIndex]];
	dotLayer.items[this.fruitItemIndexes[this.currentFruitIndex]].visible = true;
	this.fruitVisible = true;

	// Timer used to remove the fruit if it was not eaten
	var that = this;

	this.fruitDisappearTimer = new Timer(function () {
		 that.removeFruit();
	 }, Const.timer.fruit);
};

TileMap.prototype.removeFruit = function () {
	var dotLayer = this.findObjectLayer(Const.tmx.layers.dots);
	dotLayer.items[this.fruitItemIndexes[this.currentFruitIndex]].visible = false;

	this.fruitVisible = false;
	this.currentFruit = null;

	this.fruitDisappearTimer.stop();

	// Set next fruit if there is one
	if ((this.currentFruitIndex + 1) in this.fruitItemIndexes) {
		this.setCurrentFruit(this.currentFruitIndex + 1);
	}
};
