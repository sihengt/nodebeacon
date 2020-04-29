const noble = require('@abandonware/noble');
const ghostyu = 'E2C56DB5DFFB48D2B060D0F5A71096E0';


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
  if (macAddress == "3ca308ac7f2e" | macAddress =="3ca308ac9b69"){
    console.log('found device: ', macAddress,' ',localName,' ',rssi);
    console.log('distance calculated: ', calculatedDistance);    
    console.log();
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

