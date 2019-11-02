import L from "leaflet";
import { GeodesicLine } from "./geodesic-line"
import { GeodesicOptions } from "./geodesic-core"

export class GreatCircleClass extends GeodesicLine {

    constructor(latlngs?: L.LatLngExpression[], options?: GeodesicOptions) {
        super(latlngs, options);
    }

    update(latlngs: L.LatLngExpression[]): void {
    }    
}