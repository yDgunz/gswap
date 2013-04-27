function juggle() {
	var animator = new Animator();
	animator.startTime = (new Date()).getTime();
	animator.juggler = new Juggler();
	animator.juggler.N = document.getElementById("in_N").value;
	animator.juggler.initJuggler();
	var canvas = document.getElementById('jugglerCanvas');
	animator.animate(canvas);
}

