var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server, { log: false })
,   conf = require('./config.json')
,   ref = require('ref')
,   ffi = require('ffi');

var ArrayType = require('ref-array')

var status = "off"
,   red = 0
,   green = 0
,   blue = 0
,   preset = 0;

var boblight = ref.types.void
,   boblightPtr = ref.refType(boblight)
,   boblightRgb = ArrayType(ref.types.int);

var libboblight = ffi.Library('libboblight', {
	'boblight_init' : [ 'pointer', [] ],
	'boblight_destroy' : [ 'void' , [ boblightPtr ] ],
	'boblight_connect' : [ 'int' , [ boblightPtr,  "string", 'int', 'int'] ],
	'boblight_setpriority' : [ 'int' , [ boblightPtr, "int" ]],
	'boblight_addpixel' : [ 'int', [ boblightPtr, "int", boblightRgb ]],
	'boblight_sendrgb' : [ 'int', [ boblightPtr, "int", "int" ]]
});

var rgbBlack = new boblightRgb([0,0,0]);
var rgbCustom = new boblightRgb([0,0,0]);
var ptr = libboblight.boblight_init();
libboblight.boblight_connect(ptr, "127.0.0.1", 19333, 1000000);

//console.log(libboblight.boblight_destroy(ptr));


server.listen(conf.port);
app.configure(function(){
	// statische Dateien ausliefern
	app.use(express.static(__dirname + '/public'));
});
// wenn der Pfad / aufgerufen wird
app.get('/', function (req, res) {
	// so wird die Datei index.html ausgegeben
	res.sendfile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
	socket.emit('currData', { status: status, red: red, green: green, blue: blue });
	socket.emit('presets', { presets: conf.presets });

	socket.on('status', function (data) {
		status = data;
		io.sockets.emit('currData', { status: status, red: red, green: green, blue: blue, preset: preset });
		//console.log('status changed to: ' + data);
		if (status == "on") {			
			libboblight.boblight_setpriority(ptr, 1);
			updateColor();
		} else {
			libboblight.boblight_addpixel(ptr, -1, rgbBlack);
			libboblight.boblight_sendrgb(ptr, 1, 0);
			libboblight.boblight_setpriority(ptr, 200);
		}
	});
	socket.on('red', function (data) {
		red = data;
		preset = 0;
		rgbCustom[0] = red;
		updateColor();
		io.sockets.emit('currData', { status: status, red: red, green: green, blue: blue, preset: preset });
		//console.log('red changed to: ' + data);
	});
	socket.on('green', function (data) {
		green = data;
                preset = 0;
		rgbCustom[1] = green;
		updateColor();
		io.sockets.emit('currData', { status: status, red: red, green: green, blue: blue, preset: preset });
		//console.log('green changed to: ' + data);
	});
	socket.on('blue', function (data) {
		blue = data;
                preset = 0;
		rgbCustom[2] = blue;
		updateColor();
		io.sockets.emit('currData', { status: status, red: red, green: green, blue: blue, preset: preset });
		//console.log('blue changed to: ' + data);
	});
	
	socket.on('preset', function (data) {
		//console.log("Got preset request #" + data);
		//console.log("this is preset " + conf.presets[data]["name"]);
                preset = data;
		if (preset != 0) {
			red = conf.presets[data]["r"];
			green = conf.presets[data]["g"];
			blue = conf.presets[data]["b"];
			rgbCustom = [red, green, blue];
		}
		io.sockets.emit('currData', { status: status, red: red, green: green, blue: blue, preset: preset });
		updateColor();
	});
});

function updateColor() {
	libboblight.boblight_addpixel(ptr, -1, rgbCustom);
	libboblight.boblight_sendrgb(ptr, 1, 0);
}

//console.log('Der Server läuft nun auf dem Port ' + conf.port);
