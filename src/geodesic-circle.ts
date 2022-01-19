import * as L from "leaflet";
import { GeodesicGeometry, Statistics } from "./geodesic-geom"
import {DEFAULT_GEODESIC_OPTIONS, GeodesicOptions, RawGeodesicOptions} from "./geodesic-core"
import { latlngExpressiontoLatLng } from "./types-helper";

/**
 * Draw geodesic circle based on L.Polyline
 */
export class GeodesicCircleClass extends L.Polyline {
    /** Does the actual geometry calculations */
    readonly geom: GeodesicGeometry;
    /** Current center */
    center: L.LatLng;
    /** Current radius in meters */
    radius: number;
    /** Use this if you need some details about the current geometry */
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
     * @param updateStats If should update statistics
     */
    private update(updateStats = (this.options as RawGeodesicOptions).updateStatisticsAfterRedrawing): void {
        const circle = this.geom.circle(this.center, this.radius);

        if (updateStats) {
            this.statistics = this.geom.updateStatistics([[this.center]], [circle]);
        }

        // Circumference must be re-calculated from geodesic
        this.statistics.totalDistance = this.geom.multilineDistance([circle]).reduce((x, y) => x + y, 0);

        if ((this.options as GeodesicOptions).wrap) {
            const split = this.geom.splitCircle(circle);
            super.setLatLngs(split);
        }
        else {
            super.setLatLngs(circle);
        }
    }

    /**
     * Updates statistics of this line.
     * You should call it only if you've set {@link GeodesicOptions.updateStatisticsAfterRedrawing} to `false`.
     */
    updateStatistics(): this {
        this.update(true);
        return this;
    }

    /**
     * Calculates the distance between the current center and an arbitrary position.
     * @param latlng Geo-position to calculate distance to
     * @return Distance in meters
     */
    distanceTo(latlng: L.LatLngExpression): number {
        const dest = latlngExpressiontoLatLng(latlng);
        return this.geom.distance(this.center, dest);
    }

    /**
     * Sets a new center for the geodesic circle and update the geometry. Radius may also be set.
     * @param center New center
     * @param radius New radius
     */
    setLatLng(center: L.LatLngExpression, radius?: number): this {
        this.center = latlngExpressiontoLatLng(center);
        this.radius = radius ? radius : this.radius;
        this.update();
        return this;
    }

    /**
     * Sets a new radius for the geodesic circle and update the geometry. Center may also be set.
     * @param radius New radius
     * @param center New center
     */
    setRadius(radius: number, center?: L.LatLngExpression): this {
        this.radius = radius;
        this.center = center ? latlngExpressiontoLatLng(center) : this.center;
        this.update();
        return this;
    }
}
