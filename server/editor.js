var express = require('express');
var request = require('request');
var http = require('http');
var path = require('path');
var fs = require('fs-extra');
var bodyParser = require('body-parser')

var assets = require('./assets.js');
var workspaces = require('./workspace.js');
var tools = require('./tools.js');

const PORT = 7781;

var app = express();
app.set('port', PORT);
app.use(bodyParser.json({limit: '50mb', extended: true}))

app.use(express.static(path.join(__dirname,'../web')));
app.use('/client', express.static(path.join(__dirname,'../client')));
app.use('/workspaces', express.static(path.join(__dirname,'../tmp')));
app.use('/assets', express.static(path.join(__dirname,'../assets')));
app.get('/', function(req, res){ res.sendFile(path.join(__dirname, '../web/maps.html')); });

app.use('/api/assets', assets.init(express.Router()));
app.use('/api/workspaces', workspaces.init(express.Router()));
app.use('/api/tools', tools.init(express.Router()));

var server = http.Server(app);
server.listen(PORT, function() {
    console.log('Starting server on port ' + PORT);
});