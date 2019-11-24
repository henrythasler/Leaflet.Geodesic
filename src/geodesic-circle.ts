import L from "leaflet";
import { GeodesicGeometry, Statistics } from "./geodesic-geom"
import { GeodesicOptions } from "./geodesic-core"
import { latlngExpressiontoLatLng } from "./types-helper";

/**
 * Can be used to create a geodesic circle based on L.Polyline
 */
export class GeodesicCircleClass extends L.Polyline {
    defaultOptions: GeodesicOptions = { wrap: true, steps: 24, fill: true, noClip: true };
    readonly geom: GeodesicGeometry;
    center: L.LatLng;
    radius: number;
    statistics: Statistics = {} as any;

    constructor(center?: L.LatLngExpression, options?: GeodesicOptions) {
        super([], options);
        L.Util.setOptions(this, { ...this.defaultOptions, ...options });

        // merge/set options
        const extendedOptions = this.options as GeodesicOptions;
        this.radius = (extendedOptions.radius === undefined) ? 1000 * 1000 : extendedOptions.radius;
        this.center = (center === undefined) ? new L.LatLng(0, 0) : latlngExpressiontoLatLng(center);

        this.geom = new GeodesicGeometry(this.options);

        // update the geometry
        this.update();
    }

    /**
     * Updates the geometry and re-calculates some statistics
     */
    private update(): void {
        const latlngs = this.geom.circle(this.center, this.radius);

        this.statistics = this.geom.updateStatistics([[this.center]], [latlngs]);
        // circumfence must be re-calculated from geodesic 
        this.statistics.totalDistance = this.geom.multilineDistance([latlngs]).reduce((x, y) => x + y, 0);

        this.setLatLngs(latlngs);
    }

    /**
     * Calculate the distance between the current center and an arbitrary position.
     * @param latlng geo-position to calculate distance to
     * @return distance in meters
     */
    distanceTo(latlng: L.LatLngExpression): number {
        const dest = latlngExpressiontoLatLng(latlng);
        return this.geom.distance(this.center, dest);
    }

    /**
     * Set a new center for the geodesic circle and update the geometry.
     * @param latlng new geo-position for the center
     */
    setLatLng(latlng: L.LatLngExpression): void {
        this.center = latlngExpressiontoLatLng(latlng);
        this.update();
    }

    /**
     * set a new radius for the geodesic circle and update the geometry
     * @param radius new radius in meters
     */
    setRadius(radius: number): void {
        this.radius = radius;
        this.update();
    }
}
