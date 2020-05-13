const noble = require('@abandonware/noble');
const fs = require('fs');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const tf = require('@tensorflow/tfjs-node')
const configFileName = 'dtta.config'

// Configuring Express and Socket.IO for setting up websocket connection to React.
const port = 9000
http.listen(port, () => {
  console.log(`listening on *:${port}`)
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

const calculateDistance = (txPower,rssi) => {
  // got from this dude: https://stackoverflow.com/questions/20416218/understanding-ibeacon-distancing
  // it is a regression run based on experimental results, will work as an estimate for this testbed.
  if(rssi==0){
    return -1; // as a sort of error code / cannot calculate distance.
  }

  var ratio = rssi / txPower;
  if (ratio < 1.0){
    return Math.pow(ratio,10);
  } else {
    return (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
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

// BEGIN WORK!
noble.on('stateChange', function (state) {
  console.log(state);
  if (state === 'poweredOn') {
    console.log('Powered on, beginning scan.')
    // noble.startScanning(['e2c56db5dffb48d2b060d0f5a71096e0'],true);
    noble.startScanning([],true);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function (peripheral) {
  var macAddress = peripheral.uuid;
  var rssi = peripheral.rssi;
  var localName = peripheral.advertisement.localName;
  var calculatedDistance = calculateDistance(-53,rssi);
  var current_time = Math.round((new Date()).getTime()/1000);
// 53

  for (var beacon_number in beacon_mac) {
    if (macAddress == beacon_mac[beacon_number]){
      console.log(`\x1b[3${beacon_number}m<Beacon ${beacon_number}>`, '\x1b[0m', 'RSSI: ', rssi, 'Distance Calculated ', calculatedDistance);
      beacon_list[beacon_number].update_memory(calculatedDistance);
      break
    }
  }
});

const interval = setInterval(printSomething = () => {
  console.log("Being called.");
  prepData(trilat);
}, 3000);

const prepData = async (trilat) => {
  beacon_data = new Object();
  for (var beacon_number in beacon_list) {
    x = tf.tensor(beacon_list[beacon_number].get_memory());
    if (x.shape[0] === 0) { 
      continue 
    }
    outliersRemoved = await removeOutliers(x);
    if (outliersRemoved.shape[0] === 0){
      continue
    }
    beacon_data[beacon_number] = await removeOutliers(x);
  }
  n_beacons = Object.keys(beacon_data).length;
  // you shouldn't clear beacon memory and call trilat if there are 3 keys. you should do it if there are 3 keys AFTER removing outliers.
  if (n_beacons >=1){ // as long as there're more than 3 beacons, let's GO!
    clear_all_beacon_memory();
    trilat(beacon_data);
  }
}

const removeOutliers = async (x) => {
  mean = tf.mean(x);
  std = tf.moments(x).variance.sqrt();
  z_mask = tf.less(tf.div(tf.sub(x,mean),std), 1.5);
  const result = await tf.booleanMaskAsync(x,z_mask);
  return result;
}

// Clears all memory for all beacons. 
// Happens when it's about to trilat, "pops" everything from the queue.
const clear_all_beacon_memory = () => {
  for (var beacon_number in beacon_list) {
    beacon_list[beacon_number].clear_memory();
  }
}

const trilat = (beacon_data) => {
  // for (i=0;i<beaconList.length;i++){
  //   r[i]= tf.mean(beacon_data[i]).dataSync()[0];
  // }
  r = new Object();
  w = new Object();
  let w_sum = 0;
  let x_calculated = 0;
  let y_calculated = 0;
  const g = 1.5;
  for (let beacon_number in beacon_data) {
    r[beacon_number] = tf.mean(beacon_data[beacon_number]).dataSync()[0];
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

  // TODO: For beacons > 3, change to loop. For now keep.
  // var w1 = 1 / r[0]**g;
  // var w2 = 1 / r[1]**g;
  // var w3 = 1 / r[2]**g;
  // w_sum = w1 + w2 + w3;

  // let x_calculated = (w2 * x2 + w3 * x3) / w_sum;
  // let y_calculated = (w2 * y2 + w3 * y3) / w_sum;

  console.log("calculated x,y are (",x_calculated, ",",y_calculated,").");  
  new_x = beacon1_x_px + (x_calculated / m_to_px)
  new_y = beacon1_y_px + (y_calculated / m_to_px)
  console.log("x,y are (",new_x, ",",new_y,").");

  let position = {
    lng:Math.round(new_x),
    lat:Math.round(new_y),
  };

  io.emit('updateData', position);

  // FAILED IMPLEMENTATIONS: TRILATERATION & LSE
  // const Vsquared = (x3**2) + (y3**2)
  // let x_calculated = (r[0]**2 - r[1]**2 + (3.72**2))/(2*3.72);
  // let y_calculated = (r[0]**2 - r[2]**2 + Vsquared - 2*(x3)*(x_calculated))/(2*y3);
  // console.log("calculated x,y are (",x_calculated, ",",y_calculated,").");

  // let A = mathjs.matrix([ [2*(-x2), 2*(-y2)],
  //                     [2*(-x3),2*(-y3)]])
  // let B = mathjs.matrix([ [-(x2**2)-(y2**2) + (r[1]**2-r[0]**2)],
  //                     [-(x3**2)-(y3**2) + (r[2]**2-r[0]**2)] ])

  // console.log(A)
  // A_t = mathjs.transpose(A)
  // coord = math.multiply(A_t,A)
  // console.log("(A_t * A): ", coord)
  // coord = 
  // coord = tf.matMul(coord, A, false, true);
  // coord.print(); 
  // coord = tf.matMul(coord, B);
  // coord.print(); 
}