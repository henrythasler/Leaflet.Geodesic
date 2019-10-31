import L from "leaflet";
import { GeodesicCore } from "./geodesic-core"

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
        return this.recursiveMidpoint(start, dest, 3);
    }

    multilinestring(latlngs: L.LatLngLiteral[][]): L.LatLngLiteral[][] {
        let geodesic: L.LatLngLiteral[][] = [];

        latlngs.forEach((linestring) => {
            let segment: L.LatLngLiteral[] = [];
            for (let j = 1; j < linestring.length; j++) {
                segment.splice(segment.length - 1, 1, ...this.line(linestring[j - 1], linestring[j]));
            }
            geodesic.push(segment);
        })
        return geodesic;
    }
    
    linestring(latlngs: L.LatLngLiteral[]): L.LatLngLiteral[] {
        return this.multilinestring([latlngs])[0];
    }

}
