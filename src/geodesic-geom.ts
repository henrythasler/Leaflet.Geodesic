import * as L from "leaflet";
import {
    DEFAULT_GEODESIC_OPTIONS,
    GeodesicCore,
    RawGeodesicOptions,
    WGS84Vector
} from "./geodesic-core"

/**
 * Earth radius used by WebMercator
 */
export const SPHERICAL_RADIUS = 6378137;

/**
 * Line length in radians and meters calculated on a sphere
 */
export interface SphericalStatistics {
    /**
     * Line length in radians. For one line, sum of segments' lengths. For multiline, sum of lines' lengths.
     */
    sphericalLengthRadians: number,

    /**
     * Line length in meters. Calculated using 6378137 m radius. To use custom radius,
     * multiply {@link SphericalStatistics.sphericalLengthRadians} by your radius.
     */
    sphericalLengthMeters: number,
}

/** Detailed information of the current geometry */
export interface Statistics extends SphericalStatistics {
    /** Stores the distance for each individual geodesic line */
    distanceArray: number[],
    /** Overall distance of all lines */
    totalDistance: number,
    /** number of positions that the geodesic lines are created from */
    points: number,
    /** number vertices that were created during geometry calculation */
    vertices: number
}

/**
 * `L.LatLng[]` with {@link SphericalStatistics}
 */
export interface Linestring extends Array<L.LatLng>, SphericalStatistics {}

/**
 * `Linestring[]` with total {@link SphericalStatistics}
 */
export interface Multilinestring extends Array<Linestring>, SphericalStatistics {}

export class GeodesicGeometry {
    readonly geodesic = new GeodesicCore();
    private options: RawGeodesicOptions;
    steps: number;
    private readonly segmentsNumber: number;

    constructor(options?: Partial<RawGeodesicOptions>) {
        this.options = {...DEFAULT_GEODESIC_OPTIONS, ...options};

        // Get steps from either options.segmentsNumber or deprecated options.steps
        this.segmentsNumber = this.options.segmentsNumber === undefined ? 2 ** (this.options.steps + 1) :
                this.options.segmentsNumber;

        // If undefined was passed to either of options. Needed for backwards compatibility.
        if (isNaN(this.segmentsNumber)) {
            this.segmentsNumber = 16;
        }

        if (this.options.useNaturalDrawing && this.segmentsNumber < 4) {
            throw new Error("At least 4 segments are required for natural drawing. " +
                    "Set segmentsNumber option to at least 4 to fix this error."
            );
        }

        this.steps = this.options.steps;
    }

    /**
     * Deprecated in favor of algorithm used by {@link GeodesicGeometry.line}
     *
     * A geodesic line between `start` and `dest` is created with this recursive function.
     * It calculates the geodesic midpoint between `start` and `dest` and uses this midpoint to call itself again (twice!).
     * The results are then merged into one continuous linestring.
     *
     * The number of resulting vertices (incl. `start` and `dest`) depends on the initial value for `iterations`
     * and can be calculated with: vertices == 1 + 2 ** (initialIterations + 1)
     *
     * As this is an exponential function, be extra careful to limit the initial value for `iterations` (8 results in 513 vertices).
     *
     * @param start start position
     * @param dest destination
     * @param iterations
     * @return resulting linestring
     *
     * @deprecated
     */
    recursiveMidpoint(start: L.LatLng, dest: L.LatLng, iterations: number): L.LatLng[] {
        const geom: L.LatLng[] = [start, dest];
        const midpoint = this.geodesic.midpoint(start, dest)

        if (iterations > 0) {
            geom.splice(0, 1, ...this.recursiveMidpoint(start, midpoint, iterations - 1));
            geom.splice(geom.length - 2, 2, ...this.recursiveMidpoint(midpoint, dest, iterations - 1));
        } else {
            geom.splice(1, 0, midpoint);
        }
        return geom;
    }

    /**
     * Generates a geodesic line.
     *
     * @param start Start position
     * @param dest Destination
     * @param useBigPart If both this and {@link RawGeodesicOptions.useNaturalDrawing} are true,
     * will use big part of a great circle
     * @param ignoreNaturalDrawing Internal use only. If true, will draw regular line but wrapped to the first point.
     * @param changeLengthBy Internal use only. If different from 0, will draw a draft line with the new length changed
     * from the dest point.
     * @return resulting linestring
     */
    line(start: L.LatLng, dest: L.LatLng, useBigPart = false, ignoreNaturalDrawing = false, changeLengthBy = 0): Linestring {
        let steps = this.segmentsNumber;

        // Do only last point for regular line and 20 for natural drawing for changing length to improve performance.
        if (changeLengthBy !== 0) {
            steps = this.options.useNaturalDrawing ? 20 : 1;
        }

        // When points are the same. We could make d small enough to introduce only slight floating point errors, but
        // I don't like that solution. I feel like it might fail since difference is in range of an error.
        // I have a bad feeling about points that are close but not exactly same too.
        if (this.geodesic.isEqual(start.lng, dest.lng) && this.geodesic.isEqual(start.lat, dest.lat)) {
            // @ts-ignore
            let toReturn: Linestring = [];
            toReturn.sphericalLengthRadians = 0;
            toReturn.sphericalLengthMeters = 0;
            for (let i = 0; i <= steps; i++) {
                toReturn.push(new L.LatLng(start.lat, start.lng));
            }
            return toReturn;
        }

        let lng1 = this.geodesic.toRadians(start.lng), lat1 = this.geodesic.toRadians(start.lat),
                lng2 = this.geodesic.toRadians(dest.lng), lat2 = this.geodesic.toRadians(dest.lat);

        // An edge case when lng diff is 180 deg and absolute values of lats are equal. Can be fixed by shifting any lat.
        // Even the slightest shift helps, but I like to be more careful in case floats might mess up
        if (this.geodesic.isEqual(Math.abs(lng1 - lng2), Math.PI) && this.geodesic.isEqual(Math.abs(lat1), Math.abs(lat2))) {
            lat2 -= 0.00001;
        }

        let // Call trig functions here for optimization
                cosLng1 = Math.cos(lng1), sinLng1 = Math.sin(lng1), cosLat1 = Math.cos(lat1), sinLat1 = Math.sin(lat1),
                cosLng2 = Math.cos(lng2), sinLng2 = Math.sin(lng2), cosLat2 = Math.cos(lat2), sinLat2 = Math.sin(lat2),

                // Calculate great circle distance between these points
                w = lng2 - lng1,
                h = lat2 - lat1,
                z = Math.sin(h / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(w / 2) ** 2,
                d = 2 * Math.asin(Math.sqrt(z)),
                // @ts-ignore
                coords: Linestring = [];

        /*if (this.geodesic.isEqual(d, 0) || this.geodesic.isEqual(d, Math.PI)) {
            console.log(d, lng1, lng2);
        }*/

        if (d === 0) {
            d = useBigPart ? 0 : Math.PI * 2;
        }

        // 100% of line length. Increasing this number will lengthen the line from dest point.
        // Note: using negative fraction seem to lengthen only line by small part. It glitches with the big part.
        let len = 1;
        if (this.options.useNaturalDrawing && !ignoreNaturalDrawing) {
            // Get the number of revolutions before actual line. See wrapMultilineString() for more info.
            // We also have to round using conditions below. Otherwise, we'll have a redundant revolution.

            let fractionRev = Math.abs(dest.lng - start.lng) / 360, revolutions;

            if (fractionRev % 1 === 0.5) {
                revolutions = useBigPart ? Math.ceil(fractionRev) : Math.floor(fractionRev);
            } else {
                revolutions = Math.round(fractionRev);
            }

            // This is passed by naturalDrawingLine() when regular line goes to wrong direction.
            if (useBigPart) {
                d = Math.PI * 2 - d; // Get length of a big part by subtracting current distance from 360 deg
            }

            // Correct line length and steps for required revolutions
            if (revolutions > 0) {
                // Recalculate steps regardless whether we follow big or small line to maintain predictability.
                if (!this.options.naturalDrawingFixedNumberOfSegments) {
                    steps *= revolutions;
                }

                // Using new length results in one redundant revolution
                if (useBigPart) {
                    revolutions--;
                }

                len = (Math.PI * 2 * revolutions) / d + 1;
            }
        }

        let doUntil = len;
        if (changeLengthBy !== 0) {
            doUntil = len + len * changeLengthBy;
        }

        if (!this.options.useNaturalDrawing && d * doUntil > Math.PI) {
            throw new Error("New spherical line length exceeds 180 degrees. Consider settings \"useNaturalDrawing\" " +
                    "option to true to resolve this problem. Otherwise, check new line length before calling " +
                    "changeLength()."
            )
        }

        let sinD = Math.sin(d), f = 0, i = 0, prevF = -1, moveBy = doUntil / steps,
                useBreakPoints = !this.options.useNaturalDrawing && changeLengthBy === 0;

        while (true) {
            // Without this exact if condition, TS will throw a tantrum
            if (this.options.breakPoints !== undefined && useBreakPoints) {
                if (i === this.options.breakPoints.length) {
                    break;
                }

                f = this.options.breakPoints[i];

                if (f < 0 || f > 1) {
                    throw new Error(`Fractions should be in range [0; 1]. Received fraction ${f} at index ${i}.`);
                }

                if (f <= prevF && i !== 0) {
                    throw new Error(`Each fraction should be greater than previous. Received fractions ${prevF} and ${f} at indices ${i - 1} and ${i} respectively.`);
                }

                i++;
            } else if (!(this.geodesic.isLessThanOrEqualTo(f, doUntil))) {
                break;
            }

            let A = Math.sin((len - f) * d) / sinD,
                    B = Math.sin(f * d) / sinD,
                    x = A * cosLat1 * cosLng1 + B * cosLat2 * cosLng2,
                    y = A * cosLat1 * sinLng1 + B * cosLat2 * sinLng2,
                    z = A * sinLat1 + B * sinLat2,
                    lat = this.geodesic.toDegrees(Math.atan2(z, Math.sqrt(x ** 2 + y ** 2))),
                    lng = this.geodesic.toDegrees(Math.atan2(y, x));
            coords.push(new L.LatLng(lat, lng));

            prevF = f;
            if (this.options.breakPoints === undefined || !useBreakPoints) {
                f += moveBy;
            }
        }

        // Move the first point to its map, so wrapping will work correctly
        if (this.options.useNaturalDrawing || !this.options.wrap) {
            let firstPoint = coords[0];

            if (!this.options.useNaturalDrawing && typeof this.options.moveNoWrapTo === "number") {
                firstPoint.lng += this.options.moveNoWrapTo * 360;
            } else {
                firstPoint.lng += start.lng - firstPoint.lng;
            }
        }

        // Calculate statistics
        coords.sphericalLengthRadians = d * len;
        coords.sphericalLengthMeters = coords.sphericalLengthRadians * SPHERICAL_RADIUS;

        return coords;
    }

    /**
     * Generates a continuous geodesic line from exact start to exact dest with all required revolutions
     * @param start start position
     * @param dest destination
     * @param changeLengthBy Internal use only. If different from 0, will draw a draft line with the new length changed
     * from the dest point.
     */
    naturalDrawingLine (start: L.LatLng, dest: L.LatLng, changeLengthBy = 0): Linestring {
        // Generate a small (regular) line. We should ignore natural drawing for this to improve performance and solve
        // an issue when difference between lngs is 180 degrees.
        let smallLine = this.wrapMultiLineString([this.line(start, dest, false, true, changeLengthBy)], start, dest)[0],
                lngFrom, lngTo;

        // If line won't be split, just return wrapped line to improve performance and solve some weird glitches
        if (Math.abs(start.lng - dest.lng) <= 180) {
            return smallLine;
        }

        // Determine whether small line follows the direction from start to dest, i.e. if its last point is between
        // start lng and dest lng. Otherwise, we'll use big part of a great circle to get line in desired direction.
        if (start.lng < dest.lng) {
            lngFrom = start.lng;
            lngTo = dest.lng;
        } else {
            lngFrom = dest.lng;
            lngTo = start.lng;
        }

        // Last lng should lie between start and dest, but don't touch any of it. If it touches any of these lngs,
        // difference between lngs is multiple of 180 or 360. In this case, use big part which solves certain glitches.
        let lastLng = smallLine[smallLine.length - 1].lng, useBigPart = lastLng <= lngFrom || lastLng >= lngTo;
        return this.wrapMultiLineString([this.line(start, dest, useBigPart, false, changeLengthBy)], start, dest)[0];
    }

    multiLineString(latlngs: L.LatLng[][]): Multilinestring {
        // @ts-ignore
        const multiLineString: Multilinestring = [], fn = this.options.useNaturalDrawing ? "naturalDrawingLine" : "line";

        multiLineString.sphericalLengthRadians = 0;
        multiLineString.sphericalLengthMeters = 0;

        for (const linestring of latlngs) {
            // @ts-ignore
            const segment: Linestring = [];

            segment.sphericalLengthRadians = 0;
            segment.sphericalLengthMeters = 0;

            for (let j = 1; j < linestring.length; j++) {
                const line = this[fn](linestring[j - 1], linestring[j]);
                segment.splice(segment.length - 1, 1, ...line);
                segment.sphericalLengthRadians += line.sphericalLengthRadians;
                segment.sphericalLengthMeters += line.sphericalLengthMeters;
            }
            multiLineString.push(segment);
            multiLineString.sphericalLengthRadians += segment.sphericalLengthRadians;
            multiLineString.sphericalLengthMeters += segment.sphericalLengthMeters;
        }
        return multiLineString;
    }

    lineString(latlngs: L.LatLng[]): Linestring {
        return this.multiLineString([latlngs])[0];
    }

    /**
     * Copies fields of {@link SphericalStatistics} from src to dest
     * @param src Source object
     * @param dest Destination object
     */
    private static copySphericalStatistics (src: any, dest: any) {
        const params = ["sphericalLengthRadians", "sphericalLengthMeters"];
        for (const param of params) {
            if (src[param] !== undefined) {
                dest[param] = src[param];
            }
        }
    }

    /**
     *
     * Is much (10x) faster than the previous implementation:
     *
     * ```
     * Benchmark (no split):  splitLine x 459,044 ops/sec ±0.53% (95 runs sampled)
     * Benchmark (split):     splitLine x 42,999 ops/sec ±0.51% (97 runs sampled)
     * ```
     *
     * @param startPosition
     * @param destPosition
     */
    splitLine(startPosition: L.LatLng, destPosition: L.LatLng): L.LatLng[][] {
        const antimeridianWest = {
            point: new L.LatLng(89.9, -180.0000001),    // lng is slightly off, to detect intersections with lines starting exactly on the antimeridian
            bearing: 180
        };
        const antimeridianEast = {
            point: new L.LatLng(89.9, 180.0000001),     // lng is slightly off, to detect intersections with lines starting exactly on the antimeridian
            bearing: 180
        };

        // make a copy to work with
        const start = new L.LatLng(startPosition.lat, startPosition.lng);
        const dest = new L.LatLng(destPosition.lat, destPosition.lng);

        start.lng = this.geodesic.wrap(start.lng, 360);
        dest.lng = this.geodesic.wrap(dest.lng, 360);

        if ((dest.lng - start.lng) > 180) {
            dest.lng = dest.lng - 360;
        } else if ((dest.lng - start.lng) < -180) {
            dest.lng = dest.lng + 360;
        }

        let result: L.LatLng[][] = [[new L.LatLng(start.lat, this.geodesic.wrap(start.lng, 180)), new L.LatLng(dest.lat, this.geodesic.wrap(dest.lng, 180))]];

        // crossing antimeridian from "this" side?
        if ((start.lng >= -180) && (start.lng <= 180)) {
            // crossing the "western" antimeridian
            if (dest.lng < -180) {
                const bearing: number = this.geodesic.inverse(start, dest).initialBearing;
                const intersection = this.geodesic.intersection(start, bearing, antimeridianWest.point, antimeridianWest.bearing);
                if (intersection) {
                    result = [[start, intersection], [new L.LatLng(intersection.lat, intersection.lng + 360), new L.LatLng(dest.lat, dest.lng + 360)]];
                }
            }
            // crossing the "eastern" antimeridian
            else if (dest.lng > 180) {
                const bearing: number = this.geodesic.inverse(start, dest).initialBearing;
                const intersection = this.geodesic.intersection(start, bearing, antimeridianEast.point, antimeridianEast.bearing);
                if (intersection) {
                    result = [[start, intersection], [new L.LatLng(intersection.lat, intersection.lng - 360), new L.LatLng(dest.lat, dest.lng - 360)]];
                }
            }
        }
        // coming back over the antimeridian from the "other" side?
        else if ((dest.lng >= -180) && (dest.lng <= 180)) {
            // crossing the "western" antimeridian
            if (start.lng < -180) {
                const bearing: number = this.geodesic.inverse(start, dest).initialBearing;
                const intersection = this.geodesic.intersection(start, bearing, antimeridianWest.point, antimeridianWest.bearing);
                if (intersection) {
                    result = [[new L.LatLng(start.lat, start.lng + 360), new L.LatLng(intersection.lat, intersection.lng + 360)], [intersection, dest]];
                }
            }

            // crossing the "eastern" antimeridian
            else if (start.lng > 180) {
                const bearing: number = this.geodesic.inverse(start, dest).initialBearing;
                const intersection = this.geodesic.intersection(start, bearing, antimeridianWest.point, antimeridianWest.bearing);
                if (intersection) {
                    result = [[new L.LatLng(start.lat, start.lng - 360), new L.LatLng(intersection.lat, intersection.lng - 360)], [intersection, dest]];
                }
            }
        }
        return result;
    }

    /**
     * Linestrings of a given multilinestring that cross the antimeridian will be split in two separate linestrings.
     * This function is used to wrap lines around when they cross the antimeridian
     * It iterates over all linestrings and reconstructs the step-by-step if no split is needed.
     * In case the line was split, the linestring ends at the antimeridian and a new linestring is created for the
     * remaining points of the original linestring.
     *
     * @param multilinestring
     * @return another multilinestring where segments crossing the antimeridian are split
     */
    splitMultiLineString <T extends L.LatLng[][] | Multilinestring> (multilinestring: T): T {
        const result: L.LatLng[][] = [];
        for (const linestring of multilinestring) {
            if (linestring.length === 1) {
                result.push(linestring);   // just a single point in linestring, no need to split
                continue;
            }

            let segment: L.LatLng[] = [];
            for (let j = 1; j < linestring.length; j++) {
                const split = this.splitLine(linestring[j - 1], linestring[j]);
                segment.pop();
                segment = segment.concat(split[0]);
                if (split.length > 1) {
                    result.push(segment);   // the line was split, so we end the linestring right here
                    segment = split[1];     // begin the new linestring with the second part of the split line
                }
            }

            GeodesicGeometry.copySphericalStatistics(linestring, segment);
            result.push(segment);
        }

        GeodesicGeometry.copySphericalStatistics(multilinestring, result);
        // @ts-ignore
        return result;
    }

    /**
     * Linestrings of a given multilinestring will be wrapped (+- 360°) to show a continuous line w/o any weird discontinuities
     * when `wrap` is set to `false` in the geodesic class
     * @param multilinestring
     * @param start Internal use only. Start point used to correct natural drawing line direction.
     * @param dest Internal use only. Destination point used to correct natural drawing line direction.
     * @returns another multilinestring where the points of each linestring are wrapped accordingly
     */
    wrapMultiLineString <T extends L.LatLng[][] | Multilinestring> (multilinestring: T, start: L.LatLng | null = null, dest: L.LatLng | null = null): T {
        // @ts-ignore
        const result: T = [], direction = Math.sign(dest?.lng - start?.lng);

        for (const linestring of multilinestring) {
            const resultLine: L.LatLng[] = [];
            let previous: L.LatLng | null = null;
            //console.log("___")

            // iterate over every point and check if it needs to be wrapped
            for (const point of linestring) {
                // The first point is the anchor of the linestring from which the line will always start.
                // If the difference between the current and *previous* point is greater than 360°,
                // the current point needs to be shifted to be on the same 'sphere' as the previous one.
                // We're doing toFixed() for when lng difference is close to 0.5. Otherwise, it won't wrap
                // natural drawing line correctly.

                const shift: number = previous === null ? 0 : Math.round(
                        parseFloat(((point.lng - previous.lng) / 360).toFixed(6))
                ) * 360;
                const newPoint = new L.LatLng(point.lat, point.lng - shift);

                // If using natural drawing, and new direction is not the same as required,
                // shift the point by 360 to fix it
                if (previous && start && dest) {
                    const newDirection = Math.sign(parseFloat((newPoint.lng - previous.lng).toFixed(6)));
                    //console.log(newPoint.lng, previous.lng, shift, direction, newDirection)
                    if (direction && newDirection !== direction && newDirection !== 0) {
                        newPoint.lng += direction * 360;
                    }
                }

                resultLine.push(newPoint);
                previous = newPoint; // Use the wrapped point as the anchor for the next one
            }

            result.push(resultLine);
            GeodesicGeometry.copySphericalStatistics(linestring, resultLine);
        }
        GeodesicGeometry.copySphericalStatistics(multilinestring, result);
        return result;
    }

    /**
     * Creates a circular (constant radius), closed (1st pos == last pos) geodesic linestring.
     * The number of vertices is calculated with: `vertices == steps + 1` (where 1st == last)
     *
     * @param center
     * @param radius
     * @return resulting linestring
     */
    circle(center: L.LatLng, radius: number): L.LatLng[] {
        const vertices: L.LatLng[] = [];
        for (let i = 0; i < this.steps; i++) {
            const point: WGS84Vector = this.geodesic.direct(center, 360 / this.steps * i, radius);
            vertices.push(new L.LatLng(point.lat, point.lng));
        }
        // Append first vertex to the end to close the linestring
        vertices.push(new L.LatLng(vertices[0].lat, vertices[0].lng));
        return vertices;
    }

    /**
     * Handles splitting of circles at the antimeridian.
     * @param linestring a linestring that resembles the geodesic circle
     * @return a multilinestring that consist of one or two linestrings
     */
    splitCircle(linestring: L.LatLng[]): L.LatLng[][] {
        const result: L.LatLng[][] = this.splitMultiLineString([linestring]);

        // If the circle was split, it results in exactly three linestrings where first and last
        // must be re-assembled because they belong to the same "side" of the split circle.
        if (result.length === 3) {
            result[2] = [...result[2], ...result[0]];
            result.shift();
        }
        return result;
    }

    /**
     * Calculates the distance between two positions on the earths surface
     * @param start 1st position
     * @param dest 2nd position
     * @return the distance in **meters**
     */
    distance(start: L.LatLng, dest: L.LatLng): number {
        return this.geodesic.inverse(
            new L.LatLng(start.lat, this.geodesic.wrap(start.lng, 180)),
            new L.LatLng(dest.lat, this.geodesic.wrap(dest.lng, 180))
        ).distance;
    }

    multilineDistance(multilinestring: L.LatLng[][]): number[] {
        const dist: number[] = [];
        for (const linestring of multilinestring) {
            let segmentDistance = 0;
            for (let j = 1; j < linestring.length; j++) {
                segmentDistance += this.distance(linestring[j - 1], linestring[j]);
            }
            dist.push(segmentDistance);
        }
        return dist;
    }

    updateStatistics(points: L.LatLng[][], vertices: L.LatLng[][]): Statistics {
        const stats: Statistics = {} as any;

        stats.distanceArray = this.multilineDistance(points);
        stats.totalDistance = 0;

        for (let distance of stats.distanceArray) {
            stats.totalDistance += distance;
        }

        stats.points = 0;
        for (const item of points) {
            stats.points += item.reduce((x) => x + 1, 0);
        }
        stats.vertices = 0;
        for (const item of vertices) {
            stats.vertices += item.reduce((x) => x + 1, 0);
        }
        return stats;
    }
}
