import { GeodesicCore, WGS84Vector, GeodesicOptions } from "../src/geodesic-core";
import { expect } from "chai";

import "jest";

let geodesic = new GeodesicCore();

describe("Degree <-> Radians conversion", function () {
    it("toDegrees() - zero", function () {
        let degrees = geodesic.toDegrees(0);
        expect(degrees).to.be.closeTo(0, 0.00001);
    });

    it("toDegrees() - positive radians", function () {
        let degrees = geodesic.toDegrees(Math.PI);
        expect(degrees).to.be.closeTo(180, 0.00001);
    });

    it("toDegrees() - negative radians", function () {
        let degrees = geodesic.toDegrees(-2*Math.PI);
        expect(degrees).to.be.closeTo(-360, 0.00001);
    });


    it("toRadians() - zero", function () {
        let radians = geodesic.toRadians(0);
        expect(radians).to.be.closeTo(0, 0.00001);
    });

    it("toRadians() - positive radians", function () {
        let radians = geodesic.toRadians(180);
        expect(radians).to.be.closeTo(Math.PI, 0.00001);
    });

    it("toRadians() - negative radians", function () {
        let radians = geodesic.toRadians(-360);
        expect(radians).to.be.closeTo(-2*Math.PI, 0.00001);
    });

});