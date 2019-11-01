import L from "leaflet";
export interface GeodesicOptions extends L.PolylineOptions {
    wrap?: true;
    steps?: 10;
}
export interface WGS84Vector extends L.LatLngLiteral {
    bearing: number;
}
export interface GeoDistance {
    distance: number;
    initialBearing: number;
    finalBearing: number;
}
export declare class GeodesicCore {
    readonly options: GeodesicOptions;
    readonly ellipsoid: {
        a: number;
        b: number;
        f: number;
    };
    constructor(options?: GeodesicOptions);
    toRadians(degree: number): number;
    toDegrees(radians: number): number;
    /**
     * source: https://github.com/chrisveness/geodesy/blob/master/dms.js
     * @param degrees arbitrary value
     * @return degrees between 0..360
     */
    wrap360(degrees: number): number;
    /**
     * @param degrees arbitrary value
     * @return degrees between -180..+180
     */
    wrap180(degrees: number): number;
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
    direct(start: L.LatLngLiteral, bearing: number, distance: number, maxInterations?: number): WGS84Vector;
    /**
     * Vincenty inverse calculation.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
     *
     * @param start Latitude/longitude of starting point.
     * @param dest Latitude/longitude of destination point.
     * @return Object including distance, initialBearing, finalBearing.
     */
    inverse(start: L.LatLngLiteral, dest: L.LatLngLiteral, maxInterations?: number): GeoDistance;
    /**
     * Returns the point of intersection of two paths defined by position and bearing.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-spherical.js
     *
     * @param firstPos 1st path: position and bearing
     * @param firstBearing
     * @param secondPos 2nd path: position and bearing
     * @param secondBearing
     */
    intersection(firstPos: L.LatLngLiteral, firstBearing: number, secondPos: L.LatLngLiteral, secondBearing: number): L.LatLngLiteral | null;
    midpoint(start: L.LatLngLiteral, dest: L.LatLngLiteral): L.LatLngLiteral;
}
