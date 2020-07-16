import "leaflet";
import { GeodesicLine } from './geodesic-line';
import { GeodesicCircleClass } from './geodesic-circle';

declare module "leaflet" {
    type Geodesic = GeodesicLine;
    let Geodesic: typeof GeodesicLine;
    let geodesic: (...args: ConstructorParameters<typeof GeodesicLine>) => GeodesicLine;

    type GeodesicCircle = GeodesicCircleClass;
    let GeodesicCircle: typeof GeodesicCircleClass;
    let geodesiccircle: (...args: ConstructorParameters<typeof GeodesicCircleClass>) => GeodesicCircleClass;
}

if (typeof window.L !== "undefined") {
    window.L.Geodesic = GeodesicLine;
    window.L.geodesic = (...args: ConstructorParameters<typeof GeodesicLine>) => new GeodesicLine(...args);

    window.L.GeodesicCircle = GeodesicCircleClass;
    window.L.geodesiccircle = (...args: ConstructorParameters<typeof GeodesicCircleClass>) => new GeodesicCircleClass(...args);
}

export * from './geodesic-line';
export * from './geodesic-circle';
