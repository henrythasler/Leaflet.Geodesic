import L from "leaflet";
export interface GeodesicOptions extends L.PolylineOptions {
    wrap?: true;
    steps?: 10;
}
export interface WGS84Vector extends L.LatLngLiteral {
    bearing: number;
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
     * Vincenty direct calculation.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
     *
     * @param start starting point and initial bearing (in degrees)
     * @param distance distance from starting point to calculate along given bearing in metres.
     * @return Final point (destination point) and bearing (in degrees)
     */
    direct(start: WGS84Vector, distance: number): WGS84Vector;
}
