var playing = false;
var context = new webkitAudioContext();
var oscillator;

$("#play_button").click(function() {
	if (playing) 
	{		
		playing = false;
		oscillator.stop(0);
	}
	else
	{
	oscillator = context.createOscillator();
	playing = true;
	var modulator = context.createOscillator();
	var modGain = context.createGainNode();

	oscillator.frequency.value = 300;
	modulator.connect(modGain);
	modGain.connect(oscillator.frequency);
	modGain.gain.value = 1600;
	modulator.frequency.value = 300;

	oscillator.connect(context.destination);
	oscillator.start(0);
	modulator.start(0);
	console.log(oscillator);
	}
});


var graph;
var map = {};
var init = function() {
	// Read JSON
	$.getJSON('default.json',function(data) {
		graph = data;
		for (var object in graph) {
			map[graph[object]["id"]] = graph[object];
		}
		init_structure();
	});
};

var audionodes = {};
var init_structure = function() {
	// Create all objects
	for (var object in graph) {
		audionodes[graph[object]]["id"] = 
		switch(graph[object]["type"]) {
			case "multiply":

			break;
		}
	}
}


init();
