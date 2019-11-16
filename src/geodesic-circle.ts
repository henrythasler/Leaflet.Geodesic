import L from "leaflet";
import { GeodesicGeometry, Statistics } from "./geodesic-geom"
import { GeodesicOptions } from "./geodesic-core"
import { latlngExpressiontoLiteral } from "./types-helper";

export class GeodesicCircleClass extends L.Polyline {
    defaultOptions: GeodesicOptions = { wrap: true, steps: 24, fill: true, noClip: true};
    private geom: GeodesicGeometry;
    center: L.LatLngLiteral = { lat: 0, lng: 0 };
    radius: number = 1000 * 1000;
    statistics: Statistics = {} as any;

    constructor(center?: L.LatLngExpression, options?: GeodesicOptions) {
        super([], options);
        L.Util.setOptions(this, {...this.defaultOptions, ...options});

        const extendedOptions = this.options as GeodesicOptions;
        this.radius = (extendedOptions.radius === undefined) ? 1000 * 1000 : extendedOptions.radius;

        this.geom = new GeodesicGeometry(this.options);

        if (center) {
            this.center = latlngExpressiontoLiteral(center);
            let latlngs = this.geom.circle(this.center, this.radius);
            this.statistics = this.geom.updateStatistics([[this.center]], [latlngs]);
            // circumfence must be re-calculated from geodesic 
            this.statistics.totalDistance = this.geom.multilineDistance([latlngs]).reduce((x, y) => x + y, 0);
            this.setLatLngs(latlngs);
        }
    }

    private update(): void {
        const latlngs = this.geom.circle(this.center, this.radius);

        this.statistics = this.geom.updateStatistics([[this.center]], [latlngs]);
        // circumfence must be re-calculated from geodesic 
        this.statistics.totalDistance = this.geom.multilineDistance([latlngs]).reduce((x, y) => x + y, 0);

        this.setLatLngs(latlngs);
    }

    distanceTo(latlng: L.LatLngExpression): number {
        const dest = latlngExpressiontoLiteral(latlng);
        return this.geom.distance(this.center, dest);
    }

    setLatLng(latlng: L.LatLngExpression): void {
        this.center = latlngExpressiontoLiteral(latlng);
        this.update();
    }

    setRadius(radius: number): void {
        this.radius = radius;
        this.update();
    }
}