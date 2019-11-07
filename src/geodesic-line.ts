import L from "leaflet";
import * as geojson from "geojson";
import { GeodesicOptions } from "./geodesic-core"
import { GeodesicGeometry } from "./geodesic-geom";
import { latlngExpressionArraytoLiteralArray } from "../src/types-helper";

export class GeodesicLine extends L.Layer {
    polyline: L.Polyline;
    options: GeodesicOptions = { wrap: true, steps: 3 };
    private geom: GeodesicGeometry;

    constructor(latlngs?: L.LatLngExpression[] | L.LatLngExpression[][], options?: GeodesicOptions) {
        super();
        this.options = { ...this.options, ...options };

        this.geom = new GeodesicGeometry(this.options);

        if (latlngs) {
            const geodesic = this.geom.multiLineString(latlngExpressionArraytoLiteralArray(latlngs));
            if (this.options.wrap) {
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

    private update(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): void {
        const geodesic = this.geom.multiLineString(latlngExpressionArraytoLiteralArray(latlngs));
        if (this.options.wrap) {
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

    fromGeoJson(input: geojson.GeoJSON): this {
        let latlngs: L.LatLngExpression[][] = [];
        if (input.type === "FeatureCollection") {
            input.features.forEach((feature: geojson.Feature) => {
                switch (feature.geometry.type) {
                    case "MultiPoint":
                    case "LineString":
                        latlngs = [...latlngs, ...[L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates, 0)]];
                        break;
                    case "MultiLineString":
                    case "Polygon":
                        latlngs = [...latlngs, ...L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates, 1)];
                        break;
                }
            })
        }
        // console.log(latlngs);
        this.setLatLngs(latlngs);
        return this;
    }

    getLatLngs(): L.LatLng[] | L.LatLng[][] | L.LatLng[][][] {
        return this.polyline.getLatLngs();
    }

}