var L = require('leaflet');

var beaconOptions = {
   color: 'salmon',
   fillColor: 'salmon',
   fillOpacity: 40
}
var beacon1Center = L.latLng([710,182]);
var beacon2Center = L.latLng([710,434])

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
