## nodebeacon

Nodebeacon is a project exploring how simple bluetooth beacons and willpower can attempt to carve out a somewhat acceptable indoor localization system.

This repo consists of two parts:
1. *1_node-beacon-backend*
  - Uses node.js and noble to read BLE beacons and process
  - Currently trilaterates based on the most rudimentary equation on Wikipedia. (https://en.wikipedia.org/wiki/True_range_multilateration)
  - Sends update through socket.io

2. *2_react-leaflet-frontend*
  - Uses react + leaflet
  - Receives updates through socket.io

![super rudimentary implementation](https://github.com/seeeheng/nodebeacon/blob/master/rudimentary-implementation.gif)
*First try, mercy please.*
