var game;

//var soundFile = ResourceManager.getSound('beginning');
//soundFile.finish(function () { 
//
//});
//soundFile.play();

window.onload = function () {

//	game = new Sandbox();
//	game.initialize();
//	game.start();


	game = new Game();
	game.initialize();

	document.getElementById("btnStart").addEventListener("click", function () {
		if (game.state === Const.gameState.splash) {
			game.start();
		}
	});

	document.getElementById("btnPause").addEventListener("click", function () {
		if (game.state === Const.gameState.paused) {
			this.value = 'Pause';
			game.unpause();
		} else {
			this.value = 'Resume';
			game.pause();
		}
	});

	var visible = true;
	document.getElementById("btnHide").addEventListener("click", function () {
		if (visible) {
			document.getElementById("map").style.display = 'none';
			document.getElementById("game").style.display = 'none';
			document.getElementById("hud").style.display = 'none';

			this.value = 'Show';
			visible = false;
		} else {
			document.getElementById("map").removeAttribute('style');
			document.getElementById("game").removeAttribute('style');
			document.getElementById("hud").removeAttribute('style');

			this.value = 'Hide';
			visible = true;
		}
	});

	debugChecks();
};