import * as L from "leaflet";
import { GeodesicOptions } from "./geodesic-core"
import { GeodesicGeometry, Statistics } from "./geodesic-geom";
import { latlngExpressiontoLatLng, latlngExpressionArraytoLatLngArray } from "../src/types-helper";

/**
 * Draw geodesic lines based on L.Polyline
 */
export class GeodesicLine extends L.Polyline {
    /** these should be good for most use-cases */
    defaultOptions: GeodesicOptions = { wrap: true, steps: 3 };
    /** does the actual geometry calculations */
    readonly geom: GeodesicGeometry;
    /** use this if you need some detailled info about the current geometry */
    statistics: Statistics = {} as any;
    /** stores all positions that are used to create the geodesic line */
    points: L.LatLng[][] = [];

    constructor(latlngs?: L.LatLngExpression[] | L.LatLngExpression[][], options?: GeodesicOptions) {
        super([], options);
        L.Util.setOptions(this, { ...this.defaultOptions, ...options });

        this.geom = new GeodesicGeometry(this.options);

        if (latlngs !== undefined) {
            this.setLatLngs(latlngs);
        }
    }

    /** calculates the geodesics and update the polyline-object accordingly */
    private updateGeometry(): void {
        let geodesic: L.LatLng[][] = [];

        geodesic = this.geom.multiLineString(this.points);
        this.statistics = this.geom.updateStatistics(this.points, geodesic);
        
        if ((this.options as GeodesicOptions).wrap) {
            const split = this.geom.splitMultiLineString(geodesic);
            super.setLatLngs(split);
        }
        else {
            super.setLatLngs(this.geom.wrapMultiLineString(geodesic));
        }
    }

    /**
     * overwrites the original function with additional functionality to create a geodesic line
     * @param latlngs an array (or 2d-array) of positions
     */
    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this {
        this.points = latlngExpressionArraytoLatLngArray(latlngs);
        this.updateGeometry();
        return this;
    }

    /**
     * add a given point to the geodesic line object
     * @param latlng point to add. The point will always be added to the last linestring of a multiline
     * @param latlngs define a linestring to add the new point to. Read from points-property before (e.g. `line.addLatLng(Beijing, line.points[0]);`)
     */
    addLatLng(latlng: L.LatLngExpression, latlngs?: L.LatLng[]): this {
        const point = latlngExpressiontoLatLng(latlng);
        if (this.points.length === 0) {
            this.points.push([point]);
        }
        else {
            if (latlngs === undefined) {
                this.points[this.points.length - 1].push(point);
            }
            else {
                latlngs.push(point);
            }
        }
        this.updateGeometry();
        return this;
    }

    /**
     * Creates geodesic lines from a given GeoJSON-Object.
     * @param input GeoJSON-Object
     */
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
            this.setLatLngs(latlngs);
        }
        return this;
    }

    /**
     * Calculates the distance between two geo-positions
     * @param start 1st position
     * @param dest 2nd position
     * @return the distance in meters
     */
    distance(start: L.LatLngExpression, dest: L.LatLngExpression): number {
        return this.geom.distance(latlngExpressiontoLatLng(start), latlngExpressiontoLatLng(dest));
    }
}
