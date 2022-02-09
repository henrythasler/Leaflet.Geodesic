import * as L from 'leaflet';

interface RawGeodesicOptions {
    /**
     * Wrap geodesic line at antimeridian. Set to `false`, to draw a line over the antimeridian.
     *
     * Defaults to `true`.
     */
    wrap: boolean;
    /**
     * **Only for geodesic line.**
     *
     * Controls behavior when {@link GeodesicOptions.wrap} is `false`.
     *
     * If set to anything other than number, line will be drawn from the starting point.
     *
     * If you want to move the first point to a specific map (longitudes range), set it to the map number you want,
     * so the first point's longitude will be in range `[180 * n - 360; 180 * n]` where `n` is the specified number.
     *
     * **Warning**: this option ensures that only first point will stay on the specified map,
     * other points might be beyond it!
     */
    moveNoWrapTo: "first-point" | number;
    /**
     * This option is for backwards compatibility. Use {@link GeodesicOptions.segmentsNumber} or
     * {@link GeodesicOptions.breakPoints} instead.
     *
     * Level of detail (`vertices = 1+2**(steps+1)`) for the geodesic line. Number of segments for geodesic circle.
     *
     * More steps result in a smoother line.
     *
     * Defaults to `3` for line and to `24` for circle.
     *
     * @deprecated
     */
    steps: number;
    /**
     * **Only for geodesic circle.**
     *
     * Radius in meters.
     *
     * Defaults to `1000000`.
     */
    radius: number;
    /**
     * Number of segments to generate. All segments will have equal **spherical** length which will be
     * `{@link SphericalStatistics.sphericalLengthMeters} / segmentsNumber`.
     *
     * See {@link GeodesicOptions.breakPoints} for precise control over segments.
     *
     * Values between 500 and 700 should be good enough. Values from `1000` and above will result in a jagged line
     * because of Leaflet's generalization. However, for geodesic circle, values higher than `1000` will result in a
     * smoother circle.
     *
     * **Warning:** If {@link GeodesicOptions.naturalDrawing} is `true`, this value should be at least `4`.
     *
     * If set, takes precedence over {@link GeodesicOptions.steps}.
     */
    segmentsNumber: number | undefined;
    /**
     * **Only for geodesic line.**
     *
     * An array of fractions of **spherical** line length from 0 to 1 where line should have points.
     *
     * For example, `[0, 0.1, 0.3, 0.7, 1]` will produce following segments in this exact order from start point to
     * end point:
     *
     * 1. From 0% to 10% of total length.
     * 2. From 10% to 30% of total length.
     * 3. From 30% to 70% of total length.
     * 4. From 70% to 100% of total length.
     *
     * Array should meet following conditions (otherwise, an error will be thrown):
     *
     * 1. Fractions should be in range `[0; 1]`.
     * 2. Each fraction should be greater than previous.
     *
     * If set, takes precedence over {@link GeodesicOptions.segmentsNumber}.
     * Doesn't take effect when {@link GeodesicOptions.naturalDrawing} is `true`.
     *
     * **Warning:** setting an array where not all differences between adjacent positions are same will result in
     * segments with different lengths!
     */
    breakPoints: number[] | undefined;
    /**
     * **Only for geodesic line.**
     *
     * If `true`, lines will be drawn exactly through given points.
     *
     * When points' longitudes require more than one revolution around the Earth
     * (for example, 50 and 580 will do 2 whole revolutions), line will do all that revolutions and will go exactly
     * from start to end longitudes.
     *
     * To summarize, setting this option to `true` will enable you to draw geodesic lines the same way you would draw
     * regular polylines.
     *
     * Takes precedence over {@link GeodesicOptions.wrap} and {@link GeodesicOptions.moveNoWrapTo}.
     *
     * {@link GeodesicOptions.breakPoints} doesn't take effect when this option is `true`.
     *
     * Number of segments can be dynamic or fixed.
     * See {@link GeodesicOptions.naturalDrawingFixedNumberOfSegments} for more info.
     *
     * Natural drawing greatly decreases performance, don't put many points or limit line length while using it.
     *
     * **Warning**: When two endpoints are on antimeridians, their position precision is reduced to `0.0001`.
     *
     * Defaults to `false`.
     */
    naturalDrawing: boolean;
    /**
     * **Only for geodesic line.**
     *
     * Whether to dynamically increase number of segments or not when {@link GeodesicOptions.naturalDrawing} is `true`.
     *
     * # Available values
     *
     * ## True - fixed number of segments
     *
     * Number of segments won't be changed.
     *
     * ## False - dynamic number of segments.
     *
     * If difference between start and end longitudes is not greater than 360 degrees, number of segments will be
     * whatever you've specified. Otherwise, it'll be multiplied by number of revolutions that your points make.
     *
     * Number of segments is calculated like so:
     *
     * ```
     * let numberOfSegments = 500, // Say, taken from the options
     *      revolutions = Math.round(Math.abs(dest.lng - start.lng) / 360); // Number of revolutions
     * if (revolutions > 0)
     *      numberOfSegments *= revolutions;
     * ```
     *
     * Defaults to `false`.
     */
    naturalDrawingFixedNumberOfSegments: boolean;
    /**
     * If true, will update statistics after redrawing. Set it to `false` to improve performance.
     *
     * Fields from {@link SphericalStatistics} will still be updated since they're generated by the algorithms and won't
     * impose any performance impact.
     *
     * You can manually update statistics by calling {@link GeodesicLine#updateStatistics} or
     * {@link GeodesicCircle#updateStatistics}.
     *
     * Defaults to `true`.
     */
    updateStatisticsAfterRedrawing: boolean;
}
/**
 * Combines geodesic options with polyline options
 */
interface GeodesicOptions extends L.PolylineOptions, RawGeodesicOptions {
}
interface WGS84Vector extends L.LatLngLiteral {
    bearing: number;
}
interface GeoDistance {
    distance: number;
    initialBearing: number;
    finalBearing: number;
}
declare class GeodesicCore {
    readonly options: GeodesicOptions;
    readonly ellipsoid: {
        a: number;
        b: number;
        f: number;
    };
    /**
     * Precision to perform comparisons with
     */
    precision: number;
    constructor(options?: Partial<GeodesicOptions>);
    /**
     * Converts degrees to radians
     * @param degree Angle to convert
     */
    toRadians(degree: number): number;
    /**
     * Converts radians to degrees
     * @param radians Angle to convert
     */
    toDegrees(radians: number): number;
    /**
     * Returns true, if `n1 = n2` with precision of {@link GeodesicCore#precision}
     * @param n1 First number to compare
     * @param n2 Second number to compare
     */
    isEqual(n1: number, n2: number): boolean;
    /**
     * Returns true, if `n1 <= n2` with precision of {@link GeodesicCore#precision}
     * @param n1 First number to compare
     * @param n2 Second number to compare
     */
    isLessThanOrEqualTo(n1: number, n2: number): boolean;
    /**
     * Returns true, if `n1 >= n2` with precision of {@link GeodesicCore#precision}
     * @param n1 First number to compare
     * @param n2 Second number to compare
     */
    isGreaterThanOrEqualTo(n1: number, n2: number): boolean;
    /**
     * Implements scientific modulus.
     * [Source](http://www.codeavenger.com/2017/05/19/JavaScript-Modulo-operation-and-the-Caesar-Cipher.html).
     * @param n
     * @param p
     * @return
     */
    mod(n: number, p: number): number;
    /**
     * Wraps given angle to `[0, 360]` degrees range
     * Source: https://github.com/chrisveness/geodesy/blob/master/dms.js
     * @param degrees Arbitrary value
     * @return Degrees between `[0, 360]` range
     */
    wrap360(degrees: number): number;
    /**
     * General wrap function with arbitrary max value
     * @param degrees Arbitrary value
     * @param max Defines range to wrap value too
     * @return Degrees between `[-max, max]`
     */
    wrap(degrees: number, max?: number): number;
    /**
     * Vincenty direct calculation.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
     *
     * @param start Starting point
     * @param bearing Initial bearing (in degrees)
     * @param distance Distance from starting point to calculate along given bearing in meters.
     * @param maxInterations How many iterations can be made to reach the allowed deviation (`ε`), before an error will be thrown.
     * @return Final point (destination point) and bearing (in degrees)
     */
    direct(start: L.LatLng, bearing: number, distance: number, maxInterations?: number): WGS84Vector;
    /**
     * Vincenty inverse calculation.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
     *
     * @param start Latitude/longitude of starting point.
     * @param dest Latitude/longitude of destination point.
     * @return Object including distance, initialBearing, finalBearing.
     */
    inverse(start: L.LatLng, dest: L.LatLng, maxInterations?: number, mitigateConvergenceError?: boolean): GeoDistance;
    /**
     * Returns the point of intersection of two paths defined by position and bearing.
     *
     * It uses a spherical model of the earth. This will lead to small errors compared to an ellipsoid model.
     * Based on the [work of Chris Veness](https://github.com/chrisveness/geodesy).
     * [Source file](https://github.com/chrisveness/geodesy/blob/master/latlon-spherical.js).
     *
     * @param firstPos First path's position
     * @param firstBearing First path's bearing
     * @param secondPos Second path's position
     * @param secondBearing Second path's bearing
     *
     * @return Point of intersection or null, if there's infinite intersections, or paths are antipodal
     */
    intersection(firstPos: L.LatLng, firstBearing: number, secondPos: L.LatLng, secondBearing: number): L.LatLng | null;
    /**
     * Midpoint on a geodesic line. It Splits a line defined by two given points into two lines with equal spherical length.
     * @param start Start point
     * @param dest End point
     *
     * @return Midpoint
     */
    midpoint(start: L.LatLng, dest: L.LatLng): L.LatLng;
}

/**
 * Line length in radians and meters calculated on a sphere
 */
interface SphericalStatistics {
    /**
     * Line length in radians. For one line, sum of segments' lengths. For multiline, sum of lines' lengths.
     */
    sphericalLengthRadians: number;
    /**
     * Line length in meters. Calculated using 6378137 m radius. To use custom radius,
     * multiply {@link SphericalStatistics.sphericalLengthRadians} by your radius.
     */
    sphericalLengthMeters: number;
}
/** Detailed information of the current geometry */
interface Statistics extends SphericalStatistics {
    /** Stores the distance for each individual geodesic line */
    distanceArray: number[];
    /** Overall distance of all lines */
    totalDistance: number;
    /** Number of positions that the geodesic lines are created from */
    points: number;
    /** Number vertices that were created during geometry calculation */
    vertices: number;
}
/**
 * `L.LatLng[]` with {@link SphericalStatistics}
 */
interface Linestring extends Array<L.LatLng>, SphericalStatistics {
}
/**
 * `Linestring[]` with total {@link SphericalStatistics}
 */
interface Multilinestring extends Array<Linestring>, SphericalStatistics {
}
declare class GeodesicGeometry {
    readonly geodesic: GeodesicCore;
    private options;
    steps: number;
    private readonly segmentsNumber;
    constructor(options?: Partial<RawGeodesicOptions>, calledFromCircle?: boolean);
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
    recursiveMidpoint(start: L.LatLng, dest: L.LatLng, iterations: number): L.LatLng[];
    /**
     * Generates a geodesic line.
     *
     * @param start Start position
     * @param dest Destination
     * @param useLongPart If both this and {@link RawGeodesicOptions.naturalDrawing} are true,
     * will use long part of a great circle
     * @param ignoreNaturalDrawing Internal use only. If true, will draw regular line but wrapped to the first point.
     * @param changeLengthBy Internal use only. If different from 0, will draw a draft line with the new length changed
     * from the dest point.
     * @return resulting linestring
     */
    line(start: L.LatLng, dest: L.LatLng, useLongPart?: boolean, ignoreNaturalDrawing?: boolean, changeLengthBy?: number): Linestring;
    /**
     * Generates a continuous geodesic line from exact start to exact dest with all required revolutions
     * @param start start position
     * @param dest destination
     * @param changeLengthBy Internal use only. If different from 0, will draw a draft line with the new length changed
     * from the dest point.
     */
    naturalDrawingLine(start: L.LatLng, dest: L.LatLng, changeLengthBy?: number): Linestring;
    multiLineString(latlngs: L.LatLng[][]): Multilinestring;
    lineString(latlngs: L.LatLng[]): Linestring;
    /**
     * Copies fields of {@link SphericalStatistics} from src to dest
     * @param src Source object
     * @param dest Destination object
     */
    private static copySphericalStatistics;
    /**
     * Splits a segment on antimeridians.
     *
     * @param startPosition Start segment point
     * @param destPosition End segment point
     *
     * @return Split segment
     */
    splitLine(startPosition: L.LatLng, destPosition: L.LatLng): L.LatLng[][];
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
    splitMultiLineString<T extends L.LatLng[][] | Multilinestring>(multilinestring: T): T;
    /**
     * Linestrings of a given multilinestring will be wrapped (+- 360°) to show a continuous line w/o any weird discontinuities
     * when `wrap` is set to `false` in the geodesic class
     * @param multilinestring Multilinestring to wrap
     * @returns Multilinestring where the points of each linestring are wrapped accordingly
     */
    wrapMultiLineString<T extends L.LatLng[][] | Multilinestring>(multilinestring: T): T;
    /**
     * Creates a circular (constant radius), closed (1st pos == last pos) geodesic linestring.
     * The number of vertices is calculated with: `vertices == steps + 1` (where 1st == last)
     *
     * @param center
     * @param radius
     * @return resulting linestring
     */
    circle(center: L.LatLng, radius: number): L.LatLng[];
    /**
     * Handles splitting of circles at the antimeridian.
     * @param linestring a linestring that resembles the geodesic circle
     * @return a multilinestring that consist of one or two linestrings
     */
    splitCircle(linestring: L.LatLng[]): L.LatLng[][];
    /**
     * Calculates the distance between two positions on the earths surface
     * @param start First position
     * @param dest Second position
     * @return Distance in **meters**
     */
    distance(start: L.LatLng, dest: L.LatLng): number;
    multilineDistance(multilinestring: L.LatLng[][]): number[];
    /**
     * Calculates and returns statistics **not** including spherical lengths
     * @param points Points to calculate statistics of
     * @param vertices Vertices to calculate statistics of
     *
     * @return Calculated statistics
     */
    updateStatistics(points: L.LatLng[][], vertices: L.LatLng[][]): Statistics;
}

/**
 * Draw geodesic line based on L.Polyline
 */
declare class GeodesicLine extends L.Polyline {
    /** Does the actual geometry calculations */
    readonly geom: GeodesicGeometry;
    /** Use this if you need some details about the current geometry */
    statistics: Statistics;
    /** Stores all positions that are used to create the geodesic line */
    points: L.LatLng[][];
    constructor(latlngs?: L.LatLngExpression[] | L.LatLngExpression[][], options?: Partial<GeodesicOptions>);
    /** Calculates the geodesics and update the polyline-object accordingly */
    private updateGeometry;
    /**
     * Updates statistics of this line.
     * You should call it only if you've set {@link GeodesicOptions.updateStatisticsAfterRedrawing} to `false`.
     */
    updateStatistics(): this;
    /**
     * Overwrites the original function with additional functionality to create a geodesic line
     * @param latlngs an array (or 2d-array) of positions
     */
    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this;
    /**
     * Adds a given point to the geodesic line object
     * @param latlng point to add. The point will always be added to the last linestring of a multiline
     * @param latlngs define a linestring to add the new point to. Read from points-property before (e.g. `line.addLatLng(Beijing, line.points[0]);`)
     */
    addLatLng(latlng: L.LatLngExpression, latlngs?: L.LatLng[]): this;
    /**
     * Fixes following edge cases:
     *
     * 1. Split not working correctly when one point has -180 lng and the other -- +180.
     * 2. When natural drawing is used, points lie on antimeridians, and changeLength() called, wrong line is produced.
     */
    private fixLatLngs;
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
     * because in this case it's mandatory to follow long part of a great circle.
     * Consider setting {@link GeodesicOptions.naturalDrawing} to `true` to fix it.
     * 3. If `byFraction` is less than 1 for `start` and `end` or it's less than 0.5 for `both`, an error will be thrown.
     * 4. Modification precision lies withing 0.0001 range in some edge cases.
     *
     * @param from Start point, end point or both. If set to "both", will change length from both anchors by the
     * same given fraction. I.e., if you pass 1.5 as a fraction, new length will be oldLength + oldLength * 1.5 * 2.
     * @param byFraction A fraction to change length by. It it's positive, line will be lengthened.
     * If negative - shortened. If 0, nothing will be done.
     */
    changeLength(from: "start" | "end" | "both", byFraction: number): this;
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
    private changeLengthAndGetLastElement;
    /**
     * Creates geodesic lines from a given GeoJSON-Object.
     * @param input GeoJSON object
     */
    fromGeoJson(input: GeoJSON.GeoJSON): this;
    /**
     * Calculates the distance between two geo-positions
     * @param start First position
     * @param dest Second position
     * @return Distance in meters
     */
    distance(start: L.LatLngExpression, dest: L.LatLngExpression): number;
    getLatLngs(): L.LatLng[][];
}

/**
 * Draw geodesic circle based on L.Polyline
 */
declare class GeodesicCircleClass extends L.Polyline {
    /** Does the actual geometry calculations */
    readonly geom: GeodesicGeometry;
    /** Current center */
    center: L.LatLng;
    /** Current radius in meters */
    radius: number;
    /** Use this if you need some details about the current geometry */
    statistics: Statistics;
    constructor(center?: L.LatLngExpression, options?: Partial<GeodesicOptions>);
    /**
     * Updates the geometry and re-calculates some statistics
     * @param updateStats If should update statistics
     */
    private update;
    /**
     * Updates statistics of this line.
     * You should call it only if you've set {@link GeodesicOptions.updateStatisticsAfterRedrawing} to `false`.
     */
    updateStatistics(): this;
    /**
     * Calculates the distance between the current center and an arbitrary position.
     * @param latlng Geo-position to calculate distance to
     * @return Distance in meters
     */
    distanceTo(latlng: L.LatLngExpression): number;
    /**
     * Sets a new center for the geodesic circle and update the geometry. Radius may also be set.
     * @param center New center
     * @param radius New radius
     */
    setLatLng(center: L.LatLngExpression, radius?: number): this;
    /**
     * Sets a new radius for the geodesic circle and update the geometry. Center may also be set.
     * @param radius New radius
     * @param center New center
     */
    setRadius(radius: number, center?: L.LatLngExpression): this;
}

declare module "leaflet" {
    type Geodesic = GeodesicLine;
    let Geodesic: typeof GeodesicLine;
    let geodesic: (...args: ConstructorParameters<typeof GeodesicLine>) => GeodesicLine;
    type GeodesicCircle = GeodesicCircleClass;
    let GeodesicCircle: typeof GeodesicCircleClass;
    let geodesiccircle: (...args: ConstructorParameters<typeof GeodesicCircleClass>) => GeodesicCircleClass;
}

export { GeodesicCircleClass, GeodesicLine };
