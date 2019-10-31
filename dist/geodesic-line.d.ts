import L from "leaflet";
import { GeodesicOptions } from "./geodesic-core";
export declare class GeodesicLine extends L.Layer {
    readonly polyline: L.Polyline;
    readonly options: GeodesicOptions;
    private geom;
    constructor(latlngs: L.LatLngExpression[] | L.LatLngExpression[][], options?: GeodesicOptions);
    onAdd(map: L.Map): this;
    onRemove(): this;
    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this;
}
