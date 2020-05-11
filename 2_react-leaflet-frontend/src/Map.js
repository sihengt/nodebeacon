import React from "react";
import { Map, Marker, Circle, Popup, Tooltip, ImageOverlay} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import roomPicture from './config/maps/room.png'
import livingRoomPicture from './config/maps/livingroom.png'
import DICPicture from './config/maps/dicpart1.jpg'
import socketIOClient from "socket.io-client";
import configFile from "./config/config.json"

// Some initializing setup due to bugs in react-leaflet. This allows icons to properly show.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// Some startup constants
const ENDPOINT = "http://127.0.0.1:9000";

// Initializing function to add more beacons.
const Beacon  = (props) => {
  return (
    <Circle
      center={props.center}
      radius={props.radius}>
      <Tooltip direction='right' permanent>{props.name}</Tooltip>
    </Circle>
  );
}

let maps = new Object({0:livingRoomPicture, 1:roomPicture, 2:DICPicture})

// TODO: Move this into mounting.
const parseBeaconNumbers = (configFile) => {
  console.log("Now parsing beacon names from config file.")
  let beaconNames = new Object();
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

const parseBeaconCenters = (configFile) => {
  console.log("Now parsing beacon locations from config file.")
  let beaconCenters = new Object();
  for (var roomNumber in configFile) {
    for (var property in configFile[roomNumber]){
      if (property.startsWith("beacon")){
        let beacon_number = property.slice(property.length-1); // getting the beacon number from the config file.
        if (typeof beaconCenters[beacon_number] == 'undefined'){ // reading config file, checking if beacon array exists. If doesn't, initialize.
          beaconCenters[beacon_number] = [];
        }
        let beacon_x = configFile[roomNumber][property]["x_px"];
        let beacon_y = configFile[roomNumber][property]["y_px"];
        beaconCenters[beacon_number].push([beacon_y,beacon_x])
      }
    }
  }
  return beaconCenters;
}

const parseMapBounds = (configFile) => {
  console.log("Now parsing beacon locations from config file.")
  let mapBounds = new Object();
  for (var roomNumber in configFile) {
    let x_max_px = configFile[roomNumber]["map"]["x_max_px"];
    let y_max_px = configFile[roomNumber]["map"]["y_max_px"];
    mapBounds[roomNumber] = [y_max_px, x_max_px];
  }
  return mapBounds;
}

const parseMapCenters = (configFile) => {
  console.log("Now parsing beacon locations from config file.")
  let mapCenters = new Object();
  for (var roomNumber in configFile) {
    let x_max_px = configFile[roomNumber]["map"]["x_max_px"];
    let y_max_px = configFile[roomNumber]["map"]["y_max_px"];
    mapCenters[roomNumber] = [y_max_px/2, x_max_px/2];
  }
  return mapCenters;
}

const beaconNames = parseBeaconNumbers(configFile);
const beaconCenters = parseBeaconCenters(configFile);
const mapBounds = parseMapBounds(configFile);
const mapCenters = parseMapCenters(configFile);

console.log(mapBounds)
console.log(mapCenters)

class HomeMap extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      lat: 0, // these coordinates are center of the room. 
      lng: 0,
      zoom: -0.5,
      location:2,
      beacon_name: beaconNames,
      beacon_center: beaconCenters,
      map_bounds: mapBounds,
      map_centers: mapCenters,
      maps: maps
    };
  }

  componentDidMount(){
    console.log("About to fetch.")
    // const socket = socketIOClient(ENDPOINT)
    // socket.on("updateData", data => {
    //   console.log(data);
    //   this.setState({
    //     lat: data.lat,
    //     lng: data.lng,
    //   });
    // });
  }

  componentWillUnmount(){
    const socket = socketIOClient(ENDPOINT)
    socket.close();
  }

  onChangeValue = (event) => {
    // var isTrue = (event.target.value === 'true');
    this.setState({
      location: event.target.value,
    });
    console.log(this.state)
  }

  render() {
    const position = [this.state.lat, this.state.lng]
    const filepath = this.state.maps[this.state.location];
    
    const corner1 = L.latLng([0,0]);
    const corner2 = this.state.map_bounds[this.state.location];
    const bounds = L.latLngBounds(corner2,corner1)
    const center = this.state.map_centers[this.state.location];
    // SETTING UP BEACONS.
    const beaconRadius = 4;

    return (
      <div className="UI">
        <div onChange={this.onChangeValue} className="buttoncontainer">
          <label className="buttons">
            <input type="radio" value={0} name="where" /> Living Room
            <input type="radio" value={1} name="where" /> Room
            <input type="radio" value={2} name="where" defaultChecked={true}/> DIC            
          </label>
        </div>        
        <div className="map">
          <Map 
            center={center} 
            scrollWheelZoom={false}
            doubleClickZoom={false} 
            zoom={this.state.zoom}
            minZoom={-2}
            zoomSnap={0.125}
            crs={L.CRS.Simple}>
            
            <ImageOverlay
              url={filepath}
              bounds={bounds}
            />

            <Marker position={position}>
              <Popup>
                You are here. <br />
              </Popup>
            </Marker>

            <Beacon center={this.state.beacon_center[1][this.state.location]} radius={beaconRadius} name={this.state.beacon_name[1][this.state.location]}/>
            <Beacon center={this.state.beacon_center[2][this.state.location]} radius={beaconRadius} name={this.state.beacon_name[2][this.state.location]}/>
            <Beacon center={this.state.beacon_center[3][this.state.location]} radius={beaconRadius} name={this.state.beacon_name[3][this.state.location]}/>
            <Beacon center={this.state.beacon_center[4][this.state.location]} radius={beaconRadius} name={this.state.beacon_name[4][this.state.location]}/>
         
          </Map>
        </div>
      </div>
    )
  }
}

export default HomeMap