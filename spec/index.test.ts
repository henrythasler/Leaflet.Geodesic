/**
 * @jest-environment jsdom
 */

import L from "leaflet";
import "../src/index";

import { expect } from "chai";

import "jest";

describe("Object creation", function () {
    it("Classes", function () {
        const geodesic:L.Geodesic = new L.Geodesic();
        const greatcircle:L.GreatCircle = new L.GreatCircle();
        expect(geodesic).to.be.instanceOf(L.Geodesic);
        expect(greatcircle).to.be.instanceOf(L.GreatCircle);
    });

    it("Functions", function () {
        const geodesic:L.Geodesic = L.geodesic();
        const greatcircle:L.GreatCircle = L.greatcircle();
        expect(geodesic).to.be.instanceOf(L.Geodesic);
        expect(greatcircle).to.be.instanceOf(L.GreatCircle);
    });    
});
