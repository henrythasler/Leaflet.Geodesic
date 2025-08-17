import { instanceOfLatLngExpression, latlngExpressiontoLatLng, latlngExpressionArraytoLatLngArray } from "../src/types-helper";
import { expect } from "chai";

import "jest";
import { LatLng, LatLngLiteral, LatLngExpression, Point } from "leaflet";

import { eps } from "./test-toolbox";

const Berlin: LatLngLiteral = { lat: 52.5, lng: 13.35 };
const MontBlanc: LatLngLiteral = { lat: 45.832778, lng: 6.865, alt: 4807 };

describe("instanceOf-Functions", function () {
    it("instanceOfLatLngExpression", function () {
        expect(instanceOfLatLngExpression(new LatLng(Berlin.lat, Berlin.lng))).to.be.true;
        expect(instanceOfLatLngExpression(Berlin)).to.be.true;
        expect(instanceOfLatLngExpression(MontBlanc)).to.be.true;
        expect(instanceOfLatLngExpression([Berlin.lat, Berlin.lng])).to.be.true;
        expect(instanceOfLatLngExpression([MontBlanc.lat, MontBlanc.lng, MontBlanc.alt])).to.be.true;
        expect(instanceOfLatLngExpression(new Point(Berlin.lat, Berlin.lng))).to.be.false;
        expect(instanceOfLatLngExpression({ some: "object", num: 33 })).to.be.false;
    });
});

describe("latlngExpressiontoLatLng", function () {
    it("LatLng-Class", function () {
        const point = latlngExpressiontoLatLng(new LatLng(Berlin.lat, Berlin.lng));
        expect(point).to.be.instanceOf(LatLng);
        expect(point.lat).to.be.closeTo(Berlin.lat, eps);
        expect(point.lng).to.be.closeTo(Berlin.lng, eps);
    });

    it("LatLng-Array", function () {
        const point = latlngExpressiontoLatLng([Berlin.lat, Berlin.lng]);
        expect(point).to.be.instanceOf(LatLng);
        expect(point.lat).to.be.closeTo(Berlin.lat, eps);
        expect(point.lng).to.be.closeTo(Berlin.lng, eps);
    });

    it("LatLng-Array with alt", function () {
        const point = latlngExpressiontoLatLng([MontBlanc.lat, MontBlanc.lng, MontBlanc.alt]);
        expect(point).to.be.instanceOf(LatLng);
        expect(point.lat).to.be.closeTo(MontBlanc.lat, eps);
        expect(point.lng).to.be.closeTo(MontBlanc.lng, eps);
        expect(point.alt).to.be.closeTo(MontBlanc.alt!, eps);
    });    

    it("LatLngLiteral", function () {
        const point = latlngExpressiontoLatLng(Berlin);
        expect(point).to.be.instanceOf(LatLng);
        expect(point.lat).to.be.closeTo(Berlin.lat, eps);
        expect(point.lng).to.be.closeTo(Berlin.lng, eps);
    });

    it("LatLngLiteral with alt", function () {
        const point = latlngExpressiontoLatLng(MontBlanc);
        expect(point).to.be.instanceOf(LatLng);
        expect(point.lat).to.be.closeTo(MontBlanc.lat, eps);
        expect(point.lng).to.be.closeTo(MontBlanc.lng, eps);
        expect(point.alt).to.be.closeTo(MontBlanc.alt!, eps);
    });    

    it("unknown Object (string instead of number)", function () {
        expect(() => latlngExpressiontoLatLng({ lat: Berlin.lat, lng: `${Berlin.lng}` } as any)).to.throw(/Unknown object found/);
    });
});


describe("latlngExpressionArraytoLatLngArray", function () {

    function checkLatLng(latlng: LatLng[][], n: number, m: number, fixture: LatLngLiteral): void {
        expect(latlng).to.be.length(n);
        expect(latlng).to.be.an("array");
        latlng.forEach((items) => {
            expect(items).to.be.length(m);
            items.forEach((point) => {
                expect(point).to.be.instanceOf(LatLng);
                expect(point.lat).to.be.closeTo(fixture.lat, eps);
                expect(point.lng).to.be.closeTo(fixture.lng, eps);
            })
        });
    }

    it("1D-Array - 1 Point - LatLng-Class", function () {
        const n = 1, m = 1;
        const latlng = latlngExpressionArraytoLatLngArray([new LatLng(Berlin.lat, Berlin.lng)]);
        checkLatLng(latlng, n, m, Berlin)
    });

    it("1D-Array - Multipoint - LatLng-Class", function () {
        const n = 1, m = 5;
        const latlng = latlngExpressionArraytoLatLngArray((new Array(m) as LatLngExpression[]).fill(new LatLng(Berlin.lat, Berlin.lng)));
        checkLatLng(latlng, n, m, Berlin)
    });

    it("1D-Array - 1 Point - LatLng-Literal", function () {
        const n = 1, m = 1;
        const latlng = latlngExpressionArraytoLatLngArray([Berlin]);
        checkLatLng(latlng, n, m, Berlin);
    });

    it("1D-Array - Multipoint - LatLng-Literal", function () {
        const n = 1, m = 5;
        const latlng = latlngExpressionArraytoLatLngArray((new Array(m) as LatLngExpression[]).fill(Berlin));
        checkLatLng(latlng, n, m, Berlin);

    });

    it("1D-Array - 1 Point - LatLng-Tuple", function () {
        const n = 1, m = 1;
        const latlng = latlngExpressionArraytoLatLngArray([[Berlin.lat, Berlin.lng]]);
        checkLatLng(latlng, n, m, Berlin);
    });

    it("1D-Array - Multipoint - LatLng-Tuple", function () {
        const n = 1, m = 5;
        const latlng = latlngExpressionArraytoLatLngArray((new Array(m) as LatLngExpression[]).fill([Berlin.lat, Berlin.lng]));
        checkLatLng(latlng, n, m, Berlin);
    });

    it("2D-Array - LatLng-Class", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as LatLngExpression[]).fill(new LatLng(Berlin.lat, Berlin.lng)));
        const latlng = latlngExpressionArraytoLatLngArray(input);
        checkLatLng(latlng, n, m, Berlin);
    });

    it("2D-Array - LatLng-Literal", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as LatLngExpression[]).fill(Berlin));
        const latlng = latlngExpressionArraytoLatLngArray(input);
        checkLatLng(latlng, n, m, Berlin);
    });

    it("2D-Array - LatLng-Tuple", function () {
        const n = 2, m = 2;
        const input = new Array(n).fill((new Array(m) as LatLngExpression[]).fill([Berlin.lat, Berlin.lng]));
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
        const input = new Array(n).fill((new Array(m) as LatLngExpression[]).fill({ lat: Berlin.lat, lng: `${Berlin.lng}` } as any));
        expect(() => latlngExpressionArraytoLatLngArray(input)).to.throw(/Unknown object found/);
    });

});
