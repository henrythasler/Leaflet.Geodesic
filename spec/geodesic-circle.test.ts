/**
 * @jest-environment jsdom
 */
import * as L from "leaflet";
import { GeodesicCircleClass } from "../src/geodesic-circle";
import { expect } from "chai";
import "jest";
import {Beijing, Buninyong, checkFixture, compareObject, eps, FlindersPeak, Seattle} from "./test-toolbox";
import {mockMap} from "./mock-map";


const defaultOptions = { wrap: true, steps: 24, fill: true, noClip: true };

describe("Main functionality", function () {
    const radius = 1000 * 1000, map = mockMap();

    it("Create class w/o any parameters", function () {
        const circle = new GeodesicCircleClass();
        expect(circle).to.be.instanceOf(GeodesicCircleClass);
        compareObject(circle.options, defaultOptions);
    });

    it("Create class with parameters", function () {
        const circle = new GeodesicCircleClass(Beijing, { steps: 48 });
        expect(circle).to.be.instanceOf(GeodesicCircleClass);
        compareObject(circle.options, { ...defaultOptions, ...{ steps: 48 } });
    });

    it("Add empty circle to map", async function () {
        const circle = new GeodesicCircleClass().addTo(map);
        expect(circle).to.be.instanceOf(GeodesicCircleClass);
        compareObject(circle.options, defaultOptions);
        expect(map.hasLayer(circle)).to.be.true;
    });

    it("update center", async function () {
        const circle = new GeodesicCircleClass(Seattle).addTo(map);
        expect(circle).to.be.instanceOf(GeodesicCircleClass);
        compareObject(circle.options, defaultOptions);
        expect(map.hasLayer(circle)).to.be.true;

        circle.setLatLng(Beijing);
        expect(circle.center.lat).to.be.closeTo(Beijing.lat, eps);
        expect(circle.center.lng).to.be.closeTo(Beijing.lng, eps);
        expect(circle.radius).to.be.closeTo(radius, eps);
    });

    it("update center with radius", async function () {
        const circle = new GeodesicCircleClass(Seattle).addTo(map);
        expect(circle).to.be.instanceOf(GeodesicCircleClass);
        compareObject(circle.options, defaultOptions);
        expect(map.hasLayer(circle)).to.be.true;

        circle.setLatLng(Beijing, 2 * radius);
        expect(circle.center.lat).to.be.closeTo(Beijing.lat, eps);
        expect(circle.center.lng).to.be.closeTo(Beijing.lng, eps);
        expect(circle.radius).to.be.closeTo(2 * radius, eps);
    });

    it("update radius", async function () {
        const circle = new GeodesicCircleClass(Seattle, { radius: radius }).addTo(map);
        expect(circle).to.be.instanceOf(GeodesicCircleClass);
        compareObject(circle.options, { ...defaultOptions, ...{ radius: radius } });
        expect(map.hasLayer(circle)).to.be.true;

        expect(circle.center.lat).to.be.closeTo(Seattle.lat, eps);
        expect(circle.center.lng).to.be.closeTo(Seattle.lng, eps);
        circle.setRadius(2 * radius);
        expect(circle.radius).to.be.closeTo(2 * radius, eps);
    });

    it("update radius with center", async function () {
        const circle = new GeodesicCircleClass(Seattle, { radius: radius }).addTo(map);
        expect(circle).to.be.instanceOf(GeodesicCircleClass);
        compareObject(circle.options, { ...defaultOptions, ...{ radius: radius } });
        expect(map.hasLayer(circle)).to.be.true;

        expect(circle.center.lat).to.be.closeTo(Seattle.lat, eps);
        expect(circle.center.lng).to.be.closeTo(Seattle.lng, eps);
        circle.setRadius(2 * radius, Beijing);
        expect(circle.radius).to.be.closeTo(2 * radius, eps);
        expect(circle.center.lat).to.be.closeTo(Beijing.lat, eps);
        expect(circle.center.lng).to.be.closeTo(Beijing.lng, eps);
    });

    it("Add non-wrapped circle", function () {
        const circle = new GeodesicCircleClass(Beijing, { steps: 48, wrap: false }).addTo(map);
        expect(circle).to.be.instanceOf(GeodesicCircleClass);
        compareObject(circle.options, { ...defaultOptions, ...{ steps: 48, wrap: false } });
        expect(map.hasLayer(circle)).to.be.true;
    });

    it("distance function (wrapper for vincenty inverse)", function () {
        const circle = new GeodesicCircleClass(FlindersPeak);
        const res = circle.distanceTo(Buninyong);
        expect(res).to.be.a("number");
        expect(res).to.be.closeTo(54972.271, 0.001);   // epsilon is larger, because precision of reference value is only 3 digits
    });

    it("Statistics calculation (simple)", async function () {
        const circle = new GeodesicCircleClass(Beijing, { radius: 1000, steps: 24 });
        expect(circle.statistics.totalDistance).to.be.closeTo(6265.257177, eps);
        expect(circle.statistics.distanceArray).to.be.an("array");
        expect(circle.statistics.distanceArray).to.be.length(1);
        expect(circle.statistics.points).to.be.equal(1);
        expect(circle.statistics.vertices).to.be.equal(25);
    });

});

describe("Bugs", function () {
    const map = mockMap();

    it("Calling getBounds on a GeodesicCircle throws an error (#48)", async function () {
        const circle = new GeodesicCircleClass(Seattle, { radius: 10 });
        const group = new L.FeatureGroup([circle]).addTo(map);

        compareObject(circle.options, { ...defaultOptions, ...{ radius: 10 } });
        expect(circle.center.lat).to.be.closeTo(Seattle.lat, eps);
        expect(circle.center.lng).to.be.closeTo(Seattle.lng, eps);

        expect(map.hasLayer(group)).to.be.true;

        const bounds = group.getBounds();
        expect(bounds).to.be.instanceOf(L.LatLngBounds);
        checkFixture([[bounds.getCenter()]], [[Seattle]]);
    });
});
