# Testing branch
Leaflet 1.0 has introduced [incompatible changes](https://github.com/Leaflet/Leaflet/blob/master/CHANGELOG.md) with Leaflet.Geodesic. Namely the MultiPolyline class has been removed. This means Leaflet.Geodesic has to be changed in some parts.

This branch has been created to adapt Leaflet.Geodesic to Leaflet 1.0+.

# Leaflet.Geodesic

Add-on for [Leaflet](http://leafletjs.com/) to draw [geodesic](http://en.wikipedia.org/wiki/Geodesics_on_an_ellipsoid) lines and great circles. A geodesic line is the shortest path between two given positions on the earth surface. Wrapping at lng=180° is handled correctly.

[<img src="https://github.com/henrythasler/Leaflet.Geodesic/blob/master/example/interactive.png" alt="Leaflet.Geodesic Screenshot" />](http://www.thasler.com/leaflet.geodesic/example/interactive.html)

It is based on [geodesy](https://github.com/chrisveness/geodesy) by Chris Veness that gives extremely precise results.


## Live-Demo
- [Static Demo](http://www.thasler.com/leaflet.geodesic/example/simple.html)
- [Interactive Demo](http://www.thasler.com/leaflet.geodesic/example/interactive.html)
- [Interactive Demo (noWrap)](http://www.thasler.com/leaflet.geodesic/example/interactive-noWrap.html)
- [Great Circle Demo](http://www.thasler.com/leaflet.geodesic/example/circle.html)
- [geoJSON Demo (static)](http://www.thasler.com/leaflet.geodesic/example/geojson.html)

## Usage
Leaflet.Geodesic can be used similar to Leaflet's [Polyline](http://leafletjs.com/reference.html#polyline). 

### Important note for Leaflet v1.0.0+
Please look at the branch [Testing1.0](https://github.com/henrythasler/Leaflet.Geodesic/tree/testing1.0) to use Leaflet.Geodesic with Leaflet v1.0.0+. The master branch can only be used with Leaflet before v1.0.0.

### Creation
```JavaScript
L.geodesic( <LatLng[][]> latlngs, <Geodesic options> options? )
```

### Options
Geodesic has the following options:

Option  | Type | Default | Description
-------------: | ------------- | ------------- | :-------------
`steps`  | `Number` | `10` | Defines how many intermediate points are generated along the path. More steps mean a smoother path.
`color`  | `String` | `blue` | Stroke color.
`wrap`  | `Boolean` | `true` | Wrap line at map border (date line). Set to 'false' if you want lines to cross the dateline (experimental, see noWrap-example on how to use)

All options of Leaflet's [Polyline](http://leafletjs.com/reference.html#polyline) can be used as well.

### Tutorial
You need to add the plugin in your html file **after** the leaflet file

```html
<script src="leaflet.js"></script>
<script src="Leaflet.Geodesic.js"></script>
```


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

A geodesic line can have more than two Points:
```JavaScript
var berlin = new L.LatLng(52.5, 13.35); 
var losangeles = new L.LatLng(33.82, -118.38);
var capetown = new L.LatLng(-33.91, 18.41);

Geodesic.setLatLngs([[berlin, losangeles, capetown]]);
```

You can also draw independent lines within one geodesic object:
```JavaScript
var berlin = new L.LatLng(52.5, 13.35); 
var losangeles = new L.LatLng(33.82, -118.38);
var capetown = new L.LatLng(-33.91, 18.41);
var sydney = new L.LatLng(-33.91, 151.08);

Geodesic.setLatLngs([[berlin, losangeles], [capetown, sydney]]);
```

### Create geodesic objects from geoJSON:
contributed by [prodrigestivill](https://github.com/prodrigestivill).
To control its behavior it has been added 3 properties per each GeoJSON features:

Option  | Type | Default | Description
-------------: | ------------- | ------------- | :-------------
`geodesic`  | `boolean` | `false` | To specify which are geodesic lines or not (default is false). So if disabled will use the original code from Leaflet.
`geodesic_steps`  | `number` | `10` | To specify the steps to use (same as steps option in the plugin).
`geodesic_wrap`  | `boolean` | `true` | To specify the steps to use (same as wrap option in the plugin).
```JavaScript
var geojson = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "geodesic": "true",
        "geodesic_steps": 50,
        "geodesic_wrap": "true"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-69.9609375, 29.22889003019423],
          [26.71875, 65.6582745198266],
          [99.49218749999999, -12.211180191503985]
        ]
      }
    }
  ]
};

var layer_geojson = L.geoJson(geojson).addTo(map);
```

Please refer to the provided examples for additional information on how to use geodesic lines.

## FAQ
#####Q: How can I use a custom icon with leaflet?
A: http://jsfiddle.net/h1r3yagb/

#####Q: I want to draw only part (eg. halfway) of a geodesic line between two places? 
A: http://jsfiddle.net/h1r3yagb/2

## License
GPL V3

