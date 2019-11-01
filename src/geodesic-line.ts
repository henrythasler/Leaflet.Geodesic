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
        this.polyline = L.polyline(this.geom.multiLineString(latlngExpressionArraytoLiteralArray(latlngs)), this.options);
    }

    onAdd(map: L.Map): this {
        this.polyline.addTo(map);
        return this;
    }

    onRemove(): this {
        this.polyline.remove();
        return this;
    }

    update(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): void {
        let geodesic = this.geom.multiLineString(latlngExpressionArraytoLiteralArray(latlngs));
        this.polyline.setLatLngs(this.geom.splitMultiLineString(geodesic));
    }

    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this {
        this.update(latlngs);
        return this;
    }

    getLatLngs(): L.LatLng[] | L.LatLng[][] | L.LatLng[][][] {
        return this.polyline.getLatLngs();
    }

}