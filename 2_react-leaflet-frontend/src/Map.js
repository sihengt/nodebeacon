import React from "react";
import { Map, Marker, Circle, Popup, Tooltip, ImageOverlay} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import roomPicture from './room.jpg'
import socketIOClient from "socket.io-client";

delete L.Icon.Default.prototype._getIconUrl;

const ENDPOINT = "http://127.0.0.1:9000";


L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

class HomeMap extends React.Component {
  // use a hook instead to receive the response.
  constructor(props){
    super(props);
    this.state = {
      error:null,
      isLoaded: false,
      lat: 364, // these coordinates are center of the room. 
      lng: 227,
      zoom: -5,
    };
  }

  componentDidMount(){
    console.log("About to fetch.")
    const socket = socketIOClient(ENDPOINT)
    socket.on("updateData", data => {
      console.log(data);
      this.setState({
        isLoaded: true,
        lat: data.lat,
        lng: data.lng,
      });
    });
  }

  componentWillUnmount(){
    const socket = socketIOClient(ENDPOINT)
    socket.close();
  }

  render() {
    const center = L.latLng([364, 227])
    const position = [this.state.lat, this.state.lng]
    const filepath = roomPicture;
    const corner1 = L.latLng([0,0])
    const corner2 = L.latLng([728,454])
    const bounds = L.latLngBounds(corner2,corner1)

    // SETTING UP BEACONS.
    const beaconRadius = 4;
    const beacon1Center = L.latLng([710,182]);
    const beacon2Center = L.latLng([710,434]);

    return (
      <Map center={center} zoom={this.state.zoom} crs={L.CRS.Simple}>
        <ImageOverlay
          url={filepath}
          bounds={bounds}
        />
        <Marker position={position}>
          <Popup>
            You are here. <br />
          </Popup>
        </Marker>

        <Circle
          center={beacon1Center} 
          radius={beaconRadius}>
          <Tooltip 
            direction="right" 
            permanent>
            BEACON 1 (7f2e)
          </Tooltip>
        </Circle>
        <Circle
          center={beacon2Center}
          radius={beaconRadius}>
          <Tooltip 
            direction="right" 
            permanent>
            BEACON 2 (9b69)
          </Tooltip>
        </Circle>
        
      </Map>
    )
  }
}

export default HomeMap