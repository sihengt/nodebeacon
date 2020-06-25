// Helper functions to read the parsers provided

const parseBeaconCenters = (configFile) => {
    console.log("Now parsing beacon locations from config file.")
    let beaconCenters = {};
    for (var roomNumber in configFile) {
        for (var property in configFile[roomNumber]) {
            if (property.startsWith("beacon")) {
                let beacon_number = property.slice(property.length - 1); // getting the beacon number from the config file.
                if (typeof beaconCenters[beacon_number] == 'undefined') { // reading config file, checking if beacon array exists. If doesn't, initialize.
                    beaconCenters[beacon_number] = [];
                }
                let beacon_x = configFile[roomNumber][property]["x_px"];
                let beacon_y = configFile[roomNumber][property]["y_px"];
                beaconCenters[beacon_number].push([beacon_y, beacon_x])
            }
        }
    }
    return beaconCenters;
}

const parseMapBounds = (configFile) => {
    console.log("Now parsing beacon locations from config file.")
    let mapBounds = {};
    for (var roomNumber in configFile) {
        let x_max_px = configFile[roomNumber]["map"]["x_max_px"];
        let y_max_px = configFile[roomNumber]["map"]["y_max_px"];
        mapBounds[roomNumber] = [y_max_px, x_max_px];
    }
    return mapBounds;
}

const parseMapCenters = (configFile) => {
    console.log("Now parsing beacon locations from config file.")
    let mapCenters = {};
    for (var roomNumber in configFile) {
        let x_max_px = configFile[roomNumber]["map"]["x_max_px"];
        let y_max_px = configFile[roomNumber]["map"]["y_max_px"];
        mapCenters[roomNumber] = [y_max_px / 2, x_max_px / 2];
    }
    return mapCenters;
}

const parseBeaconNumbers = (configFile) => {
    console.log("Now parsing beacon names from config file.")
    let beaconNames = {};
    for (var roomNumber in configFile) {
      for (var property in configFile[roomNumber]){
        if (property.startsWith("beacon")){
          let beacon_number = property.slice(property.length-1); // getting the beacon number from the config file.
          if (typeof beaconNames[beacon_number] == 'undefined'){ // reading config file, checking if beacon array exists. If doesn't, initialize.
            beaconNames[beacon_number] = [];
          }
          let beacon_name = configFile[roomNumber][property]["mac"];
          beacon_name = beacon_name.slice(beacon_name.length-4); // keeping only last 4 letters
          beacon_name = "BEACON " + beacon_number + " (" + beacon_name + ")"
          beaconNames[beacon_number].push(beacon_name)
        }
      }
    }
    return beaconNames;
  }
export default {parseBeaconCenters, parseMapBounds, parseMapCenters, parseBeaconNumbers}