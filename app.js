var L = require('leaflet');

var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -5
});

var bounds = [[0,0], [1600,739]];
var image = L.imageOverlay('room.jpg', bounds).addTo(map);
map.fitBounds(bounds);
