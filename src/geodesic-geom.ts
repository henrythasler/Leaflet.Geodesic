import L, { geodesic } from "leaflet";
import { GeodesicCore, GeoDistance } from "./geodesic-core"

export class GeodesicGeometry {
    readonly geodesic = new GeodesicCore();

    recursiveMidpoint(start: L.LatLngLiteral, dest: L.LatLngLiteral, iterations: number): L.LatLngLiteral[] {
        let geom: L.LatLngLiteral[] = [start, dest];
        const midpoint = this.geodesic.midpoint(start, dest)

        if (iterations > 0) {
            geom.splice(0, 1, ...this.recursiveMidpoint(start, midpoint, iterations - 1));
            geom.splice(geom.length - 2, 2, ...this.recursiveMidpoint(midpoint, dest, iterations - 1));
        }
        else geom.splice(1, 0, midpoint);

        return geom;
    }

    line(start: L.LatLngLiteral, dest: L.LatLngLiteral): L.LatLngLiteral[] {
        return this.recursiveMidpoint(start, dest, 4);
    }

    multiLineString(latlngs: L.LatLngLiteral[][]): L.LatLngLiteral[][] {
        let multiLineString: L.LatLngLiteral[][] = [];

        latlngs.forEach((linestring) => {
            let segment: L.LatLngLiteral[] = [];
            for (let j = 1; j < linestring.length; j++) {
                segment.splice(segment.length - 1, 1, ...this.line(linestring[j - 1], linestring[j]));
            }
            multiLineString.push(segment);
        })
        return multiLineString;
    }

    lineString(latlngs: L.LatLngLiteral[]): L.LatLngLiteral[] {
        return this.multiLineString([latlngs])[0];
    }

    splitLine(start: L.LatLngLiteral, dest: L.LatLngLiteral): L.LatLngLiteral[][] {
        const dateLineWest = {
            point: { lat: 89, lng: -180 } as L.LatLngLiteral,
            bearing: 180
        };
        const dateLineEast = {
            point: { lat: 89, lng: 180 } as L.LatLngLiteral,
            bearing: 180
        };
        let line: GeoDistance = this.geodesic.inverse(start, dest);
        let intersection: L.LatLngLiteral | null;

        // depending on initial direction, we check for crossing the dateline in western or eastern direction
        if (line.initialBearing > 180) {
            intersection = this.geodesic.intersection(start, line.initialBearing, dateLineWest.point, dateLineWest.bearing);
        }
        else {
            intersection = this.geodesic.intersection(start, line.initialBearing, dateLineEast.point, dateLineEast.bearing);
        }

        if (intersection) {
            let intersectionDistance = this.geodesic.inverse(start, intersection);
            if (intersectionDistance.distance < line.distance) {
                if (intersection.lng < -179.9999) {
                    return [[start, intersection], [{ lat: intersection.lat, lng: intersection.lng + 360 }, dest]];
                }
                else if (intersection.lng > 179.9999) {
                    return [[start, intersection], [{ lat: intersection.lat, lng: intersection.lng - 360 }, dest]];
                }
                return [[start, intersection], [intersection, dest]];
            }
        }
        return [[start, dest]]
    }

    splitMultiLineString(multilinestring: L.LatLngLiteral[][]): L.LatLngLiteral[][] {
        let result: L.LatLngLiteral[][] = [];
        multilinestring.forEach((linestring) => {
            let segment: L.LatLngLiteral[] = [linestring[0]];
            for (let j = 1; j < linestring.length; j++) {
                let split = this.splitLine(linestring[j - 1], linestring[j]);
                if (split.length === 1) {
                    segment.push(linestring[j]);
                }
                else {
                    segment.push(split[0][1]);
                    result.push(segment);
                    segment = split[1];
                }
            }
            result.push(segment);
        });
        return result;
    }
}
