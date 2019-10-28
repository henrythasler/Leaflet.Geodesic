import L from "leaflet";
import { GeodesicCore } from "./geodesic-core"

export class GeodesicGeometry {
    readonly geodesic = new GeodesicCore();

    line(start: L.LatLngLiteral, dest: L.LatLngLiteral, iterations: number): L.LatLngLiteral[] {
        let geom: L.LatLngLiteral[] = [start, dest];
        const midpoint = this.geodesic.midpoint(start, dest)

        if (iterations > 0) {
            geom.splice(0, 1, ...this.line(start, midpoint, iterations - 1));
            geom.splice(geom.length - 2, 2, ...this.line(midpoint, dest, iterations - 1));
        }
        else geom.splice(1, 0, midpoint);

        return geom;
    }
}
