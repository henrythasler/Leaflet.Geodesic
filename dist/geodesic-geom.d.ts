import L from "leaflet";
import { GeodesicCore } from "./geodesic-core";
export declare class GeodesicGeometry {
    readonly geodesic: GeodesicCore;
    recursiveMidpoint(start: L.LatLngLiteral, dest: L.LatLngLiteral, iterations: number): L.LatLngLiteral[];
    line(start: L.LatLngLiteral, dest: L.LatLngLiteral): L.LatLngLiteral[];
    multiLineString(latlngs: L.LatLngLiteral[][]): L.LatLngLiteral[][];
    lineString(latlngs: L.LatLngLiteral[]): L.LatLngLiteral[];
    splitLine(start: L.LatLngLiteral, dest: L.LatLngLiteral): L.LatLngLiteral[][];
    splitMultiLineString(multilinestring: L.LatLngLiteral[][]): L.LatLngLiteral[][];
}
