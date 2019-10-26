import { GeodesicCore, WGS84Vector, GeodesicOptions } from "../src/geodesic-core";
import { expect } from "chai";

import "jest";

// test case with distance 54972.271 m
const FlindersPeak:L.LatLngLiteral = {lat: -37.9510334166667, lng: 144.424867888889};
const Buninyong:L.LatLngLiteral = {lat: -37.6528211388889, lng: 143.926495527778};

const Berlin:L.LatLngLiteral = {lat: 52.5, lng: 13.35};
// const losangeles = new L.LatLng(33.82, -118.38);
// const santiago = new L.LatLng(-33.44, -70.71);
// const tokio = new L.LatLng(35.47, 139.15);
// const sydney = new L.LatLng(-33.91, 151.08);
// const capetown = new L.LatLng(-33.94, 18.39);
// const calgary = new L.LatLng(51.07, -114.35);
// const hammerfest = new L.LatLng(70.70, 23.55);
// const barrow = new L.LatLng(71.35, -156);

// const northMagneticPole = [85.9, -147];
// const southMagneticPole = [-64.497, 137.684];
// const northPole = [90, 0];
// const southPole = [-90, 0];

const geodesic = new GeodesicCore();
const eps = 0.000001;


describe("Degree <-> Radians conversion", function () {
    it("toDegrees() - zero", function () {
        let degrees = geodesic.toDegrees(0);
        expect(degrees).to.be.closeTo(0, eps);
    });

    it("toDegrees() - positive radians", function () {
        let degrees = geodesic.toDegrees(Math.PI);
        expect(degrees).to.be.closeTo(180, eps);
    });

    it("toDegrees() - negative radians", function () {
        let degrees = geodesic.toDegrees(-2 * Math.PI);
        expect(degrees).to.be.closeTo(-360, eps);
    });


    it("toRadians() - zero", function () {
        let radians = geodesic.toRadians(0);
        expect(radians).to.be.closeTo(0, eps);
    });

    it("toRadians() - positive radians", function () {
        let radians = geodesic.toRadians(180);
        expect(radians).to.be.closeTo(Math.PI, eps);
    });

    it("toRadians() - negative radians", function () {
        let radians = geodesic.toRadians(-360);
        expect(radians).to.be.closeTo(-2 * Math.PI, eps);
    });
});

describe("Vincenty direct calculation", function () {
    it("Along the equator", function () {
        const dest = geodesic.direct({
            lat: 0,
            lng: 0,
        } as L.LatLngLiteral,
            90,
            100000
        );
        expect(dest).to.be.an("object");
        expect(dest).to.include.all.keys("lat", "lng", "bearing");
        expect(dest.lat).to.be.closeTo(0, eps);
        expect(dest.lng).to.be.closeTo(0.898315, eps);  // position was validated with QGIS-Plugin ("Create line of bearing")
        expect(dest.bearing).to.be.closeTo(90, eps);
    });

    it("Equator circumfence", function () {
        const dest = geodesic.direct({
            lat: 0,
            lng: 0,
        } as L.LatLngLiteral,
            90,
            6378137*2*Math.PI
        );
        expect(dest).to.be.an("object");
        expect(dest).to.include.all.keys("lat", "lng", "bearing");
        expect(dest.lat).to.be.closeTo(0, eps);
        expect(dest.lng).to.be.closeTo(0, eps);
        expect(dest.bearing).to.be.closeTo(90, eps);
    });

    it("FlindersPeak to Buninyong", function () {
        const dest = geodesic.direct(FlindersPeak, 90, 54972.271);
        expect(dest).to.be.an("object");
        expect(dest).to.include.all.keys("lat", "lng", "bearing");
        expect(dest.lat).to.be.closeTo(Buninyong.lat, eps);
        expect(dest.lng).to.be.closeTo(Buninyong.lng, eps);  // position was validated with QGIS-Plugin ("Create line of bearing")
        expect(dest.bearing).to.be.closeTo(127.299753, eps);
    });


    it("Let's go somewhere from Berlin", function () {
        const dest = geodesic.direct(Berlin, 90, 16000000);
        expect(dest).to.be.an("object");
        expect(dest).to.include.all.keys("lat", "lng", "bearing");
        expect(dest.lat).to.be.closeTo(-40.018704, eps);
        expect(dest.lng).to.be.closeTo(143.167929, eps);  // position was validated with QGIS-Plugin ("Create line of bearing")
        expect(dest.bearing).to.be.closeTo(127.299753, eps);
    });

});
