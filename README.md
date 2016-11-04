# LED Utility
Developed by Jonas Jongejan for Vertigo 2015

## About
This utility can monitor and configure ArtNet 3 devices, specificaly developed for a [custom made ArtNet node](https://github.com/vertigo-dk/VardeLED) running in Teensy

## Install
Clone repository, and run `npm install`

### dependent
`npm install express --save`
`npm install socket.io`

## Run
- To monitor visible nodes on the network, run `node app -m`
- To update a node, run `node app -u`
