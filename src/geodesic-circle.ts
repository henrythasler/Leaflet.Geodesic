import L from "leaflet";
import { GeodesicGeometry, Statistics } from "./geodesic-geom"
import { GeodesicOptions } from "./geodesic-core"
import { latlngExpressiontoLiteral } from "./types-helper";

export class GeodesicCircleClass extends L.Layer {
    polyline: L.Polyline;
    options: GeodesicOptions = { wrap: true, steps: 24, fill: true, noClip: true };
    private geom: GeodesicGeometry;
    center: L.LatLngLiteral = { lat: 0, lng: 0 };
    radius: number = 0;
    statistics: Statistics = {} as any;

    constructor(center?: L.LatLngExpression, options?: GeodesicOptions) {
        super();
        this.options = { ...this.options, ...options };  // noClip prevents broken fills

        this.geom = new GeodesicGeometry(this.options);

        this.radius = (this.options.radius === undefined) ? 1000 * 1000 : this.options.radius;

        if (center) {
            this.center = latlngExpressiontoLiteral(center);
            let latlngs = this.geom.circle(this.center, this.radius);
            this.statistics = this.geom.updateStatistics([[this.center]], [latlngs]);
            // circumfence must be re-calculated from geodesic 
            this.statistics.totalDistance = this.geom.multilineDistance([latlngs]).reduce((x, y) => x + y, 0);

            this.polyline = new L.Polyline(latlngs, this.options);
        }
        else {
            this.polyline = new L.Polyline([], this.options);
        }
    }

    onAdd(map: L.Map): this {
        this.polyline.addTo(map);
        return this;
    }

    onRemove(): this {
        this.polyline.remove();
        return this;
    }

    private update(): void {
        const latlngs = this.geom.circle(this.center, this.radius);

        this.statistics = this.geom.updateStatistics([[this.center]], [latlngs]);
        // circumfence must be re-calculated from geodesic 
        this.statistics.totalDistance = this.geom.multilineDistance([latlngs]).reduce((x, y) => x + y, 0);

        this.polyline.setLatLngs(latlngs);
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