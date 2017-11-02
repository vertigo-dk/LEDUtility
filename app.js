var Table = require('cli-table');
var program = require('commander');
var inquirer = require("inquirer");
var zpad = require('zpad');

var ArtNet = require('artnet');

// For webserver
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var controller = ArtNet.createController();

program
    .version('0.0.3')
    .option('-m --monitor', 'Live monitor nodes')
    .option('-u --update', 'Update config of node')
    .option('-w --webserver', 'start webserver')
    .parse(process.argv)


if (program.monitor) {
    setTimeout(function() {
        //console.log('\033[2J');
        updateTable();
    }, 200)
} else if (program.update) {
    setTimeout(function() {
        var ips = [];

        if (controller.nodes.length == 0) {
            console.error("No nodes found")
        } else {
            controller.nodes.sort(function(a, b){
                //var startAddressA = (a.net <<8)+(a.subnet<<4)+parseInt(a.universesOutput[0]);
                //var startAddressB = (b.net <<8)+(b.subnet<<4)+parseInt(b.universesOutput[0]);
                if(a.name < b.name) return -1;
                if(a.name > b.name) return 1;
                //return startAddressA-startAddressB;

            });


            for (var i = 0; i < controller.nodes.length; i++) {
                ips.push({
                    name: controller.nodes[i].ip + " (" + controller.nodes[i].name + ")",
                    value: controller.nodes[i].ip
                })
            }


            inquirer.prompt([{
                name: 'ip',
                message: 'Node IP-address',
                type: 'list',
                choices: ips,
                validate: function(d) {
                    console.log(d)
                }
            }, {
                name: 'id',
                message: 'Node ID',
                default: 1
            }], function(res) {

                inquirer.prompt([{
                    name: 'name',
                    message: 'Node name',
                    default: 'BlackLED ' + zpad(res.id, 3)
                }], function(res2) {
                    controller.updateClient(res.ip, res2.name, [(res.id), (res.id) * 1 + 1, (res.id) * 1 + 2, (res.id) * 1 + 3], true);
                    // setTimeout(function(){
                    // 	controller.updateClient(res.ip, undefined, undefined, false);
                    setTimeout(function() {
                            process.exit()
                        }, 1000)
                        //},1000);

                })
            })
        }

    }, 200);

} else if (program.webserver) {
    server.listen(8080);
    console.log('Local server established at port 8080');

    // create fileserver
    app.use(express.static(__dirname + '/HTML'));
    app.get('/', function(req, res, next) {
        res.sendFile(__dirname + '/HTML/index.html');
    });


    io.sockets.on('connection', function(socket) {
        console.log('* page loaded');
        socket.on("updateList", function(obj) {
            socket.emit("nodeList", createList()||undefined);
        });
        socket.on("updateClient", function(node) {
            controller.updateClient(node.ip, node.name, [(node.id),(node.id)*1+1,(node.id)*1+2,(node.id)*1+3], true);
            // console.log('* update ArtNode  -  IP: ' + node.ip.port + ' Name:' + node.name + ' startAddress:' + node.id);
        });

        // setTimeout(function() {
        //     socket.emit("nodeList", createList());
        // }, 1000);
    });



}


function updateTable() {
    var table = new Table({
        head: ['IP', 'MAC', 'Name', 'Version', 'Ports', 'Universes', 'net', 'subnet', 'report']
    });

    if (controller.nodes.length == 0) {
      console.error("No nodes found")
    } else {
      controller.nodes.sort(function(a, b){
        //var startAddressA = (a.net <<8)+(a.subnet<<4)+parseInt(a.universesOutput[0]);
        //var startAddressB = (b.net <<8)+(b.subnet<<4)+parseInt(b.universesOutput[0]);
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        //return startAddressA-startAddressB;
      });
    }
    for (var i = 0; i < controller.nodes.length; i++) {
        console.log(controller.nodes[i])
        table.push(
            [controller.nodes[i].ip, controller.nodes[i].mac, controller.nodes[i].name, controller.nodes[i].version, controller.nodes[i].numOutputs, controller.nodes[i].universesOutput.join(','), controller.nodes[i].net, controller.nodes[i].subnet, controller.nodes[i].report]
        );
    }
    console.log('\033[2J');
    if (table.length > 0) {
        console.log(table.toString());
    } else {
        console.log("No ArtNet nodes found");
    }
    setTimeout(updateTable, 1000);
}

function BlackLED(ip, mac, name, version, numOutputs, universesOutput, net, subnet, report) {
    this.ip = ip;
    this.mac = mac;
    this.name = name;
    this.version = version;
    this.numOutputs = numOutputs;
    this.universesOutput = universesOutput;
    this.net = net;
    this.subnet = subnet;
    this.report = report;
};

function createList() {
    var boxes = [];
    controller.nodes.sort(function(a, b){
        var startAddressA = (a.net <<8)+(a.subnet<<4)+parseInt(a.universesOutput[0]);
        var startAddressB = (b.net <<8)+(b.subnet<<4)+parseInt(b.universesOutput[0]);
        return startAddressA-startAddressB;
    });

    for (var i = 0; i < controller.nodes.length; i++) {
        boxes.push(new BlackLED(controller.nodes[i].ip, controller.nodes[i].mac, controller.nodes[i].name, controller.nodes[i].version, controller.nodes[i].numOutputs, controller.nodes[i].universesOutput, controller.nodes[i].net, controller.nodes[i].subnet, controller.nodes[i].report));
    }
    return boxes;
}
