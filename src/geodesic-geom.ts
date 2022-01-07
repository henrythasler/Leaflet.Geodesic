import * as L from "leaflet";
import { GeodesicCore, GeodesicOptions, WGS84Vector } from "./geodesic-core"

/** detailled information of the current geometry */
export interface Statistics {
    /** Stores the distance for each individual geodesic line */
    distanceArray: number[],
    /** overall distance of all lines */
    totalDistance: number,
    /** number of positions that the geodesic lines are created from */
    points: number,
    /** number vertices that were created during geometry calculation */
    vertices: number
}

export class GeodesicGeometry {
    readonly geodesic = new GeodesicCore();
    steps: number;

    constructor(options?: GeodesicOptions) {
        this.steps = (options && options.steps !== undefined) ? options.steps : 3;
    }

    /**
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
     * This is the wrapper-function to generate a geodesic line. It's just for future backwards-compatibility
     * if there is another algorithm used to create the actual line.
     * 
     * The `steps`-property is used to define the number of resulting vertices of the linestring: vertices == 1 + 2 ** (steps + 1)
     * The value for `steps` is currently limited to 8 (513 vertices) for performance reasons until another algorithm is found.
     * 
     * @param start start position
     * @param dest destination
     * @return resulting linestring
     */
    line(start: L.LatLng, dest: L.LatLng): L.LatLng[] {
        return this.recursiveMidpoint(start, dest, Math.min(8, this.steps));
    }

    multiLineString(latlngs: L.LatLng[][]): L.LatLng[][] {
        const multiLineString: L.LatLng[][] = [];

        for (const linestring of latlngs) {
            const segment: L.LatLng[] = [];
            for (let j = 1; j < linestring.length; j++) {
                segment.splice(segment.length - 1, 1, ...this.line(linestring[j - 1], linestring[j]));
            }
            multiLineString.push(segment);
        }
        return multiLineString;
    }

    lineString(latlngs: L.LatLng[]): L.LatLng[] {
        return this.multiLineString([latlngs])[0];
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
    splitMultiLineString(multilinestring: L.LatLng[][]): L.LatLng[][] {
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
            result.push(segment);
        }
        return result;
    }

    /**
     * Linestrings of a given multilinestring will be wrapped (+- 360°) to show a continuous line w/o any weird discontinuities
     * when `wrap` is set to `false` in the geodesic class
     * @param multilinestring
     * @returns another multilinestring where the points of each linestring are wrapped accordingly
     */
    wrapMultiLineString(multilinestring: L.LatLng[][]): L.LatLng[][] {
        const result: L.LatLng[][] = [];

        for (const linestring of multilinestring) {
            const resultLine: L.LatLng[] = [];
            let previous: L.LatLng | null = null;

            // iterate over every point and check if it needs to be wrapped
            for (const point of linestring) {
                if (previous === null) {
                    // the first point is the anchor of the linestring from which the line will always start (w/o any wrapping applied)
                    resultLine.push(new L.LatLng(point.lat, point.lng));
                    previous = new L.LatLng(point.lat, point.lng);
                }
                else {  // I prefer clearly defined branches over a continue-operation.

                    // if the difference between the current and *previous* point is greater than 360°, the current point needs to be shifted
                    // to be on the same 'sphere' as the previous one.
                    const offset = Math.round((point.lng - previous.lng) / 360);
                    // shift the point accordingly and add to the result
                    resultLine.push(new L.LatLng(point.lat, point.lng - offset * 360));
                    // use the wrapped point as the anchor for the next one
                    previous = new L.LatLng(point.lat, point.lng - offset * 360);   // Need a new object here, to avoid changing the input data
                }
            }
            result.push(resultLine);
        }
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
        // append first vertice to the end to close the linestring
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
        stats.totalDistance = stats.distanceArray.reduce((x, y) => x + y, 0);
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
