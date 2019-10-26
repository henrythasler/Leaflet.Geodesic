import L from "leaflet";
import { GeodesicOptions } from "./geodesic-core";
export declare class GreatCircleClass extends L.Layer {
    readonly polygon: L.Polygon;
    readonly options: GeodesicOptions;
    constructor(latlngs: L.LatLngExpression[] | L.LatLngExpression[][], options?: GeodesicOptions);
    onAdd(map: L.Map): this;
    onRemove(): this;
    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this;
    asPolyline(): L.LatLngExpression[];
}
