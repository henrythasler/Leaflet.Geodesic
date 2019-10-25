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
export * from './geodesic-line';
export * from './great-circle';
