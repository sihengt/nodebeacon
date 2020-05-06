const noble = require('@abandonware/noble');
const fs = require('fs');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const tf = require('@tensorflow/tfjs-node')
// Configuring Express and Socket.IO for setting up websocket connection to React.
const port = 9000
http.listen(port, () => {
  console.log(`listening on *:${port}`)
})

// Initialization; init file should go here next.
const beacon1mac = '3ca308ac7f2e';
const beacon2mac = '3ca308ac9b69';
const beacon3mac = '3ca308adecb3';
const u = 3.72;

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

// BLE BEACON INITIALIZATION AND WORK
Beacon1 = new Beacon(beacon1mac);
Beacon2 = new Beacon(beacon2mac);
Beacon3 = new Beacon(beacon3mac);
let beaconList = new Array(Beacon1, Beacon2, Beacon3);

noble.on('stateChange', function (state) {
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

  if (macAddress == beacon1mac){
    console.log('\x1b[36m', '<Beacon 1>', '\x1b[0m', 'RSSI: ', rssi, 'Distance Calculated ', calculatedDistance);
    Beacon1.update_memory(calculatedDistance);
    console.log();
  }

  if (macAddress == beacon2mac){
    console.log('\x1b[31m', '<Beacon 2>', '\x1b[0m', 'RSSI: ', rssi, 'Distance Calculated ', calculatedDistance);
    Beacon2.update_memory(calculatedDistance);
    console.log();
  }

  if (macAddress == beacon3mac){
    console.log('\x1b[32m', '<Beacon 3>', '\x1b[0m]', 'RSSI: ', rssi, 'Distance Calculated ', calculatedDistance);
    Beacon3.update_memory(calculatedDistance);
    console.log();
  }
});

const interval = setInterval(printSomething = () => {
  console.log("Being called.");
  prepData(trilat);
}, 2000);

const prepData = async (trilat) => {
  beacon_data = new Object();
  for (i=0;i<beaconList.length;i++){
    x = tf.tensor(beaconList[i].get_memory());
    if (x.shape[0] === 0) { 
      continue 
    }
    outliersRemoved = await removeOutliers(x);
    if (outliersRemoved.shape[0] === 0){
      continue
    }
    beacon_data[i] = await removeOutliers(x);
  }
  n_beacons = Object.keys(beacon_data).length;
  // you shouldn't clear beacon memory and call trilat if there are 3 keys. you should do it if there are 3 keys AFTER removing outliers.
  if (n_beacons >= 3){
    clear_all_beacon_memory();
    trilat(beacon_data);
  }
}

const removeOutliers = async (x) => {
  mean = tf.mean(x);
  std = tf.moments(x).variance.sqrt();
  z_mask = tf.less(tf.div(tf.sub(x,mean),std), 3);
  const result = await tf.booleanMaskAsync(x,z_mask);
  return result;
}

// Clears all memory for all beacons. 
// Happens when it's about to trilat, "pops" everything from the queue.
const clear_all_beacon_memory = () => {
  for (i=0; i<beaconList.length;i++){
    beaconList[i].clear_memory();
  }
}

const trilat = (beacon_data) => {
  r = new Object();
  for (i=0;i<beaconList.length;i++){
    r[i]= tf.mean(beacon_data[i]).dataSync()[0];
  }
  // HARDCODED FOR NOW.
  const x2 = -3.72;
  const y2 = 0;
  const x3 = -2.37;
  const y3 = -3.873;
  const Vsquared = (x3**2) + (y3**2)
  console.log("r's:", r)
  // let x_calculated = (r[0]**2 - r[1]**2 + (3.72**2))/(2*3.72);
  // let y_calculated = (r[0]**2 - r[2]**2 + Vsquared - 2*(x3)*(x_calculated))/(2*y3);

  // console.log("calculated x,y are (",x_calculated, ",",y_calculated,").");
  const g = 1
  var w1 = 1 / r[0]**g;
  var w2 = 1 / r[1]**g;
  var w3 = 1 / r[2]**g;
  w_sum = w1 + w2 + w3;
  var x_calculated = (w2 * x2 + w3 * x3) / w_sum;
  var y_calculated = (w2 * y2 + w3 * y3) / w_sum;

  console.log("calculated x,y are (",x_calculated, ",",y_calculated,").");  
  new_x = 272 + (x_calculated / 0.014758)
  new_y = Math.min(710 + (y_calculated / 0.014758),710)
  console.log("x,y are (",new_x, ",",new_y,").");

  let position = {
    lng:Math.round(new_x),
    lat:Math.round(new_y),
    yourRoom:true
  };

  io.emit('updateData', position);
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