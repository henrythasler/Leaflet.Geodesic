import { GeodesicGeometry } from "../src/geodesic-geom";
import { expect } from "chai";

import "jest";

const Berlin: L.LatLngLiteral = { lat: 52.5, lng: 13.35 };
const Seattle: L.LatLngLiteral = { lat: 47.56, lng: -122.33 };
const Capetown: L.LatLngLiteral = { lat: -33.94, lng: 18.39 };

const SeattleCapetown3: L.LatLngLiteral[] = [
    { lat: 47.56, lng: -122.33 },
    { lat: 18.849527, lng: -35.885828 },
    { lat: -33.94, lng: 18.39 }
];

const SeattleCapetown5: L.LatLngLiteral[] = [
    { lat: 47.56, lng: -122.33 },
    { lat: 41.580847, lng: -70.162019 },
    { lat: 18.849527, lng: -35.885828 },
    { lat: -8.461111, lng: -10.677708 },
    { lat: -33.94, lng: 18.39 }
];

const geom = new GeodesicGeometry();
const eps = 0.000001;

describe("recursiveMidpoint method", function () {
    it("Seatle to Capetown, zero iterations (just the midpoint)", function () {
        const n = 0;
        const line = geom.recursiveMidpoint(Seattle, Capetown, n);
        expect(line).to.be.an("array");
        expect(line).to.be.length(1 + 2 ** (n + 1));    // 3
        line.forEach((point, index) => {
            expect(point).to.be.an("object");
            expect(point).to.include.all.keys("lat", "lng");
            expect(point.lat).to.be.closeTo(SeattleCapetown3[index].lat, eps);
            expect(point.lng).to.be.closeTo(SeattleCapetown3[index].lng, eps);
        })
    });

    it("Seatle to Capetown, one iteration", function () {
        const n = 1;
        const line = geom.recursiveMidpoint(Seattle, Capetown, n);
        expect(line).to.be.an("array");
        expect(line).to.be.length(1 + 2 ** (n + 1));    // 5
        line.forEach((point, index) => {
            expect(point).to.be.an("object");
            expect(point).to.include.all.keys("lat", "lng");
            expect(point.lat).to.be.closeTo(SeattleCapetown5[index].lat, eps);
            expect(point.lng).to.be.closeTo(SeattleCapetown5[index].lng, eps);
        })
    });

    it("Seatle to Capetown, 2 iteration", function () {
        const n = 2;
        const line = geom.recursiveMidpoint(Seattle, Capetown, n);
        expect(line).to.be.an("array");
        expect(line).to.be.length(1 + 2 ** (n + 1));    // 9
    });

    it("Seatle to Capetown, 3 iteration", function () {
        const n = 3;
        const line = geom.recursiveMidpoint(Seattle, Capetown, n);
        expect(line).to.be.an("array");
        expect(line).to.be.length(1 + 2 ** (n + 1));    // 17
    });

    it("Seatle to Capetown, 10 iteration", function () {
        const n = 10;
        const line = geom.recursiveMidpoint(Seattle, Capetown, n);
        expect(line).to.be.an("array");
        expect(line).to.be.length(1 + 2 ** (n + 1));    // 2049
    });
});

describe("line function", function () {
    it("Berlin, Seatle", function () {
        const line = geom.line(Berlin, Seattle);
        expect(line).to.be.an("array");
    });
});

describe("linestring function", function () {
    it("Berlin, Seatle, Capetown", function () {
        const line = geom.linestring([Berlin, Seattle, Capetown]);
        expect(line).to.be.an("array");
    });
});

describe("multilinestring function", function () {
    it("Berlin, Seatle, Capetown", function () {
        const line = geom.multilinestring([[Berlin, Seattle, Capetown]]);
        expect(line).to.be.an("array");
    });
});
