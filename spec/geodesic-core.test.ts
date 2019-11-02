import { GeodesicCore, WGS84Vector, GeodesicOptions } from "../src/geodesic-core";
import { expect } from "chai";

import "jest";

// test case with distance 54972.271 m
const FlindersPeak: L.LatLngLiteral = { lat: -37.9510334166667, lng: 144.424867888889 };
const Buninyong: L.LatLngLiteral = { lat: -37.6528211388889, lng: 143.926495527778 };

const Berlin: L.LatLngLiteral = { lat: 52.5, lng: 13.35 };
const LosAngeles: L.LatLngLiteral = { lat: 33.82, lng: -118.38 };

const Seattle: L.LatLngLiteral = { lat: 47.56, lng: -122.33 };
const Santiago: L.LatLngLiteral = { lat: -33.44, lng: -70.71 };
const Capetown: L.LatLngLiteral = { lat: -33.94, lng: 18.39 };

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

describe("Helper functions", function () {
    it("toDegrees() - convert radians to degrees", function () {
        expect(geodesic.toDegrees(0)).to.be.closeTo(0, eps);
        expect(geodesic.toDegrees(Math.PI)).to.be.closeTo(180, eps);
        expect(geodesic.toDegrees(-2 * Math.PI)).to.be.closeTo(-360, eps);
    });

    it("toRadians() - convert degrees to radians", function () {
        expect(geodesic.toRadians(0)).to.be.closeTo(0, eps);
        expect(geodesic.toRadians(180)).to.be.closeTo(Math.PI, eps);
        expect(geodesic.toRadians(-360)).to.be.closeTo(-2 * Math.PI, eps);
    });

    it("wrap360() - limit value to 0..360", function () {
        expect(geodesic.wrap360(90)).to.be.closeTo(90, eps);
        expect(geodesic.wrap360(360)).to.be.closeTo(0, eps);
        expect(geodesic.wrap360(-90)).to.be.closeTo(270, eps);
    });

});


describe("Vincenty direct - regular test cases", function () {
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
            6378137 * 2 * Math.PI
        );
        expect(dest).to.be.an("object");
        expect(dest).to.include.all.keys("lat", "lng", "bearing");
        expect(dest.lat).to.be.closeTo(0, eps);
        expect(dest.lng).to.be.closeTo(0, eps);
        expect(dest.bearing).to.be.closeTo(90, eps);
    });

    // from https://www.movable-type.co.uk/scripts/latlong-vincenty.html
    it("FlindersPeak to Buninyong", function () {
        const dest = geodesic.direct(FlindersPeak, 306. + 52. / 60. + 5.37 / 3600., 54972.271);
        expect(dest).to.be.an("object");
        expect(dest).to.include.all.keys("lat", "lng", "bearing");
        expect(dest.lat).to.be.closeTo(Buninyong.lat, eps);
        expect(dest.lng).to.be.closeTo(Buninyong.lng, eps);
        expect(dest.bearing).to.be.closeTo(307. + 10. / 60. + 25.07 / 3600., eps);
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

describe("Vincenty direct - Corner-cases and error handling", function () {
    it("antipodal position along equator", function () {
        const dest = geodesic.direct({ lat: 0, lng: 0 }, 90, 6378137 * Math.PI);
        expect(dest).to.be.an("object");
        expect(dest).to.include.all.keys("lat", "lng", "bearing");
        expect(dest.lat).to.be.closeTo(0, eps);
        expect(dest.lng).to.be.closeTo(180, eps);
        expect(dest.bearing).to.be.closeTo(90, eps);
    });

    it("zero distance", function () {
        const dest = geodesic.direct({ lat: 0, lng: 0 }, 90, 0);
        expect(dest).to.be.an("object");
        expect(dest).to.include.all.keys("lat", "lng", "bearing");
        expect(dest.lat).to.be.closeTo(0, eps);
        expect(dest.lng).to.be.closeTo(0, eps);
        expect(dest.bearing).to.be.closeTo(90, eps);
    });

    it("Reduced iterations to throw maxIterations-error", function () {
        try {
            geodesic.direct(Berlin, 90, 16000000, 3);
            expect.fail();
        } catch (e) {
            expect(e).to.be.an("Error");
            expect(e.message).to.have.match(/vincenty formula failed to converge/);
        }
    });
});


describe("Vincenty inverse - regular test cases", function () {
    it("FlindersPeak to Buninyong", function () {
        const res = geodesic.inverse(FlindersPeak, Buninyong);
        expect(res).to.be.an("object");
        expect(res).to.include.all.keys("distance", "initialBearing", "finalBearing");
        expect(res.distance).to.be.closeTo(54972.271, 0.001);   // epsilon is larger, because precision of reference value is  only 3 digits
        expect(res.initialBearing).to.be.closeTo(306 + 52 / 60 + 5.37 / 3600, eps);
        expect(res.finalBearing).to.be.closeTo(307 + 10. / 60. + 25.07 / 3600., eps);
    });

    it("Berlin to LosAngeles", function () {
        const res = geodesic.inverse(Berlin, LosAngeles, 10);
        expect(res).to.be.an("object");
        expect(res).to.include.all.keys("distance", "initialBearing", "finalBearing");
        expect(res.distance).to.be.closeTo(9360165.785, 0.001); // verified via http://www.ga.gov.au/geodesy/datums/vincenty_inverse.jsp
        expect(res.initialBearing).to.be.closeTo(321 + 28 / 60 + 34.1 / 3600, 0.1);
        expect(res.finalBearing).to.be.closeTo((180 + 27) % 360 + (11 + 60) % 60 / 60. + (8.62 + 60) % 60 / 3600., eps);
    });


});

describe("Vincenty inverse - Corner-cases and error handling", function () {
    it("Antipodal (opposite)", function () {
        const res = geodesic.inverse({ lat: 0, lng: 0 }, { lat: 0, lng: 180 });
        expect(res).to.be.an("object");
        expect(res).to.include.all.keys("distance", "initialBearing", "finalBearing");
        expect(res.distance).to.be.closeTo(20004000, 1000);
        expect(res.initialBearing).to.be.closeTo(0, eps);   // the formula has special handling for antipodals (going only north/south)
        expect(res.finalBearing).to.be.closeTo(180, eps);
    });

    it("Coincident (start=destination)", function () {
        const res = geodesic.inverse(Berlin, Berlin);
        expect(res).to.be.an("object");
        expect(res).to.include.all.keys("distance", "initialBearing", "finalBearing");
        expect(res.distance).to.be.closeTo(0, 0.001); // verified via http://www.ga.gov.au/geodesy/datums/vincenty_inverse.jsp
        expect(res.initialBearing).to.be.NaN;
        expect(res.finalBearing).to.be.NaN;
    });

    it("no convergence", function () {
        try {
            // reduced maxIterations
            geodesic.inverse({ lat: 0, lng: 0 }, { lat: 0, lng: 179.5 }, 50, false);
            expect.fail();
        } catch (e) {
            expect(e).to.be.an("Error");
            expect(e.message).to.have.match(/vincenty formula failed to converge/);
        }
    });

    it("mitigate convergence Error", function () {
        let res = geodesic.inverse({ lat: 0, lng: 0 }, { lat: 0, lng: 179.5 });
        expect(res).to.be.an("object");
        expect(res).to.include.all.keys("distance", "initialBearing", "finalBearing");
        expect(res.distance).to.be.closeTo(19969603.453263, eps);
        expect(res.initialBearing).to.be.closeTo(90, eps);   // the formula has special handling for antipodals (going only north/south)
        expect(res.finalBearing).to.be.closeTo(90, eps);
    });

    it("λ > π", function () {
        try {
            geodesic.inverse({ lat: -84, lng: -172 }, { lat: -70, lng: 190 });
            expect.fail();
        } catch (e) {
            expect(e).to.be.an("Error");
            expect(e.message).to.have.match(/λ > π/);
        }
    });
});

describe("Intersection - regular test cases", function () {
    it("Intersect at zero island", function () {
        const res = geodesic.intersection(
            { lat: 0, lng: -1 }, 90,
            { lat: -1, lng: 0 }, 0);
        if (res) {
            expect(res).to.be.an("object");
            expect(res).to.include.all.keys("lat", "lng");
            expect(res.lat).to.be.closeTo(0, eps);
            expect(res.lng).to.be.closeTo(0, eps);
        }
        else {
            expect.fail();
        }
    });

    it("Intersection Berlin-Santiago and Seattle-Capetown", function () {
        const path1 = geodesic.inverse(Berlin, Santiago);
        const path2 = geodesic.inverse(Seattle, Capetown);
        const res = geodesic.intersection(
            Berlin, path1.initialBearing,
            Seattle, path2.initialBearing
        );
        if (res) {
            expect(res).to.be.an("object");
            expect(res).to.include.all.keys("lat", "lng");
            expect(res.lat).to.be.closeTo(17.099091, eps);  // checked with QGIS
            expect(res.lng).to.be.closeTo(-33.681335, eps);
        }
        else {
            expect.fail();
        }
    });

    it("Intersection from Chris Veness (stn-cdg-bxl)", function () {
        const res = geodesic.intersection(
            { lat: 51.8853, lng: 0.2545 }, 108.547,
            { lat: 49.0034, lng: 2.5735 }, 32.435
        );
        if (res) {
            expect(res).to.be.an("object");
            expect(res).to.include.all.keys("lat", "lng");
            expect(res.lat).to.be.closeTo(50.9078, 0.0001);
            expect(res.lng).to.be.closeTo(4.5084, 0.0001);
        }
        else {
            expect.fail();
        }
    });
});

describe("Intersection - Corner-cases and error handling", function () {
    it("Coincident", function () {
        const res = geodesic.intersection(
            Berlin, 0,
            Berlin, 0);
        if (res) {
            expect(res).to.be.an("object");
            expect(res).to.include.all.keys("lat", "lng");
            expect(res.lat).to.be.closeTo(Berlin.lat, eps);
            expect(res.lng).to.be.closeTo(Berlin.lng, eps);
        }
        else {
            expect.fail();
        }
    });

    it("Antipodal (from Chris Veness)", function () {
        const res = geodesic.intersection(
            { lat: 2, lng: 1 }, 0,
            { lat: 1, lng: 0 }, 90);
        expect(res).to.be.null;
    });
});


describe("midpoint - regular test cases", function () {
    it("Seattle and Capetown", function () {
        const res = geodesic.midpoint(Seattle, Capetown);
        expect(res).to.be.an("object");
        expect(res).to.include.all.keys("lat", "lng");
        expect(res.lat).to.be.closeTo(18.849527, eps);
        expect(res.lng).to.be.closeTo(-35.885828, eps);
    });
});