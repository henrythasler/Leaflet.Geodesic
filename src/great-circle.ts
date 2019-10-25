import L from "leaflet";
import { GeodesicOptions } from "./geodesic-algorithms"

export class GreatCircleClass extends L.Layer {
    readonly polygon: L.Polygon;
    readonly options: GeodesicOptions = {};

    constructor(latlngs: L.LatLngExpression[] | L.LatLngExpression[][], options?: GeodesicOptions) {
        super();
        this.options = { ...this.options, ...options };
        this.polygon = L.polygon(latlngs, this.options);
    }

    onAdd(map: L.Map): this {
        this.polygon.addTo(map);
        return this;
    }

    onRemove(): this {
        this.polygon.remove();
        return this;
    }

    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this {
        this.polygon.setLatLngs(latlngs);
        return this;
    }

    asPolyline(): L.LatLngExpression[] {
        console.log("[ Geodesic ]: asPolyline()");
        return [[0, 0] as L.LatLngExpression];
    }
}