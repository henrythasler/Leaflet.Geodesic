/**
 * @jest-environment jsdom
 */

import { instanceOfLatLngExpression, latlngExpressiontoLatLng, latlngExpressionArraytoLatLngArray } from "../src/types-helper";
import { expect } from "chai";

import "jest";
import L from "leaflet";

import { eps } from "./test-toolbox";

const Berlin: L.LatLngLiteral = { lat: 52.5, lng: 13.35 };

describe("instanceOf-Functions", function () {
    it("instanceOfLatLngExpression", function () {
        expect(instanceOfLatLngExpression(new L.LatLng(Berlin.lat, Berlin.lng))).to.be.true;
        expect(instanceOfLatLngExpression(Berlin)).to.be.true;
        expect(instanceOfLatLngExpression([Berlin.lat, Berlin.lng])).to.be.true;
        expect(instanceOfLatLngExpression(new L.Point(Berlin.lat, Berlin.lng))).to.be.false;
        expect(instanceOfLatLngExpression({ some: "object", num: 33 })).to.be.false;
        // expect(instanceOfLatLngExpression([{some:"object", num: 33}])).to.be.true;
    });
});

describe("latlngExpressiontoLatLng", function () {
    it("LatLng-Class", function () {
        const point = latlngExpressiontoLatLng(new L.LatLng(Berlin.lat, Berlin.lng));
        expect(point).to.be.instanceOf(L.LatLng);
        expect(point.lat).to.be.closeTo(Berlin.lat, eps);
        expect(point.lng).to.be.closeTo(Berlin.lng, eps);
    });

    it("LatLng-Array", function () {
        const point = latlngExpressiontoLatLng([Berlin.lat, Berlin.lng]);
        expect(point).to.be.instanceOf(L.LatLng);
        expect(point.lat).to.be.closeTo(Berlin.lat, eps);
        expect(point.lng).to.be.closeTo(Berlin.lng, eps);
    });

    it("LatLngLiteral", function () {
        const point = latlngExpressiontoLatLng(Berlin);
        expect(point).to.be.instanceOf(L.LatLng);
        expect(point.lat).to.be.closeTo(Berlin.lat, eps);
        expect(point.lng).to.be.closeTo(Berlin.lng, eps);
    });

    it("unknown Object (string instead of number)", function () {
        expect(() => latlngExpressiontoLatLng({ lat: Berlin.lat, lng: `${Berlin.lng}` } as any)).to.throw(/Unknown object found/);
    });
});


describe("latlngExpressionArraytoLatLngArray", function () {

    function checkLatLng(latlng: L.LatLng[][], n: number, m: number, fixture: L.LatLngLiteral): void {
        expect(latlng).to.be.length(n);
        expect(latlng).to.be.an("array");
        latlng.forEach((items) => {
            expect(items).to.be.length(m);
            items.forEach((point) => {
                expect(point).to.be.instanceOf(L.LatLng);
                expect(point.lat).to.be.closeTo(fixture.lat, eps);
                expect(point.lng).to.be.closeTo(fixture.lng, eps);
            })
        });
    }

    it("1D-Array - 1 Point - LatLng-Class", function () {
        const n = 1, m = 1;
        const latlng = latlngExpressionArraytoLatLngArray([new L.LatLng(Berlin.lat, Berlin.lng)]);
        checkLatLng(latlng, n, m, Berlin)
    });

    it("1D-Array - Multipoint - LatLng-Class", function () {
        const n = 1, m = 5;
        const latlng = latlngExpressionArraytoLatLngArray((new Array(m) as L.LatLngExpression[]).fill(new L.LatLng(Berlin.lat, Berlin.lng)));
        checkLatLng(latlng, n, m, Berlin)
    });

    it("1D-Array - 1 Point - LatLng-Literal", function () {
        const n = 1, m = 1;
        const latlng = latlngExpressionArraytoLatLngArray([Berlin]);
        checkLatLng(latlng, n, m, Berlin);
    });

    it("1D-Array - Multipoint - LatLng-Literal", function () {
        const n = 1, m = 5;
        const latlng = latlngExpressionArraytoLatLngArray((new Array(m) as L.LatLngExpression[]).fill(Berlin));
        checkLatLng(latlng, n, m, Berlin);

    });

    it("1D-Array - 1 Point - LatLng-Tuple", function () {
        const n = 1, m = 1;
        const latlng = latlngExpressionArraytoLatLngArray([[Berlin.lat, Berlin.lng]]);
        checkLatLng(latlng, n, m, Berlin);
    });

    it("1D-Array - Multipoint - LatLng-Tuple", function () {
        const n = 1, m = 5;
        const latlng = latlngExpressionArraytoLatLngArray((new Array(m) as L.LatLngExpression[]).fill([Berlin.lat, Berlin.lng]));
        checkLatLng(latlng, n, m, Berlin);
    });

    it("2D-Array - LatLng-Class", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as L.LatLngExpression[]).fill(new L.LatLng(Berlin.lat, Berlin.lng)));
        const latlng = latlngExpressionArraytoLatLngArray(input);
        checkLatLng(latlng, n, m, Berlin);
    });

    it("2D-Array - LatLng-Literal", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as L.LatLngExpression[]).fill(Berlin));
        const latlng = latlngExpressionArraytoLatLngArray(input);
        checkLatLng(latlng, n, m, Berlin);
    });

    it("2D-Array - LatLng-Tuple", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as L.LatLngExpression[]).fill([Berlin.lat, Berlin.lng]));
        const latlng = latlngExpressionArraytoLatLngArray(input);
        checkLatLng(latlng, n, m, Berlin);
    });

    it("1D-Array - unknown Object (string instead of number)", function () {
        expect(() => latlngExpressionArraytoLatLngArray([{ lat: Berlin.lat, lng: "matafokka" } as any])).to.throw(/Unknown object found/);
    });

    it("1D-Array - unknown Object (object instead of array)", function () {
        expect(() => latlngExpressionArraytoLatLngArray({ lat: Berlin.lat, lng: Berlin.lng } as any)).to.throw(/Unknown object found/);
    });

    it("2D-Array - unknown Object (string instead of number)", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as L.LatLngExpression[]).fill({ lat: Berlin.lat, lng: `${Berlin.lng}` } as any));
        expect(() => latlngExpressionArraytoLatLngArray(input)).to.throw(/Unknown object found/);
    });

});
