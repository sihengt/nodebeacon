import React from "react";
import L from 'leaflet';
import { Map, Popup, ImageOverlay} from "react-leaflet";
import { DriftMarker} from "leaflet-drift-marker"
import configFile from "./config/config.json"
import roomPicture from './Assets/maps/room.png'
import livingRoomPicture from './Assets/maps/livingroom.png'
import DICPicture from './Assets/maps/diccroppedmay18.png'
import Beacon from "./Components/Beacon"
import Parsers from "./Components/Parsers"

// Some initializing setup due to bugs in react-leaflet. This allows icons to properly show.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const ENDPOINT = "http://localhost:9000";
const maps = {0:livingRoomPicture, 1:roomPicture, 2:DICPicture}
const beaconNames = Parsers.parseBeaconNumbers(configFile);
const beaconCenters = Parsers.parseBeaconCenters(configFile);
const mapBounds = Parsers.parseMapBounds(configFile);
const mapCenters = Parsers.parseMapCenters(configFile);

class HomeMap extends React.Component {
  constructor(props){
    super(props);
    this.socket = null;
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
    this.socket = new WebSocket("ws://localhost:9000");
    this.socket.onopen = () => {
      this.socket.send("test"); //Will work here!
      this.socket.send("hello!");
    }
    this.socket.onmessage = (message_in) => {
      console.log(message_in);
      try {
        let obj = JSON.parse(message_in.data);
        this.setState(obj);  
      } catch(err) { console.log("Not a json: ", message_in.data)}
    }
  }

  componentWillUnmount(){
    this.socket.close();
  }

  onChangeValue = (event) => {
    this.setState({
      location: event.target.value,
    });
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
            zoom={this.state.zoom}
            zoomDelta={0.25}
            zoomSnap={0}
            minZoom={-2}
            crs={L.CRS.Simple}>
            <ImageOverlay
              url={filepath}
              bounds={bounds}
            />
            <DriftMarker
                // if position changes, marker will drift its way to new position
                position={position}
                duration={1000}>
                <Popup> You are here. </Popup>
            </DriftMarker>
            <Beacon center={this.state.beacon_center[1][this.state.location]} radius={beaconRadius} name={this.state.beacon_name[1][this.state.location]}/>
          </Map>
        </div>
      </div>
    )
  }
}

export default HomeMap