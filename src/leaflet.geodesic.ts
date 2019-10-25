import L from "leaflet";

interface GeodesicOptions extends L.PolylineOptions {
    wrap: true
}

export class LeafletGeodesic extends L.Polyline {
    protected latlngs: L.LatLngExpression[];

    constructor(options: GeodesicOptions) {
        super([[0, 0] as L.LatLngExpression], options);
        console.log("[ Geodesic ]: constructor()");
        this.latlngs = this.asPolyline();
    }

    asPolyline(): L.LatLngExpression[] {
        console.log("[ Geodesic ]: asPolyline()");
        return [[0, 0] as L.LatLngExpression];
    }
}