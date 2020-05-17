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

		for (var beaconNumber in beacon_mac){
			if (beacon_mac[beaconNumber] == data.mac){
				// console.log(`\x1b[3${beaconNumber}m<Beacon ${beaconNumber}>`, '\x1b[0m', 'Distance: ', data.distance);
				beacon_list[beaconNumber].update_memory(data.distance);
			}
		}

	});
})

ioReact.on('connection', (socket) => {
	console.log("React Connected.");
})

// This is the updated Beacon class.
// Its memory is basically just a queue.
class Beacon {
	constructor(mac){
		this.id = mac;
		this.memory = new Array();
	}
	clear_memory() { 
		this.memory = new Array(); 
	}
	get_memory() { 
		return this.memory 
	}
	update_memory(distance){
		this.memory = [...this.memory, distance]
	}
}
// Initialization; init file should go here next.
var configFile = JSON.parse(fs.readFileSync(configFileName,'utf8'));
const m_to_px = configFile.map.m_to_px
const beacon1_x_px = configFile.beacon1.x_px
const beacon1_y_px = configFile.beacon1.y_px
let beacon_xs = new Object();
let beacon_ys = new Object();
let beacon_mac = new Object();
let beacon_list = new Object();

for (var property in configFile) {
	if (property.startsWith("beacon")){
		let beacon_number = property.slice(property.length-1);
		beacon_xs[beacon_number] = configFile[property].relative_x_m
		beacon_ys[beacon_number] = configFile[property].relative_y_m
		beacon_mac[beacon_number] = configFile[property].mac
		beacon_list[beacon_number] = new Beacon(beacon_mac[beacon_number])
	}
}

const interval = setInterval(printSomething = () => {
  console.log("Being called.");
  prepData(trilat);
}, 2000);

const prepData = (trilat) => {
  beacon_data = new Object();
  for (var beacon_number in beacon_list) {
    x = beacon_list[beacon_number].get_memory();
    if (x.length == 0){
    	continue;
    }
    beacon_data[beacon_number] = x;
  }
  n_beacons = Object.keys(beacon_data).length;
  // you shouldn't clear beacon memory and call trilat if there are 3 keys. you should do it if there are 3 keys AFTER removing outliers.
  if (n_beacons >= 3){ // as long as there're more than 3 beacons, let's GO!
    clear_all_beacon_memory();
    trilat(beacon_data);
  }
}

// Clears all memory for all beacons. 
// Happens when it's about to trilat, "pops" everything from the queue.
const clear_all_beacon_memory = () => {
  for (var beacon_number in beacon_list) {
    beacon_list[beacon_number].clear_memory();
  }
}

const trilat = (beacon_data) => {
  r = new Object();
  w = new Object();
  let w_sum = 0;
  let x_calculated = 0;
  let y_calculated = 0;
  const g = 1.2;

  // console.log(beacon_data)
  
  for (let beacon_number in beacon_data) {
  	let total_value = 0;
  	for (let i=0;i<beacon_data[beacon_number].length;i++){
  		let one_value = beacon_data[beacon_number][i]
  		total_value += one_value;
  	}
  	r[beacon_number] = (total_value/beacon_data[beacon_number].length);
  }

  for (let beacon_number in beacon_data){
    w[beacon_number] = 1/ r[beacon_number]**g;
    x_calculated += w[beacon_number] * beacon_xs[beacon_number]
    y_calculated += w[beacon_number] * beacon_ys[beacon_number]
    w_sum += w[beacon_number];
  }

  x_calculated /= w_sum;
  y_calculated /= w_sum;
  
  console.log("r's:", r)
  console.log("w's:", w)

  console.log("calculated x,y are (",x_calculated, ",",y_calculated,").");  
  new_x = beacon1_x_px + (x_calculated / m_to_px)
  new_y = Math.min(beacon1_y_px + (y_calculated / m_to_px),710)
  console.log("x,y are (",new_x, ",",new_y,").");

  let position = {
    lng:Math.round(new_x),
    lat:Math.round(new_y),
  };
  ioReact.emit('updateData', position);
}