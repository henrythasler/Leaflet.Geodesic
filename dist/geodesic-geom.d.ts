import L from "leaflet";
import { GeodesicCore } from "./geodesic-core";
export declare class GeodesicGeometry {
    readonly geodesic: GeodesicCore;
    recursiveMidpoint(start: L.LatLngLiteral, dest: L.LatLngLiteral, iterations: number): L.LatLngLiteral[];
    line(start: L.LatLngLiteral, dest: L.LatLngLiteral): L.LatLngLiteral[];
    multilinestring(latlngs: L.LatLngLiteral[][]): L.LatLngLiteral[][];
    linestring(latlngs: L.LatLngLiteral[]): L.LatLngLiteral[];
}
