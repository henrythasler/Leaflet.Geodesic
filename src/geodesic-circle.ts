import * as L from "leaflet";
import { GeodesicGeometry, Statistics } from "./geodesic-geom"
import {DEFAULT_GEODESIC_OPTIONS, GeodesicOptions, RawGeodesicOptions} from "./geodesic-core"
import { latlngExpressiontoLatLng } from "./types-helper";

/**
 * Can be used to create a geodesic circle based on L.Polyline
 */
export class GeodesicCircleClass extends L.Polyline {
    readonly geom: GeodesicGeometry;
    center: L.LatLng;
    radius: number;
    statistics: Statistics = {} as any;

    constructor(center?: L.LatLngExpression, options?: Partial<GeodesicOptions>) {
        super([], options);

        L.Util.setOptions(this, {...DEFAULT_GEODESIC_OPTIONS, wrap: true, steps: 24, fill: true, noClip: true, ...options});

        // merge/set options
        const extendedOptions = this.options as GeodesicOptions;
        this.radius = (extendedOptions.radius === undefined) ? 1000 * 1000 : extendedOptions.radius;
        this.center = (center === undefined) ? new L.LatLng(0, 0) : latlngExpressiontoLatLng(center);

        this.geom = new GeodesicGeometry(this.options as RawGeodesicOptions, true);

        // update the geometry
        this.update();
    }

    /**
     * Updates the geometry and re-calculates some statistics
     * @param updateStats -
     */
    private update(updateStats = (this.options as RawGeodesicOptions).updateStatisticsAfterRedrawing): void {
        const circle = this.geom.circle(this.center, this.radius);

        if (updateStats) {
            this.statistics = this.geom.updateStatistics([[this.center]], [circle]);
        }

        // circumference must be re-calculated from geodesic
        this.statistics.totalDistance = this.geom.multilineDistance([circle]).reduce((x, y) => x + y, 0);

        if ((this.options as GeodesicOptions).wrap) {
            const split = this.geom.splitCircle(circle);
            super.setLatLngs(split);
        }
        else {
            super.setLatLngs(circle);
        }
    }

    updateStatistics() {
        this.update(true);
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
     * Set a new center for the geodesic circle and update the geometry. Radius may also be set.
     * @param center the new center
     * @param radius the new radius
     */
    setLatLng(center: L.LatLngExpression, radius?: number): void {
        this.center = latlngExpressiontoLatLng(center);
        this.radius = radius ? radius : this.radius;
        this.update();
    }

    /**
     * Set a new radius for the geodesic circle and update the geometry. Center may also be set.
     * @param radius the new radius
     * @param center the new center
     */
    setRadius(radius: number, center?: L.LatLngExpression): void {
        this.radius = radius;
        this.center = center ? latlngExpressiontoLatLng(center) : this.center;
        this.update();
    }
}
