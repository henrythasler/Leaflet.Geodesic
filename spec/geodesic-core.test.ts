import { GeodesicCore } from "../src/geodesic-core";

import "jest";
import L from "leaflet";

import { highPrecisionDigits, lowPrecisionDigits, medPrecisionDigits, expectCloseTo } from "./test-toolbox";

// test case with distance 54972.271 m
const FlindersPeak = new L.LatLng(-37.9510334166667, 144.424867888889);
const Buninyong = new L.LatLng(-37.6528211388889, 143.926495527778);

const Berlin = new L.LatLng(52.5, 13.35);
const LosAngeles = new L.LatLng(33.82, -118.38);

const Seattle = new L.LatLng(47.56, -122.33);
const Santiago = new L.LatLng(-33.44, -70.71);
const Capetown = new L.LatLng(-33.94, 18.39);

const geodesic = new GeodesicCore();

describe("Helper functions", function () {
    it("toDegrees() - convert radians to degrees", function () {
        expect(geodesic.toDegrees(0)).toBeCloseTo(0, highPrecisionDigits);
        expect(geodesic.toDegrees(Math.PI)).toBeCloseTo(180, highPrecisionDigits);
        expect(geodesic.toDegrees(-2 * Math.PI)).toBeCloseTo(-360, highPrecisionDigits);
    });

    it("toRadians() - convert degrees to radians", function () {
        expect(geodesic.toRadians(0)).toBeCloseTo(0, highPrecisionDigits);
        expect(geodesic.toRadians(180)).toBeCloseTo(Math.PI, highPrecisionDigits);
        expect(geodesic.toRadians(-360)).toBeCloseTo(-2 * Math.PI, highPrecisionDigits);
    });

    it("wrap360() - limit value to 0..360", function () {
        expect(geodesic.wrap360(90)).toBeCloseTo(90, highPrecisionDigits);
        expect(geodesic.wrap360(360)).toBeCloseTo(0, highPrecisionDigits);
        expect(geodesic.wrap360(-90)).toBeCloseTo(270, highPrecisionDigits);
    });

    it("wrap() - limit value to -360...+360", function () {
        expect(geodesic.wrap(90)).toBeCloseTo(90, highPrecisionDigits);
        expect(geodesic.wrap(360)).toBeCloseTo(360, highPrecisionDigits);
        expect(geodesic.wrap(-360)).toBeCloseTo(-360, highPrecisionDigits);
        expect(geodesic.wrap(-90)).toBeCloseTo(-90, highPrecisionDigits);
        expect(geodesic.wrap(1000)).toBeCloseTo(280, highPrecisionDigits);
        expect(geodesic.wrap(-1000)).toBeCloseTo(-280, highPrecisionDigits);
    });

    it("wrap(?, 180) - limit value to -180...+180", function () {
        expect(geodesic.wrap(90, 180)).toBeCloseTo(90, highPrecisionDigits);
        expect(geodesic.wrap(360, 180)).toBeCloseTo(0, highPrecisionDigits);
        expect(geodesic.wrap(-360, 180)).toBeCloseTo(0, highPrecisionDigits);
        expect(geodesic.wrap(180, 180)).toBeCloseTo(180, highPrecisionDigits);
        expect(geodesic.wrap(-180, 180)).toBeCloseTo(-180, highPrecisionDigits);
        expect(geodesic.wrap(-90, 180)).toBeCloseTo(-90, highPrecisionDigits);
        expect(geodesic.wrap(1000, 180)).toBeCloseTo(-80, highPrecisionDigits);
        expect(geodesic.wrap(-1000, 180)).toBeCloseTo(80, highPrecisionDigits);
    });

});


describe("Vincenty direct - regular test cases", function () {
    it("Along the equator", function () {
        const dest = geodesic.direct(new L.LatLng(0, 0),
            90,
            100000
        );
        expect(dest).toBeObject();
        expect(dest).toContainAllKeys(["lat", "lng", "bearing"]);
        expect(dest.lat).toBeCloseTo(0, highPrecisionDigits);
        expect(dest.lng).toBeCloseTo(0.898315, highPrecisionDigits);  // position was validated with QGIS-Plugin ("Create line of bearing")
        expect(dest.bearing).toBeCloseTo(90, highPrecisionDigits);
    });

    it("Equator circumference", function () {
        const dest = geodesic.direct(new L.LatLng(0, 0),
            90,
            6378137 * 2 * Math.PI
        );
        expect(dest).toBeObject();
        expect(dest).toContainAllKeys(["lat", "lng", "bearing"]);
        expect(dest.lat).toBeCloseTo(0, highPrecisionDigits);
        expect(dest.lng).toBeCloseTo(0, highPrecisionDigits);
        expect(dest.bearing).toBeCloseTo(90, highPrecisionDigits);
    });

    // from https://www.movable-type.co.uk/scripts/latlong-vincenty.html
    it("FlindersPeak to Buninyong", function () {
        const dest = geodesic.direct(FlindersPeak, 306. + 52. / 60. + 5.37 / 3600., 54972.271);
        expect(dest).toBeObject();
        expect(dest).toContainAllKeys(["lat", "lng", "bearing"]);
        expect(dest.lat).toBeCloseTo(Buninyong.lat, highPrecisionDigits);
        expect(dest.lng).toBeCloseTo(Buninyong.lng, highPrecisionDigits);
        expect(dest.bearing).toBeCloseTo(307. + 10. / 60. + 25.07 / 3600., highPrecisionDigits);
    });

    it("Let's go somewhere from Berlin", function () {
        const dest = geodesic.direct(Berlin, 90, 16000000);
        expect(dest).toBeObject();
        expect(dest).toContainAllKeys(["lat", "lng", "bearing"]);
        expect(dest.lat).toBeCloseTo(-40.018704, highPrecisionDigits);
        expect(dest.lng).toBeCloseTo(143.167929, highPrecisionDigits);  // position was validated with QGIS-Plugin ("Create line of bearing")
        expect(dest.bearing).toBeCloseTo(127.299753, highPrecisionDigits);
    });
});

describe("Vincenty direct - Corner-cases and error handling", function () {
    it("antipodal position along equator", function () {
        const dest = geodesic.direct(new L.LatLng(0, 0), 90, 6378137 * Math.PI);
        expect(dest).toBeObject();
        expect(dest).toContainAllKeys(["lat", "lng", "bearing"]);
        expect(dest.lat).toBeCloseTo(0, highPrecisionDigits);
        expect(dest.lng).toBeCloseTo(-180, highPrecisionDigits);  // FIXME: why is this not +180?
        expect(dest.bearing).toBeCloseTo(90, highPrecisionDigits);
    });

    it("zero distance", function () {
        const dest = geodesic.direct(new L.LatLng(0, 0), 90, 0);
        expect(dest).toBeObject();
        expect(dest).toContainAllKeys(["lat", "lng", "bearing"]);
        expect(dest.lat).toBeCloseTo(0, highPrecisionDigits);
        expect(dest.lng).toBeCloseTo(0, highPrecisionDigits);
        expect(dest.bearing).toBeCloseTo(90, highPrecisionDigits);
    });

    it("Reduced iterations to throw maxIterations-error", function () {
        expect(() => geodesic.direct(Berlin, 90, 16000000, 3)).toThrow(/vincenty formula failed to converge/);
    });
});


describe("Vincenty inverse - regular test cases", function () {
    it("FlindersPeak to Buninyong", function () {
        const res = geodesic.inverse(FlindersPeak, Buninyong);
        expect(res).toBeObject();
        expect(res).toContainAllKeys(["distance", "initialBearing", "finalBearing"]);
        expect(res.distance).toBeCloseTo(54972.271, lowPrecisionDigits);   // epsilon is larger, because precision of reference value is  only 3 digits
        expect(res.initialBearing).toBeCloseTo(306 + 52 / 60 + 5.37 / 3600, highPrecisionDigits);
        expect(res.finalBearing).toBeCloseTo(307 + 10. / 60. + 25.07 / 3600., highPrecisionDigits);
    });

    it("Berlin to LosAngeles", function () {
        const res = geodesic.inverse(Berlin, LosAngeles, 10);
        expect(res).toBeObject();
        expect(res).toContainAllKeys(["distance", "initialBearing", "finalBearing"]);
        expect(res.distance).toBeCloseTo(9360165.785); // verified via http://www.ga.gov.au/geodesy/datums/vincenty_inverse.jsp
        expect(res.initialBearing).toBeCloseTo(321 + 28 / 60 + 34.1 / 3600, 0.1);
        expect(res.finalBearing).toBeCloseTo((180 + 27) % 360 + (11 + 60) % 60 / 60. + (8.62 + 60) % 60 / 3600., highPrecisionDigits);
    });


});

describe("Vincenty inverse - Corner-cases and error handling", function () {
    it("Antipodal (opposite)", function () {
        const res = geodesic.inverse(new L.LatLng(0, 0), new L.LatLng(0, 180));
        expect(res).toBeObject();
        expect(res).toContainAllKeys(["distance", "initialBearing", "finalBearing"]);
        expectCloseTo(res.distance, 20004000, 1000); // verified via http://www.ga.gov.au/geodesy/datums/vincenty_inverse.jsp
        expect(res.initialBearing).toBeCloseTo(0, highPrecisionDigits);   // the formula has special handling for antipodals (going only north/south)
        expect(res.finalBearing).toBeCloseTo(180, highPrecisionDigits);
    });

    it("Coincident (start=destination)", function () {
        const res = geodesic.inverse(Berlin, Berlin);
        expect(res).toBeObject();
        expect(res).toContainAllKeys(["distance", "initialBearing", "finalBearing"]);
        expect(res.distance).toBeCloseTo(0, lowPrecisionDigits); // verified via http://www.ga.gov.au/geodesy/datums/vincenty_inverse.jsp
        expect(res.initialBearing).toBeNaN();
        expect(res.finalBearing).toBeNaN();
    });

    it("no convergence", function () {
        expect(() => geodesic.inverse(new L.LatLng(0, 0), new L.LatLng(0, 179.5), 50, false)).toThrow(/vincenty formula failed to converge/);
    });

    it("mitigate convergence Error", function () {
        let res = geodesic.inverse(new L.LatLng(0, 0), new L.LatLng(0, 179.5));
        expect(res).toBeObject();
        expect(res).toContainAllKeys(["distance", "initialBearing", "finalBearing"]);
        expect(res.distance).toBeCloseTo(19969603.453263, highPrecisionDigits);
        expect(res.initialBearing).toBeCloseTo(90, highPrecisionDigits);   // the formula has special handling for antipodals (going only north/south)
        expect(res.finalBearing).toBeCloseTo(90, highPrecisionDigits);
    });

    it("λ > π", function () {
        expect(() => geodesic.inverse(new L.LatLng(-84, -172), new L.LatLng(-70, 190))).toThrow(/λ > π/);
    });
});

describe("Intersection - regular test cases", function () {
    it("Intersect at zero island", function () {
        const res = geodesic.intersection(
            new L.LatLng(0, -1), 90,
            new L.LatLng(-1, 0), 0);
        if (res) {
            expect(res).toBeInstanceOf(L.LatLng);
            expect(res.lat).toBeCloseTo(0, highPrecisionDigits);
            expect(res.lng).toBeCloseTo(0, highPrecisionDigits);
        }
        else {
            expect.fail("Expected intersection to be found, but got null");
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
            expect(res).toBeInstanceOf(L.LatLng);
            expect(res.lat).toBeCloseTo(17.099091, highPrecisionDigits);  // checked with QGIS
            expect(res.lng).toBeCloseTo(-33.681335, highPrecisionDigits);
        }
        else {
            expect.fail("Expected intersection to be found, but got null");
        }
    });

    it("Intersection from Chris Veness (stn-cdg-bxl)", function () {
        const res = geodesic.intersection(
            new L.LatLng(51.8853, 0.2545), 108.547,
            new L.LatLng(49.0034, 2.5735), 32.435
        );
        if (res) {
            expect(res).toBeInstanceOf(L.LatLng);
            expect(res.lat).toBeCloseTo(50.9078, medPrecisionDigits);
            expect(res.lng).toBeCloseTo(4.5084, medPrecisionDigits);
        }
        else {
            expect.fail("Expected intersection to be found, but got null");
        }
    });
});

describe("Intersection - Corner-cases and error handling", function () {
    it("Coincident", function () {
        const res = geodesic.intersection(
            Berlin, 0,
            Berlin, 0);
        if (res) {
            expect(res).toBeInstanceOf(L.LatLng);
            expect(res.lat).toBeCloseTo(Berlin.lat, highPrecisionDigits);
            expect(res.lng).toBeCloseTo(Berlin.lng, highPrecisionDigits);
        }
        else {
            expect.fail("Expected intersection to be found, but got null");
        }
    });

    it("Antipodal (from Chris Veness)", function () {
        const res = geodesic.intersection(
            new L.LatLng(2, 1), 0,
            new L.LatLng(1, 0), 90);
        expect(res).toBeNull();
    });

    it("Over southpole with φ3=NaN", function () {
        const res = geodesic.intersection(
            new L.LatLng(-77.6966041375563, 18.28125000000003), 179.99999999999994,
            new L.LatLng(89, 180), 180);

        if (res) {
            expect(res).toBeInstanceOf(L.LatLng);
            expect(res.lat).toBeCloseTo(-90, highPrecisionDigits);
            expect(res.lng).toBeCloseTo(196.00983852008366, highPrecisionDigits);
        }
        else {
            expect.fail("Expected intersection to be found, but got null");
        }
    });

});


describe("midpoint - regular test cases", function () {
    it("Seattle and Capetown", function () {
        const res = geodesic.midpoint(Seattle, Capetown);
        expect(res).toBeInstanceOf(L.LatLng);
        expect(res.lat).toBeCloseTo(18.849527, highPrecisionDigits);
        expect(res.lng).toBeCloseTo(-35.885828, highPrecisionDigits);
    });
});
