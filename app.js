var L = require('leaflet');

var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -5
});

var bounds = [[0,0], [728,454]];
var image = L.imageOverlay('room.jpg', bounds).addTo(map);
var beacon_1 = L.latLng([710,182]);
var beacon_2 = L.latLng([710,434]);
L.marker(beacon_1).addTo(map);
L.marker(beacon_2).addTo(map);

map.fitBounds(bounds);
