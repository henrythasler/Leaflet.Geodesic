/**
 * @jest-environment jsdom
 */
import L, {LatLngExpression} from "leaflet";
import { GeodesicLine } from "../src/geodesic-line";
import { readFileSync } from "fs";
import { expect } from "chai";

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

const Beijing = new L.LatLng(39.92, 116.39);


const fixturesPath = "spec/fixtures/";

const defaultOptions = { wrap: true, steps: 3 };

describe("Main functionality", function () {
    let container: HTMLElement;
    let map: L.Map;

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '400px';
        map = L.map(container, { renderer: new L.SVG(), center: [0, 0], zoom: 12 });
    });

    it("Create class w/o any parameters", function () {
        const line = new GeodesicLine();
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(line.points).to.be.length(0);
    });

    it("Create class with parameters", function () {
        const line = new GeodesicLine([], { steps: 0 });
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, { ...defaultOptions, ...{ steps: 0 } });
        expect(line.points).to.be.length(0);
    });

    it("Create class with parameters", function () {
        const line = new GeodesicLine([], { wrap: false });
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, { ...defaultOptions, ...{ wrap: false } });
        expect(line.points).to.be.length(0);
    });

    it("Add empty line to map", function () {
        const line = new GeodesicLine().addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;
        expect(line.points).to.be.length(0);
    });

    it("Modify Line", function () {
        const line = new GeodesicLine().addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;
        line.setLatLngs([Berlin, Capetown]);
        checkFixture(line.points, [[Berlin, Capetown]])
    });

    it("Modify Line w/o wrapping", function () {
        const line = new GeodesicLine([], { wrap: false }).addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, { ...defaultOptions, ...{ wrap: false } });
        expect(map.hasLayer(line)).to.be.true;
        line.setLatLngs([Berlin, Capetown]);
        checkFixture(line.points, [[Berlin, Capetown]])
    });

    it("Read LatLngs from empty line", function () {
        const line = new GeodesicLine().addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;
        const latlngs = line.getLatLngs();
        expect(latlngs).to.be.an("array");
        expect(latlngs.length).to.be.equal(0);
    });

    it("Read LatLngs", function () {
        const line = new GeodesicLine([Berlin, Capetown]).addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;
        checkFixture(line.points, [[Berlin, Capetown]])
        const latlngs = line.getLatLngs();
        expect(latlngs).to.be.an("array");
        expect(latlngs.length).to.be.equal(1);
    });

    it("Delete LatLngs", function () {
        const line = new GeodesicLine([Berlin, Capetown]).addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;
        checkFixture(line.points, [[Berlin, Capetown]])
        line.setLatLngs([]);
        checkFixture(line.points, [])
        const latlngs = line.getLatLngs();
        expect(latlngs).to.be.an("array");
        expect(latlngs.length).to.be.equal(0);
    });

    it("Overwrite LatLngs", function () {
        const line = new GeodesicLine([Berlin, Capetown]).addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;
        checkFixture(line.points, [[Berlin, Capetown]])
        line.setLatLngs([[Berlin, LosAngeles], [Santiago, Capetown]]);
        checkFixture(line.points, [[Berlin, LosAngeles], [Santiago, Capetown]])
        const latlngs = line.getLatLngs();
        expect(latlngs).to.be.an("array");
        expect(latlngs.length).to.be.equal(2);
    });    

    it("Statistics calculation (simple)", async function () {
        const line = new GeodesicLine([[Berlin, Seattle, Capetown]], { steps: 0 }).addTo(map);
        checkFixture(line.points, [[Berlin, Seattle, Capetown]])
        expect(line.statistics.totalDistance).to.be.closeTo(24569051.081048, eps);
        expect(line.statistics.distanceArray).to.be.an("array");
        expect(line.statistics.distanceArray).to.be.length(1);
        expect(line.statistics.points).to.be.equal(3);
        expect(line.statistics.vertices).to.be.equal(5);
    });

    it("Statistics calculation (complex)", async function () {
        const line = new GeodesicLine([[Berlin, LosAngeles], [Santiago, Capetown]], { steps: 1 }).addTo(map);
        checkFixture(line.points, [[Berlin, LosAngeles], [Santiago, Capetown]])
        expect(line.statistics.totalDistance).to.be.closeTo(17319123.023856, eps);
        expect(line.statistics.distanceArray).to.be.an("array");
        expect(line.statistics.distanceArray).to.be.length(2);
        expect(line.statistics.points).to.be.equal(4);
        expect(line.statistics.vertices).to.be.equal(10);
    });

    it("distance calculation", async function () {
        const line = new GeodesicLine();
        const distance = line.distance(FlindersPeak, Buninyong);
        expect(distance).to.be.closeTo(54972.271, 0.001);
    });
});

describe("GeoJSON-Support", function () {
    let container: HTMLElement;
    let map: L.Map;
    const mockLog = jest.fn();
    const originalLog = console.log;

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '400px';
        map = L.map(container, { renderer: new L.SVG(), center: [0, 0], zoom: 12 });

        mockLog.mockClear();
    });

    afterEach(function () {
        console.log = originalLog;
    })

    it("Just a Linestring", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}geometry-line.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("Feature with Linestring", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}feature-line.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with LineString", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}line.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with Polygon", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}polygon.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with Polygon incl. hole", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}polygon-hole.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}polygon-hole.fixture.json`, "utf8")));
    });

    it("FeatureCollection with MultiPoint", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}multipoint.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with MultiLineString", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}multiline.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}multiline.fixture.json`, "utf8")));
    });

    it("FeatureCollection with MultiPolygon", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}multipolygon.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}multipolygon.fixture.json`, "utf8")));
    });

    it("FeatureCollection with LineString and MultiPolygon", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}line-multipolygon.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        const fixture = [
            ...JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")),
            ...JSON.parse(readFileSync(`${fixturesPath}multipolygon.fixture.json`, "utf8"))];
        checkFixture(latlngs, fixture);
    });

    it("FeatureCollection with Point", async function () {
        console.log = mockLog;

        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}point.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        expect(latlngs).to.be.an("array");
        expect(latlngs).to.be.length(0);
        expect(mockLog.mock.calls[0][0]).to.match(/Type "Point" not supported/);
    });

    it("Mixed FeatureCollection", async function () {
        console.log = mockLog;

        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}mixed.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}mixed.fixture.json`, "utf8")));
        expect(mockLog.mock.calls[0][0]).to.match(/Type "Point" not supported/);
    });

    it("GeometryCollection", async function () {
        console.log = mockLog;

        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}geometrycollection.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as L.LatLng[][]; // FIXME: This is NOT typesafe!!
        expect(latlngs).to.be.an("array");
        expect(latlngs).to.be.length(0);
        expect(mockLog.mock.calls[0][0]).to.match(/Type "GeometryCollection" not supported/);
    });
});

describe("Usage of base-class functions", function () {
    let container: HTMLElement;
    let map: L.Map;

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '400px';
        map = L.map(container, { renderer: new L.SVG(), center: [0, 0], zoom: 12 });
    });

    it("getBounds()", async function () {
        const line = new GeodesicLine([FlindersPeak, Buninyong]).addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;

        const bounds = line.getBounds();
        expect(bounds).to.be.instanceOf(L.LatLngBounds);
        checkFixture([[bounds.getCenter()]], [[{ lat: (FlindersPeak.lat + Buninyong.lat) / 2, lng: (FlindersPeak.lng + Buninyong.lng) / 2 }]]);
    });

    it("getBounds() in FeatureGroup", async function () {
        const line = new GeodesicLine([FlindersPeak, Buninyong]);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);

        const group = new L.FeatureGroup([line]).addTo(map);
        expect(map.hasLayer(group)).to.be.true;

        const bounds = group.getBounds();
        expect(bounds).to.be.instanceOf(L.LatLngBounds);
        checkFixture([[bounds.getCenter()]], [[{ lat: (FlindersPeak.lat + Buninyong.lat) / 2, lng: (FlindersPeak.lng + Buninyong.lng) / 2 }]]);
    });

    it("addLatLng() to empty line", async function () {
        const line = new GeodesicLine([]).addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;

        line.addLatLng(LosAngeles);
        checkFixture(line.points, [[LosAngeles]])
    });

    it("addLatLng() to existing point", async function () {
        const line = new GeodesicLine([LosAngeles]).addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;

        line.addLatLng(Berlin);
        checkFixture(line.points, [[LosAngeles, Berlin]])
    });

    it("addLatLng() to existing line", async function () {
        const line = new GeodesicLine([LosAngeles, Berlin]).addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;

        line.addLatLng(Beijing);
        checkFixture(line.points, [[LosAngeles, Berlin, Beijing]])
    });

    it("addLatLng() to multiline", async function () {
        const line = new GeodesicLine([[Berlin, LosAngeles], [Santiago, Capetown]]).addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;

        line.addLatLng(Beijing);
        checkFixture(line.points, [[Berlin, LosAngeles], [Santiago, Capetown, Beijing]])
    });

    it("addLatLng() to multiline with given segment #0", async function () {
        const line = new GeodesicLine([[Berlin, LosAngeles], [Santiago, Capetown]]).addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;

        line.addLatLng(Beijing, line.points[0]);
        checkFixture(line.points, [[Berlin, LosAngeles, Beijing], [Santiago, Capetown]])
    });

    it("addLatLng() to multiline with given segment #1", async function () {
        const line = new GeodesicLine([[Berlin, LosAngeles], [Santiago, Capetown], [Tokyo, Sydney]]).addTo(map);
        expect(line).to.be.instanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).to.be.true;

        line.addLatLng(Beijing, line.points[1]);
        checkFixture(line.points, [[Berlin, LosAngeles], [Santiago, Capetown, Beijing], [Tokyo, Sydney]])
    });

});

// Ultimate changeLength() test for regular lines. If it fails, something wrong might be with the line itself.
/*describe("changeLength() regular line", function () {
    // "Thanks" to the trig functions and shift when when lng diff is 180 deg and absolute values of lats are equal,
    // precision suffers by much. Also, change lngShift to 60 for more accurate tests. 30 will throw a heap out of
    // memory error.
    const lngShift = 90, latShift = 40, eps = 0.0001;

    for (let lng1 = -180; lng1 <= 180; lng1 += lngShift) {
        for (let lat1 = -80; lat1 <= 80; lat1 += latShift) {

            for (let lng2 = -180; lng2 <= 180; lng2 += lngShift) {
                for (let lat2 = -80; lat2 <= 80; lat2 += latShift) {

                    for (let i = -0.9; i <= 2; i += 0.4) {

                        const geodesic = new GeodesicLine([[lat1, lng1], [lat2, lng2]]),
                            expectedLength = geodesic.statistics.sphericalLengthRadians + geodesic.statistics.sphericalLengthRadians * i;

                        if (expectedLength > Math.PI) {
                            continue;
                        }

                        //console.log(lat1, lng1, lat2, lng2, i);
                        geodesic.changeLength("start", i);

                        it(`[[${lat1}, ${lng1}], [${lat2}, ${lng2}]] by ${i}`, function () {
                            expect(geodesic.statistics.sphericalLengthRadians).to.be.closeTo(expectedLength, eps);
                        });

                    }

                }
            }

        }
    }
});*/

// Another changeLength() test. Aimed mainly for natural drawing which doesn't work for now.
/*describe("changeLength()", function () {

    const modes = ["end", "start", "both"], coords: LatLngExpression[] = [[10, 10], [15, 15]];

    // Test modes
    for (const mode of modes) {

        // Test regular and natural drawing lines
        for (let naturalDrawing of [false, true]) {
            let start = -0.9, end = 1, lenDiffMultiplier = 1, lngShifts = [5],
                    lineTypeText = "Regular line";

            if (mode === "both") {
                start = -0.45;
                lenDiffMultiplier = 2;
            }

            if (naturalDrawing) {
                end = 2; // There's no upper limit
                lineTypeText = "Natural drawing line";

                // We should test different lngs and antimeridians for it
                lngShifts = [];
                for (let j = -10; j <= 10; j++) {
                    lngShifts.push(j * 180);
                    lngShifts.push(5 + j * 180);
                }
            }

            // Test different length modifications
            for (let i = start; i <= end; i += 0.4) {

                // Test shifts for natural line
                for (let shift of lngShifts) {
                    let testName = `${lineTypeText} from ${mode} by ${i}`;
                    if (naturalDrawing) {
                        testName += ` with ${shift} lng shift`;
                    }

                    // Test the line
                    it(testName, function () {
                        const geodesic = new GeodesicLine([[10, 10], [15, 10 + shift]], {naturalDrawing}),
                                srcLenRad = geodesic.statistics.sphericalLengthRadians,
                                srcLenM = geodesic.statistics.sphericalLengthMeters;

                        // @ts-ignore
                        geodesic.changeLength(mode, i);
                        const expectedDiff = 1 + i * lenDiffMultiplier,
                                newLenRad = geodesic.statistics.sphericalLengthRadians,
                                newLenM = geodesic.statistics.sphericalLengthMeters;

                        expect(newLenRad / srcLenRad).to.be.closeTo(expectedDiff, eps);
                        expect(newLenM / srcLenM).to.be.closeTo(expectedDiff, eps);
                    });
                }
            }
        }

        // Test errors

        it(`Length more than 180 degrees from ${mode} throws`, function () {
            expect(() => {
                // @ts-ignore
                new GeodesicLine(coords).changeLength(mode, 100);
            }).to.throw(/New spherical line length/);
        });

        it(`Shorten by more than 1 (whole length) from ${mode} throws`, function () {
            expect(() => {
                // @ts-ignore
                new GeodesicLine(coords).changeLength(mode, -1);
            }).to.throw(/Can't change length/);
        });
    }
});*/

describe("Options", function () {
    it("moveNoWrapTo = 3", function () {
        const geodesic = new GeodesicLine([[-50, -700], [-40, -635]], {
            wrap: false,
            moveNoWrapTo: 3
        });
        // @ts-ignore
        expect(geodesic.getLatLngs()[0][0].lng).to.be.equal(1100);
    });

    it("moveNoWrapTo doesn't affect wrap = true", function () {
        const geodesic = new GeodesicLine([[-50, -700], [-40, -635]], {
            moveNoWrapTo: 3
        });
        // @ts-ignore
        expect(geodesic.getLatLngs()[0][0].lng).to.be.closeTo(20, eps);
    });

    it("moveNoWrapTo doesn't affect naturalDrawing = true", function () {
        const geodesic = new GeodesicLine([[-50, -700], [-40, -635]], {
            naturalDrawing: true,
            moveNoWrapTo: 3
        });
        // @ts-ignore
        expect(geodesic.getLatLngs()[0][0].lng).not.to.be.equal(1100);
    });

    const breakPoints = [0, 0.3, 0.5, 0.9, 1];

    it("breakPoints", function () {
        const geodesic = new GeodesicLine([[-50, -700], [-40, -635]], {breakPoints}),
            latLngs = geodesic.getLatLngs()[0] as L.LatLng[];

        expect(latLngs).to.have.lengthOf(breakPoints.length);

        for (let i = 1; i < breakPoints.length; i++) {
            const testLength = new GeodesicLine([latLngs[i - 1], latLngs[i]]).statistics.sphericalLengthRadians,
                segmentLength = geodesic.statistics.sphericalLengthRadians * (breakPoints[i] - breakPoints[i - 1]);
            expect(testLength).to.be.closeTo(segmentLength, eps);
        }
    });

    it("breakPoints doesn't affect natural drawing", function () {
        const geodesic = new GeodesicLine([[-50, -700], [-40, -635]], {
            breakPoints,
            naturalDrawing: true,
            segmentsNumber: 10
        });
        expect(geodesic.getLatLngs()[0]).not.to.have.lengthOf(breakPoints.length);
    });

    it("updateStatisticsAfterRedrawing = false doesn't hang anything", function () {
        expect(() => {
            return new GeodesicLine([[-50, -700], [-40, -635]], {
                updateStatisticsAfterRedrawing: false
            })
        }).not.to.throw();
    });
});