// import { Polyline, PolylineOptions, LatLngExpression } from "leaflet";
import L from "leaflet";
import {LeafletGeodesic} from './leaflet.geodesic';

declare module "leaflet" {
    type Geodesic = LeafletGeodesic;
    let Geodesic: typeof LeafletGeodesic;    
    let geodesic: (...args: ConstructorParameters<typeof LeafletGeodesic>) => LeafletGeodesic;
}

L.Geodesic = LeafletGeodesic;
L.geodesic = (...args: ConstructorParameters<typeof LeafletGeodesic>) => new LeafletGeodesic(...args);
