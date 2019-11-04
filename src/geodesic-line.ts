import L from "leaflet";
import { GeodesicOptions } from "./geodesic-core"
import { GeodesicGeometry } from "./geodesic-geom";
import { latlngExpressionArraytoLiteralArray } from "../src/types-helper";

export class GeodesicLine extends L.Layer {
    readonly polyline: L.Polyline;
    readonly options: GeodesicOptions = { split: true, steps: 3 };
    private geom: GeodesicGeometry;

    constructor(latlngs?: L.LatLngExpression[] | L.LatLngExpression[][], options?: GeodesicOptions) {
        super();
        this.options = { ...this.options, ...options };

        // allow "wrap" for compatibility-reasons with the (old) javascript-implementation. Is mapped to "split".
        if ("wrap" in this.options) {
            this.options.split = this.options.wrap;
            delete this.options.wrap;
        }

        this.geom = new GeodesicGeometry(this.options);

        if (latlngs) {
            const geodesic = this.geom.multiLineString(latlngExpressionArraytoLiteralArray(latlngs));
            if (this.options.split) {
                const split = this.geom.splitMultiLineString(geodesic);
                this.polyline = new L.Polyline(split, this.options);
            }
            else {
                this.polyline = new L.Polyline(geodesic, this.options);
            }
        }
        else {
            this.polyline = new L.Polyline([], this.options);
        }
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
        const geodesic = this.geom.multiLineString(latlngExpressionArraytoLiteralArray(latlngs));
        if (this.options.split) {
            const split = this.geom.splitMultiLineString(geodesic);
            this.polyline.setLatLngs(split);
        }
        else {
            this.polyline.setLatLngs(geodesic);
        }
    }

    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this {
        this.update(latlngs);
        return this;
    }

    getLatLngs(): L.LatLng[] | L.LatLng[][] | L.LatLng[][][] {
        return this.polyline.getLatLngs();
    }

}