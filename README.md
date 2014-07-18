Leaflet.Geodesic
================

Add-on for [Leaflet](http://leafletjs.com/) to draw [geodesic](http://en.wikipedia.org/wiki/Geodesics_on_an_ellipsoid) lines and great circles. A geodesic line is the shortest path between two given positions on the earth surface.

[<img src="http://www.thasler.org/leaflet.geodesic/example/interactive.png" alt="Leaflet.Draw Screenshot" />](http://www.thasler.org/leaflet.geodesic/example/interactive.html)

It is based on [geodesy](https://github.com/chrisveness/geodesy) by Chris Veness that gives extremely precise results.


Live-Demo
---------
- [Static Demo](http://www.thasler.org/leaflet.geodesic/example/simple.html)
- [Interactive Demo](http://www.thasler.org/leaflet.geodesic/example/interactive.html)
- [Great Circle Demo](http://www.thasler.org/leaflet.geodesic/example/circle.html)

Usage
-----
Leaflet.Geodesic can be used similar to Leaflet's [MultiPolyline](http://leafletjs.com/reference.html#multipolyline). 

Geodesic has the following additional options:
* steps - defines how many intermediate points are generated along the path. More steps mean a smoother path.

This code creates an empty Geodesic object:
```JavaScript
var Geodesic = L.geodesic([], {
	weight: 7, 
	opacity: 0.5,
	color: 'blue',
	steps: 50
}).addTo(map);
```

To actually draw a line, we need to create and set the coordinates of our geodesic line:
```JavaScript
var berlin = new L.LatLng(52.5, 13.35); 
var losangeles = new L.LatLng(33.82, -118.38);

Geodesic.setLatLngs([[berlin, losangeles]]);
```

a geodesic line can have more than two positions:
```JavaScript
var berlin = new L.LatLng(52.5, 13.35); 
var losangeles = new L.LatLng(33.82, -118.38);
var capetown = new L.LatLng(-33.91, 18.41);

Geodesic.setLatLngs([[berlin, losangeles, capetown]]);
```

you can also draw independent lines within one geodesic object:
```JavaScript
var berlin = new L.LatLng(52.5, 13.35); 
var losangeles = new L.LatLng(33.82, -118.38);
var capetown = new L.LatLng(-33.91, 18.41);
var sydney = new L.LatLng(-33.91, 151.08);

Geodesic.setLatLngs([[berlin, losangeles], [capetown, sydney]]);
```

Please refer to the provided examples for additional information on how to use geodesic lines.

License
-------
GPL V3

