const fs = require('fs');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const configFileName = 'room.config'

const serverReact = require('http').Server(app);
const ioReact = require('socket.io')(serverReact);

server.listen(3319);
serverReact.listen(9000);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	console.log("Connected.");
	socket.on('new message', (data) =>{
    console.log(data);
    sendToReact(data);
	});
})

ioReact.on('connection', (socket) => {
	console.log("React Connected.");
})

// This is the updated Beacon class.
// Its memory is basically just a queue.

// Initialization; init file should go here next.
var configFile = JSON.parse(fs.readFileSync(configFileName,'utf8'));
const m_to_px = configFile.map.m_to_px
const beacon1_x_px = configFile.beacon1.x_px
const beacon1_y_px = configFile.beacon1.y_px
let beacon_xs = new Object();
let beacon_ys = new Object();
let beacon_mac = new Object();

for (var property in configFile) {
	if (property.startsWith("beacon")){
		let beacon_number = property.slice(property.length-1);
		beacon_xs[beacon_number] = configFile[property].relative_x_m
		beacon_ys[beacon_number] = configFile[property].relative_y_m
		beacon_mac[beacon_number] = configFile[property].mac
	}
}

const sendToReact = (beacon_data) => {
  x = -beacon_data.x;
  y = -beacon_data.y;
  new_x = beacon1_x_px + x/m_to_px;
  new_y = beacon1_y_px + y/m_to_px;
  console.log(new_x)
  console.log(new_y)
  let position = {
    lng:Math.round(new_x),
    lat:Math.round(new_y),
  };
  ioReact.emit('updateData', position);
}