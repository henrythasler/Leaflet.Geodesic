/**
 * @jest-environment jsdom
 */

import { latlngExpressiontoLiteral } from "../src/types-helper";
import { expect } from "chai";

import "jest";
import {LatLng} from "leaflet";

const Berlin: L.LatLngLiteral = { lat: 52.5, lng: 13.35 };
const eps = 0.000001;

describe("latlngExpressiontoLiteral", function () {
    it("LatLng-Class", function () {
        const point:L.LatLngLiteral = latlngExpressiontoLiteral(new LatLng(48, 11));
        expect(point).to.be.an("object");
        expect(point).to.include.all.keys("lat", "lng");
        expect(point.lat).to.be.closeTo(48, eps);
        expect(point.lng).to.be.closeTo(11, eps);
    });

    it("LatLng-Array", function () {
        const point:L.LatLngLiteral = latlngExpressiontoLiteral([Berlin.lat, Berlin.lng]);
        expect(point).to.be.an("object");
        expect(point).to.include.all.keys("lat", "lng");
        expect(point.lat).to.be.closeTo(Berlin.lat, eps);
        expect(point.lng).to.be.closeTo(Berlin.lng, eps);
    });

    it("LatLngLiteral", function () {
        const point:L.LatLngLiteral = latlngExpressiontoLiteral(Berlin);
        expect(point).to.be.an("object");
        expect(point).to.include.all.keys("lat", "lng");
        expect(point.lat).to.be.closeTo(Berlin.lat, eps);
        expect(point.lng).to.be.closeTo(Berlin.lng, eps);
    });   
});
