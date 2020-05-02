import React from "react";
import { Map, Marker, Circle, Popup, Tooltip, ImageOverlay} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

type State = {
  lat: number,
  lng: number,
  zoom: number,
};

class HomeMap extends React.Component<{}, State>{
  state = {
    lat: 364,
    lng: 227,
    zoom: -5,
  }

  render() {
    const position = [this.state.lat, this.state.lng]
    const filepath = "https://raw.githubusercontent.com/seeeheng/nodebeacon/master/room.jpg"
    const corner1 = L.latLng([0,0])
    const corner2 = L.latLng([728,454])
    const bounds = L.latLngBounds(corner2,corner1)

    // SETTING UP BEACONS.
    const beaconRadius = 4;
    const beacon1Center = L.latLng([710,182]);
    const beacon2Center = L.latLng([710,434]);
    return (
      <Map center={position} zoom={this.state.zoom} crs={L.CRS.Simple}>
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