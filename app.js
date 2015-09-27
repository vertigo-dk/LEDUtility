var Table = require('cli-table');
var program = require('commander');

var ArtNet = require('../node-artnet');

var controller = ArtNet.createController();

program
  .version('0.0.1')
  .option('-m --monitor', 'Live monitor nodes')
  .option('-u --update', 'Update config of node')
  .parse(process.argv)


if(program.monitor){
	setTimeout(function(){
		//console.log('\033[2J');
		updateTable();	
	}, 200)
} else if(program.update){
	controller.updateClient("2.1.204.238");
}
 

function updateTable(){
	var table = new Table({
	    head: ['IP', 'MAC', 'Name','Version', 'Ports', 'Universes']
	});

	for(var i=0;i<controller.nodes.length;i++){
		console.log(controller.nodes[i])
		table.push(
		    [controller.nodes[i].ip, controller.nodes[i].mac, controller.nodes[i].name, controller.nodes[i].version, controller.nodes[i].numOutputs, controller.nodes[i].universesOutput.join(',')]
		);
	}
	console.log('\033[2J');
	if(table.length > 0){
		console.log(table.toString()); 
	} else {
		console.log("No ArtNet nodes found");
	}

	setTimeout(updateTable, 1000);
}

