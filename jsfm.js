var context = new AudioContext();
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

var build_url = function(fp,fpfm,i,a,d,s,r,ah,dh,sh,v_amp,v_freq) {
	return "http://tfjgeorge.com/jsfm/index.html"
		+ "?fp="+fp
		+ "&fpfm="+fpfm
		+ "&i="+i
		+ "&a="+a
		+ "&d="+d
		+ "&s="+s
		+ "&r="+r
		+ "&ah="+ah
		+ "&dh="+dh
		+ "&v_amp="+v_amp
		+ "&v_freq="+v_freq
		+ "&sh="+sh;
}

var update_parameters = function() {
	fp = parseFloat($("#fp").val());
	var fpfm = parseFloat($("#fm").val());
	fm = fpfm*fp;
	var index = parseFloat($("#i").val());
	mod_index = index * fp;
	
	var data1 = buffer_fp.getChannelData(0);
	for (var i=0; i<512; i++) {
		data1[i] = fp;
	}
	var vibrato_amp = parseFloat($("#vibrato_amp").val());
	var vibrato_freq = parseFloat($("#vibrato_freq").val());
	audionodes.vibrato.frequency.value = vibrato_freq;
	audionodes.vibrato_gain.gain.value = vibrato_amp;

	audionodes.modulation_index.gain.value = mod_index;
	audionodes.fm_node.gain.value = fpfm;
	
	var a = parseFloat($("#a").val())/1000,
	    d = parseFloat($("#d").val())/1000,
	    s = parseFloat($("#s").val())/1000,
	    r = parseFloat($("#r").val())/1000,
	    ah = parseFloat($("#ah").val()),
	    dh = parseFloat($("#dh").val()),
	    sh = parseFloat($("#sh").val());

	$("#url").val(build_url(fp,fpfm,index,a*1000,d*1000,s*1000,r*1000,ah,dh,sh,vibrato_amp,vibrato_freq));
};

var fill_parameters = function() {
	var par_object = {};
	var parameters = window.location.search.slice(1);
	var splitted = parameters.split("&");
	if (splitted.length > 5) {
		for (var i in splitted) {
			var n = splitted[i].split("=");
			par_object[n[0]] = n[1];
		}
		$("#fp").val(par_object["fp"]);
		$("#fm").val(par_object["fpfm"]);
		$("#i").val(par_object["i"]);
		$("#a").val(par_object["a"]);
		$("#d").val(par_object["d"]);
		$("#s").val(par_object["s"]);
		$("#r").val(par_object["r"]);
		$("#ah").val(par_object["ah"]);
		$("#dh").val(par_object["dh"]);
		$("#sh").val(par_object["sh"]);
		$("#vibrato_amp").val(par_object["v_amp"]);
		$("#vibrato_freq").val(par_object["v_freq"]);
	}
}


var audionodes = {};

// Create all nodes
audionodes.fm_node = context.createGain();
audionodes.fm_oscillator = context.createOscillator();
audionodes.modulation_index = context.createGain();
audionodes.modulation_gain = context.createGain();
audionodes.fp_node = context.createBufferSource();
audionodes.fp_oscillator = context.createOscillator();
audionodes.volume = context.createGain();
audionodes.flat = context.createBufferSource();
audionodes.envelope = context.createGain();
audionodes.alpha = context.createGain();
audionodes.beta = context.createGain();
audionodes.vibrato = context.createOscillator();
audionodes.vibrato_gain = context.createGain();

// Connect all nodes together
audionodes.fm_node.connect(audionodes.fm_oscillator.frequency);
audionodes.vibrato_gain.connect(audionodes.fm_oscillator.frequency);
audionodes.vibrato.connect(audionodes.vibrato_gain);
audionodes.vibrato_gain.connect(audionodes.fp_oscillator.frequency);
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
audionodes.fp_node.connect(audionodes.fm_node);

// Set up nodes
audionodes.fm_oscillator.start(context.currentTime);
audionodes.fp_node.start(context.currentTime);
audionodes.flat.start(context.currentTime);
audionodes.fp_oscillator.start(context.currentTime);
audionodes.vibrato.start(context.currentTime);

audionodes.modulation_index.gain.value = mod_index;
audionodes.volume.gain.value = 0;
audionodes.modulation_gain.gain.value = 0;
audionodes.fm_oscillator.frequency.value = 0;
audionodes.fp_oscillator.frequency.value = 0;

audionodes.alpha.gain.value = 1;
audionodes.beta.gain.value = 1;
audionodes.envelope.gain.value = 0;

var buffer_fp = context.createBuffer(1,512,context.sampleRate);
var buffer_flat = context.createBuffer(1,512,context.sampleRate);
var buffer_flat_data = buffer_flat.getChannelData(0);
for (var i=0; i<512; i++) { buffer_flat_data[i] = 1; }
audionodes.flat.buffer = buffer_flat;
audionodes.flat.loop = true;
audionodes.fp_node.buffer = buffer_fp;
audionodes.fp_node.loop = true;

fill_parameters();
update_parameters();
