import React from "react";
import { Map, Marker, Circle, Popup, Tooltip, ImageOverlay} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import roomPicture from './room.png'
import livingRoomPicture from './livingroom.png'
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:9000";

// Some initializing setup due to bugs in react-leaflet. This allows icons to properly show.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// Initializing function to add more beacons.
function Beacon(props){
  return (
    <Circle
      center={props.center}
      radius={props.radius}>
      <Tooltip direction='right' permanent>{props.name}</Tooltip>
    </Circle>
  );
}

class HomeMap extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      lat: 364, // these coordinates are center of the room. 
      lng: 227,
      zoom: -5,
      yourRoom:true
    };
  }

  componentDidMount(){
    console.log("About to fetch.")
    const socket = socketIOClient(ENDPOINT)
    socket.on("updateData", data => {
      console.log(data);
      this.setState({
        lat: data.lat,
        lng: data.lng,
        // yourRoom: data.yourRoom
      });
    });
  }

  componentWillUnmount(){
    const socket = socketIOClient(ENDPOINT)
    socket.close();
  }

  onChangeValue = (event) => {
    var isTrue = (event.target.value === 'true');
    this.setState({
      yourRoom: isTrue,
    });
    console.log(this.state)
  }

  render() {
    const center = this.state.yourRoom? L.latLng([364, 227]) : L.latLng([303, 160.5])
    const position = [this.state.lat, this.state.lng]
    const filepath = this.state.yourRoom ? roomPicture : livingRoomPicture;
    
    const corner1 = L.latLng([0,0])
    const corner2 = this.state.yourRoom ? L.latLng([728,454]) : L.latLng([606,321])
    const bounds = L.latLngBounds(corner2,corner1)

    // SETTING UP BEACONS.
    const beaconRadius = 4;
    const beacon1Center = this.state.yourRoom ? L.latLng([710,272]) : L.latLng([23.5,300]);
    const beacon2Center = this.state.yourRoom ? L.latLng([710,20]) : L.latLng([236,21]);
    const beacon3Center = this.state.yourRoom ? L.latLng([522.7,111.4]) : L.latLng([373.8,189]);
    const beacon4Center = this.state.yourRoom ? L.latLng([511,229]) : L.latLng([0,0]);
    const beacon1Name = this.state.yourRoom ? "BEACON 1 (7f2e)" : "BEACON 1 (7f69)"
    const beacon2Name = this.state.yourRoom ? "BEACON 2 (9b69)" : "BEACON 2 (9f0f)"
    const beacon3Name = this.state.yourRoom ? "BEACON 3 (ecb3)" : "BEACON 3 (15f0)"
    const beacon4Name = this.state.yourRoom ? "BEACON 4 (9f0f)" : "BEACON 4 (????)"

    return (
      <div className="UI">
        <div onChange={this.onChangeValue} className="buttoncontainer">
          <label className="buttons">
            <input type="radio" value={false} name="where" /> Living Room
            <input type="radio" value={true} name="where" defaultChecked={true}/> Room
          </label>
        </div>        
        <div className="map">
          <Map 
            center={center} 
            scrollWheelZoom={false}
            doubleClickZoom={false} 
            zoom={this.state.zoom} 
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

            <Beacon center={beacon1Center} radius={beaconRadius} name={beacon1Name}/>
            <Beacon center={beacon2Center} radius={beaconRadius} name={beacon2Name}/>
            <Beacon center={beacon3Center} radius={beaconRadius} name={beacon3Name}/>
            <Beacon center={beacon4Center} radius={beaconRadius} name={beacon4Name}/>
         
          </Map>
        </div>
      </div>
    )
  }
}

export default HomeMap