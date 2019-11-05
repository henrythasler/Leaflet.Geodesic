import L from "leaflet";
import { GeodesicLine } from './geodesic-line';
import { GeodesicCircleClass } from './geodesic-circle';

declare module "leaflet" {
        type Geodesic = GeodesicLine;
        let Geodesic: typeof GeodesicLine;
        let geodesic: (...args: ConstructorParameters<typeof GeodesicLine>) => GeodesicLine;

        type GreatCircle = GeodesicCircleClass;
        let GeodesicCircle: typeof GeodesicCircleClass;
        let geodesiccircle: (...args: ConstructorParameters<typeof GeodesicCircleClass>) => GeodesicCircleClass;
}

L.Geodesic = GeodesicLine;
L.geodesic = (...args: ConstructorParameters<typeof GeodesicLine>) => new GeodesicLine(...args);

L.GeodesicCircle = GeodesicCircleClass;
L.geodesiccircle = (...args: ConstructorParameters<typeof GeodesicCircleClass>) => new GeodesicCircleClass(...args);

export * from './geodesic-line';
export * from './geodesic-circle';
