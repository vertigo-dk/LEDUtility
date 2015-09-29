var Table = require('cli-table');
var program = require('commander');
var inquirer = require("inquirer");

var ArtNet = require('node-artnet');

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
	setTimeout(function(){
		var ips = [];

		if(controller.nodes.length == 0){
			console.error("No nodes found")
		} else {
			controller.nodes.sort();
			for(var i=0;i<controller.nodes.length;i++){
				ips.push({name:controller.nodes[i].ip + " ("+controller.nodes[i].name+")", value:controller.nodes[i].ip})
			}


			inquirer.prompt([
				{name: 'ip', message:'Node IP-address', type:'list', choices:ips, validate:function(d){
					console.log(d)
				}},
				{name: 'id', message:'Node ID', default:1}
			], function( res){

				inquirer.prompt([
					{name:'name', message: 'Node name', default:'VardeLED '+res.id}	
				], function(res2){
					controller.updateClient(res.ip, res2.name, [(res.id)*4+0,(res.id)*4+1,(res.id)*4+2,(res.id)*4+3], true);
					setTimeout(function(){
						controller.updateClient(res.ip, undefined, undefined, false);
						setTimeout(function(){
							process.exit()	
						}, 100)
					},1000);
				 	
				})	
			})
		}

	}, 200);
}
 

function updateTable(){
	var table = new Table({
	    head: ['IP', 'MAC', 'Name','Version', 'Ports', 'Universes', 'net', 'subnet']
	});

	for(var i=0;i<controller.nodes.length;i++){
		console.log(controller.nodes[i])
		table.push(
		    [controller.nodes[i].ip, controller.nodes[i].mac, controller.nodes[i].name, controller.nodes[i].version, controller.nodes[i].numOutputs, controller.nodes[i].universesOutput.join(','), controller.nodes[i].net, controller.nodes[i].subnet]
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

