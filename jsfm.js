var context = new webkitAudioContext();
var fp = 400,
    fm = 600,
    mod_index = 2 * fp;

var play = function() {
	audionodes.envelope.gain.value = 1;
};

var stop = function() {
	audionodes.envelope.gain.value = 0;
};

var playing = false;
$("#play_button").click(function() {
	if (playing) 
	{		
		playing = false;
		stop();
	}
	else
	{
		play();
		playing = true;
	}
});
$("input").change(function() {
	fp = parseFloat($("#fp").val());
	fm = parseFloat($("#fm").val());
	mod_index = parseFloat($("#i").val()) * fp;
	
	var data = buffer_fp.getChannelData(0);
	for (var i=0; i<512; i++) {
		data[i] = fp;
	}

	data = buffer_fm.getChannelData(0);
	for (var i=0; i<512; i++) {
		data[i] = fm;
	}
	audionodes.modulation_index.gain.value = mod_index;
	
});


var audionodes = {};

// Create all nodes
audionodes.fm_node = context.createBufferSource();
audionodes.fm_oscillator = context.createOscillator();
audionodes.modulation_index = context.createGainNode();
audionodes.fp_node = context.createBufferSource();
audionodes.fp_oscillator = context.createOscillator();
audionodes.envelope = context.createGainNode();

// Connect all nodes together
audionodes.fm_node.connect(audionodes.fm_oscillator.frequency);
audionodes.fm_oscillator.connect(audionodes.modulation_index);
audionodes.fp_node.connect(audionodes.fp_oscillator.frequency);
audionodes.modulation_index.connect(audionodes.fp_oscillator.frequency);
audionodes.fp_oscillator.connect(audionodes.envelope);
audionodes.envelope.connect(context.destination);

// Set up nodes
audionodes.fm_oscillator.start(context.currentTime);
audionodes.fp_node.start(context.currentTime);
audionodes.fp_oscillator.start(context.currentTime);

audionodes.modulation_index.gain.value = mod_index;
audionodes.envelope.gain.value = 0;

var buffer_fp = context.createBuffer(1,512,context.sampleRate);
var buffer_fm = context.createBuffer(1,512,context.sampleRate);
audionodes.fp_node.buffer = buffer_fm;
audionodes.fp_node.loop = true;
audionodes.fm_node.buffer = buffer_fm;
audionodes.fm_node.loop = true;
