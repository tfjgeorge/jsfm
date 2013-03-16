var context = new webkitAudioContext();
var fp = 400,
    fm = 600,
    mod_index = 2 * fp;

var play = function() {
	var a = parseFloat($("#a").val())/1000,
	    d = parseFloat($("#d").val())/1000,
	    s = parseFloat($("#s").val())/1000,
	    r = parseFloat($("#r").val())/1000,
	    ah = parseFloat($("#ah").val()),
	    dh = parseFloat($("#dh").val()),
	    sh = parseFloat($("#sh").val());
	audionodes.envelope.gain.setValueAtTime(0,context.currentTime);
	audionodes.envelope.gain.linearRampToValueAtTime(ah,context.currentTime+0.01);
	audionodes.envelope.gain.linearRampToValueAtTime(dh,context.currentTime+a);
	audionodes.envelope.gain.linearRampToValueAtTime(sh,context.currentTime+a+d);
	audionodes.envelope.gain.linearRampToValueAtTime(sh,context.currentTime+a+s);
	audionodes.envelope.gain.linearRampToValueAtTime(0,context.currentTime+a+s+r);


};

var playing = false;
$("#play_button").click(function() {
	play();
});
$("input").change(function() { update_parameters(); });

var update_parameters = function() {
	fp = parseFloat($("#fp").val());
	fm = parseFloat($("#fm").val());
	mod_index = parseFloat($("#i").val()) * fp;
	
	var data1 = buffer_fp.getChannelData(0);
	for (var i=0; i<512; i++) {
		data1[i] = fp;
	}

	var data2 = buffer_fm.getChannelData(0);
	for (var i=0; i<512; i++) {
		data2[i] = fm;
	}
	audionodes.modulation_index.gain.value = mod_index;
	
};


var audionodes = {};

// Create all nodes
audionodes.fm_node = context.createBufferSource();
audionodes.fm_oscillator = context.createOscillator();
audionodes.modulation_index = context.createGainNode();
audionodes.modulation_gain = context.createGainNode();
audionodes.fp_node = context.createBufferSource();
audionodes.fp_oscillator = context.createOscillator();
audionodes.volume = context.createGainNode();
audionodes.flat = context.createBufferSource();
audionodes.envelope = context.createGainNode();
audionodes.alpha = context.createGainNode();
audionodes.beta = context.createGainNode();

// Connect all nodes together
audionodes.fm_node.connect(audionodes.fm_oscillator.frequency);
audionodes.fm_oscillator.connect(audionodes.modulation_index);
audionodes.fp_node.connect(audionodes.fp_oscillator.frequency);
audionodes.modulation_index.connect(audionodes.modulation_gain);
audionodes.modulation_gain.connect(audionodes.fp_oscillator.frequency);
audionodes.fp_oscillator.connect(audionodes.volume);
audionodes.volume.connect(context.destination);
audionodes.envelope.connect(audionodes.alpha);
audionodes.alpha.connect(audionodes.modulation_gain.gain);
audionodes.envelope.connect(audionodes.beta);
audionodes.beta.connect(audionodes.volume.gain);
audionodes.flat.connect(audionodes.envelope);

// Set up nodes
audionodes.fm_oscillator.start(context.currentTime);
audionodes.fp_node.start(context.currentTime);
audionodes.flat.start(context.currentTime);
audionodes.fm_node.start(context.currentTime);
audionodes.fp_oscillator.start(context.currentTime);

audionodes.modulation_index.gain.value = mod_index;
audionodes.volume.gain.value = 0;
audionodes.modulation_gain.gain.value = 0;
audionodes.fm_oscillator.frequency.value = 0;
audionodes.fp_oscillator.frequency.value = 0;

audionodes.alpha.gain.value = 1;
audionodes.beta.gain.value = 1;
audionodes.envelope.gain.value = 0;

var buffer_fp = context.createBuffer(1,512,context.sampleRate);
var buffer_fm = context.createBuffer(1,512,context.sampleRate);
var buffer_flat = context.createBuffer(1,512,context.sampleRate);
var buffer_flat_data = buffer_flat.getChannelData(0);
for (var i=0; i<512; i++) { buffer_flat_data[i] = 1; }
audionodes.flat.buffer = buffer_flat;
audionodes.flat.loop = true;
audionodes.fp_node.buffer = buffer_fp;
audionodes.fp_node.loop = true;
audionodes.fm_node.buffer = buffer_fm;
audionodes.fm_node.loop = true;

update_parameters();
