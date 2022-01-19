import * as L from "leaflet";
import {DEFAULT_GEODESIC_OPTIONS, GeodesicOptions, RawGeodesicOptions} from "./geodesic-core";
import {GeodesicGeometry, Statistics} from "./geodesic-geom";
import { latlngExpressiontoLatLng, latlngExpressionArraytoLatLngArray } from "../src/types-helper";

/**
 * Draw geodesic line based on L.Polyline
 */
export class GeodesicLine extends L.Polyline {
    /** Does the actual geometry calculations */
    readonly geom: GeodesicGeometry;
    /** Use this if you need some details about the current geometry */
    statistics: Statistics = {} as Statistics;
    /** Stores all positions that are used to create the geodesic line */
    points: L.LatLng[][] = [];

    constructor(latlngs?: L.LatLngExpression[] | L.LatLngExpression[][], options?: Partial<GeodesicOptions>) {
        super([], options);
        L.Util.setOptions(this, { ...DEFAULT_GEODESIC_OPTIONS, ...options });

        this.geom = new GeodesicGeometry(this.options as RawGeodesicOptions);

        if (latlngs !== undefined) {
            this.setLatLngs(latlngs);
        }
    }

    /** Calculates the geodesics and update the polyline-object accordingly */
    private updateGeometry(updateStats = (this.options as RawGeodesicOptions).updateStatisticsAfterRedrawing): void {
        let geodesic = this.geom.multiLineString(this.points), opts = this.options as GeodesicOptions, latLngs;

        if (updateStats) {
            this.statistics = this.geom.updateStatistics(this.points, geodesic);
        }

        this.statistics.sphericalLengthRadians = geodesic.sphericalLengthRadians;
        this.statistics.sphericalLengthMeters = geodesic.sphericalLengthMeters;

        if (opts.naturalDrawing) {
            latLngs = geodesic;
        } else if (opts.wrap) {
            latLngs = this.geom.splitMultiLineString(geodesic);
        } else {
            latLngs = this.geom.wrapMultiLineString(geodesic);
        }

        super.setLatLngs(latLngs);
    }

    /**
     * Updates statistics of this line.
     * You should call it only if you've set {@link GeodesicOptions.updateStatisticsAfterRedrawing} to `false`.
     */
    updateStatistics() {
        this.updateGeometry(true);
        return this;
    }

    /**
     * Overwrites the original function with additional functionality to create a geodesic line
     * @param latlngs an array (or 2d-array) of positions
     */
    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this {
        this.points = latlngExpressionArraytoLatLngArray(latlngs);
        this.fixLatLngs();
        this.updateGeometry();
        return this;
    }

    /**
     * Adds a given point to the geodesic line object
     * @param latlng point to add. The point will always be added to the last linestring of a multiline
     * @param latlngs define a linestring to add the new point to. Read from points-property before (e.g. `line.addLatLng(Beijing, line.points[0]);`)
     */
    addLatLng(latlng: L.LatLngExpression, latlngs?: L.LatLng[]): this {
        const point = latlngExpressiontoLatLng(latlng);
        if (this.points.length === 0) {
            this.points.push([point]);
        } else {
            if (latlngs === undefined) {
                this.points[this.points.length - 1].push(point);
            } else {
                latlngs.push(point);
            }
        }
        this.fixLatLngs();
        this.updateGeometry();
        return this;
    }

    /**
     * Fixes following edge cases:
     *
     * 1. Split not working correctly when one point has -180 lng and the other -- +180.
     * 2. When natural drawing is used, points lie on antimeridians, and changeLength() called, wrong line is produced.
     */
    private fixLatLngs() {
        const opts = this.options as GeodesicOptions, fixSplit = opts.wrap && !opts.naturalDrawing;
        if (!fixSplit && !opts.naturalDrawing) {
            return;
        }

        for (const linestring of this.points) {
            for (let i = 1; i < linestring.length; i++) {
                const prevPoint = linestring[i - 1], point = linestring[i],absDiff = Math.abs(point.lng - prevPoint.lng);

                if (fixSplit && absDiff === 360) {
                    prevPoint.lng -= 0.000001; // For split, even this small change helps
                } else if (opts.naturalDrawing && this.geom.geodesic.isEqual(absDiff % 180, 0)) {
                    prevPoint.lng -= 0.0001; // For natural drawing, less shift doesn't work for some reason
                }

            }
        }
    }

    /**
     * Changes length of this line (if it's multiline, will change length of all its lines) from given anchor by
     * a given fraction.
     *
     * This function won't shorten or lengthen segments, it'll use only start and end points.
     *
     * **Usage notes:**
     *
     * 1. This function will move original points to split or wrapped line, but won't modify original objects.
     * 2. If new spherical length in radians of a segment with affected point (start and/or end)
     * will exceed Pi (180 degrees), and {@link GeodesicOptions.naturalDrawing} is `false`, an error will be thrown,
     * because in this case it's mandatory to follow big part of a great circle.
     * Consider setting {@link GeodesicOptions.naturalDrawing} to `true` to fix it.
     * 3. If `byFraction` is less than 1 for `start` and `end` or it's less than 0.5 for `both`, an error will be thrown.
     * 4. Modification precision lies withing 0.0001 range in some edge cases.
     *
     * @param from Start point, end point or both. If set to "both", will change length from both anchors by the
     * same given fraction. I.e., if you pass 1.5 as a fraction, new length will be oldLength + oldLength * 1.5 * 2.
     * @param byFraction A fraction to change length by. It it's positive, line will be lengthened.
     * If negative - shortened. If 0, nothing will be done.
     */
    changeLength(from: "start" | "end" | "both", byFraction: number): this {
        // Split sometimes fail with distance really close to 0
        if (byFraction === 0 || this.geom.geodesic.isEqual(this.statistics.sphericalLengthRadians, 0)) {
            return this;
        }

        let isBoth = from === "both", doStart = isBoth || from === "start", doEnd = isBoth || from === "end",
            fn = "naturalDrawingLine", args = [];

        if (isBoth && byFraction <= -0.5) {
            throw new Error("Can't change length by value less than or equal to -0.5 (whole line length while using " +
                    "from = \"both\"). Provided value: " + byFraction
            );
        }

        if (byFraction <= -1) {
            throw new Error("Can't change length by value less than or equal to -1 (whole line length). " +
                    "Provided value: " + byFraction
            );
        }

        if (!(this.options as GeodesicOptions).naturalDrawing) {
            fn = "line";
            args.push(false, false);
        }

        args.push(byFraction);

        for (let line of this.points) {
            let start = line[0], end = line[line.length - 1];

            if (doEnd) {
                line[line.length - 1] = this.changeLengthAndGetLastElement(fn, start, end, args);
            }

            if (doStart) {
                line[0] = this.changeLengthAndGetLastElement(fn, end, start, args);
            }
        }

        this.updateGeometry(true);
        return this;
    }

    /**
     * Calls given line function defined by given points, passes given args to it and returns the last point of the
     * produced line.
     *
     * @param fn Function to call
     * @param start Start point
     * @param end End point
     * @param args Arguments to pass to the function. Should contain length to change by.
     *
     * @return Last point of the produced line
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private changeLengthAndGetLastElement(fn: string, start: L.LatLng, end: L.LatLng, args: any[]) {
        // @ts-ignore
        let line = this.geom[fn](start, end, ...args);

        // Splitting doesn't work on two points, we'll use wrapping instead
        if (!(this.options as GeodesicOptions).naturalDrawing) {
            line = this.geom.wrapMultiLineString([line])[0];
        }
        return line[line.length - 1];
    }

    /**
     * Creates geodesic lines from a given GeoJSON-Object.
     * @param input GeoJSON object
     */
    fromGeoJson(input: GeoJSON.GeoJSON): this {
        let latlngs: L.LatLngExpression[][] = [];
        let features: GeoJSON.Feature[] = [];

        if (input.type === "FeatureCollection") {
            features = input.features;
        } else if (input.type === "Feature") {
            features = [input];
        } else if (["MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"].includes(input.type)) {
            features = [{
                type: "Feature",
                geometry: input,
                properties: {}
            }];
        } else {
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
                    latlngs = [...latlngs, ...L.GeoJSON.coordsToLatLngs(item, 1)];
                });
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
     * @param start First position
     * @param dest Second position
     * @return Distance in meters
     */
    distance(start: L.LatLngExpression, dest: L.LatLngExpression): number {
        return this.geom.distance(latlngExpressiontoLatLng(start), latlngExpressiontoLatLng(dest));
    }
}
