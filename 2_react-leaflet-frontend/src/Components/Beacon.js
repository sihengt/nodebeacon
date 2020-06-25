import React from 'react'
import {Circle, Tooltip} from 'react-leaflet'
const Beacon  = (props) => {
    return (
      <Circle
        center={props.center}
        radius={props.radius}>
        <Tooltip direction='right'>{props.name}</Tooltip>
      </Circle>
    );
}

export default Beacon;