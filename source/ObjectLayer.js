function ObjectLayer() {
	this.name = null;
	this.items = new Array();
	this.visible = true;
}

ObjectLayer.subclass(Object);

ObjectLayer.prototype.initialize = function (layerData) {
	this.name = layerData.name;
	this.visible = layerData.visible;

	for (var i in layerData.objects) {
		var item = new Item();
		item.initialize(layerData.objects[i]);

		this.items.push(item);
	}
};

ObjectLayer.prototype.findItemByProperty = function (property, value) {
	var findValue = false;

	if (value !== undefined) {
		findValue = true;
	}

	for (var itemIndex in this.items) {
		var item = this.items[itemIndex];

		if (item.hasOwnProperty('properties')) {
			for (var prop in item.properties) {
				if (prop == property) {
					if (!findValue || (findValue && value == item.properties[prop])) {
						return item;
					}
				}
			}
		}
	}
};
