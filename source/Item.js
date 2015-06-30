/* global Collidable */

function Item(x, y, w, h) {
	Collidable.apply(this, x, y, w, h);

	this.name = '';
	this.gId = null;
	this.rotation = 0;

	this.type = null;
	this.visible = false;

	this.properties = new Array();
}

Item.subclass(Collidable);

Item.prototype.initialize = function (objectData) {

	if (objectData.hasOwnProperty('gid')) {
		this.gId = objectData.gid;
	}
	this.name = objectData.name;
	this.type = objectData.type;

	// Correction for the Y offset of tile objects
	if (objectData.hasOwnProperty('gid')) {
		this.pos.y = objectData.y - objectData.height;
	} else {
		this.pos.y = objectData.y;
	}

	this.pos.x = objectData.x;
	
	this.bounds.w = objectData.width;
	this.bounds.h = objectData.height;

	this.rotation = objectData.rotation;
	this.visible = objectData.visible;

	if (objectData.hasOwnProperty('properties')) {
		this.properties = objectData.properties;
	}
};