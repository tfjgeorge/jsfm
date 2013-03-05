$("#play_button").click(function() {
	console.log("clicked");

	var context = new webkitAudioContext();
	var oscillator = context.createOscillator();
	var modulator = context.createOscillator();
	var modGain = context.createGainNode();

	modulator.connect(modGain);
	modGain.connect(oscillator.frequency);
	modGain.gain.value = 300;
	modulator.frequency.value = 300;

	oscillator.connect(context.destination);
	oscillator.start(0);
	console.log(oscillator);
});
