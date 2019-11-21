/**
 * @jest-environment jsdom
 */

import { latlngExpressiontoLiteral, instanceOfLatLngExpression, latlngExpressionArraytoLiteralArray, latlngExpressiontoLatLng } from "../src/types-helper";
import { expect } from "chai";

import "jest";
import L from "leaflet";

const Berlin: L.LatLngLiteral = { lat: 52.5, lng: 13.35 };
const eps = 0.000001;

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


describe("latlngExpressiontoLiteral", function () {
    it("LatLng-Class", function () {
        const point: L.LatLngLiteral = latlngExpressiontoLiteral(new L.LatLng(Berlin.lat, Berlin.lng));
        expect(point).to.be.an("object");
        expect(point).to.include.all.keys("lat", "lng");
        expect(point.lat).to.be.closeTo(Berlin.lat, eps);
        expect(point.lng).to.be.closeTo(Berlin.lng, eps);
    });

    it("LatLng-Array", function () {
        const point: L.LatLngLiteral = latlngExpressiontoLiteral([Berlin.lat, Berlin.lng]);
        expect(point).to.be.an("object");
        expect(point).to.include.all.keys("lat", "lng");
        expect(point.lat).to.be.closeTo(Berlin.lat, eps);
        expect(point.lng).to.be.closeTo(Berlin.lng, eps);
    });

    it("LatLngLiteral", function () {
        const point: L.LatLngLiteral = latlngExpressiontoLiteral(Berlin);
        expect(point).to.be.an("object");
        expect(point).to.include.all.keys("lat", "lng");
        expect(point.lat).to.be.closeTo(Berlin.lat, eps);
        expect(point.lng).to.be.closeTo(Berlin.lng, eps);
    });

    it("unknown Object (string instead of number)", function () {
        try {
            latlngExpressiontoLiteral({lat: Berlin.lat, lng: `${Berlin.lng}`} as any);
        } catch (e) {
            expect(e).to.be.an("Error");
            expect(e.message).to.have.match(/Unknown object found/);            
        }
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
        try {
            latlngExpressiontoLatLng({lat: Berlin.lat, lng: `${Berlin.lng}`} as any);
        } catch (e) {
            expect(e).to.be.an("Error");
            expect(e.message).to.have.match(/Unknown object found/);            
        }
    });    
});


describe("latlngExpressionArraytoLiteralArray", function () {

    function checkLiteral(literal: L.LatLngLiteral[][], n: number, m:number, fixture:L.LatLngLiteral): void {
        expect(literal).to.be.length(n);
        expect(literal).to.be.an("array");
        literal.forEach((items) => {
            expect(items).to.be.length(m);
            items.forEach((point) => {
                expect(point).to.be.an("object");
                expect(point).to.include.all.keys("lat", "lng");
                expect(point.lat).to.be.closeTo(fixture.lat, eps);
                expect(point.lng).to.be.closeTo(fixture.lng, eps);
            })
        });
    }

    it("1D-Array - 1 Point - LatLng-Class", function () {
        const n = 1, m = 1;
        const literal = latlngExpressionArraytoLiteralArray([new L.LatLng(Berlin.lat, Berlin.lng)]);
        checkLiteral(literal, n, m, Berlin)
    });

    it("1D-Array - Multipoint - LatLng-Class", function () {
        const n = 1, m = 5;
        const literal = latlngExpressionArraytoLiteralArray((new Array(m) as L.LatLngExpression[]).fill(new L.LatLng(Berlin.lat, Berlin.lng)));
        checkLiteral(literal, n, m, Berlin)
    });

    it("1D-Array - 1 Point - LatLng-Literal", function () {
        const n = 1, m = 1;
        const literal = latlngExpressionArraytoLiteralArray([Berlin]);
        checkLiteral(literal, n, m, Berlin);
    });

    it("1D-Array - Multipoint - LatLng-Literal", function () {
        const n = 1, m = 5;
        const literal = latlngExpressionArraytoLiteralArray((new Array(m) as L.LatLngExpression[]).fill(Berlin));
        checkLiteral(literal, n, m, Berlin);

    });

    it("1D-Array - 1 Point - LatLng-Tuple", function () {
        const n = 1, m = 1;
        const literal = latlngExpressionArraytoLiteralArray([[Berlin.lat, Berlin.lng]]);
        checkLiteral(literal, n, m, Berlin);
    });

    it("1D-Array - Multipoint - LatLng-Tuple", function () {
        const n = 1, m = 5;
        const literal = latlngExpressionArraytoLiteralArray((new Array(m) as L.LatLngExpression[]).fill([Berlin.lat, Berlin.lng]));
        checkLiteral(literal, n, m, Berlin);
    });

    it("2D-Array - LatLng-Class", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as L.LatLngExpression[]).fill(new L.LatLng(Berlin.lat, Berlin.lng)));
        const literal = latlngExpressionArraytoLiteralArray(input);
        checkLiteral(literal, n, m, Berlin);
    });

    it("2D-Array - LatLng-Literal", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as L.LatLngExpression[]).fill(Berlin));
        const literal = latlngExpressionArraytoLiteralArray(input);
        checkLiteral(literal, n, m, Berlin);
    });

    it("2D-Array - LatLng-Tuple", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as L.LatLngExpression[]).fill([Berlin.lat, Berlin.lng]));
        const literal = latlngExpressionArraytoLiteralArray(input);
        checkLiteral(literal, n, m, Berlin);
    });    

    it("1D-Array - unknown Object (string instead of number)", function () {
        try {
            latlngExpressionArraytoLiteralArray([{lat: Berlin.lat, lng: `${Berlin.lng}`} as any]);
        } catch (e) {
            expect(e).to.be.an("Error");
            expect(e.message).to.have.match(/Unknown object found/);            
        }
    });

    it("2D-Array - unknown Object (string instead of number)", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as L.LatLngExpression[]).fill({lat: Berlin.lat, lng: `${Berlin.lng}`} as any));
        try {
            latlngExpressionArraytoLiteralArray(input);
        } catch (e) {
            expect(e).to.be.an("Error");
            expect(e.message).to.have.match(/Unknown object found/);            
        }
    });

});