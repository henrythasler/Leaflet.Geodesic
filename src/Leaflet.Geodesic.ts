import { Polyline, PolylineOptions, LatLngTuple, LatLngExpression } from "leaflet";

namespace L {
    interface GeodesicOptions extends PolylineOptions {
        wrap: true
    }

    export class Geodesic extends Polyline {
        protected latlngs: LatLngExpression[];

        constructor(options: GeodesicOptions) {
            super([[0, 0] as LatLngExpression], options);
            this.latlngs = this.polyline();
        }

        polyline(): LatLngExpression[] {
            return [[0, 0] as LatLngExpression];
        }
    }
}