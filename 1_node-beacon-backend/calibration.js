const noble = require('@abandonware/noble');
const fs = require('fs');
let filePath = "./beacon3m.txt"

const logData = (rssi, filePath) => {
  let data = rssi.toString() + "\n";
  fs.appendFile(filePath, data, (err) => {
    if (err) throw err;
  });
}

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
  console.log('found device: ', macAddress,' ',localName, ' ',rssi);

  // if (macAddress == "94e36d6215f0"){
    // console.log('Beacon 1');
    console.log('found device: ', macAddress,' ',rssi);
    // console.log('Calculated distance: ', calculateDistance(-66,rssi))
    // logData(rssi, filePath);
  }

  //-52.013
});


    // let data = rssi.toString() + "\n"
    // fs.appendFile(filePath,data,(err) => {
    //  if (err) throw err;
    //  console.log('Appended to file.');
    // });
// const calculateDistance = (rssi, measuredPower, envConst) => {
//   let calculated = (-rssi - measuredPower)/(10*envConst)
//   return Math.pow(10,calculated)
// }

const calculateDistance = (txPower,rssi) => {
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
