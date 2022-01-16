import * as L from "leaflet";

export interface RawGeodesicOptions {
    /**
     * Wrap geodesic line at antimeridian. Set to false, to draw a line over the antimeridian. Defaults to true.
     */
    wrap: boolean,

    /**
     * Controls behavior when {@link GeodesicOptions.wrap} is false.
     *
     * If set to anything other than number, line will be drawn from the starting point.
     *
     * If you want to move the first point to a specific map (longitudes range), set it to the map number you want,
     * so the first point's longitude will be in range `[180 * n - 360; 180 * n]` where `n` is the specified number.
     *
     * **Warning**: this option ensures that only first point will stay on the specified map,
     * other points might be beyond it!
     */
    moveNoWrapTo: "first-point" | number,

    /**
     * This option is for backwards compatibility. Use {@link GeodesicOptions.segmentsNumber} or
     * {@link GeodesicOptions.breakPoints} instead.
     *
     * Level of detail (`vertices = 1+2**(steps+1)`) for the geodesic line.
     *
     * More steps result in a smoother line.
     *
     * Defaults to 3.
     *
     * @deprecated
     */
    steps: number,

    /**
     * Only for circle: radius in meters.
     */
    radius: number,

    /**
     * Number of segments to generate. All segments will have equal **spherical** length which will be
     * `{@link SphericalStatistics.sphericalLengthMeters} / segmentsNumber`.
     *
     * See {@link GeodesicOptions.breakPoints} for precise control over segments.
     *
     * Values between 500 and 700 should be good enough. Values from 1000 and above will result in a jagged line
     * because of Leaflet's generalization.
     *
     * **Warning:** If {@link GeodesicOptions.naturalDrawing} is true, this value should be at least 4.
     *
     * If set, takes precedence over {@link GeodesicOptions.steps}
     */
    segmentsNumber: number | undefined,

    /**
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
     * 1. Fractions should be in range [0; 1].
     * 2. Each fraction should be greater than previous.
     *
     * If set, takes precedence over {@link GeodesicOptions.segmentsNumber}.
     * Doesn't take effect when {@link GeodesicOptions.naturalDrawing} is true.
     *
     * **Warning:** setting an array where not all differences between adjacent positions are same will result in
     * segments with different lengths!
     */
    breakPoints: number[] | undefined,

    /**
     * If true, lines will be drawn exactly through given points.
     *
     * When points' longitudes require more than one revolution around the Earth
     * (for example, 50 and 580 will do 2 whole revolutions), line will do all that revolutions and will go exactly
     * from start to end longitudes.
     *
     * To summarize, setting this option to true will enable you to draw geodesic lines the same way you would draw
     * regular polylines.
     *
     * Takes precedence over {@link GeodesicOptions.wrap} and {@link GeodesicOptions.moveNoWrapTo}.
     *
     * {@link GeodesicOptions.breakPoints} doesn't take effect when this option is true.
     *
     * Number of segments can be dynamic or fixed.
     * See {@link GeodesicOptions.naturalDrawingFixedNumberOfSegments} for more info.
     *
     * Natural drawing greatly decreases performance, don't put many points or limit line length while using it.
     *
     * Defaults to false.
     */
    naturalDrawing: boolean,

    /**
     * Whether to dynamically increase number of segments or not when {@link GeodesicOptions.naturalDrawing} is true.
     * Defaults to false, i.e. number of segments is dynamic but predictable.
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
     */
    naturalDrawingFixedNumberOfSegments: boolean,

    /**
     * If true, will update statistics after redrawing. Set it to false to improve performance.
     *
     * Fields from {@link SphericalStatistics} will still be updated since they're generated by the algorithms and won't
     * impose any performance impact.
     *
     * You can manually update statistics by calling {@link GeodesicLine#updateStatistics} or
     * {@link GeodesicCircle#updateStatistics}.
     *
     * Defaults to true.
     */
    updateStatisticsAfterRedrawing: boolean,
}

export interface GeodesicOptions extends L.PolylineOptions, RawGeodesicOptions {
}

export const DEFAULT_GEODESIC_OPTIONS = {
    radius: 1000000,
    steps: 3,
    wrap: true,
    moveNoWrapTo: "first-point" as "first-point",
    segmentsNumber: undefined,
    breakPoints: undefined,
    naturalDrawing: false,
    naturalDrawingFixedNumberOfSegments: false,
    updateStatisticsAfterRedrawing: true,
};

export interface WGS84Vector extends L.LatLngLiteral {
    bearing: number;
}

export interface GeoDistance {
    distance: number,
    initialBearing: number,
    finalBearing: number
}

export class GeodesicCore {

    readonly options: GeodesicOptions;
    readonly ellipsoid = {
        a: 6378137,
        b: 6356752.3142,
        f: 1 / 298.257223563
    }; // WGS-84

    precision = 0.00001;

    constructor(options?: Partial<GeodesicOptions>) {
        this.options = { ...DEFAULT_GEODESIC_OPTIONS, ...options };
    }

    toRadians(degree: number): number {
        return degree * Math.PI / 180;
    }

    toDegrees(radians: number): number {
        return radians * 180 / Math.PI;
    }

    isEqual(n1: number, n2: number) {
        return Math.abs(n1 - n2) <= this.precision;
    }

    isLessThanOrEqualTo(n1: number, n2: number) {
        return n1 - n2 <= this.precision;
    }

    isGreaterThanOrEqualTo(n1: number, n2: number) {
        return n1 - n2 >= -this.precision;
    }

    /**
     * implements scientific modulus
     * source: http://www.codeavenger.com/2017/05/19/JavaScript-Modulo-operation-and-the-Caesar-Cipher.html 
     * @param n 
     * @param p 
     * @return 
     */
    mod(n: number, p: number): number {
        const r = n % p;
        return r < 0 ? r + p : r;
    }

    /**
     * source: https://github.com/chrisveness/geodesy/blob/master/dms.js
     * @param degrees arbitrary value
     * @return degrees between 0..360
     */
    wrap360(degrees: number): number {
        if (0 <= degrees && degrees < 360) {
            return degrees; // avoid rounding due to arithmetic ops if within range
        } else {
            return this.mod(degrees, 360)
        }
    }

    /**
     * general wrap function with arbitrary max value
     * @param degrees arbitrary value
     * @param max
     * @return degrees between `-max`..`+max`
     */
    wrap(degrees: number, max = 360) {
        if (-max <= degrees && degrees <= max) {
            return degrees;
        } else {
            return this.mod((degrees + max), 2 * max) - max;
        }
    }

    /**
     * Vincenty direct calculation.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
     *
     * @param start starting point 
     * @param bearing initial bearing (in degrees)
     * @param distance distance from starting point to calculate along given bearing in meters.
     * @param maxInterations How many iterations can be made to reach the allowed deviation (`ε`), before an error will be thrown.
     * @return Final point (destination point) and bearing (in degrees)
     */
    direct(start: L.LatLng, bearing: number, distance: number, maxInterations = 100): WGS84Vector {
        const φ1 = this.toRadians(start.lat);
        const λ1 = this.toRadians(start.lng);
        const α1 = this.toRadians(bearing);
        const s = distance;
        const ε = Number.EPSILON * 1000;

        const { a, b, f } = this.ellipsoid;

        const sinα1 = Math.sin(α1);
        const cosα1 = Math.cos(α1);

        const tanU1 = (1 - f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
        const σ1 = Math.atan2(tanU1, cosα1); // σ1 = angular distance on the sphere from the equator to P1
        const sinα = cosU1 * sinα1;          // α = azimuth of the geodesic at the equator
        const cosSqα = 1 - sinα * sinα;
        const uSq = cosSqα * (a * a - b * b) / (b * b);
        const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
        const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

        let σ = s / (b * A), sinσ = null, cosσ = null, Δσ = null; // σ = angular distance P₁ P₂ on the sphere
        let cos2σₘ = null; // σₘ = angular distance on the sphere from the equator to the midpoint of the line

        let σʹ = null, iterations = 0;
        do {
            cos2σₘ = Math.cos(2 * σ1 + σ);
            sinσ = Math.sin(σ);
            cosσ = Math.cos(σ);
            Δσ = B * sinσ * (cos2σₘ + B / 4 * (cosσ * (-1 + 2 * cos2σₘ * cos2σₘ) -
                B / 6 * cos2σₘ * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σₘ * cos2σₘ)));
            σʹ = σ;
            σ = s / (b * A) + Δσ;
        } while (Math.abs(σ - σʹ) > ε && ++iterations < maxInterations);
        if (iterations >= maxInterations) {
            throw new EvalError(`Direct vincenty formula failed to converge after ${maxInterations} iterations 
                (start=${start.lat}/${start.lng}; bearing=${bearing}; distance=${distance})`); // not possible?
        }

        const x = sinU1 * sinσ - cosU1 * cosσ * cosα1;
        const φ2 = Math.atan2(sinU1 * cosσ + cosU1 * sinσ * cosα1, (1 - f) * Math.sqrt(sinα * sinα + x * x));
        const λ = Math.atan2(sinσ * sinα1, cosU1 * cosσ - sinU1 * sinσ * cosα1);
        const C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
        const dL = λ - (1 - C) * f * sinα * (σ + C * sinσ * (cos2σₘ + C * cosσ * (-1 + 2 * cos2σₘ * cos2σₘ)));
        const λ2 = λ1 + dL;

        const α2 = Math.atan2(sinα, -x);

        return {
            lat: this.toDegrees(φ2),
            lng: this.toDegrees(λ2),
            bearing: this.wrap360(this.toDegrees(α2))
        };
    }

    /**
     * Vincenty inverse calculation.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
     *
     * @param start Latitude/longitude of starting point.
     * @param dest Latitude/longitude of destination point.
     * @return Object including distance, initialBearing, finalBearing.
     */
    inverse(start: L.LatLng, dest: L.LatLng, maxInterations = 100, mitigateConvergenceError = true): GeoDistance {
        const p1 = start, p2 = dest;
        const φ1 = this.toRadians(p1.lat), λ1 = this.toRadians(p1.lng);
        const φ2 = this.toRadians(p2.lat), λ2 = this.toRadians(p2.lng);
        const π = Math.PI;
        const ε = Number.EPSILON;

        // allow alternative ellipsoid to be specified
        const { a, b, f } = this.ellipsoid;

        const dL = λ2 - λ1; // L = difference in longitude, U = reduced latitude, defined by tan U = (1-f)·tanφ.
        const tanU1 = (1 - f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
        const tanU2 = (1 - f) * Math.tan(φ2), cosU2 = 1 / Math.sqrt((1 + tanU2 * tanU2)), sinU2 = tanU2 * cosU2;

        const antipodal = Math.abs(dL) > π / 2 || Math.abs(φ2 - φ1) > π / 2;

        let λ = dL, sinλ = null, cosλ = null; // λ = difference in longitude on an auxiliary sphere
        let σ = antipodal ? π : 0, sinσ = 0, cosσ = antipodal ? -1 : 1, sinSqσ = null; // σ = angular distance P₁ P₂ on the sphere
        let cos2σₘ = 1;                      // σₘ = angular distance on the sphere from the equator to the midpoint of the line
        let sinα = null, cosSqα = 1;         // α = azimuth of the geodesic at the equator
        let C = null;

        let λʹ = null, iterations = 0;
        do {
            sinλ = Math.sin(λ);
            cosλ = Math.cos(λ);
            sinSqσ = (cosU2 * sinλ) * (cosU2 * sinλ) + (cosU1 * sinU2 - sinU1 * cosU2 * cosλ) * (cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
            if (Math.abs(sinSqσ) < ε) {
                break;  // co-incident/antipodal points (falls back on λ/σ = L)
            }
            sinσ = Math.sqrt(sinSqσ);
            cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
            σ = Math.atan2(sinσ, cosσ);
            sinα = cosU1 * cosU2 * sinλ / sinσ;
            cosSqα = 1 - sinα * sinα;
            cos2σₘ = (cosSqα !== 0) ? (cosσ - 2 * sinU1 * sinU2 / cosSqα) : 0; // on equatorial line cos²α = 0 (§6)
            C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
            λʹ = λ;
            λ = dL + (1 - C) * f * sinα * (σ + C * sinσ * (cos2σₘ + C * cosσ * (-1 + 2 * cos2σₘ * cos2σₘ)));
            const iterationCheck = antipodal ? Math.abs(λ) - π : Math.abs(λ);
            if (iterationCheck > π) {
                throw new EvalError('λ > π');
            }
        } while (Math.abs(λ - λʹ) > 1e-12 && ++iterations < maxInterations);

        if (iterations >= maxInterations) {
            if (mitigateConvergenceError) {
                return this.inverse(start, new L.LatLng(dest.lat, dest.lng - 0.01), maxInterations, mitigateConvergenceError);
            } else {
                throw new EvalError(`Inverse vincenty formula failed to converge after ${maxInterations} iterations 
                    (start=${start.lat}/${start.lng}; dest=${dest.lat}/${dest.lng})`);
            }

        }
        const uSq = cosSqα * (a * a - b * b) / (b * b);
        const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
        const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
        const Δσ = B * sinσ * (cos2σₘ + B / 4 * (cosσ * (-1 + 2 * cos2σₘ * cos2σₘ) -
            B / 6 * cos2σₘ * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σₘ * cos2σₘ)));

        const s = b * A * (σ - Δσ); // s = length of the geodesic

        // note special handling of exactly antipodal points where sin²σ = 0 (due to discontinuity
        // atan2(0, 0) = 0 but atan2(this.ε, 0) = π/2 / 90°) - in which case bearing is always meridional,
        // due north (or due south!)
        // α = azimuths of the geodesic; α2 the direction P₁ P₂ produced
        const α1 = Math.abs(sinSqσ) < ε ? 0 : Math.atan2(cosU2 * sinλ, cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
        const α2 = Math.abs(sinSqσ) < ε ? π : Math.atan2(cosU1 * sinλ, -sinU1 * cosU2 + cosU1 * sinU2 * cosλ);

        return {
            distance: s,
            initialBearing: Math.abs(s) < ε ? NaN : this.wrap360(this.toDegrees(α1)),
            finalBearing: Math.abs(s) < ε ? NaN : this.wrap360(this.toDegrees(α2))
        } as GeoDistance;
    }

    /**
     * Returns the point of intersection of two paths defined by position and bearing. 
     * This calculation uses a spherical model of the earth. This will lead to small errors compared to an ellipsiod model.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-spherical.js
     * 
     * @param firstPos 1st path: position and bearing
     * @param firstBearing
     * @param secondPos 2nd path: position and bearing
     * @param secondBearing
     */

    intersection(firstPos: L.LatLng, firstBearing: number, secondPos: L.LatLng, secondBearing: number): L.LatLng | null {
        const φ1 = this.toRadians(firstPos.lat);
        const λ1 = this.toRadians(firstPos.lng);
        const φ2 = this.toRadians(secondPos.lat);
        const λ2 = this.toRadians(secondPos.lng);
        const θ13 = this.toRadians(firstBearing);
        const θ23 = this.toRadians(secondBearing);
        const Δφ = φ2 - φ1, Δλ = λ2 - λ1;
        const π = Math.PI;
        const ε = Number.EPSILON;

        // angular distance p1-p2
        const δ12 = 2 * Math.asin(Math.sqrt(Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
            + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)));
        if (Math.abs(δ12) < ε) {
            return firstPos; // coincident points
        }

        // initial/final bearings between points
        const cosθa = (Math.sin(φ2) - Math.sin(φ1) * Math.cos(δ12)) / (Math.sin(δ12) * Math.cos(φ1));
        const cosθb = (Math.sin(φ1) - Math.sin(φ2) * Math.cos(δ12)) / (Math.sin(δ12) * Math.cos(φ2));
        const θa = Math.acos(Math.min(Math.max(cosθa, -1), 1)); // protect against rounding errors
        const θb = Math.acos(Math.min(Math.max(cosθb, -1), 1)); // protect against rounding errors

        const θ12 = Math.sin(λ2 - λ1) > 0 ? θa : 2 * π - θa;
        const θ21 = Math.sin(λ2 - λ1) > 0 ? 2 * π - θb : θb;

        const α1 = θ13 - θ12; // angle 2-1-3
        const α2 = θ21 - θ23; // angle 1-2-3

        if (Math.sin(α1) === 0 && Math.sin(α2) === 0) {
            return null; // infinite intersections
        }
        if (Math.sin(α1) * Math.sin(α2) < 0) {
            return null;        // ambiguous intersection (antipodal?)
        }

        const cosα3 = -Math.cos(α1) * Math.cos(α2) + Math.sin(α1) * Math.sin(α2) * Math.cos(δ12);
        const δ13 = Math.atan2(Math.sin(δ12) * Math.sin(α1) * Math.sin(α2), Math.cos(α2) + Math.cos(α1) * cosα3);
        const φ3 = Math.asin(Math.min(Math.max(Math.sin(φ1) * Math.cos(δ13) + Math.cos(φ1) * Math.sin(δ13) * Math.cos(θ13), -1), 1));
        const Δλ13 = Math.atan2(Math.sin(θ13) * Math.sin(δ13) * Math.cos(φ1), Math.cos(δ13) - Math.sin(φ1) * Math.sin(φ3));
        const λ3 = λ1 + Δλ13;
        return new L.LatLng(this.toDegrees(φ3), this.toDegrees(λ3));
    }

    midpoint(start: L.LatLng, dest: L.LatLng): L.LatLng {
        // φm = atan2( sinφ1 + sinφ2, √( (cosφ1 + cosφ2⋅cosΔλ)² + cos²φ2⋅sin²Δλ ) )
        // λm = λ1 + atan2(cosφ2⋅sinΔλ, cosφ1 + cosφ2⋅cosΔλ)
        // midpoint is sum of vectors to two points: mathforum.org/library/drmath/view/51822.html

        const φ1 = this.toRadians(start.lat);
        const λ1 = this.toRadians(start.lng);
        const φ2 = this.toRadians(dest.lat);
        const Δλ = this.toRadians(dest.lng - start.lng);

        // get cartesian coordinates for the two points
        const A = { x: Math.cos(φ1), y: 0, z: Math.sin(φ1) }; // place point A on prime meridian y=0
        const B = { x: Math.cos(φ2) * Math.cos(Δλ), y: Math.cos(φ2) * Math.sin(Δλ), z: Math.sin(φ2) };

        // vector to midpoint is sum of vectors to two points (no need to normalise)
        const C = { x: A.x + B.x, y: A.y + B.y, z: A.z + B.z };

        const φm = Math.atan2(C.z, Math.sqrt(C.x * C.x + C.y * C.y));
        const λm = λ1 + Math.atan2(C.y, C.x);

        return new L.LatLng(this.toDegrees(φm), this.toDegrees(λm));
    }
}
