# Leaflet.Geodesic
[![Build Status](https://travis-ci.org/henrythasler/Leaflet.Geodesic.svg?branch=master)](https://travis-ci.org/henrythasler/Leaflet.Geodesic) [![npm](https://img.shields.io/npm/v/leaflet.geodesic)](https://www.npmjs.com/package/leaflet.geodesic) [![Coverage Status](https://coveralls.io/repos/github/henrythasler/Leaflet.Geodesic/badge.svg?branch=master)](https://coveralls.io/github/henrythasler/Leaflet.Geodesic?branch=master) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=henrythasler_Leaflet.Geodesic&metric=alert_status)](https://sonarcloud.io/dashboard?id=henrythasler_Leaflet.Geodesic) [![Total alerts](https://img.shields.io/lgtm/alerts/g/henrythasler/Leaflet.Geodesic.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/henrythasler/Leaflet.Geodesic/alerts/) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/henrythasler/Leaflet.Geodesic.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/henrythasler/Leaflet.Geodesic/context:javascript)

Add-on for [Leaflet](http://leafletjs.com/) to draw [geodesic](http://en.wikipedia.org/wiki/Geodesics_on_an_ellipsoid) lines and circles. A geodesic line is the shortest path between two given positions on the earth surface.

[![demo](docs/img/demo.png)](https://blog.cyclemap.link/Leaflet.Geodesic/basic-interactive.html)

[Live Demos and Tutorials](https://blog.cyclemap.link/Leaflet.Geodesic/)

## Add the plugin to your project

Leaflet.Geodesic is available via CDN. Add the following snippet to your html-file after you have [included leaflet.js](https://leafletjs.com/examples/quick-start/).

```html
<!-- Make sure you put this AFTER leaflet.js -->
<script src="https://cdn.jsdelivr.net/npm/leaflet.geodesic"></script>
```

Leaflet.Geodesic is available from [unpkg](https://unpkg.com/browse/leaflet.geodesic/) and [jsDelivr](https://www.jsdelivr.com/package/npm/leaflet.geodesic).

## Basic usage

- `L.Geodesic` draws geodesic lines between all points of a given line- or multiline-string. 
- `L.GeodesicCircle` draws a circle with a specific radius around a given point.

The Objects can be created as follows:

```JavaScript
const geodesicLine = new L.Geodesic().addTo(map);   // creates a blank geodesic-line-object and adds it to the map
const geodesicCircle = new L.GeodesicCircle().addTo(map);   // creates a blank geodesic-circle-object and adds it to the map
```

Alternative method:

```JavaScript
const geodesicLine = L.geodesic().addTo(map);   // lower-case, w/o new-keyword
const geodesicCircle = L.geodesiccircle().addTo(map);   // lower-case, w/o new-keyword
```

Make sure you add the geodesic-object to the map. It won't display otherwise.

Each constructor is defined as:
```JavaScript
Geodesic(latlngs?: L.LatLngExpression[] | L.LatLngExpression[][], options?: GeodesicOptions)
GeodesicCircle(center?: L.LatLngExpression, options?: GeodesicOptions)
```

## Geodesic Lines

This draws a line. The geometry (points) to use can be given during creation as:

### Objects (Literals)

```JavaScript
const Berlin = {lat: 52.5, lng: 13.35};
const LosAngeles = {lat: 33.82, lng: -118.38};
const geodesic = new L.Geodesic([Berlin, LosAngeles]).addTo(map);
```

### LatLng-Class

```JavaScript
const Berlin = new L.LatLng(52.5, 13.35);
const LosAngeles = new L.LatLng(33.82, -118.38);
const geodesic = new L.Geodesic([Berlin, LosAngeles]).addTo(map);
``` 

### Tuples

```JavaScript
const Berlin = [52.5, 13.35];
const LosAngeles = [33.82, -118.38];
const geodesic = new L.Geodesic([Berlin, LosAngeles]).addTo(map);
```

![line](docs/img/line.png)

### Line-strings

Multiple consecutive points can be given as an array (linestring):

```JavaScript
const places = [
    new L.LatLng(52.5, 13.35), // Berlin
    new L.LatLng(33.82, -118.38), // Los Angeles
    new L.LatLng(-33.44, -70.71), // Santiago
    new L.LatLng(-33.94, 18.39), // Capetown
];
const geodesic = new L.Geodesic(places).addTo(map);
```

![linestring](docs/img/linestring.png)

### Multi-line-strings

Multiple independent linestrings can be defined as a 2-dimensional array of points:

```JavaScript
const places = [
    [   // 1st line
        new L.LatLng(52.5, 13.35), // Berlin
        new L.LatLng(33.82, -118.38), // Los Angeles
    ],
    [   // 2nd line
        new L.LatLng(-33.44, -70.71), // Santiago
        new L.LatLng(-33.94, 18.39), // Capetown
    ]
];
const geodesic = new L.Geodesic(places).addTo(map);
```

![multilinestring](docs/img/multilinestring.png)

### GeoJSON-Support

GeoJSON-data can be used to create geodesic lines with the `fromGeoJson()` method:

```JavaScript
const geojson = {
    "type": "LineString",
    "coordinates": [
        [13.35, 52.5], [-122.33, 47.56], [18.39, -33.94], [116.39, 39.92], [13.35, 52.5]
    ]
};
const geodesic = new L.Geodesic().addTo(map);
geodesic.fromGeoJson(geojson);
```

![geojson](docs/img/geojson.png)

### Updating the geometry

Each Geodesic-Class provides a `setLatLngs()`-Method, that can be used to update the geometry of an existing geodesic-object:

```Javascript
const geodesic = new L.Geodesic().addTo(map);   // add empty object to the map

const Berlin = new L.LatLng(52.5, 13.35);
const LosAngeles = new L.LatLng(33.82, -118.38);
geodesic.setLatLngs([Berlin, LosAngeles])   // update in-place
```

The `setLatLngs()`-Method accepts the same types (Literal, Tuple, LatLang-Class, Linstring, Multilinestring) as the L.Geodesic-constructor itself.

### Line Options
All options defined for [Polyline](http://leafletjs.com/reference.html#polyline) and [Path](https://leafletjs.com/reference.html#path) for can be used Leaflet.Geodesic.

The most important options are:

Option  | Type | Default | Description
---|---|---|---
`color` |	`String` | "#3388ff" | Stroke color
`weight` | `Number` | 3 | Stroke width in pixels
`opacity` | `Number` | 1.0 | Stroke opacity (0=transparent, 1=opaque)
`steps` | `Number` | 3 | Level of detail (vertices = 1+2**(steps+1)) for the geodesic line. More steps result in a smoother line. Range: 0..8

Example:

```Javascript
const Berlin = new L.LatLng(52.5, 13.35);
const LosAngeles = new L.LatLng(33.82, -118.38);
const options = {
    weight: 20,
    opacity: 0.5,
    color: 'red',
};
const geodesic = new L.Geodesic([Berlin, LosAngeles], options).addTo(map);
```

![lineoptions](docs/img/lineoptions.png)

## Geodesic Circles

Circles can be added with another class called `L.GeodesicCircle` as follows:

```Javascript
const Seattle = new L.LatLng(47.56, -122.33);
const geodesiccircle = new L.GeodesicCircle(Seattle, {
    radius: 3000*1000,  // 3000km in meters
}).addTo(map);   
```

![circle](docs/img/circle.png)

Handling of circles crossing the antimeridian (wrapping) is not yet supported.

### Circle Options

Option  | Type | Default | Description
---|---|---|---
`radius` | `Number` | 1000*1000 | Radius in **meters**
`steps` | `Number` | 24 | Number of segments that are used to approximate the circle.
`fill` | `boolean` | true | Draws a filled circle.
`color` |	`String` | "#3388ff" | Stroke color
`weight` | `Number` | 3 | Stroke width in pixels
`opacity` | `Number` | 1.0 | Stroke opacity (0=transparent, 1=opaque)

Please refer to the options for [Polyline](http://leafletjs.com/reference.html#polyline) and [Path](https://leafletjs.com/reference.html#path) for additional settings.

## Statistics

The `L.Geodesic` and `L.GeodesicCircle`-class provide a `statistics`-Object with the following properties:

Property | Type | Description
---|---|---
`totalDistance` |	`Number` | The total distance of all geodesic lines in meters. (Circumfence for `L.GeodesicCircle`)
`distanceArray` | `Number[]` | The distance for each separate linestring in meters
`points` | `Number` | Number of points that were given on creation or with `setLatLngs()`
`vertices` | `Number` | Number of vertices of all geodesic lines that were calculated

## Distance Calculation

The `L.Geodesic` provides a `distance`-function to calculate the precise distance between two points:

```Javascript
const Berlin = new L.LatLng(52.5, 13.35);
const Beijing = new L.LatLng(39.92, 116.39);

const line = new L.Geodesic();
const distance = line.distance(Berlin, Beijing);
console.log(`${Math.floor(distance/1000)} km`) // prints: 7379 km
```

The `L.GeodesicCircle`-class provides a `distanceTo`-function to calculate the distance between the current center and any given point:

```Javascript
const Berlin = new L.LatLng(52.5, 13.35);
const Beijing = new L.LatLng(39.92, 116.39);

const circle = new L.GeodesicCircle(Berlin);
const distance = circle.distanceTo(Beijing);
console.log(`${Math.floor(distance/1000)} km`) // prints: 7379 km
```

## Scientific background

All calculations are based on the [WGS84-Ellipsoid](https://en.wikipedia.org/wiki/World_Geodetic_System#WGS84) (EPSG:4326) using [Vincenty's formulae](https://en.wikipedia.org/wiki/Vincenty%27s_formulae). This method leads to very precise calculations but may fail for some corner-cases (e.g. [Antipodes](https://en.wikipedia.org/wiki/Antipodes)). I use some workarounds to mitigate these convergence errors. This may lead to reduced precision (a.k.a. slightly wrong results) in these cases.  This is good enough for a web mapping application but you shouldn't plan a space mission based on this data. OMG, this section has just become a disclaimer...
