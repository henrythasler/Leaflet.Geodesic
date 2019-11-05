/**
 * @jest-environment jsdom
 */
import L from "leaflet";
import { GeodesicOptions } from "../src/geodesic-core"
import { GreatCircleClass } from "../src/great-circle";
import { expect } from "chai";

import "jest";

// test case with distance 54972.271 m
const FlindersPeak: L.LatLngLiteral = { lat: -37.9510334166667, lng: 144.424867888889 };
const Buninyong: L.LatLngLiteral = { lat: -37.6528211388889, lng: 143.926495527778 };

const Seattle: L.LatLngLiteral = { lat: 47.56, lng: -122.33 };
const Beijing: L.LatLngLiteral = { lat: 39.92, lng: 116.39 };

const defaultOptions:GeodesicOptions = { wrap: true, steps: 24, noClip: true };

const eps = 0.000001;

describe("Main functionality", function () {
    let map: L.Map;
    const radius = 1000 * 1000;

    beforeEach(function () {
        map = L.map(document.createElement('div'));
    });

    afterEach(function () {
        map.remove();
    });

    it("Create class w/o any parameters", function () {
        const circle = new GreatCircleClass();
        expect(circle.options).to.be.deep.equal(defaultOptions);
        expect(circle.polyline).to.be.an("object");
    });

    it("Create class with legacy parameters", function () {
        const circle = new GreatCircleClass(Beijing, {wrap: true});
        expect(circle.options).to.be.deep.equal(defaultOptions);
        expect(circle.polyline).to.be.an("object");
    });

    it("Add empty circle to map", async function () {
        const circle = new GreatCircleClass().addTo(map);
        expect(circle.options).to.be.deep.equal(defaultOptions);
        expect(circle.polyline).to.be.an("object");

        expect(map.hasLayer(circle)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GreatCircleClass);
        });
    });

    it("update center", async function () {
        const circle = new GreatCircleClass(Seattle).addTo(map);
        circle.setLatLng(Beijing);
        expect(circle.options).to.be.deep.equal(defaultOptions);
        expect(circle.polyline).to.be.an("object");
        expect(circle.center.lat).to.be.closeTo(Beijing.lat, eps);
        expect(circle.center.lng).to.be.closeTo(Beijing.lng, eps);
        expect(circle.radius).to.be.closeTo(radius, eps);

        expect(map.hasLayer(circle)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GreatCircleClass);
        });
    });

    it("update radius", async function () {
        const circle = new GreatCircleClass(Seattle, { radius: radius }).addTo(map);
        expect(circle.options).to.be.deep.equal({ ...defaultOptions, ...{radius: radius} });
        expect(circle.polyline).to.be.an("object");
        expect(circle.center.lat).to.be.closeTo(Seattle.lat, eps);
        expect(circle.center.lng).to.be.closeTo(Seattle.lng, eps);
        circle.setRadius(2 * radius);
        expect(circle.radius).to.be.closeTo(2 * radius, eps);

        expect(map.hasLayer(circle)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GreatCircleClass);
        });
    });

    it("distance function (wrapper for vincenty inverse)", function () {
        const circle = new GreatCircleClass(FlindersPeak);
        const res = circle.distanceTo(Buninyong);
        expect(res).to.be.a("number");
        expect(res).to.be.closeTo(54972.271, 0.001);   // epsilon is larger, because precision of reference value is  only 3 digits
    });

});