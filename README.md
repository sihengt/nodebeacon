## Trilateration

Nodebeacon is a project exploring how simple bluetooth beacons and willpower can attempt to carve out a somewhat acceptable indoor localization system.

This repo consists of two parts:
1. *1_node-beacon-backend*
  - Uses node.js and noble to read BLE beacons and process
  - Currently trilaterates based on Weighted Centroid Localization
  	- Other methods tried = MSE optimization / trilateration, but these are not accurate.
  	- WCL is awesome because as long as all beacons are equally inaccurate, it will be somewhat accurate. + it's computationally cheap.
  - Sends update through socket.io

2. *2_react-leaflet-frontend*
  - Uses react + leaflet
  - Receives updates through socket.io

3. *3_android-beacon-backend*
  - node + socket.io to receive information from an android app instead of the unreliable laptop BT adapter.

4. *4_studies*
  - Some relevant studies + gifs, in no particular order.

![WCL](https://github.com/seeeheng/nodebeacon/blob/master/wcl.gif)
