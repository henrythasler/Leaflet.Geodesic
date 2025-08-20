import { LatLng, LatLngBounds, FeatureGroup, Map, SVG } from "leaflet";
import { GeodesicOptions } from "../src/geodesic-core"
import { GeodesicLine } from "../src/geodesic-line";
import { readFileSync } from "fs";

import { jest } from "@jest/globals";

import { checkFixture, compareObject, highPrecisionDigits } from "./test-toolbox";

// test case with distance 54972.271 m
const FlindersPeak = new LatLng(-37.9510334166667, 144.424867888889, 328);
const Buninyong = new LatLng(-37.6528211388889, 143.926495527778, 745);

const Berlin = new LatLng(52.5, 13.35);
const LosAngeles = new LatLng(33.82, -118.38);

const Seattle = new LatLng(47.56, -122.33);
const Santiago = new LatLng(-33.44, -70.71);
const Capetown = new LatLng(-33.94, 18.39);

const Tokyo = new LatLng(35.47, 139.15);
const Sydney = new LatLng(-33.91, 151.08);

const Beijing = new LatLng(39.92, 116.39);


const fixturesPath = "spec/fixtures/";

const defaultOptions: GeodesicOptions = { wrap: true, steps: 3 };

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

describe("Main functionality", function () {
    let container: HTMLElement;
    let map: Map;

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '400px';
        map = new Map(container, { renderer: new SVG(), center: [0, 0], zoom: 12 });
    });

    it("Create class w/o any parameters", function () {
        const line = new GeodesicLine();
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(line.points).toHaveLength(0);
    });

    it("Create class with parameters", function () {
        const line = new GeodesicLine([], { steps: 0 });
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, { ...defaultOptions, ...{ steps: 0 } });
        expect(line.points).toHaveLength(0);
    });

    it("Create class with parameters", function () {
        const line = new GeodesicLine([], { wrap: false });
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, { ...defaultOptions, ...{ wrap: false } });
        expect(line.points).toHaveLength(0);
    });

    it("Add empty line to map", function () {
        const line = new GeodesicLine().addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();
        expect(line.points).toHaveLength(0);
    });

    it("Modify Line", function () {
        const line = new GeodesicLine().addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();
        line.setLatLngs([Berlin, Capetown]);
        checkFixture(line.points, [[Berlin, Capetown]])
    });

    it("Modify Line w/o wrapping", function () {
        const line = new GeodesicLine([], { wrap: false }).addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, { ...defaultOptions, ...{ wrap: false } });
        expect(map.hasLayer(line)).toBeTrue();
        line.setLatLngs([Berlin, Capetown]);
        checkFixture(line.points, [[Berlin, Capetown]])
    });

    it("Read LatLngs from empty line", function () {
        const line = new GeodesicLine().addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();
        const latlngs = line.getLatLngs();
        expect(latlngs).toBeInstanceOf(Array);
        expect(latlngs.length).toEqual(0);
    });

    it("Read LatLngs", function () {
        const line = new GeodesicLine([Berlin, Capetown]).addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();
        checkFixture(line.points, [[Berlin, Capetown]])
        const latlngs = line.getLatLngs();
        expect(latlngs).toBeInstanceOf(Array);
        expect(latlngs.length).toEqual(1);
    });

    it("Delete LatLngs", function () {
        const line = new GeodesicLine([Berlin, Capetown]).addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();
        checkFixture(line.points, [[Berlin, Capetown]])
        line.setLatLngs([]);
        checkFixture(line.points, [])
        const latlngs = line.getLatLngs();
        expect(latlngs).toBeInstanceOf(Array);
        expect(latlngs.length).toEqual(0);
    });

    it("Overwrite LatLngs", function () {
        const line = new GeodesicLine([Berlin, Capetown]).addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();
        checkFixture(line.points, [[Berlin, Capetown]])
        line.setLatLngs([[Berlin, LosAngeles], [Santiago, Capetown]]);
        checkFixture(line.points, [[Berlin, LosAngeles], [Santiago, Capetown]])
        const latlngs = line.getLatLngs();
        expect(latlngs).toBeInstanceOf(Array);
        expect(latlngs.length).toEqual(2);
    });    

    it("Statistics calculation (simple)", async function () {
        const line = new GeodesicLine([[Berlin, Seattle, Capetown]], { steps: 0 }).addTo(map);
        checkFixture(line.points, [[Berlin, Seattle, Capetown]])
        expect(line.statistics.totalDistance).toBeCloseTo(24569051.081048, highPrecisionDigits);
        expect(line.statistics.distanceArray).toBeInstanceOf(Array);
        expect(line.statistics.distanceArray).toHaveLength(1);
        expect(line.statistics.points).toEqual(3);
        expect(line.statistics.vertices).toEqual(5);
    });

    it("Statistics calculation (complex)", async function () {
        const line = new GeodesicLine([[Berlin, LosAngeles], [Santiago, Capetown]], { steps: 1 }).addTo(map);
        checkFixture(line.points, [[Berlin, LosAngeles], [Santiago, Capetown]])
        expect(line.statistics.totalDistance).toBeCloseTo(17319123.023856, highPrecisionDigits);
        expect(line.statistics.distanceArray).toBeInstanceOf(Array);
        expect(line.statistics.distanceArray).toHaveLength(2);
        expect(line.statistics.points).toEqual(4);
        expect(line.statistics.vertices).toEqual(10);
    });

    it("distance calculation", async function () {
        const line = new GeodesicLine();
        const distance = line.distance(FlindersPeak, Buninyong);
        expect(distance).toBeCloseTo(54972.271);
    });

    it("Preserve alt properties", async function () {
        const line = new GeodesicLine([FlindersPeak, Buninyong], { steps: 1 });
        const res = line.getLatLngs() as LatLng[][];
        expect(res[0][0].alt).toEqual(FlindersPeak.alt);
        expect(res[0][4].alt).toEqual(Buninyong.alt);
    });    
});

describe("GeoJSON-Support", function () {
    let container: HTMLElement;
    let map: Map;
    const mockLog = jest.fn();
    const originalLog = console.log;

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '400px';
        map = new Map(container, { renderer: new SVG(), center: [0, 0], zoom: 12 });

        mockLog.mockClear();
    });

    afterEach(function () {
        console.log = originalLog;
    })

    it("Just a Linestring", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}geometry-line.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("Feature with Linestring", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}feature-line.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with LineString", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}line.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with Polygon", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}polygon.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with Polygon inc hole", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}polygon-hole.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}polygon-hole.fixture.json`, "utf8")));
    });

    it("FeatureCollection with MultiPoint", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}multipoint.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with MultiLineString", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}multiline.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}multiline.fixture.json`, "utf8")));
    });

    it("FeatureCollection with MultiPolygon", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}multipolygon.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}multipolygon.fixture.json`, "utf8")));
    });

    it("FeatureCollection with LineString and MultiPolygon", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}line-multipolygon.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
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
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
        expect(latlngs).toBeInstanceOf(Array);
        expect(latlngs).toHaveLength(0);
        expect(mockLog.mock.calls[0][0]).toMatch(/Type "Point" not supported/);
    });

    it("Mixed FeatureCollection", async function () {
        console.log = mockLog;

        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}mixed.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}mixed.fixture.json`, "utf8")));
        expect(mockLog.mock.calls[0][0]).toMatch(/Type "Point" not supported/);
    });

    it("GeometryCollection", async function () {
        console.log = mockLog;

        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}geometrycollection.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = line.getLatLngs() as LatLng[][]; // FIXME: This is NOT typesafe!!
        expect(latlngs).toBeInstanceOf(Array);
        expect(latlngs).toHaveLength(0);
        expect(mockLog.mock.calls[0][0]).toMatch(/Type "GeometryCollection" not supported/);
    });
});

describe("Usage of base-class functions", function () {
    let container: HTMLElement;
    let map: Map;

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '400px';
        map = new Map(container, { renderer: new SVG(), center: [0, 0], zoom: 12 });
    });

    it("getBounds()", async function () {
        const line = new GeodesicLine([FlindersPeak, Buninyong]).addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();

        const bounds = line.getBounds();
        expect(bounds).toBeInstanceOf(LatLngBounds);
        checkFixture([[bounds.getCenter()]], [[{ lat: (FlindersPeak.lat + Buninyong.lat) / 2, lng: (FlindersPeak.lng + Buninyong.lng) / 2 }]]);
    });

    it("getBounds() in FeatureGroup", async function () {
        const line = new GeodesicLine([FlindersPeak, Buninyong]);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);

        const group = new FeatureGroup([line]).addTo(map);
        expect(map.hasLayer(group)).toBeTrue();

        const bounds = group.getBounds();
        expect(bounds).toBeInstanceOf(LatLngBounds);
        checkFixture([[bounds.getCenter()]], [[{ lat: (FlindersPeak.lat + Buninyong.lat) / 2, lng: (FlindersPeak.lng + Buninyong.lng) / 2 }]]);
    });

    it("addLatLng() to empty line", async function () {
        const line = new GeodesicLine([]).addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();

        line.addLatLng(LosAngeles);
        checkFixture(line.points, [[LosAngeles]])
    });

    it("addLatLng() to existing point", async function () {
        const line = new GeodesicLine([LosAngeles]).addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();

        line.addLatLng(Berlin);
        checkFixture(line.points, [[LosAngeles, Berlin]])
    });

    it("addLatLng() to existing line", async function () {
        const line = new GeodesicLine([LosAngeles, Berlin]).addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();

        line.addLatLng(Beijing);
        checkFixture(line.points, [[LosAngeles, Berlin, Beijing]])
    });

    it("addLatLng() to multiline", async function () {
        const line = new GeodesicLine([[Berlin, LosAngeles], [Santiago, Capetown]]).addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();

        line.addLatLng(Beijing);
        checkFixture(line.points, [[Berlin, LosAngeles], [Santiago, Capetown, Beijing]])
    });

    it("addLatLng() to multiline with given segment #0", async function () {
        const line = new GeodesicLine([[Berlin, LosAngeles], [Santiago, Capetown]]).addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();

        line.addLatLng(Beijing, line.points[0]);
        checkFixture(line.points, [[Berlin, LosAngeles, Beijing], [Santiago, Capetown]])
    });

    it("addLatLng() to multiline with given segment #1", async function () {
        const line = new GeodesicLine([[Berlin, LosAngeles], [Santiago, Capetown], [Tokyo, Sydney]]).addTo(map);
        expect(line).toBeInstanceOf(GeodesicLine);
        compareObject(line.options, defaultOptions);
        expect(map.hasLayer(line)).toBeTrue();

        line.addLatLng(Beijing, line.points[1]);
        checkFixture(line.points, [[Berlin, LosAngeles], [Santiago, Capetown, Beijing], [Tokyo, Sydney]])
    });

});
