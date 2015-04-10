function debugChecks() {
	// Tile Grid
	document.getElementById("tileGrid").addEventListener("change", function (e) {
		if (this.checked) {
			Config.debug.tileGrid = true;
		} else {
			Config.debug.tileGrid = false;
		}
		game.drawMap();
	});

	document.getElementById("tileGridLabel").addEventListener("click", function () {
		var checkbox = document.getElementById("tileGrid");
		if (checkbox.hasOwnProperty('checked')) {
			if (checkbox.checked) {
				checkbox.checked = false;
				Config.debug.tileGrid = false;
			} else {
				checkbox.checked = true;
				Config.debug.tileGrid = true;
			}
			game.drawMap();
		}
	});

	// Collision map
	document.getElementById("tileCollisions").addEventListener("change", function (e) {
		if (this.checked) {
			Config.debug.collisionMap = true;
		} else {
			Config.debug.collisionMap = false;
		}
		game.drawMap();
	});

	document.getElementById("tileCollisionsLabel").addEventListener("click", function () {
		var checkbox = document.getElementById("tileCollisions");
		if (checkbox.hasOwnProperty('checked')) {
			if (checkbox.checked) {
				checkbox.checked = false;
				Config.debug.collisionMap = false;
			} else {
				checkbox.checked = true;
				Config.debug.collisionMap = true;
			}
			game.drawMap();
		}
	});


	// Collision map
	document.getElementById("targetTile").addEventListener("change", function (e) {
		if (this.checked) {
			Config.debug.ghostTargetTile = true;
		} else {
			Config.debug.ghostTargetTile = false;
		}
	});

	document.getElementById("targetTileLabel").addEventListener("click", function () {
		var checkbox = document.getElementById("targetTile");
		if (checkbox.hasOwnProperty('checked')) {
			if (checkbox.checked) {
				checkbox.checked = false;
				Config.debug.ghostTargetTile = false;
			} else {
				checkbox.checked = true;
				Config.debug.ghostTargetTile = true;
			}
		}
	});


	// Character boxes
	document.getElementById("characterBox").addEventListener("change", function (e) {
		if (this.checked) {
			Config.debug.characterBounds = true;
		} else {
			Config.debug.characterBounds = false;
		}
	});

	document.getElementById("characterBoxLabel").addEventListener("click", function () {
		var checkbox = document.getElementById("characterBox");
		if (checkbox.hasOwnProperty('checked')) {
			if (checkbox.checked) {
				checkbox.checked = false;
				Config.debug.characterBounds = false;
			} else {
				checkbox.checked = true;
				Config.debug.characterBounds = true;
			}
		}
	});

	// Eaten dots boxes
	document.getElementById("eatenDotCounter").addEventListener("change", function (e) {
		if (this.checked) {
			Config.debug.eatenDotCounter = true;
		} else {
			Config.debug.eatenDotCounter = false;
		}
	});

	document.getElementById("eatenDotCounterLabel").addEventListener("click", function () {
		var checkbox = document.getElementById("eatenDotCounter");
		if (checkbox.hasOwnProperty('checked')) {
			if (checkbox.checked) {
				checkbox.checked = false;
				Config.debug.eatenDotCounter = false;
			} else {
				checkbox.checked = true;
				Config.debug.eatenDotCounter = true;
			}
		}
	});

	// Remaining dots boxes
	document.getElementById("remainingDotCounter").addEventListener("change", function (e) {
		if (this.checked) {
			Config.debug.remainingDotCounter = true;
		} else {
			Config.debug.remainingDotCounter = false;
		}
	});

	document.getElementById("remainingDotCounterLabel").addEventListener("click", function () {
		var checkbox = document.getElementById("remainingDotCounter");
		if (checkbox.hasOwnProperty('checked')) {
			if (checkbox.checked) {
				checkbox.checked = false;
				Config.debug.remainingDotCounter = false;
			} else {
				checkbox.checked = true;
				Config.debug.remainingDotCounter = true;
			}
		}
	});
}

