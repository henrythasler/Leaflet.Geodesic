/**
 * @jest-environment jsdom
 */
import { GeodesicGeometry } from "../src/geodesic-geom";

import L from "leaflet";

import "jest";

import {Berlin, checkFixture} from "./test-toolbox";


const geom = new GeodesicGeometry({ steps: 6 }, true);

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

describe("splitCircle function", function () {
    it("splitting at antimeridian (west)", function () {
        const fixture: L.LatLngLiteral[][] = [
            [{ lat: -21.992404660096888, lng: 180 },
                { lat: -13.180500382803578, lng: 166.23330500967688 },
                { lat: 13.180500382803567, lng: 166.23330500967688 },
                { lat: 21.912163313335537, lng: 180 }],
            [{ lat: 21.912163313335537, lng: -180 },
                { lat: 27.11163550749344, lng: -170 },
                { lat: 27.11163550749344, lng: -170 },
                { lat: 13.180500382803567, lng: -146.2333050096769 },
                { lat: -13.180500382803556, lng: -146.2333050096769 },
                { lat: -27.11163550749344, lng: -170 },
                { lat: -21.992404660096888, lng: -180 }]
        ];
        const circle = geom.circle(new L.LatLng(0, -170), 3000 * 1000);
        const split = geom.splitCircle(circle);
        checkFixture(split, fixture);
    });

    it("splitting at antimeridian (east)", function () {
        const fixture: L.LatLngLiteral[][] = [
            [{ lat: 21.9924046601208, lng: -180 },
                { lat: 13.180500382803567, lng: -166.23330500967688 },
                { lat: -13.180500382803556, lng: -166.23330500967688 },
                { lat: -21.912163426550492, lng: -180 }],
            [{ lat: -21.912163426550492, lng: 180 },
                { lat: -27.11163550749344, lng: 170 },
                { lat: -13.180500382803578, lng: 146.2333050096769 },
                { lat: 13.180500382803567, lng: 146.2333050096769 },
                { lat: 27.11163550749344, lng: 170 },
                { lat: 27.11163550749344, lng: 170 },
                { lat: 21.9924046601208, lng: 180 }]
        ];
        const circle = geom.circle(new L.LatLng(0, 170), 3000 * 1000);
        const split = geom.splitCircle(circle);
        checkFixture(split, fixture);
    });

    it("splitting on antimeridian (west)", function () {
        const fixture: L.LatLngLiteral[][] = [
            [{ lat: -26.58540067640274, lng: 179.99996878961207 },
                { lat: -12.69836235379589, lng: 156.28174493726942 },
                { lat: 13.662436754820993, lng: 156.18289585552634 },
                { lat: 27.563243310965472, lng: 180 }],
            [{ lat: 27.563243310965472, lng: -180 },
                { lat: 27.637816560707744, lng: -180 },
                { lat: 27.637816560707744, lng: -180 },
                { lat: 13.662436754820993, lng: -156.18289585552634 },
                { lat: -12.698362353795874, lng: -156.28174493726945 },
                { lat: -26.58541503069416, lng: -180 },
                { lat: -26.58540067640274, lng: -180.000031 }]
        ];
        const circle = geom.circle(new L.LatLng(0.5273, -180), 3000 * 1000);
        const split = geom.splitCircle(circle);
        checkFixture(split, fixture);
    });

    it("splitting on antimeridian (east)", function () {
        const fixture: L.LatLngLiteral[][] = [
            [{ lat: 27.637814866657912, lng: -179.999996 },
                { lat: 13.662436754820993, lng: -156.18289585552634 },
                { lat: -12.698362353795874, lng: -156.28174493726945 },
                { lat: -26.510122528165866, lng: -180 }],
            [{ lat: -26.510122528165866, lng: 180 },
                { lat: -26.58541503069416, lng: 180 },
                { lat: -12.69836235379589, lng: 156.28174493726945 },
                { lat: 13.662436754820993, lng: 156.18289585552634 },
                { lat: 27.637816560707744, lng: 180 },
                { lat: 27.637816560707744, lng: 180 },
                { lat: 27.637814866657912, lng: 180.000004 }]
        ];
        const circle = geom.circle(new L.LatLng(0.5273, 180), 3000 * 1000);
        const split = geom.splitCircle(circle);
        checkFixture(split, fixture);
    });
});
