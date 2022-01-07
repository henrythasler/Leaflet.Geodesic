/**
 * @jest-environment jsdom
 */
import { GeodesicGeometry } from "../src/geodesic-geom";
import { expect } from "chai";

import L from "leaflet";

import "jest";

import { checkFixture, compareObject, eps } from "./test-toolbox";

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
const Singapore = new L.LatLng(1.34, 104.01);
const Beijing = new L.LatLng(39.92, 116.39);

const SeattleTokyo: L.LatLngLiteral[][] = [
    [Seattle, { lat: 53.130876, lng: -180 }],
    [{ lat: 53.130876, lng: 180 }, Tokyo]
];

const TokyoSeattle: L.LatLngLiteral[][] = [
    [Tokyo, { lat: 53.095949, lng: 180 }],
    [{ lat: 53.095949, lng: -180 }, Seattle]
];

const SeattleCapetown3: L.LatLngLiteral[] = [
    Seattle,
    { lat: 18.849527, lng: -35.885828 },
    Capetown
];

const SeattleCapetown5: L.LatLngLiteral[] = [
    Seattle,
    { lat: 41.580847, lng: -70.162019 },
    { lat: 18.849527, lng: -35.885828 },
    { lat: -8.461111, lng: -10.677708 },
    Capetown
];

const SeattleCapetown17: L.LatLngLiteral[] = [
    Seattle,
    { lat: 48.427425, lng: -108.576666 },
    { lat: 47.634890, lng: -94.803244 },
    { lat: 45.273503, lng: -81.829902 },
    { lat: 41.580846, lng: -70.162018 },
    { lat: 36.847303, lng: -59.917625 },
    { lat: 31.342769, lng: -50.956530 },
    { lat: 25.287045, lng: -43.032642 },
    { lat: 18.849527, lng: -35.885827 },
    { lat: 12.160105, lng: -29.277999 },
    { lat: 5.321680, lng: -22.998827 },
    { lat: -1.578828, lng: -16.858750 },
    { lat: -8.461110, lng: -10.677707 },
    { lat: -15.242921, lng: -4.272800 },
    { lat: -21.831282, lng: 2.553773 },
    { lat: -28.112432, lng: 10.024650 },
    Capetown
];

const geom = new GeodesicGeometry();

describe("constructor and properties", function () {
    it("no additional settings given", function () {
        expect(geom.steps).to.be.equal(3);
    });
});

describe("recursiveMidpoint method", function () {
    it("Seatle to Capetown, zero iterations (just the midpoint)", function () {
        const n = 0;
        const line = geom.recursiveMidpoint(Seattle, Capetown, n);
        expect(line).to.be.an("array");
        expect(line).to.be.length(1 + 2 ** (n + 1));    // 3
        checkFixture([line], [SeattleCapetown3]);
    });

    it("Seatle to Capetown, one iteration", function () {
        const n = 1;
        const line = geom.recursiveMidpoint(Seattle, Capetown, n);
        expect(line).to.be.an("array");
        expect(line).to.be.length(1 + 2 ** (n + 1));    // 5
        checkFixture([line], [SeattleCapetown5]);
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
    it("Seattle -> Capetown", function () {
        checkFixture([geom.line(Seattle, Capetown)], [SeattleCapetown17]);
    });

    it("Seattle -> Capetown with default steps", function () {
        const customGeom = new GeodesicGeometry({ steps: undefined });
        checkFixture([customGeom.line(Seattle, Capetown)], [SeattleCapetown17]);
    });
});

describe("linestring function", function () {
    it("Berlin, Seattle, Capetown", function () {
        const line = geom.lineString([Berlin, Seattle, Capetown]);
        expect(line).to.be.an("array");
    });
});

describe("multilinestring function", function () {
    it("Berlin, Seattle, Capetown", function () {
        const line = geom.multiLineString([[Berlin, Seattle, Capetown]]);
        expect(line).to.be.an("array");
    });
});

describe("splitLine function", function () {

    it("Berlin -> Seattle (no split)", function () {
        checkFixture(geom.splitLine(Berlin, Seattle), [[Berlin, Seattle]]);
    });

    it("Seattle -> Berlin (no split)", function () {
        checkFixture(geom.splitLine(Seattle, Berlin), [[Seattle, Berlin]]);
    });

    it("Berlin -> Sydney (no split)", function () {
        checkFixture(geom.splitLine(Berlin, Sydney), [[Berlin, Sydney]]);
    });

    it("Seattle -> Tokyo", function () {
        const split = geom.splitLine(Seattle, Tokyo);
        checkFixture(split, SeattleTokyo);
    });

    it("Tokyo -> Seattle", function () {
        const split = geom.splitLine(Tokyo, Seattle);
        checkFixture(split, TokyoSeattle);
    });

    it("Over Southpole (no split)", function () {
        const fixture: L.LatLngLiteral[][] = [
            [{ lat: -76.92061351829682, lng: -24.257812500000004 },
                { lat: -72.28906720017675, lng: 155.7421875 }]
        ];
        const split = geom.splitLine(new L.LatLng(-76.92061351829682, -24.257812500000004), new L.LatLng(-72.28906720017675, 155.7421875));
        checkFixture(split, fixture);
    });

    it("Values if close to antimeridian", function () {
        const fixture: L.LatLngLiteral[][] = [[{ lat: -50.6251, lng: -57.1289 }, { lat: -35.34762564469152, lng: -179.97352713285602 }]];
        const split = geom.splitLine(new L.LatLng(-50.6251, -57.1289), new L.LatLng(-35.34762564469152, -179.97352713285602));
        checkFixture(split, fixture);
    });

    it("Over Northpole", function () {
        const fixture: L.LatLngLiteral[][] = [
            [LosAngeles, { lat: 89.75831966628218, lng: -180 }],
            [{ lat: 89.75831966628218, lng: 180 }, { lat: 65.3668, lng: 62.2266 }]
        ];
        const split = geom.splitLine(LosAngeles, new L.LatLng(65.3668, 62.2266));
        checkFixture(split, fixture);
    });

    it("North Canada to Antarctica", function () {
        const fixture: L.LatLngLiteral[][] = [
            [{ lat: 83.2777, lng: -168.75 }, { lat: -84.6735, lng: 11.25 }]
        ];
        const split = geom.splitLine(new L.LatLng(83.2777, -168.75), new L.LatLng(-84.6735, 11.25));
        checkFixture(split, fixture);
    });

    it("Values close to dateline (no split)", function () {
        const fixture: L.LatLngLiteral[][] = [[{ lat: -50.6251, lng: -57.1289 }, { lat: -35.34762564469152, lng: -179.97352713285602 }]];
        const split = geom.splitLine(new L.LatLng(-50.6251, -57.1289), new L.LatLng(-35.34762564469152, -179.97352713285602));
        checkFixture(split, fixture);
    });

    it("Tokyo (shifted west) -> Seattle", function () {
        const split = geom.splitLine(new L.LatLng(Tokyo.lat, Tokyo.lng - 360), Seattle);
        checkFixture(split, TokyoSeattle);
    });

    it("Seattle (shifted east) -> Tokyo ", function () {
        const split = geom.splitLine(new L.LatLng(Seattle.lat, Seattle.lng + 360), Tokyo);
        checkFixture(split, SeattleTokyo);
    });

    it("Berlin (shifted east) -> Seattle (shifted east)", function () {
        const split = geom.splitLine(new L.LatLng(Berlin.lat, Berlin.lng + 360), new L.LatLng(Seattle.lat, Seattle.lng + 360));
        checkFixture(split, [[Berlin, Seattle]]);
    });

    it("Seattle (shifted west) -> Berlin (shifted west)", function () {
        const split = geom.splitLine(new L.LatLng(Seattle.lat, Seattle.lng - 360), new L.LatLng(Berlin.lat, Berlin.lng - 360));
        checkFixture(split, [[Seattle, Berlin]]);
    });

    it("Berlin (shifted 4*east) -> Seattle (shifted 4*east)", function () {
        const split = geom.splitLine(new L.LatLng(Berlin.lat, Berlin.lng + 4 * 360), new L.LatLng(Seattle.lat, Seattle.lng + 4 * 360));
        checkFixture(split, [[Berlin, Seattle]]);
    });

    it("Seattle (shifted east) -> Tokyo (shifted east)", function () {
        const split = geom.splitLine(new L.LatLng(Seattle.lat, Seattle.lng + 360), new L.LatLng(Tokyo.lat, Tokyo.lng + 360));
        checkFixture(split, SeattleTokyo);
    });

    it("Seattle (shifted 4*east) -> Tokyo (shifted 4*east)", function () {
        const split = geom.splitLine(new L.LatLng(Seattle.lat, Seattle.lng + 4 * 360), new L.LatLng(Tokyo.lat, Tokyo.lng + 4 * 360));
        checkFixture(split, SeattleTokyo);
    });

    it("Santiago (shifted east) -> Seattle (shifted east)", function () {
        const split = geom.splitLine(new L.LatLng(Santiago.lat, Santiago.lng + 360), new L.LatLng(Seattle.lat, Seattle.lng + 360));
        checkFixture(split, [[Santiago, Seattle]]);
    });

    it("Sydney -> LosAngeles (shifted east)", function () {
        const fixture: L.LatLngLiteral[][] = [
            [Sydney, { lat: -15.09323198441759, lng: 180 }],
            [{ lat: -15.09323198441759, lng: -180 }, LosAngeles]
        ];
        const split = geom.splitLine(new L.LatLng(Sydney.lat, Sydney.lng), new L.LatLng(LosAngeles.lat, LosAngeles.lng + 360));
        checkFixture(split, fixture);
    });
});

describe("splitLine - test cases for bugs #1", function () {
    it("Los Angeles -> Tokyo", function () {
        const fixture: L.LatLngLiteral[][] = [
            [
                LosAngeles,
                { lat: 51.644339, lng: -180 }],
            [
                { lat: 51.644339, lng: 180 },
                { lat: 36.597887451521956, lng: 129.52500015633 }]];

        const split = geom.splitLine(LosAngeles, new L.LatLng(36.597887451521956, 129.52500015633));
        checkFixture(split, fixture);
    });

    it("Line starts exactly on antimeridian", function () {
        const fixture: L.LatLngLiteral[][] = [
            [{ lat: 27.637816560707744, lng: 180 },
                { lat: 27.637814, lng: 180.000003 }],
            [{ lat: 27.637814, lng: -179.999996 },
                { lat: 13.662436, lng: -156.182895 }]
        ];

        const split = geom.splitLine(new L.LatLng(27.637816560707744, 180), new L.LatLng(13.662436754820993, 203.81710414447366));
        checkFixture(split, fixture);
    });
});


describe("splitMultiLineString function", function () {
    it("empty input", function () {
        const split = geom.splitMultiLineString([]);
        checkFixture(split, []);
    });

    it("just a point", function () {
        const split = geom.splitMultiLineString([[Berlin]]);
        checkFixture(split, [[Berlin]]);
    });

    it("Line Berlin -> Seattle (no split)", function () {
        checkFixture(geom.splitMultiLineString([[Berlin, Seattle]]), [[Berlin, Seattle]]);
    });

    it("Berlin -> Seattle (no split)", function () {
        const geodesic = [geom.recursiveMidpoint(Berlin, Seattle, 1)];
        const split = geom.splitMultiLineString(geodesic);
        checkFixture(split, geodesic);
    });

    it("Line Seattle -> Tokyo", function () {
        const fixture: L.LatLngLiteral[][] = [  // verified with QGIS
            [Seattle, { lat: 53.130876, lng: -180 }],
            [{ lat: 53.130876, lng: 180 }, Tokyo]
        ];
        const split = geom.splitMultiLineString([[Seattle, Tokyo]]);
        checkFixture(split, fixture);
    });

    it("Seattle -> Tokyo", function () {
        const fixture: L.LatLngLiteral[][] = [
            [
                { lat: 47.56, lng: -122.33 },
                { lat: 53.86920734446313, lng: -148.18981326309986 },
                { lat: 53.438428643246105, lng: -177.80102713286155 },
                { lat: 53.105220539910135, lng: -179.99999999998232 }],
            [
                { lat: 53.105220539910135, lng: 180.00000000001768 },
                { lat: 46.47098438753966, lng: 157.17353392461567 },
                { lat: 35.47, lng: 139.15 }]];

        const geodesic = [geom.recursiveMidpoint(Seattle, Tokyo, 1)];
        const split = geom.splitMultiLineString(geodesic);
        checkFixture(split, fixture);
    });

    it("Tokyo -> Seattle", function () {
        const fixture: L.LatLngLiteral[][] = [
            [
                { lat: 35.47, lng: 139.15 },
                { lat: 46.470984387539666, lng: 157.17353392461575 },
                { lat: 53.08741200357901, lng: 179.99999999999866 }],
            [
                { lat: 53.08741200357901, lng: -180.00000000000134 },
                { lat: 53.438428643246105, lng: -177.80102713286158 },
                { lat: 53.86920734446313, lng: -148.18981326309986 },
                { lat: 47.56, lng: -122.33 }]];

        const geodesic = [geom.recursiveMidpoint(Tokyo, Seattle, 1)];
        const split = geom.splitMultiLineString(geodesic);
        checkFixture(split, fixture);
    });
});

describe("splitMultiLineString - test cases for bugs", function () {
    it("Berlin -> Los Angeles (higher resolution, no split)", function () {
        const geodesic = [geom.recursiveMidpoint(Berlin, new L.LatLng(32.54681317351517, -118.82812500000001), 2)];
        const split = geom.splitMultiLineString(geodesic);
        checkFixture(split, geodesic);
    });

    it("Los Angeles -> Tokyo", function () {
        const fixture: L.LatLngLiteral[][] = [
            [
                { lat: 33.82, lng: -118.38 },
                { lat: 48.618678, lng: -166.584707 },
                { lat: 48.525174, lng: -180 }],
            [
                { lat: 48.525174, lng: 180 },
                { lat: 38.2727, lng: 141.3281 }]];

        const geodesic = [geom.recursiveMidpoint(LosAngeles, new L.LatLng(38.2727, 141.3281), 0)];
        const split = geom.splitMultiLineString(geodesic);
        checkFixture(split, fixture);
    });

    it("Falkland -> Tokyo (geodesic vertex close to dateline)", function () {
        const fixture: L.LatLngLiteral[][] = [
            [
                { lat: -50.6251, lng: -57.1289 },
                { lat: -35.34762564469152, lng: -179.97352713285602 },
                { lat: -35.314181797099394, lng: -180.00000000010883 }],
            [
                { lat: -35.314181797099394, lng: 179.99999999989117 },
                { lat: 35.47, lng: 139.15 }]];

        const geodesic = [geom.recursiveMidpoint(new L.LatLng(-50.6251, -57.1289), Tokyo, 0)];
        const split = geom.splitMultiLineString(geodesic);
        checkFixture(split, fixture);
    });
});

describe("distance function (wrapper for vincenty inverse)", function () {
    it("FlindersPeak to Buninyong", function () {
        const res = geom.distance(FlindersPeak, Buninyong);
        expect(res).to.be.a("number");
        expect(res).to.be.closeTo(54972.271, 0.001);   // epsilon is larger, because precision of reference value is  only 3 digits
    });

    it("λ > π", function () {
        const res = geom.distance(new L.LatLng(24.206889622398023, 223.94531250000003), new L.LatLng(33.43144133557529, -136.75781250000003));
        expect(res).to.be.a("number");
        expect(res).to.be.closeTo(1024686.1978118686, eps);
    });
});

describe("multilineDistance()", function () {
    it("FlindersPeak to Buninyong and back", function () {
        const res = geom.multilineDistance([[FlindersPeak, Buninyong], [Buninyong, FlindersPeak]]);
        expect(res).to.be.an("array");
        expect(res).to.be.length(2);
        const sum = res.reduce((x, y) => x + y, 0);
        expect(sum).to.be.closeTo(2 * 54972.271, 0.001);
        expect(res[0]).to.be.closeTo(54972.271, 0.001);   // epsilon is larger, because precision of reference value is only 3 digits
        expect(res[1]).to.be.closeTo(54972.271, 0.001);   // epsilon is larger, because precision of reference value is only 3 digits
    });

    it("Berlin -> Seattle -> Capetown", function () {
        const res = geom.multilineDistance([[Berlin, Seattle, Capetown]]);
        expect(res).to.be.an("array");
        expect(res).to.be.length(1);
        const sum = res.reduce((x, y) => x + y, 0);
        expect(sum).to.be.closeTo(24569051.081048, eps);
    });

    it("Just a point (invalid)", function () {
        const res = geom.multilineDistance([[Berlin]]);
        expect(res).to.be.an("array");
        expect(res).to.be.length(1);
        const sum = res.reduce((x, y) => x + y, 0);
        expect(sum).to.be.closeTo(0, eps);
    });

    it("empty input", function () {
        const res = geom.multilineDistance([[]]);
        expect(res).to.be.an("array");
        expect(res).to.be.length(1);
        const sum = res.reduce((x, y) => x + y, 0);
        expect(sum).to.be.closeTo(0, eps);
    });
});

describe("Statistics Calculation", function () {
    it("with empty geodesic", function () {
        const res = geom.updateStatistics([], []);
        compareObject(res, { distanceArray: [], totalDistance: 0, points: 0, vertices: 0 });
    });

    it("with single point", function () {
        const res = geom.updateStatistics([[FlindersPeak]], []);
        compareObject(res, { distanceArray: [0], totalDistance: 0, points: 1, vertices: 0 });
    });

    it("with two point", function () {
        const n = 2;
        const line = geom.recursiveMidpoint(FlindersPeak, Buninyong, n);
        const res = geom.updateStatistics([[FlindersPeak, Buninyong]], [line]);
        expect(res).to.have.all.keys("distanceArray", "totalDistance", "points", "vertices");
        expect(res.distanceArray).to.be.an("array");
        expect(res.distanceArray).to.be.length(1);
        expect(res.distanceArray[0]).to.be.closeTo(54972.271, 0.001);
        expect(res.totalDistance).to.be.closeTo(54972.271, 0.001);
        expect(res).to.include({ points: 2, vertices: 1 + 2 ** (n + 1) });
    });

    it("with two lines", function () {
        const n = 2;
        const line = geom.recursiveMidpoint(FlindersPeak, Buninyong, n);
        const res = geom.updateStatistics([[FlindersPeak, Buninyong], [FlindersPeak, Buninyong]], [line, line]);
        expect(res).to.have.all.keys("distanceArray", "totalDistance", "points", "vertices");
        expect(res.distanceArray).to.be.an("array");
        expect(res.distanceArray).to.be.length(2);
        expect(res.distanceArray[0]).to.be.closeTo(54972.271, 0.001);
        expect(res.distanceArray[1]).to.be.closeTo(54972.271, 0.001);
        expect(res.totalDistance).to.be.closeTo(2 * 54972.271, 0.001);
        expect(res).to.include({ points: 4, vertices: 2 * (1 + 2 ** (n + 1)) });
    });
});

describe("wrapMultiLineString function", function () {
    it("simple no-wrap", function () {
        const wrapped = geom.wrapMultiLineString([[new L.LatLng(0, 0), new L.LatLng(0, 90)]]);
        checkFixture(wrapped, [[{ lat: 0, lng: 0 }, { lat: 0, lng: 90 }]]);
    });

    it("simple wrap #1", function () {
        const wrapped = geom.wrapMultiLineString([[new L.LatLng(0, 0), new L.LatLng(0, 360)]]);
        checkFixture(wrapped, [[{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }]]);
    });

    it("simple wrap #2", function () {
        const wrapped = geom.wrapMultiLineString([[new L.LatLng(0, -370), new L.LatLng(0, -110)]]);
        checkFixture(wrapped, [[{ lat: 0, lng: -370 }, { lat: 0, lng: -470 }]]);
    });

    it("simple wrap #3", function () {
        const wrapped = geom.wrapMultiLineString([[new L.LatLng(0, 80), new L.LatLng(0, -130)]]);
        checkFixture(wrapped, [[{ lat: 0, lng: 80 }, { lat: 0, lng: 230 }]]);
    });


    it("corporealfunk's testcase", function () {
        const before: L.LatLng[] = [
            new L.LatLng(34, -118),
            new L.LatLng(53, -170),
            new L.LatLng(53, 180),
            new L.LatLng(53, 169),
            new L.LatLng(51, 165),
            new L.LatLng(35, 140),
        ];
        const fixture: L.LatLngLiteral[] = [
            { lat: 34, lng: -118 },
            { lat: 53, lng: -170 },
            { lat: 53, lng: 180 - 360 },
            { lat: 53, lng: 169 - 360 },
            { lat: 51, lng: 165 - 360 },
            { lat: 35, lng: 140 - 360 },
        ];

        const wrapped = geom.wrapMultiLineString([before]);
        checkFixture(wrapped, [fixture]);
    });

    it("Berlin -> Los Angeles (no change)", function () {
        const before: L.LatLng[] =
                [
                    Berlin,
                    new L.LatLng(65.24359311042674, -71.51008528822054),
                    LosAngeles
                ];


        const fixture: L.LatLng[] =
                [
                    Berlin,
                    new L.LatLng(65.24359311042674, -71.51008528822054),
                    LosAngeles
                ];

        const wrapped = geom.wrapMultiLineString([before]);
        checkFixture(wrapped, [fixture]);
    });

    it("Los Angeles -> Singapore (wrap target)", function () {
        const before: L.LatLng[] =
                [
                    LosAngeles,
                    new L.LatLng(40.448498633477804, -200.5721420728674),
                    Singapore,
                ];

        const fixture: L.LatLng[] =
                [
                    LosAngeles,
                    new L.LatLng(40.448498633477804, -200.5721420728674),
                    new L.LatLng(1.34, 104.01 - 360),
                ];

        const wrapped = geom.wrapMultiLineString([before]);
        checkFixture(wrapped, [fixture]);
    });

    it("Singapore -> Los Angeles (wrap target)", function () {
        const before: L.LatLng[] =
                [
                    Singapore,
                    new L.LatLng(40.448498633477804, 159.42785792713264),
                    LosAngeles,
                ];

        const fixture: L.LatLng[] =
                [
                    Singapore,
                    new L.LatLng(40.448498633477804, 159.42785792713264),
                    new L.LatLng(33.82, -118.38 + 360),
                ];

        const wrapped = geom.wrapMultiLineString([before]);
        checkFixture(wrapped, [fixture]);
    });

    it("Los Angeles -> Santiago (shifted east)", function () {
        // // use this snippet to generate test cases
        // const customGeom = new GeodesicGeometry({ steps: 0 });
        // const before = customGeom.multiLineString([[LosAngeles, new L.LatLng(Santiago.lat, Santiago.lng + 0*360)]]);
        // console.log(before);

        const before: L.LatLng[] =
                [
                    LosAngeles,
                    new L.LatLng(0.20771518159766966, -94.48916772481697),
                    new L.LatLng(Santiago.lat, Santiago.lng - 10 * 360),
                ];

        const fixture: L.LatLng[] =
                [
                    LosAngeles,
                    new L.LatLng(0.20771518159766966, -94.48916772481697),
                    new L.LatLng(Santiago.lat, Santiago.lng + 0 * 360),
                ];

        const wrapped = geom.wrapMultiLineString([before]);
        checkFixture(wrapped, [fixture]);
    });

    it("Beijing (shifted west) -> Sydney", function () {
        const before: L.LatLng[] =
                [
                    new L.LatLng(Beijing.lat, Beijing.lng - 1 * 360),
                    new L.LatLng(3.147636627913074, -225.55932619186368),
                    Sydney,
                ];

        const fixture: L.LatLng[] =
                [
                    new L.LatLng(Beijing.lat, Beijing.lng - 1 * 360),
                    new L.LatLng(3.147636627913074, -225.55932619186368),
                    new L.LatLng(Sydney.lat, Sydney.lng - 1 * 360),
                ];

        const wrapped = geom.wrapMultiLineString([before]);
        checkFixture(wrapped, [fixture]);
    });

    it("Santiago > Tokyo > Capetown > Sydney, where the latter 3 must be shifted west", function () {
        const before: L.LatLng[] =
                [
                    Santiago,
                    Tokyo,
                    Capetown,
                    Sydney,
                ];

        const fixture: L.LatLng[] =
                [
                    Santiago,
                    new L.LatLng(Tokyo.lat, Tokyo.lng - 1 * 360),
                    new L.LatLng(Capetown.lat, Capetown.lng - 1 * 360),
                    new L.LatLng(Sydney.lat, Sydney.lng - 1 * 360),
                ];

        const wrapped = geom.wrapMultiLineString([before]);
        checkFixture(wrapped, [fixture]);
    });

    it("LosAngeles -> Capetown -> Tokyo -> Santiago, where only Santiago must be shifted (end of linestring)", function () {
        const before: L.LatLng[] =
                [
                    LosAngeles,
                    Capetown,
                    Tokyo,
                    Santiago,
                ];

        const fixture: L.LatLng[] =
                [
                    LosAngeles,
                    new L.LatLng(Capetown.lat, Capetown.lng),
                    new L.LatLng(Tokyo.lat, Tokyo.lng),
                    new L.LatLng(Santiago.lat, Santiago.lng + 1 * 360),
                ];
        const wrapped = geom.wrapMultiLineString([before]);
        checkFixture(wrapped, [fixture]);
    });

    it("Tokyo -> Santiago -> Sydney -> Capetown, where only Santiago must be shifted (middle of linestring)", function () {
        const before: L.LatLng[] =
                [
                    Tokyo,
                    Santiago,
                    Sydney,
                    Capetown,
                ];

        const fixture: L.LatLng[] =
                [
                    new L.LatLng(Tokyo.lat, Tokyo.lng),
                    new L.LatLng(Santiago.lat, Santiago.lng + 1 * 360),
                    Sydney,
                    Capetown,
                ];

        const wrapped = geom.wrapMultiLineString([before]);
        checkFixture(wrapped, [fixture]);
    });

    it("Tokyo -> Santiago -> Sydney -> Capetown, where only Santiago must be shifted (middle of linestring)", function () {
        const before: L.LatLng[] =
                [
                    Tokyo,
                    Santiago,
                    Sydney,
                    Capetown,
                ];

        const fixture: L.LatLng[] =
                [
                    new L.LatLng(Tokyo.lat, Tokyo.lng),
                    new L.LatLng(Santiago.lat, Santiago.lng + 1 * 360),
                    Sydney,
                    Capetown,
                ];

        const wrapped = geom.wrapMultiLineString([before]);
        checkFixture(wrapped, [fixture]);
    });

    it("Hardcore Testcase with multiple different shifts", function () {
        const before: L.LatLng[] =
                [
                    Tokyo,
                    Santiago,
                    Capetown,
                    Sydney,
                    LosAngeles,
                    Berlin
                ];

        const fixture: L.LatLng[] =
                [
                    Tokyo,
                    new L.LatLng(Santiago.lat, Santiago.lng + 1 * 360),
                    new L.LatLng(Capetown.lat, Capetown.lng + 1 * 360),
                    new L.LatLng(Sydney.lat, Sydney.lng + 1 * 360),
                    new L.LatLng(LosAngeles.lat, LosAngeles.lng + 2 * 360),
                    new L.LatLng(Berlin.lat, Berlin.lng + 2 * 360),
                ];

        const wrapped = geom.wrapMultiLineString([before]);
        checkFixture(wrapped, [fixture]);
    });
});
