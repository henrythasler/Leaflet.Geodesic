/**
 * @jest-environment jsdom
 */
import { GeodesicGeometry } from "../src/geodesic-geom";
import { expect } from "chai";

import L from "leaflet";

import "jest";

// test case with distance 54972.271 m
const FlindersPeak = new L.LatLng(-37.9510334166667, 144.424867888889);
const Buninyong = new L.LatLng(-37.6528211388889, 143.926495527778);

const Berlin = new L.LatLng(52.5, 13.35);
const LosAngeles = new L.LatLng(33.82, -118.38);

const Seattle = new L.LatLng(47.56, -122.33);
const Santiago = new L.LatLng(-33.44, -70.71);
const Capetown = new L.LatLng(-33.94, 18.39);

const Tokyo = new L.LatLng(35.47, 139.15);
const Sydney = new L.LatLng(-33.91, 151.08);

const Beijing = new L.LatLng(39.92, 116.39);


const geom = new GeodesicGeometry({ steps: 6 });
const eps = 0.000001;

function checkFixture(specimen: L.LatLng[][], fixture: L.LatLngLiteral[][]): void {
    expect(specimen).to.be.an("array");
    expect(specimen).to.be.length(fixture.length);
    specimen.forEach((line, k) => {
        expect(line).to.be.length(fixture[k].length);
        line.forEach((point, l) => {
            expect(point).to.be.instanceOf(L.LatLng);
            expect(point.lat).to.be.closeTo(fixture[k][l].lat, eps);
            expect(point.lng).to.be.closeTo(fixture[k][l].lng, eps);
        });
    });
}

describe("circle function", function () {
    it("1000km around Berlin", function () {
        const fixture: L.LatLngLiteral[][] = [
            [
                { lat: 61.479983, lng: 13.349999 },
                { lat: 56.219051, lng: 27.392553 },
                { lat: 47.396791, lng: 24.852190 },
                { lat: 43.506398, lng: 13.350000 },
                { lat: 47.396791, lng: 1.847809 },
                { lat: 56.219051, lng: -0.692553 },
                { lat: 61.479983, lng: 13.349999 }]];

        const circle = geom.circle(Berlin, 1000 * 1000);
        checkFixture([circle], fixture);
    });
});

// describe("splitCircle function", function () {
//     it("splitting at antimeridian (west)", function () {
//         const fixture: L.LatLngLiteral[][] = [
//             [
//                 { lat: 61.479983, lng: 13.349999 },
//                 { lat: 56.219051, lng: 27.392553 },
//                 { lat: 47.396791, lng: 24.852190 },
//                 { lat: 43.506398, lng: 13.350000 },
//                 { lat: 47.396791, lng: 1.847809 },
//                 { lat: 56.219051, lng: -0.692553 }]];

//         const circle = geom.circle({ lat: 0, lng: -170 }, 3000 * 1000);
//         console.log(circle);
//         const split = geom.splitCircle(circle);
//         console.log(split);
//         // checkFixture([circle], fixture);
//     });

//     it("splitting at antimeridian (east)", function () {
//         const fixture: L.LatLngLiteral[][] = [
//             [
//                 { lat: 61.479983, lng: 13.349999 },
//                 { lat: 56.219051, lng: 27.392553 },
//                 { lat: 47.396791, lng: 24.852190 },
//                 { lat: 43.506398, lng: 13.350000 },
//                 { lat: 47.396791, lng: 1.847809 },
//                 { lat: 56.219051, lng: -0.692553 }]];

//         const circle = geom.circle({ lat: 0, lng: 170 }, 3000 * 1000);
//         const split = geom.splitCircle(circle);
//         console.log(circle);
//         console.log(split);
//         // checkFixture([circle], fixture);
//     });

// });
