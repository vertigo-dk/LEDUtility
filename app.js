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
var firstTime = true;

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
            controller.nodes.sort();
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
    // if (firstTime) {
        server.listen(8080);
        console.log('Local server established at port 8080');

        // create fileserver
        app.use(express.static(__dirname + '/HTML'));
        app.get('/', function(req, res, next) {
            res.sendFile(__dirname + '/HTML/index.html');
        });
    //     firstTime = false;
    // }

    io.sockets.on('connection', function(socket) {
        console.log('* page loaded');
        socket.on("updateList", function(obj) {
            console.log('* update ArtNode list');
            var list = "test List";
            socket.emit("nodeList", list);
        });
        socket.on("updateClient", function(node) {
            // controller.updateClient(node.ip, node.name, [(node.id),(node.id)*1+1,(node.id)*1+2,(node.id)*1+3], true);
            console.log('* update ArtNode  -  Port:'); // + obj.server.port + ' IP:' + obj.server.host);
        });

        // setTimeout(function() {
        //     socket.emit("nodeList", "test");// createList());
        //     console.log('* update ArtNode  -  list');
        // }, 1000);
    });



}


function updateTable() {
    var table = new Table({
        head: ['IP', 'MAC', 'Name', 'Version', 'Ports', 'Universes', 'net', 'subnet', 'report']
    });

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

function createList() {
    var table = new Table({
        head: ['IP', 'MAC', 'Name', 'Version', 'Ports', 'Universes', 'net', 'subnet', 'report']
    });

    for (var i = 0; i < controller.nodes.length; i++) {
        console.log(controller.nodes[i])
        table.push(
            [controller.nodes[i].ip, controller.nodes[i].mac, controller.nodes[i].name, controller.nodes[i].version, controller.nodes[i].numOutputs, controller.nodes[i].universesOutput.join(','), controller.nodes[i].net, controller.nodes[i].subnet, controller.nodes[i].report]
        );
    }

    if (table.length > 0) {
        console.log(table.toString());

        return table.toString();
    } else {
        return "No ArtNet nodes found";
    }

}
