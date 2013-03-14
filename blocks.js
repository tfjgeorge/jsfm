var Block = {};
var AudioContext = new webkitAudioContext();

/* Define block types */
Block.types = {};
Block.types.oscillator = {
	"type": "oscillator",
	"input":"frequency",
	"parameters": {
		"shape": ["sin"]
	}
};
Block.types.gain = {
	"type":"gain",
	"parameters": {
		"type": ["flat"],
		"value": 1
	}
};
Block.types.flat = {
	"type":"flat",
	"parameters" : {
		"type": ["flat"],
		"value": 400
	}
};
Block.types.output = {
	"type":"output",
	"parameters" : {
		"value" : 1
	}
}

/* Define blocks */
Block.blocks = [];
Block.map = {};

/* Update a parameter */
Block.update_parameter = function(id, par_type, new_value) {
	var block = Block.map[id];
	if (block.type == Block.types.output || block.type == Block.types.gain) {
		block.node.gain.value = new_value;
	}
	if (block.type == Block.types.flat) {
		if (par_type == "value") {
			var buffer = block.node.buffer.getChannelData(0);
			for (var i=0; i<buffer.length; i++) {
				buffer[i] = new_value;
			}
		}
	}
}

/* Add a block */
Block.add_block = function(type) {
	var id = "block"+Block.blocks.length;
	$("#blocks").append('<div class="block" id="'+id+'"></div>');	

	var node;
	switch (type) {
		case Block.types.output:
			node = AudioContext.createGainNode();
			node.connect(AudioContext.destination);
		break;
		case Block.types.flat:
			node = AudioContext.createBufferSource();
			var buffer = AudioContext.createBuffer(1,512,AudioContext.sampleRate);
			node.start(0);
			node.buffer = buffer;
			node.loop = true;
		break;
		case Block.types.gain:
			node = AudioContext.createGainNode();
		break;
		case Block.types.oscillator:
			node = AudioContext.createOscillator();
			node.frequency.value = 0;
			node.start(0);
		break;
	}

	var block = {
		id: id,
		type: type,
		jdom: $("#blocks>.block:last-child"),
		node: node
	};

	block.jdom.append('<p>id: '+block.id+'</p>');
	block.jdom.append('<p>type: '+block.type.type+'</p>');
	for (var par in type.parameters) {
		if (typeof(type.parameters[par]) == "number") {
			var input = block.jdom.append('<p>'+par+'<input type="text" value="'+type.parameters[par]+'"></p>');
			input.change(function() {
				Block.update_parameter(id,par,parseFloat(input.find("input").val()));	
			});
		}
	}

	Block.blocks.push(block);
	Block.map[id] = block;

	/* Add to selectors */
	$("#from,#to").append('<option value="'+block.id+'">'+block.id+'</option>');

};

/* Define links */
Block.links = [];

/* Create link between two components */
Block.create_link = function(from,to) {
	var from_node = Block.map[from].node,
	    to_node   = Block.map[to].node;
	if (Block.map[to].type.input) {
		console.log(to_node[Block.map[to].type.input]);
		from_node.connect(to_node[Block.map[to].type.input]);
	} else {
		from_node.connect(to_node);
	}
};

/* Create output block */
Block.add_block(Block.types.output);

/* Create UI bindings */
$("#button_add_oscillator").click(function() { Block.add_block(Block.types.oscillator); });
$("#button_add_flat").click(function() { Block.add_block(Block.types.flat); });
$("#button_add_gain").click(function() { Block.add_block(Block.types.gain); });
$("#button_create_link").click(function() { Block.create_link($("#from>option:selected").attr("value"),$("#to>option:selected").attr("value")); });
