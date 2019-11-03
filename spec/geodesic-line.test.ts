/**
 * @jest-environment jsdom
 */

 import { GeodesicLine } from "../src/geodesic-line";

import { expect } from "chai";

import "jest";

describe("Main functionality", function () {
    it("Create class w/o any parameters", function () {
        const line = new GeodesicLine();
        expect(line.options).to.be.deep.equal({});
        expect(line.polyline).to.be.an("object");
    });
});