import L from "leaflet";
import "../src/index";

import "jest";

describe("Object creation", function () {
    it("Classes", function () {
        const geodesic: L.Geodesic = new L.Geodesic();
        const circle: L.GeodesicCircle = new L.GeodesicCircle();
        expect(geodesic).toBeInstanceOf(L.Geodesic);
        expect(circle).toBeInstanceOf(L.GeodesicCircle);
    });

    it("Functions", function () {
        const geodesic: L.Geodesic = L.geodesic();
        const circle: L.GeodesicCircle = L.geodesiccircle();
        expect(geodesic).toBeInstanceOf(L.Geodesic);
        expect(circle).toBeInstanceOf(L.GeodesicCircle);
    });
});
