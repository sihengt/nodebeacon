var L = require('leaflet');
const fs = require('fs');

var beaconOptions = {
   color: 'salmon',
   fillColor: 'salmon',
   fillOpacity: 40
}
var beacon1Center = L.latLng([710,182]);
var beacon2Center = L.latLng([710,434]);

var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -5
});

var bounds = [[0,0], [728,454]];
var image = L.imageOverlay('room.jpg', bounds).addTo(map);

var beacon_circle1 = L.circle(beacon1Center, 4, beaconOptions).bindTooltip("BEACON 1 (7f2e)",{
	permanent: true,
	direction: 'right'
});
var beacon_circle2 = L.circle(beacon2Center, 4, beaconOptions).bindTooltip("BEACON 2 (9b69)",{
	permanent: true,
	direction: 'right'
});;
beacon_circle1.addTo(map);
beacon_circle2.addTo(map);

map.fitBounds(bounds);

// function loadDoc() {
//   var xhttp = new XMLHttpRequest();
//   xhttp.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//      console.log(this.response);
//     }
//   };
//   xhttp.open("GET", "current_position.json", true);
//   xhttp.send();
// }

// setInterval(loadDoc,5000);

function doStuff() {
  console.log("stuff");
  // beacon1Center = L.latlng([200,182]);
}
setInterval(doStuff,1000);