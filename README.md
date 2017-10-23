# LED Utility
Developed by Jonas Jongejan for Vertigo 2015

## About
This utility can monitor and configure ArtNet 3 devices, specificaly developed for a [custom made ArtNet node](https://github.com/vertigo-dk/VardeLED) running in Teensy

## Install
download and install
`cd` into the folder
`npm install`

## Run
- To start the webserver, run `node app -w` the server is on `127.0.0.1:8080`
- To monitor visible nodes on the network, run `node app -m`
- To update a node, run `node app -u`
