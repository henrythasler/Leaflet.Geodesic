/**
 * @jest-environment jsdom
 */
import L from "leaflet";
import * as geojson from "geojson";
import { GeodesicOptions } from "../src/geodesic-core"
import { GeodesicLine } from "../src/geodesic-line";
import { readFileSync } from "fs";
import { expect } from "chai";
import { latlngExpressionArraytoLiteralArray } from "../src/types-helper";

import "jest";

const Berlin: L.LatLngLiteral = { lat: 52.5, lng: 13.35 };
const Seattle: L.LatLngLiteral = { lat: 47.56, lng: -122.33 };
const Capetown: L.LatLngLiteral = { lat: -33.94, lng: 18.39 };

const SeattleCapetown5: L.LatLngLiteral[] = [
    Seattle,
    { lat: 41.580847, lng: -70.162019 },
    { lat: 18.849527, lng: -35.885828 },
    { lat: -8.461111, lng: -10.677708 },
    Capetown
];

const fixturesPath = "spec/fixtures/";

const defaultOptions: GeodesicOptions = { wrap: true, steps: 3 };
const eps = 0.000001;

function checkFixture(specimen: L.LatLngLiteral[][], fixture: L.LatLngLiteral[][]): void {
    expect(specimen).to.be.an("array");
    expect(specimen).to.be.length(fixture.length);
    specimen.forEach((line, k) => {
        expect(line).to.be.length(fixture[k].length);
        line.forEach((point, l) => {
            expect(point).to.be.an("object");
            expect(point).to.include.all.keys("lat", "lng");
            expect(point.lat).to.be.closeTo(fixture[k][l].lat, eps);
            expect(point.lng).to.be.closeTo(fixture[k][l].lng, eps);
        });
    });
}

describe("Main functionality", function () {
    let map: L.Map;

    beforeEach(function () {
        map = L.map(document.createElement('div'));
    });

    afterEach(function () {
        map.remove();
    });

    it("Create class w/o any parameters", function () {
        const line = new GeodesicLine();
        expect(line.options).to.be.deep.equal(defaultOptions);
    });

    it("Create class with parameters", function () {
        const line = new GeodesicLine([Berlin, Seattle], { steps: 0 });
        expect(line.options).to.be.deep.equal({ ...defaultOptions, ...{ steps: 0 } });
    });

    it("Create class with parameters", function () {
        const line = new GeodesicLine([Berlin, Seattle], { wrap: false });
        expect(line.options).to.be.deep.equal({ ...defaultOptions, ...{ wrap: false } });
    });

    it("Add empty line to map", async function () {
        const line = new GeodesicLine().addTo(map);
        expect(line.options).to.be.deep.equal(defaultOptions);
        expect(line.polyline).to.be.an("object");

        expect(map.hasLayer(line)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GeodesicLine);
        });
    });

    it("Modify Line", async function () {
        const line = new GeodesicLine().addTo(map);
        expect(line.options).to.be.deep.equal(defaultOptions);
        expect(line.polyline).to.be.an("object");
        expect(map.hasLayer(line)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GeodesicLine);
        });
        line.setLatLngs([Berlin, Capetown]);
    });

    it("Modify Line w/o wrapping", async function () {
        const line = new GeodesicLine([], { wrap: false }).addTo(map);
        expect(line.options).to.be.deep.equal({ ...defaultOptions, ...{ wrap: false } });
        expect(line.polyline).to.be.an("object");
        expect(map.hasLayer(line)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GeodesicLine);
        });
        line.setLatLngs([Berlin, Capetown]);
    });

    it("Read LatLngs", async function () {
        const line = new GeodesicLine().addTo(map);
        expect(line.options).to.be.deep.equal(defaultOptions);
        expect(line.polyline).to.be.an("object");
        expect(map.hasLayer(line)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GeodesicLine);
        });
        const latlngs = line.getLatLngs();
        expect(latlngs).to.be.an("array");
    });
});

describe("GeoJSON-Support", function () {
    let map: L.Map;

    beforeEach(function () {
        map = L.map(document.createElement('div'));
    });

    afterEach(function () {
        map.remove();
    });

    it("Read LineString", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: geojson.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}simple-linestring.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("Read Polygon", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: geojson.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}simple-polygon.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("Read MultiPoint", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: geojson.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}simple-multipoint.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("Read MultiLineString", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: geojson.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}simple-multilinestring.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}multiline.fixture.json`, "utf8")));
    });

});
