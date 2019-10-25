import L from "leaflet";
import { GeodesicLine } from './geodesic-line';
import { GreatCircleClass } from './great-circle';

declare module "leaflet" {
        type Geodesic = GeodesicLine;
        let Geodesic: typeof GeodesicLine;
        let geodesic: (...args: ConstructorParameters<typeof GeodesicLine>) => GeodesicLine;

        type GreatCircle = GreatCircleClass;
        let GreatCircle: typeof GreatCircleClass;
        let greatcircle: (...args: ConstructorParameters<typeof GreatCircleClass>) => GreatCircleClass;
}

L.Geodesic = GeodesicLine;
L.geodesic = (...args: ConstructorParameters<typeof GeodesicLine>) => new GeodesicLine(...args);

L.GreatCircle = GreatCircleClass;
L.greatcircle = (...args: ConstructorParameters<typeof GreatCircleClass>) => new GreatCircleClass(...args);

export * from './geodesic-line';
export * from './great-circle';
