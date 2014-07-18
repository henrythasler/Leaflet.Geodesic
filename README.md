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
```
var Geodesic = L.geodesic([], {
	weight: 7, 
	opacity: 0.5,
	color: 'blue',
	steps: 50
}).addTo(map);
```

Geodesic has the following additional options:
* steps - defines how many intermediate points are generated along the path. More steps mean a smoother path.


License
-------
GPL V3

