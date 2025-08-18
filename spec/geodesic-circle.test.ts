import L from "leaflet";
import { GeodesicOptions } from "../src/geodesic-core"
import { GeodesicCircleClass } from "../src/geodesic-circle";

import "jest";

import { checkFixture, compareObject, closeToDigits_5, closeToDigits_3 } from "./test-toolbox";

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


const defaultOptions: GeodesicOptions = { wrap: true, steps: 24, fill: true, noClip: true };

describe("Main functionality", function () {
    let container: HTMLElement;
    let map: L.Map;
    const radius = 1000 * 1000;

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '400px';
        map = L.map(container, { renderer: new L.SVG(), center: [0, 0], zoom: 12 });
    });

    it("Create class w/o any parameters", function () {
        const circle = new GeodesicCircleClass();
        expect(circle).toBeInstanceOf(GeodesicCircleClass);
        compareObject(circle.options, defaultOptions);
    });

    it("Create class with parameters", function () {
        const circle = new GeodesicCircleClass(Beijing, { steps: 48 });
        expect(circle).toBeInstanceOf(GeodesicCircleClass);
        compareObject(circle.options, { ...defaultOptions, ...{ steps: 48 } });
    });

    it("Add empty circle to map", async function () {
        const circle = new GeodesicCircleClass().addTo(map);
        expect(circle).toBeInstanceOf(GeodesicCircleClass);
        compareObject(circle.options, defaultOptions);
        expect(map.hasLayer(circle)).toBe(true);
    });

    it("update center", async function () {
        const circle = new GeodesicCircleClass(Seattle).addTo(map);
        expect(circle).toBeInstanceOf(GeodesicCircleClass);
        compareObject(circle.options, defaultOptions);
        expect(map.hasLayer(circle)).toBe(true);

        circle.setLatLng(Beijing);
        expect(circle.center.lat).toBeCloseTo(Beijing.lat, closeToDigits_5);
        expect(circle.center.lng).toBeCloseTo(Beijing.lng, closeToDigits_5);
        expect(circle.radius).toBeCloseTo(radius, closeToDigits_5);
    });

    it("update center with radius", async function () {
        const circle = new GeodesicCircleClass(Seattle).addTo(map);
        expect(circle).toBeInstanceOf(GeodesicCircleClass);
        compareObject(circle.options, defaultOptions);
        expect(map.hasLayer(circle)).toBe(true);

        circle.setLatLng(Beijing, 2 * radius);
        expect(circle.center.lat).toBeCloseTo(Beijing.lat, closeToDigits_5);
        expect(circle.center.lng).toBeCloseTo(Beijing.lng, closeToDigits_5);
        expect(circle.radius).toBeCloseTo(2 * radius, closeToDigits_5);
    });

    it("update radius", async function () {
        const circle = new GeodesicCircleClass(Seattle, { radius: radius }).addTo(map);
        expect(circle).toBeInstanceOf(GeodesicCircleClass);
        compareObject(circle.options, { ...defaultOptions, ...{ radius: radius } });
        expect(map.hasLayer(circle)).toBe(true);

        expect(circle.center.lat).toBeCloseTo(Seattle.lat, closeToDigits_5);
        expect(circle.center.lng).toBeCloseTo(Seattle.lng, closeToDigits_5);
        circle.setRadius(2 * radius);
        expect(circle.radius).toBeCloseTo(2 * radius, closeToDigits_5);
    });

    it("update radius with center", async function () {
        const circle = new GeodesicCircleClass(Seattle, { radius: radius }).addTo(map);
        expect(circle).toBeInstanceOf(GeodesicCircleClass);
        compareObject(circle.options, { ...defaultOptions, ...{ radius: radius } });
        expect(map.hasLayer(circle)).toBe(true);

        expect(circle.center.lat).toBeCloseTo(Seattle.lat, closeToDigits_5);
        expect(circle.center.lng).toBeCloseTo(Seattle.lng, closeToDigits_5);
        circle.setRadius(2 * radius, Beijing);
        expect(circle.radius).toBeCloseTo(2 * radius, closeToDigits_5);
        expect(circle.center.lat).toBeCloseTo(Beijing.lat, closeToDigits_5);
        expect(circle.center.lng).toBeCloseTo(Beijing.lng, closeToDigits_5);
    });

    it("Add non-wrapped circle", function () {
        const circle = new GeodesicCircleClass(Beijing, { steps: 48, wrap: false }).addTo(map);
        expect(circle).toBeInstanceOf(GeodesicCircleClass);
        compareObject(circle.options, { ...defaultOptions, ...{ steps: 48, wrap: false } });
        expect(map.hasLayer(circle)).toBe(true);
    });

    it("distance function (wrapper for vincenty inverse)", function () {
        const circle = new GeodesicCircleClass(FlindersPeak);
        const res = circle.distanceTo(Buninyong);
        expect(res).toBeNumber();
        expect(res).toBeCloseTo(54972.271, closeToDigits_3);   // epsilon is larger, because precision of reference value is only 3 digits
    });

    it("Statistics calculation (simple)", async function () {
        const circle = new GeodesicCircleClass(Beijing, { radius: 1000, steps: 24 });
        expect(circle.statistics.totalDistance).toBeCloseTo(6265.257177, closeToDigits_5);
        expect(circle.statistics.distanceArray).toBeInstanceOf(Array);
        expect(circle.statistics.distanceArray).toHaveLength(1);
        expect(circle.statistics.points).toEqual(1);
        expect(circle.statistics.vertices).toEqual(25);
    });

});

describe("Bugs", function () {
    let container: HTMLElement;
    let map: L.Map;

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '400px';
        map = L.map(container, { renderer: new L.SVG(), center: [0, 0], zoom: 12 });
    });

    it("Calling getBounds on a GeodesicCircle throws an error (#48)", async function () {
        const circle = new GeodesicCircleClass(Seattle, { radius: 10 });
        const group = new L.FeatureGroup([circle]).addTo(map);

        compareObject(circle.options, { ...defaultOptions, ...{ radius: 10 } });
        expect(circle.center.lat).toBeCloseTo(Seattle.lat, closeToDigits_5);
        expect(circle.center.lng).toBeCloseTo(Seattle.lng, closeToDigits_5);

        expect(map.hasLayer(group)).toBe(true);

        const bounds = group.getBounds();
        expect(bounds).toBeInstanceOf(L.LatLngBounds);
        checkFixture([[bounds.getCenter()]], [[Seattle]]);
    });
});
