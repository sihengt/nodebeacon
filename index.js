const noble = require('@abandonware/noble');
const ghostyu = 'E2C56DB5DFFB48D2B060D0F5A71096E0';

class Beacon {
  constructor(mac){
    this.id = mac;
    this.memory = new Object();
  }
  update_memory(time, distance){
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
    console.log();
    Beacon1.update_memory(current_time,calculatedDistance);
  }

  if (macAddress == "3ca308ac9b69"){
    console.log('Beacon 2');
    console.log('Current unix time: ', current_time);
    console.log('found device: ', macAddress,' ',localName,' ',rssi);
    console.log('distance calculated: ', calculatedDistance); 
    console.log();
    Beacon2.update_memory(current_time, calculatedDistance);
  }


function updateDistance(storage,current_time,distance){
  if(storage[current_time]){
    previous_value = storage[current_time];
    new_value = (distance + previous_value)/2;
    storage[current_time] = new_value;
  }
  else{
    storage[current_time]=distance;
  }
  return storage
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

