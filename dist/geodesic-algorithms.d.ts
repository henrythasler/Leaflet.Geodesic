import L from "leaflet";
export interface GeodesicOptions extends L.PolylineOptions {
    wrap?: true;
    steps?: 10;
}
