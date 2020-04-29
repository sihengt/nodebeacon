const noble = require('@abandonware/noble');
const fs = require('fs');
const beacon1mac = '3ca308ac7f2e';
const beacon2mac = '3ca308ac9b69';
const u = 3.72;

class Beacon {
  constructor(mac){
    this.id = mac;
    this.memory = new Object();
  }
  have_memory(time){
    if(this.memory[time]){
      return true;
    }
    else{
      return false;
    }
  }

  get_memory(time){
    if (this.memory[time]){
      return this.memory[time];
    }
    else {
      return -1;
    }
  }
  update_memory(time, distance){
    // todo: this is not even a proper average man, pls wake up. ok la but you only slept 4 hours so you get free pass.
    if(this.memory[time]){
      var previous_value = this.memory[time];
      var new_value = (distance + previous_value)/2;
      this.memory[time] = new_value;
    }
    else {
      this.memory[time] = distance;
    }
  console.log("Updated memory ", this.memory);
  }
}

Beacon1 = new Beacon("3ca308ac7f2e");
Beacon2 = new Beacon("3ca308ac9b69");

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
  var calculatedDistance = calculateDistance(-66,rssi);
  var current_time = Math.round((new Date()).getTime()/1000);

  if (macAddress == "3ca308ac7f2e"){
    console.log('Beacon 1');
    console.log('Current unix time: ', current_time);
    console.log('found device: ', macAddress,' ',localName,' ',rssi);
    console.log('distance calculated: ', calculatedDistance);    
    Beacon1.update_memory(current_time,calculatedDistance);
    trilat(current_time);
    console.log();
  }

  if (macAddress == "3ca308ac9b69"){
    console.log('Beacon 2');
    console.log('Current unix time: ', current_time);
    console.log('found device: ', macAddress,' ',localName,' ',rssi);
    console.log('distance calculated: ', calculatedDistance); 
    Beacon2.update_memory(current_time, calculatedDistance);
    trilat(current_time);
    console.log();
  }


function trilat(time){
  if ( (Beacon1.have_memory(time)) && (Beacon2.have_memory(time)) ){
    console.log('ready to trilat the fuck out of this shit.');
    var r1 = Beacon1.get_memory(time); 
    var r2 = Beacon2.get_memory(time);

    var new_x = (r1**2 - r2**2 + u**2) / (2*u)
    console.log("R1: ", r1, "R2: ", r2, "new_x: ", new_x);
    
    var temp = r1**2 - new_x**2;
    if(temp<0){
      temp=0;
    }
    var new_y = (Math.sqrt(temp))
    console.log("New x: ", new_x);
    console.log("New y: ", new_y);
    let position = {
      x:new_x,
      y:new_y
    };
    let data = JSON.stringify(position);
    fs.writeFileSync('current_position.json', data);
  }
}

  // console.log(`peripheral discovered (${peripheral.id} with address <${peripheral.address}, ${peripheral.addressType}>, connectable ${peripheral.connectable}, RSSI ${peripheral.rssi}:`);
  // console.log('\thello my local name is:');
  // console.log(`\t\t${peripheral.advertisement.localName}`);
  // console.log('\tcan I interest you in any of the following advertised services:');
  // console.log(`\t\t${JSON.stringify(peripheral.advertisement.serviceUuids)}`);

  // const serviceData = peripheral.advertisement.serviceData;
  // if (serviceData && serviceData.length) {
  //   console.log('\there is my service data:');
  //   for (const i in serviceData) {
  //     console.log(`\t\t${JSON.stringify(serviceData[i].uuid)}: ${JSON.stringify(serviceData[i].data.toString('hex'))}`);
  //   }
  // }
  // if (peripheral.advertisement.manufacturerData) {
  //   console.log('\there is my manufacturer data:');
  //   console.log(`\t\t${JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'))}`);
  // }
  // if (peripheral.advertisement.txPowerLevel !== undefined) {
  //   console.log('\tmy TX power level is:');
  //   console.log(`\t\t${peripheral.advertisement.txPowerLevel}`);
  // }
});

function calculateDistance(txPower,rssi){
  // got from this dude: https://stackoverflow.com/questions/20416218/understanding-ibeacon-distancing
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