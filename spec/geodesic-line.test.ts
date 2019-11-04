/**
 * @jest-environment jsdom
 */

import { GeodesicLine } from "../src/geodesic-line";
import { expect } from "chai";

import "jest";

const Berlin: L.LatLngLiteral = { lat: 52.5, lng: 13.35 };
const Seattle: L.LatLngLiteral = { lat: 47.56, lng: -122.33 };

describe("Main functionality", function () {
    it("Create class w/o any parameters", function () {
        const line = new GeodesicLine();
        expect(line.options).to.be.deep.equal({ split: true, steps: 3 });
    });

    it("Create class with parameters", function () {
        const line = new GeodesicLine([Berlin, Seattle], { steps: 0 });
        expect(line.options).to.be.deep.equal({ split: true, steps: 0 });
    });

    it("Create class with parameters", function () {
        const line = new GeodesicLine([Berlin, Seattle], { split: false });
        expect(line.options).to.be.deep.equal({ split: false, steps: 3 });
    });

    it("Create class with legacy parameter", function () {
        const line = new GeodesicLine([Berlin, Seattle], { wrap: false });
        expect(line.options).to.be.deep.equal({ split: false, steps: 3 });
    });
});