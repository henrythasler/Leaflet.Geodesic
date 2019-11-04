import L from "leaflet";
import { GeodesicGeometry } from "./geodesic-geom"
import { GeodesicOptions } from "./geodesic-core"
import { latlngExpressiontoLiteral } from "../src/types-helper";

export class GreatCircleClass extends L.Layer {
    polygon: L.Polygon;
    options: GeodesicOptions = { split: true, steps: 3 };
    private geom: GeodesicGeometry;
    center: L.LatLngLiteral = {lat: 0, lng: 0};
    radius: number = 0;

    constructor(center?: L.LatLngExpression, options?: GeodesicOptions) {
        super();
        this.options = { ...this.options, ...options };

        // allow "wrap" for compatibility-reasons with the (old) javascript-implementation. Is mapped to "split".
        if ("wrap" in this.options) {
            this.options.split = this.options.wrap;
            delete this.options.wrap;
        }

        this.geom = new GeodesicGeometry(this.options);

        this.radius = (this.options.radius === undefined) ? 1000 * 1000 : this.options.radius;

        if (center ) {
            this.center = latlngExpressiontoLiteral(center);
            let latlngs = this.geom.circle(this.center, this.radius);
            this.polygon = new L.Polygon(latlngs, this.options);
        }
        else {
            this.polygon = new L.Polygon([], this.options);
        }
    }

    onAdd(map: L.Map): this {
        this.polygon.addTo(map);
        return this;
    }

    onRemove(): this {
        this.polygon.remove();
        return this;
    }

    private update():void {
        const latlngs = this.geom.circle(this.center, this.radius);
        this.polygon.setLatLngs(latlngs);
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