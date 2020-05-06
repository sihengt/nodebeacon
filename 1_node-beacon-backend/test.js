const tf = require('@tensorflow/tfjs-node')
const fs = require('fs');

const configFileName = 'livingroom.config'
const noble = require('@abandonware/noble');

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    console.log('Powered on, beginning scan.')
    // noble.startScanning(['E2C56DB5DFFB48D2B060D0F5A71096E0'],true);
    noble.startScanning([],true);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function (peripheral) {
  var macAddress = peripheral.uuid;
  var rssi = peripheral.rssi;
  var localName = peripheral.advertisement.localName;
  // var calculatedDistance = calculateDistance(-53,rssi);
  var current_time = Math.round((new Date()).getTime()/1000);
// 53
  if (macAddress == "3ca308ac7f2e"){
    console.log('\x1b[36m', '<Beacon 1>', '\x1b[0m', 'RSSI: ', rssi);
    // Beacon1.update_memory(calculatedDistance);
    // console.log();
  }

//   if (macAddress == beacon2mac){
//     console.log('\x1b[31m', '<Beacon 2>', '\x1b[0m', 'RSSI: ', rssi);
//     // Beacon2.update_memory(calculatedDistance);
//     // console.log();
//   }

//   if (macAddress == beacon3mac){
//     console.log('\x1b[32m', '<Beacon 3>', '\x1b[0m]', 'RSSI: ', rssi);
//     // Beacon3.update_memory(calculatedDistance);
//     // console.log();
//   }
});

noble.on('warning', printError = (message) => {
  console.log("WARNING: ", message);
})

// var configFile = JSON.parse(fs.readFileSync(configFileName,'utf8'));

// beacon_xs = new Object()
// beacon_ys = new Object()
// for (var property in configFile) {
//   if (property.startsWith("beacon")){
//     let beacon_number = property.slice(property.length-1);
//     beacon_xs[beacon_number] = configFile[property].relative_x_m
//     beacon_ys[beacon_number] = configFile[property].relative_y_m
//   }
// }

// console.log(beacon_xs);
// console.log(beacon_ys);

// USING TENSORFLOW TO REMOVE OUTLIERS. >> NEED TO CHANGE PACKAGE, DON'T NEED TENSOR OPERATIONS ANYMORE.
// x = tf.tensor([2,2,5,2,2])
// mean = tf.mean(x)
// console.log(mean.dataSync()[0]);

// std = tf.moments(x).variance.sqrt()
// z = tf.div(tf.sub(x,mean),std)
// z_mask = tf.less(z,1.5)
// const result = tf.booleanMaskAsync(x,z_mask);
// result.then(data => data.print());

// This is the basic Beacon class, which should hold memories of past values. It doesn't do any calculations (yet), it just stores.
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

// Beacon1 = new Beacon("abc");
// Beacon2 = new Beacon("cde");
// Beacon3 = new Beacon("def");
// Beacon4 = new Beacon("ghi");
// Beacon5 = new Beacon("jkl");

// let beaconList = new Array(Beacon1, Beacon2, Beacon3, Beacon4, Beacon5);

// Beacon1.update_memory(10);
// Beacon1.update_memory(12);
// Beacon1.update_memory(123123);

// Beacon2.update_memory(20);
// Beacon2.update_memory(22);
// Beacon2.update_memory(23213213);

// Beacon5.update_memory(30);
// Beacon5.update_memory(32);
// Beacon5.update_memory(3322131);


// CALLING A FUNCTION EVERY 2 SECONDS TO CALCULATE POSITION.
// const interval = setInterval(printSomething = () => {
//   console.log("Being called.");
//   prepData(trilat);
// }, 2000);

// ARCHIVES!

const old_trilat = (time) => {
  if ( (Beacon1.have_memory(time)) && (Beacon2.have_memory(time)) ){
    console.log('ready to trilat.');
    var r1 = Beacon1.get_memory(time); 
    var r2 = Beacon2.get_memory(time);

    var new_x = (r1**2 - r2**2 + u**2) / (2*u)
    console.log("R1: ", r1, "R2: ", r2, "new_x: ", new_x);
    
    var temp = r1**2 - new_x**2;
    if(temp<0){
      temp=0;
    }
    var new_y = (Math.sqrt(temp))

    console.log("Before x: ", new_x);
    console.log("Before y: ", new_y);

    new_x = 182 + (new_x / 0.014758)
    new_y = 710 + (new_y / 0.014758)

    console.log("New x: ", new_x);
    console.log("New y: ", new_y);

    let position = {
      lng:Math.round(new_x),
      lat:Math.round(new_y)
    };

    io.emit('updateData', position);
    // io.on('connection', (socket) => {
    //   console.log('Updating.')
    //   console.log(position)
    //   socket.emit('updateData', position);
    // })  
    
    // app.get('/api', function(req, res){
    // res.json({lat: new_y,
    //           lng: new_x}
    //         )
    // })
  }
}

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
  if (n_beacons >= 3){ // as long as there're more than 3 beacons, let's GO!
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
  // console.log(beacon_data);
  for (var property in beacon_data) {
    console.log(property);
  }
}
