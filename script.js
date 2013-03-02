var sample_rate = 44100;

var product = function(array1,array2) {
	var output_product = Array(array1.length);
	for (var i in array1) {
		output_product[i] = array1[i] * array2[i];
	}
	return output_product;
};

var sum = function(array1,array2) {
	var output_sum = Array(array1.length);
	for (var i in array1) {
		output_sum[i] = array1[i] + array2[i];
	}
	return output_sum;
};

var cumsum = function(array) {
	var output_cumsum = Array(array.length);
	output_cumsum[0] = array[0];
	for (var i=1; i<array.length; i++) {
		output_cumsum[i] = output_cumsum[i-1] + array[i];
	}
	return output_cumsum;
};

var ones = function(length, value) {
	var value = value || 1;
	var output_ones = Array(length);
	for (var i=0; i<length; i++) {
		output_ones[i] = value;
	}
	return output_ones;
};

// Attack Decay Sustain Release
//
//
var adsr = function(T) {
	return function(t) {
		var output_adsr = Array(t.length);
		for (var i in t) {
			if (t[i]<0.1) { output_adsr[i] = 0.5+3*t[i]; }
			else if (t[i]<0.3) { output_adsr[i] = 0.8-1.5*(t[i]-0.1); }
			else if (T-t[i]<0.5) { output_adsr[i] = T-t[i]; }
			else output_adsr[i] = 0.5;
		}
		return output_adsr;
	};
};

// t vecteur instants
// m enveloppe
// f fréquence
var oscillateur = function (t,m,f) {
	var output_oscillateur = Array(t.length);
	var integration_frequences = cumsum(f);
	for (var i=0; i<t.length; i++) {
		output_oscillateur[i] = m[i] * Math.cos(2*Math.PI*integration_frequences[i]/sample_rate);
	}
	return output_oscillateur;
}

var instrument_fm = function(fp,fm,d,m,t) {
	var x1 = sum(ones(t.length,fp),oscillateur(t,ones(t.length,d),ones(t.length,fm)));
	return oscillateur(t,m(t),x1);
};

$("#play").click(function() {
	var audio = new Audio();
	var wave = new RIFFWAVE();
	var data = [];

	wave.header.sampleRate = sample_rate; // set sample rate to 44KHz
	wave.header.numChannels = 1; // two channels (stereo)

	var fp = parseInt($("#fp").val()),
	    fm = parseInt($("#fm").val()),
	    T = parseFloat($("#T").val()),
	    I = parseFloat($("#I").val());
	
	var m = adsr(T);
	var t = Array(T*sample_rate);
	for (var i=0; i<T*sample_rate; i++) {
		t[i] = i/sample_rate;
	}

	var data = instrument_fm(fp,fm,I*fm,m,t);
	var dataInt = Array(data.length);
	for (var i=0; i<data.length; i++) {
		dataInt[i] = 128 + Math.floor(data[i] * 127);
	}
	console.log(dataInt);

	wave.Make(dataInt); // make the wave file
	audio.src = wave.dataURI; // set audio source
	audio.play(); // we should hear two tones one on each speaker
	
});
