function Resource() {
	this.loaded = false;
}

Resource.subclass(Object);

Resource.prototype.isLoaded = function () {
	return this.loaded;
};