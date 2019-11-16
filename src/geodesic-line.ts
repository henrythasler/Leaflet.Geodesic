import L from "leaflet";
import { GeodesicOptions } from "./geodesic-core"
import { GeodesicGeometry, Statistics } from "./geodesic-geom";
import { latlngExpressiontoLiteral, latlngExpressionArraytoLiteralArray } from "../src/types-helper";

export class GeodesicLine extends L.Polyline {
    defaultOptions: GeodesicOptions = { wrap: true, steps: 3 };
    readonly geom: GeodesicGeometry;
    statistics: Statistics = {} as any;

    constructor(latlngs?: L.LatLngExpression[] | L.LatLngExpression[][], options?: GeodesicOptions) {
        super([], options);
        L.Util.setOptions(this, { ...this.defaultOptions, ...options });

        this.geom = new GeodesicGeometry(this.options);

        if (latlngs !== undefined) {
            this.update(latlngs);
        }
    }

    private update(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): void {
        const latLngLiteral = latlngExpressionArraytoLiteralArray(latlngs);
        const geodesic = this.geom.multiLineString(latLngLiteral);
        this.statistics = this.geom.updateStatistics(latLngLiteral, geodesic);
        if ((this.options as GeodesicOptions).wrap) {
            const split = this.geom.splitMultiLineString(geodesic);
            super.setLatLngs(split);
        }
        else {
            super.setLatLngs(geodesic);
        }
    }

    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this {
        this.update(latlngs);
        return this;
    }

    fromGeoJson(input: GeoJSON.GeoJSON): this {
        let latlngs: L.LatLngExpression[][] = [];
        let features: GeoJSON.Feature[] = [];

        if (input.type === "FeatureCollection") {
            features = input.features;
        }
        else if (input.type === "Feature") {
            features = [input];
        }
        else if (["MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"].includes(input.type)) {
            features = [{
                type: "Feature",
                geometry: input,
                properties: {}
            }]
        }
        else {
            console.log(`[Leaflet.Geodesic] fromGeoJson() - Type "${input.type}" not supported.`);
        }

        features.forEach((feature: GeoJSON.Feature) => {
            switch (feature.geometry.type) {
                case "MultiPoint":
                case "LineString":
                    latlngs = [...latlngs, ...[L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates, 0)]];
                    break;
                case "MultiLineString":
                case "Polygon":
                    latlngs = [...latlngs, ...L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates, 1)];
                    break;
                case "MultiPolygon":
                    feature.geometry.coordinates.forEach((item) => {
                        latlngs = [...latlngs, ...L.GeoJSON.coordsToLatLngs(item, 1)]
                    })
                    break;
                default:
                    console.log(`[Leaflet.Geodesic] fromGeoJson() - Type "${feature.geometry.type}" not supported.`);
            }
        });

        if (latlngs.length) {
            this.update(latlngs);
        }
        return this;
    }

    distance(start: L.LatLngExpression, dest: L.LatLngExpression): number {
        return this.geom.distance(latlngExpressiontoLiteral(start), latlngExpressiontoLiteral(dest));
    }
}