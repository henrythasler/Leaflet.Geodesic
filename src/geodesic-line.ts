import L from "leaflet";
import { GeodesicOptions } from "./geodesic-core"
import { GeodesicGeometry } from "./geodesic-geom";
import { latlngExpressionArraytoLiteralArray } from "../src/types-helper";

export class GeodesicLine extends L.Layer {
    readonly polyline: L.Polyline;
    readonly options: GeodesicOptions = {};
    private geom = new GeodesicGeometry();

    constructor(latlngs: L.LatLngExpression[] | L.LatLngExpression[][], options?: GeodesicOptions) {
        super();
        this.options = { ...this.options, ...options };
        this.polyline = L.polyline(this.geom.multilinestring(latlngExpressionArraytoLiteralArray(latlngs)), this.options);
    }

    onAdd(map: L.Map): this {
        this.polyline.addTo(map);
        return this;
    }

    onRemove(): this {
        this.polyline.remove();
        return this;
    }

    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this {
        this.polyline.setLatLngs(this.geom.multilinestring(latlngExpressionArraytoLiteralArray(latlngs)));
        return this;
    }
}