/**
 * @jest-environment jsdom
 */

import L from "leaflet";
import "../src/index";

import { expect } from "chai";

import "jest";

describe("Object creation", function () {
    it("Classes", function () {
        const geodesic: L.Geodesic = new L.Geodesic();
        const circle: L.GeodesicCircle = new L.GeodesicCircle();
        expect(geodesic).to.be.instanceOf(L.Geodesic);
        expect(circle).to.be.instanceOf(L.GeodesicCircle);
    });

    it("Functions", function () {
        const geodesic: L.Geodesic = L.geodesic();
        const circle: L.GeodesicCircle = L.geodesiccircle();
        expect(geodesic).to.be.instanceOf(L.Geodesic);
        expect(circle).to.be.instanceOf(L.GeodesicCircle);
    });
});
