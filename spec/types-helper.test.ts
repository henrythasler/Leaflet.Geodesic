import { instanceOfLatLngExpression, latlngExpressiontoLatLng, latlngExpressionArraytoLatLngArray } from "../src/types-helper";

import "jest";
import L from "leaflet";

import { closeToDigits_5 } from "./test-toolbox";

const Berlin: L.LatLngLiteral = { lat: 52.5, lng: 13.35 };
const MontBlanc: L.LatLngLiteral = { lat: 45.832778, lng: 6.865, alt: 4807 };

describe("instanceOf-Functions", function () {
    it("instanceOfLatLngExpression", function () {
        expect(instanceOfLatLngExpression(new L.LatLng(Berlin.lat, Berlin.lng))).toBeTrue();
        expect(instanceOfLatLngExpression(Berlin)).toBeTrue();
        expect(instanceOfLatLngExpression(MontBlanc)).toBeTrue();
        expect(instanceOfLatLngExpression([Berlin.lat, Berlin.lng])).toBeTrue();
        expect(instanceOfLatLngExpression([MontBlanc.lat, MontBlanc.lng, MontBlanc.alt])).toBeTrue();
        expect(instanceOfLatLngExpression(new L.Point(Berlin.lat, Berlin.lng))).toBeFalse();
        expect(instanceOfLatLngExpression({ some: "object", num: 33 })).toBeFalse();
    });
});

describe("latlngExpressiontoLatLng", function () {
    it("LatLng-Class", function () {
        const point = latlngExpressiontoLatLng(new L.LatLng(Berlin.lat, Berlin.lng));
        expect(point).toBeInstanceOf(L.LatLng);
        expect(point.lat).toBeCloseTo(Berlin.lat, closeToDigits_5);
        expect(point.lng).toBeCloseTo(Berlin.lng, closeToDigits_5);
    });

    it("LatLng-Array", function () {
        const point = latlngExpressiontoLatLng([Berlin.lat, Berlin.lng]);
        expect(point).toBeInstanceOf(L.LatLng);
        expect(point.lat).toBeCloseTo(Berlin.lat, closeToDigits_5);
        expect(point.lng).toBeCloseTo(Berlin.lng, closeToDigits_5);
    });

    it("LatLng-Array with alt", function () {
        const point = latlngExpressiontoLatLng([MontBlanc.lat, MontBlanc.lng, MontBlanc.alt]);
        expect(point).toBeInstanceOf(L.LatLng);
        expect(point.lat).toBeCloseTo(MontBlanc.lat, closeToDigits_5);
        expect(point.lng).toBeCloseTo(MontBlanc.lng, closeToDigits_5);
        expect(point.alt).toBeCloseTo(MontBlanc.alt!, closeToDigits_5);
    });    

    it("LatLngLiteral", function () {
        const point = latlngExpressiontoLatLng(Berlin);
        expect(point).toBeInstanceOf(L.LatLng);
        expect(point.lat).toBeCloseTo(Berlin.lat, closeToDigits_5);
        expect(point.lng).toBeCloseTo(Berlin.lng, closeToDigits_5);
    });

    it("LatLngLiteral with alt", function () {
        const point = latlngExpressiontoLatLng(MontBlanc);
        expect(point).toBeInstanceOf(L.LatLng);
        expect(point.lat).toBeCloseTo(MontBlanc.lat, closeToDigits_5);
        expect(point.lng).toBeCloseTo(MontBlanc.lng, closeToDigits_5);
        expect(point.alt).toBeCloseTo(MontBlanc.alt!, closeToDigits_5);
    });    

    it("unknown Object (string instead of number)", function () {
        expect(() => latlngExpressiontoLatLng({ lat: Berlin.lat, lng: `${Berlin.lng}` } as any)).toThrow(/Unknown object found/);
    });
});


describe("latlngExpressionArraytoLatLngArray", function () {

    function checkLatLng(latlng: L.LatLng[][], n: number, m: number, fixture: L.LatLngLiteral): void {
        expect(latlng).toHaveLength(n);
        expect(latlng).toBeInstanceOf(Array);
        latlng.forEach((items) => {
            expect(items).toHaveLength(m);
            items.forEach((point) => {
                expect(point).toBeInstanceOf(L.LatLng);
                expect(point.lat).toBeCloseTo(fixture.lat, closeToDigits_5);
                expect(point.lng).toBeCloseTo(fixture.lng, closeToDigits_5);
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
        expect(() => latlngExpressionArraytoLatLngArray([{ lat: Berlin.lat, lng: "matafokka" } as any])).toThrow(/Unknown object found/);
    });

    it("1D-Array - unknown Object (object instead of array)", function () {
        expect(() => latlngExpressionArraytoLatLngArray({ lat: Berlin.lat, lng: Berlin.lng } as any)).toThrow(/Unknown object found/);
    });

    it("2D-Array - unknown Object (string instead of number)", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as L.LatLngExpression[]).fill({ lat: Berlin.lat, lng: `${Berlin.lng}` } as any));
        expect(() => latlngExpressionArraytoLatLngArray(input)).toThrow(/Unknown object found/);
    });

});
