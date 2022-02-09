/*! Leaflet.Geodesic 2.6.1 - (c) Henry Thasler - https://github.com/henrythasler/Leaflet.Geodesic */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leaflet')) :
    typeof define === 'function' && define.amd ? define(['exports', 'leaflet'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.L = global.L || {}, global.L.geodesic = {}), global.L));
})(this, (function (exports, L) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var L__namespace = /*#__PURE__*/_interopNamespace(L);

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    /**
     * Default options for geodesic classes
     */
    var DEFAULT_GEODESIC_OPTIONS = {
        radius: 1000000,
        steps: 3,
        wrap: true,
        moveNoWrapTo: "first-point",
        segmentsNumber: undefined,
        breakPoints: undefined,
        naturalDrawing: false,
        naturalDrawingFixedNumberOfSegments: false,
        updateStatisticsAfterRedrawing: true,
    };
    var GeodesicCore = /** @class */ (function () {
        function GeodesicCore(options) {
            this.ellipsoid = {
                a: 6378137,
                b: 6356752.3142,
                f: 1 / 298.257223563
            }; // WGS-84
            /**
             * Precision to perform comparisons with
             */
            this.precision = 0.00001;
            this.options = __assign(__assign({}, DEFAULT_GEODESIC_OPTIONS), options);
        }
        /**
         * Converts degrees to radians
         * @param degree Angle to convert
         */
        GeodesicCore.prototype.toRadians = function (degree) {
            return degree * Math.PI / 180;
        };
        /**
         * Converts radians to degrees
         * @param radians Angle to convert
         */
        GeodesicCore.prototype.toDegrees = function (radians) {
            return radians * 180 / Math.PI;
        };
        /**
         * Returns true, if `n1 = n2` with precision of {@link GeodesicCore#precision}
         * @param n1 First number to compare
         * @param n2 Second number to compare
         */
        GeodesicCore.prototype.isEqual = function (n1, n2) {
            return Math.abs(n1 - n2) <= this.precision;
        };
        /**
         * Returns true, if `n1 <= n2` with precision of {@link GeodesicCore#precision}
         * @param n1 First number to compare
         * @param n2 Second number to compare
         */
        GeodesicCore.prototype.isLessThanOrEqualTo = function (n1, n2) {
            return n1 - n2 <= this.precision;
        };
        /**
         * Returns true, if `n1 >= n2` with precision of {@link GeodesicCore#precision}
         * @param n1 First number to compare
         * @param n2 Second number to compare
         */
        GeodesicCore.prototype.isGreaterThanOrEqualTo = function (n1, n2) {
            return n1 - n2 >= -this.precision;
        };
        /**
         * Implements scientific modulus.
         * [Source](http://www.codeavenger.com/2017/05/19/JavaScript-Modulo-operation-and-the-Caesar-Cipher.html).
         * @param n
         * @param p
         * @return
         */
        GeodesicCore.prototype.mod = function (n, p) {
            var r = n % p;
            return r < 0 ? r + p : r;
        };
        /**
         * Wraps given angle to `[0, 360]` degrees range
         * Source: https://github.com/chrisveness/geodesy/blob/master/dms.js
         * @param degrees Arbitrary value
         * @return Degrees between `[0, 360]` range
         */
        GeodesicCore.prototype.wrap360 = function (degrees) {
            if (0 <= degrees && degrees < 360) {
                return degrees; // avoid rounding due to arithmetic ops if within range
            }
            else {
                return this.mod(degrees, 360);
            }
        };
        /**
         * General wrap function with arbitrary max value
         * @param degrees Arbitrary value
         * @param max Defines range to wrap value too
         * @return Degrees between `[-max, max]`
         */
        GeodesicCore.prototype.wrap = function (degrees, max) {
            if (max === void 0) { max = 360; }
            if (-max <= degrees && degrees <= max) {
                return degrees;
            }
            else {
                return this.mod((degrees + max), 2 * max) - max;
            }
        };
        /**
         * Vincenty direct calculation.
         * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
         * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
         *
         * @param start Starting point
         * @param bearing Initial bearing (in degrees)
         * @param distance Distance from starting point to calculate along given bearing in meters.
         * @param maxInterations How many iterations can be made to reach the allowed deviation (`ε`), before an error will be thrown.
         * @return Final point (destination point) and bearing (in degrees)
         */
        GeodesicCore.prototype.direct = function (start, bearing, distance, maxInterations) {
            if (maxInterations === void 0) { maxInterations = 100; }
            var φ1 = this.toRadians(start.lat);
            var λ1 = this.toRadians(start.lng);
            var α1 = this.toRadians(bearing);
            var s = distance;
            var ε = Number.EPSILON * 1000;
            var _a = this.ellipsoid, a = _a.a, b = _a.b, f = _a.f;
            var sinα1 = Math.sin(α1);
            var cosα1 = Math.cos(α1);
            var tanU1 = (1 - f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
            var σ1 = Math.atan2(tanU1, cosα1); // σ1 = angular distance on the sphere from the equator to P1
            var sinα = cosU1 * sinα1; // α = azimuth of the geodesic at the equator
            var cosSqα = 1 - sinα * sinα;
            var uSq = cosSqα * (a * a - b * b) / (b * b);
            var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
            var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
            var σ = s / (b * A), sinσ = null, cosσ = null, Δσ = null; // σ = angular distance P₁ P₂ on the sphere
            var cos2σₘ = null; // σₘ = angular distance on the sphere from the equator to the midpoint of the line
            var σʹ = null, iterations = 0;
            do {
                cos2σₘ = Math.cos(2 * σ1 + σ);
                sinσ = Math.sin(σ);
                cosσ = Math.cos(σ);
                Δσ = B * sinσ * (cos2σₘ + B / 4 * (cosσ * (-1 + 2 * cos2σₘ * cos2σₘ) -
                    B / 6 * cos2σₘ * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σₘ * cos2σₘ)));
                σʹ = σ;
                σ = s / (b * A) + Δσ;
            } while (Math.abs(σ - σʹ) > ε && ++iterations < maxInterations);
            if (iterations >= maxInterations) {
                throw new EvalError("Direct vincenty formula failed to converge after ".concat(maxInterations, " iterations \n                (start=").concat(start.lat, "/").concat(start.lng, "; bearing=").concat(bearing, "; distance=").concat(distance, ")")); // not possible?
            }
            var x = sinU1 * sinσ - cosU1 * cosσ * cosα1;
            var φ2 = Math.atan2(sinU1 * cosσ + cosU1 * sinσ * cosα1, (1 - f) * Math.sqrt(sinα * sinα + x * x));
            var λ = Math.atan2(sinσ * sinα1, cosU1 * cosσ - sinU1 * sinσ * cosα1);
            var C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
            var dL = λ - (1 - C) * f * sinα * (σ + C * sinσ * (cos2σₘ + C * cosσ * (-1 + 2 * cos2σₘ * cos2σₘ)));
            var λ2 = λ1 + dL;
            var α2 = Math.atan2(sinα, -x);
            return {
                lat: this.toDegrees(φ2),
                lng: this.toDegrees(λ2),
                bearing: this.wrap360(this.toDegrees(α2))
            };
        };
        /**
         * Vincenty inverse calculation.
         * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
         * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
         *
         * @param start Latitude/longitude of starting point.
         * @param dest Latitude/longitude of destination point.
         * @return Object including distance, initialBearing, finalBearing.
         */
        GeodesicCore.prototype.inverse = function (start, dest, maxInterations, mitigateConvergenceError) {
            if (maxInterations === void 0) { maxInterations = 100; }
            if (mitigateConvergenceError === void 0) { mitigateConvergenceError = true; }
            var p1 = start, p2 = dest;
            var φ1 = this.toRadians(p1.lat), λ1 = this.toRadians(p1.lng);
            var φ2 = this.toRadians(p2.lat), λ2 = this.toRadians(p2.lng);
            var π = Math.PI;
            var ε = Number.EPSILON;
            // allow alternative ellipsoid to be specified
            var _a = this.ellipsoid, a = _a.a, b = _a.b, f = _a.f;
            var dL = λ2 - λ1; // L = difference in longitude, U = reduced latitude, defined by tan U = (1-f)·tanφ.
            var tanU1 = (1 - f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
            var tanU2 = (1 - f) * Math.tan(φ2), cosU2 = 1 / Math.sqrt((1 + tanU2 * tanU2)), sinU2 = tanU2 * cosU2;
            var antipodal = Math.abs(dL) > π / 2 || Math.abs(φ2 - φ1) > π / 2;
            var λ = dL, sinλ = null, cosλ = null; // λ = difference in longitude on an auxiliary sphere
            var σ = antipodal ? π : 0, sinσ = 0, cosσ = antipodal ? -1 : 1, sinSqσ = null; // σ = angular distance P₁ P₂ on the sphere
            var cos2σₘ = 1; // σₘ = angular distance on the sphere from the equator to the midpoint of the line
            var sinα = null, cosSqα = 1; // α = azimuth of the geodesic at the equator
            var C = null;
            var λʹ = null, iterations = 0;
            do {
                sinλ = Math.sin(λ);
                cosλ = Math.cos(λ);
                sinSqσ = (cosU2 * sinλ) * (cosU2 * sinλ) + (cosU1 * sinU2 - sinU1 * cosU2 * cosλ) * (cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
                if (Math.abs(sinSqσ) < ε) {
                    break; // co-incident/antipodal points (falls back on λ/σ = L)
                }
                sinσ = Math.sqrt(sinSqσ);
                cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
                σ = Math.atan2(sinσ, cosσ);
                sinα = cosU1 * cosU2 * sinλ / sinσ;
                cosSqα = 1 - sinα * sinα;
                cos2σₘ = (cosSqα !== 0) ? (cosσ - 2 * sinU1 * sinU2 / cosSqα) : 0; // on equatorial line cos²α = 0 (§6)
                C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
                λʹ = λ;
                λ = dL + (1 - C) * f * sinα * (σ + C * sinσ * (cos2σₘ + C * cosσ * (-1 + 2 * cos2σₘ * cos2σₘ)));
                var iterationCheck = antipodal ? Math.abs(λ) - π : Math.abs(λ);
                if (iterationCheck > π) {
                    throw new EvalError("λ > π");
                }
            } while (Math.abs(λ - λʹ) > 1e-12 && ++iterations < maxInterations);
            if (iterations >= maxInterations) {
                if (mitigateConvergenceError) {
                    return this.inverse(start, new L__namespace.LatLng(dest.lat, dest.lng - 0.01), maxInterations, mitigateConvergenceError);
                }
                else {
                    throw new EvalError("Inverse vincenty formula failed to converge after ".concat(maxInterations, " iterations \n                    (start=").concat(start.lat, "/").concat(start.lng, "; dest=").concat(dest.lat, "/").concat(dest.lng, ")"));
                }
            }
            var uSq = cosSqα * (a * a - b * b) / (b * b);
            var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
            var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
            var Δσ = B * sinσ * (cos2σₘ + B / 4 * (cosσ * (-1 + 2 * cos2σₘ * cos2σₘ) -
                B / 6 * cos2σₘ * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σₘ * cos2σₘ)));
            var s = b * A * (σ - Δσ); // s = length of the geodesic
            // note special handling of exactly antipodal points where sin²σ = 0 (due to discontinuity
            // atan2(0, 0) = 0 but atan2(this.ε, 0) = π/2 / 90°) - in which case bearing is always meridional,
            // due north (or due south!)
            // α = azimuths of the geodesic; α2 the direction P₁ P₂ produced
            var α1 = Math.abs(sinSqσ) < ε ? 0 : Math.atan2(cosU2 * sinλ, cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
            var α2 = Math.abs(sinSqσ) < ε ? π : Math.atan2(cosU1 * sinλ, -sinU1 * cosU2 + cosU1 * sinU2 * cosλ);
            return {
                distance: s,
                initialBearing: Math.abs(s) < ε ? NaN : this.wrap360(this.toDegrees(α1)),
                finalBearing: Math.abs(s) < ε ? NaN : this.wrap360(this.toDegrees(α2))
            };
        };
        /**
         * Returns the point of intersection of two paths defined by position and bearing.
         *
         * It uses a spherical model of the earth. This will lead to small errors compared to an ellipsoid model.
         * Based on the [work of Chris Veness](https://github.com/chrisveness/geodesy).
         * [Source file](https://github.com/chrisveness/geodesy/blob/master/latlon-spherical.js).
         *
         * @param firstPos First path's position
         * @param firstBearing First path's bearing
         * @param secondPos Second path's position
         * @param secondBearing Second path's bearing
         *
         * @return Point of intersection or null, if there's infinite intersections, or paths are antipodal
         */
        GeodesicCore.prototype.intersection = function (firstPos, firstBearing, secondPos, secondBearing) {
            var φ1 = this.toRadians(firstPos.lat);
            var λ1 = this.toRadians(firstPos.lng);
            var φ2 = this.toRadians(secondPos.lat);
            var λ2 = this.toRadians(secondPos.lng);
            var θ13 = this.toRadians(firstBearing);
            var θ23 = this.toRadians(secondBearing);
            var Δφ = φ2 - φ1, Δλ = λ2 - λ1;
            var π = Math.PI;
            var ε = Number.EPSILON;
            // angular distance p1-p2
            var δ12 = 2 * Math.asin(Math.sqrt(Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
                + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)));
            if (Math.abs(δ12) < ε) {
                return firstPos; // coincident points
            }
            // initial/final bearings between points
            var cosθa = (Math.sin(φ2) - Math.sin(φ1) * Math.cos(δ12)) / (Math.sin(δ12) * Math.cos(φ1));
            var cosθb = (Math.sin(φ1) - Math.sin(φ2) * Math.cos(δ12)) / (Math.sin(δ12) * Math.cos(φ2));
            var θa = Math.acos(Math.min(Math.max(cosθa, -1), 1)); // protect against rounding errors
            var θb = Math.acos(Math.min(Math.max(cosθb, -1), 1)); // protect against rounding errors
            var θ12 = Math.sin(λ2 - λ1) > 0 ? θa : 2 * π - θa;
            var θ21 = Math.sin(λ2 - λ1) > 0 ? 2 * π - θb : θb;
            var α1 = θ13 - θ12; // angle 2-1-3
            var α2 = θ21 - θ23; // angle 1-2-3
            if (Math.sin(α1) === 0 && Math.sin(α2) === 0) {
                return null; // infinite intersections
            }
            if (Math.sin(α1) * Math.sin(α2) < 0) {
                return null; // ambiguous intersection (antipodal?)
            }
            var cosα3 = -Math.cos(α1) * Math.cos(α2) + Math.sin(α1) * Math.sin(α2) * Math.cos(δ12);
            var δ13 = Math.atan2(Math.sin(δ12) * Math.sin(α1) * Math.sin(α2), Math.cos(α2) + Math.cos(α1) * cosα3);
            var φ3 = Math.asin(Math.min(Math.max(Math.sin(φ1) * Math.cos(δ13) + Math.cos(φ1) * Math.sin(δ13) * Math.cos(θ13), -1), 1));
            var Δλ13 = Math.atan2(Math.sin(θ13) * Math.sin(δ13) * Math.cos(φ1), Math.cos(δ13) - Math.sin(φ1) * Math.sin(φ3));
            var λ3 = λ1 + Δλ13;
            return new L__namespace.LatLng(this.toDegrees(φ3), this.toDegrees(λ3));
        };
        /**
         * Midpoint on a geodesic line. It Splits a line defined by two given points into two lines with equal spherical length.
         * @param start Start point
         * @param dest End point
         *
         * @return Midpoint
         */
        GeodesicCore.prototype.midpoint = function (start, dest) {
            // φm = atan2( sinφ1 + sinφ2, √( (cosφ1 + cosφ2⋅cosΔλ)² + cos²φ2⋅sin²Δλ ) )
            // λm = λ1 + atan2(cosφ2⋅sinΔλ, cosφ1 + cosφ2⋅cosΔλ)
            // midpoint is sum of vectors to two points: mathforum.org/library/drmath/view/51822.html
            var φ1 = this.toRadians(start.lat);
            var λ1 = this.toRadians(start.lng);
            var φ2 = this.toRadians(dest.lat);
            var Δλ = this.toRadians(dest.lng - start.lng);
            // get cartesian coordinates for the two points
            var A = { x: Math.cos(φ1), y: 0, z: Math.sin(φ1) }; // place point A on prime meridian y=0
            var B = { x: Math.cos(φ2) * Math.cos(Δλ), y: Math.cos(φ2) * Math.sin(Δλ), z: Math.sin(φ2) };
            // vector to midpoint is sum of vectors to two points (no need to normalise)
            var C = { x: A.x + B.x, y: A.y + B.y, z: A.z + B.z };
            var φm = Math.atan2(C.z, Math.sqrt(C.x * C.x + C.y * C.y));
            var λm = λ1 + Math.atan2(C.y, C.x);
            return new L__namespace.LatLng(this.toDegrees(φm), this.toDegrees(λm));
        };
        return GeodesicCore;
    }());

    /**
     * Earth radius used by WebMercator
     */
    var SPHERICAL_RADIUS = 6378137;
    var GeodesicGeometry = /** @class */ (function () {
        function GeodesicGeometry(options, calledFromCircle) {
            if (calledFromCircle === void 0) { calledFromCircle = false; }
            this.geodesic = new GeodesicCore();
            this.options = __assign(__assign({}, DEFAULT_GEODESIC_OPTIONS), options);
            // Convert deprecated steps to segments number. If called from circle, just copy the steps.
            var optionsSteps = NaN;
            if (options && options.steps !== undefined) {
                optionsSteps = calledFromCircle ? this.options.steps : Math.pow(2, (this.options.steps + 1));
            }
            // Get steps from either options.segmentsNumber or deprecated options.steps.
            this.segmentsNumber = this.options.segmentsNumber === undefined ? optionsSteps : this.options.segmentsNumber;
            // If undefined was passed to either of options. Needed for backwards compatibility.
            if (isNaN(this.segmentsNumber)) {
                this.segmentsNumber = calledFromCircle ? 24 : 16;
            }
            if (this.options.naturalDrawing && this.segmentsNumber < 4) {
                throw new Error("At least 4 segments are required for natural drawing. " +
                    "Set segmentsNumber option to at least 4 to fix this error.");
            }
            this.steps = this.segmentsNumber; // This is here to preserve backwards compatibility
        }
        /**
         * Deprecated in favor of algorithm used by {@link GeodesicGeometry.line}
         *
         * A geodesic line between `start` and `dest` is created with this recursive function.
         * It calculates the geodesic midpoint between `start` and `dest` and uses this midpoint to call itself again (twice!).
         * The results are then merged into one continuous linestring.
         *
         * The number of resulting vertices (incl. `start` and `dest`) depends on the initial value for `iterations`
         * and can be calculated with: vertices == 1 + 2 ** (initialIterations + 1)
         *
         * As this is an exponential function, be extra careful to limit the initial value for `iterations` (8 results in 513 vertices).
         *
         * @param start start position
         * @param dest destination
         * @param iterations
         * @return resulting linestring
         *
         * @deprecated
         */
        GeodesicGeometry.prototype.recursiveMidpoint = function (start, dest, iterations) {
            var geom = [start, dest];
            var midpoint = this.geodesic.midpoint(start, dest);
            if (iterations > 0) {
                geom.splice.apply(geom, __spreadArray([0, 1], this.recursiveMidpoint(start, midpoint, iterations - 1), false));
                geom.splice.apply(geom, __spreadArray([geom.length - 2, 2], this.recursiveMidpoint(midpoint, dest, iterations - 1), false));
            }
            else {
                geom.splice(1, 0, midpoint);
            }
            return geom;
        };
        /**
         * Generates a geodesic line.
         *
         * @param start Start position
         * @param dest Destination
         * @param useLongPart If both this and {@link RawGeodesicOptions.naturalDrawing} are true,
         * will use long part of a great circle
         * @param ignoreNaturalDrawing Internal use only. If true, will draw regular line but wrapped to the first point.
         * @param changeLengthBy Internal use only. If different from 0, will draw a draft line with the new length changed
         * from the dest point.
         * @return resulting linestring
         */
        GeodesicGeometry.prototype.line = function (start, dest, useLongPart, ignoreNaturalDrawing, changeLengthBy) {
            if (useLongPart === void 0) { useLongPart = false; }
            if (ignoreNaturalDrawing === void 0) { ignoreNaturalDrawing = false; }
            if (changeLengthBy === void 0) { changeLengthBy = 0; }
            var steps = this.segmentsNumber;
            // Do only last point for regular line and 20 for natural drawing for changing length to improve performance.
            if (changeLengthBy !== 0) {
                steps = this.options.naturalDrawing ? 20 : 1;
            }
            // When points are the same, just copy the start point. We could make d small enough to introduce only slight
            // floating point errors, but I don't like that solution. I feel like it might fail since difference is
            // in range of an error. I have a bad feeling about points that are close but not exactly same too.
            if (this.geodesic.isEqual(start.lng, dest.lng) && this.geodesic.isEqual(start.lat, dest.lat)) {
                // @ts-ignore
                var toReturn = [];
                toReturn.sphericalLengthRadians = 0;
                toReturn.sphericalLengthMeters = 0;
                for (var i_1 = 0; i_1 <= steps; i_1++) {
                    toReturn.push(new L__namespace.LatLng(start.lat, start.lng));
                }
                return toReturn;
            }
            var lng1 = this.geodesic.toRadians(start.lng), lat1 = this.geodesic.toRadians(start.lat), lng2 = this.geodesic.toRadians(dest.lng), lat2 = this.geodesic.toRadians(dest.lat);
            // An edge case when lng diff is 180 deg and absolute values of lats are equal. Can be fixed by shifting any lat.
            // Even the slightest shift helps, but I like to be more careful in case floats might mess up.
            if (this.geodesic.isEqual(Math.abs(lng1 - lng2), Math.PI) && this.geodesic.isEqual(Math.abs(lat1), Math.abs(lat2))) {
                lat2 -= 0.00001;
            }
            // Call trig functions here for optimization
            var cosLng1 = Math.cos(lng1), sinLng1 = Math.sin(lng1), cosLat1 = Math.cos(lat1), sinLat1 = Math.sin(lat1), cosLng2 = Math.cos(lng2), sinLng2 = Math.sin(lng2), cosLat2 = Math.cos(lat2), sinLat2 = Math.sin(lat2), 
            // Calculate great circle distance between these points
            w = lng2 - lng1, h = lat2 - lat1, z = Math.pow(Math.sin(h / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(w / 2), 2), d = 2 * Math.asin(Math.sqrt(z)), 
            // @ts-ignore
            coords = [];
            // I'm not sure if it's ever the case, but I'm too afraid to remove it.
            if (d === 0) {
                d = useLongPart ? 0 : Math.PI * 2;
            }
            // 100% of line length. Increasing this number will lengthen the line from dest point.
            // Note: using negative fraction seem to lengthen only line by short part. It glitches with the long part.
            var len = 1;
            if (this.options.naturalDrawing && !ignoreNaturalDrawing) {
                // Get the number of revolutions before actual line. See wrapMultilineString() for more info.
                // We also have to round using conditions below. Otherwise, we'll have a redundant revolution.
                var fractionRev = Math.abs(dest.lng - start.lng) / 360, revolutions = void 0;
                if (fractionRev % 1 === 0.5) {
                    revolutions = useLongPart ? Math.ceil(fractionRev) : Math.floor(fractionRev);
                }
                else {
                    revolutions = Math.round(fractionRev);
                }
                // This is passed by naturalDrawingLine() when regular line goes to wrong direction.
                if (useLongPart) {
                    d = Math.PI * 2 - d; // Get length of a long part by subtracting current distance from 360 deg
                }
                // Correct line length and steps for required revolutions
                if (revolutions > 0) {
                    // Recalculate steps regardless of which part of a great circle we follow to maintain predictability.
                    if (!this.options.naturalDrawingFixedNumberOfSegments) {
                        steps *= revolutions;
                    }
                    // Using new length results in one redundant revolution
                    if (useLongPart) {
                        revolutions--;
                    }
                    len = (Math.PI * 2 * revolutions) / d + 1;
                }
            }
            var doUntil = len;
            if (changeLengthBy !== 0) {
                doUntil = len + len * changeLengthBy;
            }
            if (!this.options.naturalDrawing && d * doUntil > Math.PI) {
                throw new Error("New spherical line length exceeds 180 degrees. Consider settings \"naturalDrawing\" " +
                    "option to true to resolve this problem. Otherwise, check new line length before calling " +
                    "changeLength().");
            }
            var sinD = Math.sin(d), f = 0, i = 0, prevF = -1, moveBy = doUntil / steps, useBreakPoints = !this.options.naturalDrawing && changeLengthBy === 0;
            while (true) {
                // Without this exact if condition, TS will throw a tantrum
                if (this.options.breakPoints !== undefined && useBreakPoints) {
                    if (i === this.options.breakPoints.length) {
                        break;
                    }
                    f = this.options.breakPoints[i];
                    if (f < 0 || f > 1) {
                        throw new Error("Fractions should be in range [0; 1]. Received fraction ".concat(f, " at index ").concat(i, "."));
                    }
                    if (f <= prevF && i !== 0) {
                        throw new Error("Each fraction should be greater than previous. Received fractions ".concat(prevF, " and ").concat(f, " at indices ").concat(i - 1, " and ").concat(i, " respectively."));
                    }
                    i++;
                }
                else if (!(this.geodesic.isLessThanOrEqualTo(f, doUntil))) {
                    break;
                }
                var A = Math.sin((len - f) * d) / sinD, B = Math.sin(f * d) / sinD, x = A * cosLat1 * cosLng1 + B * cosLat2 * cosLng2, y = A * cosLat1 * sinLng1 + B * cosLat2 * sinLng2, z_1 = A * sinLat1 + B * sinLat2, lat = this.geodesic.toDegrees(Math.atan2(z_1, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)))), lng = this.geodesic.toDegrees(Math.atan2(y, x));
                coords.push(new L__namespace.LatLng(lat, lng));
                prevF = f;
                if (this.options.breakPoints === undefined || !useBreakPoints) {
                    f += moveBy;
                }
            }
            // Move the first point to its map, so wrapping will work correctly
            if (this.options.naturalDrawing || !this.options.wrap) {
                var firstPoint = coords[0];
                if (!this.options.naturalDrawing && typeof this.options.moveNoWrapTo === "number") {
                    firstPoint.lng += this.options.moveNoWrapTo * 360;
                }
                else {
                    firstPoint.lng += start.lng - firstPoint.lng;
                }
            }
            // Calculate statistics
            coords.sphericalLengthRadians = d * doUntil;
            coords.sphericalLengthMeters = coords.sphericalLengthRadians * SPHERICAL_RADIUS;
            return coords;
        };
        /**
         * Generates a continuous geodesic line from exact start to exact dest with all required revolutions
         * @param start start position
         * @param dest destination
         * @param changeLengthBy Internal use only. If different from 0, will draw a draft line with the new length changed
         * from the dest point.
         */
        GeodesicGeometry.prototype.naturalDrawingLine = function (start, dest, changeLengthBy) {
            if (changeLengthBy === void 0) { changeLengthBy = 0; }
            // Generate a short (regular) line. We should ignore natural drawing for this to improve performance and solve
            // an issue when difference between lngs is 180 degrees.
            var shortLine = this.wrapMultiLineString([this.line(start, dest, false, true)])[0], lngFrom, lngTo, forceShortPart = false, absDiff = Math.abs(start.lng - dest.lng);
            // If line won't be split, just return wrapped line to improve performance
            if (absDiff <= 180) {
                if (changeLengthBy === 0) {
                    return shortLine;
                }
                // If we're lengthening the line, we have to redraw it. ignoreNaturalDrawing = true makes short part work.
                // I have absolutely no idea on how it works, but at least, it fixes the issue.
                forceShortPart = true;
            }
            // Determine whether short line follows the direction from start to dest, i.e. if its last point is between
            // start lng and dest lng. Otherwise, we'll use long part of a great circle to get line in desired direction.
            if (start.lng < dest.lng) {
                lngFrom = start.lng;
                lngTo = dest.lng;
            }
            else {
                lngFrom = dest.lng;
                lngTo = start.lng;
            }
            // Last lng should lie between start and dest, but don't touch any of it. If it touches any of these lngs,
            // difference between lngs is multiple of 180 or 360. In this case, use long part which solves certain glitches.
            var lastLng = shortLine[shortLine.length - 1].lng, useLongPart = !forceShortPart && (lastLng <= lngFrom || lastLng >= lngTo);
            return this.wrapMultiLineString([this.line(start, dest, useLongPart, false, changeLengthBy)])[0];
        };
        GeodesicGeometry.prototype.multiLineString = function (latlngs) {
            // @ts-ignore
            var multiLineString = [], fn = this.options.naturalDrawing ? "naturalDrawingLine" : "line";
            multiLineString.sphericalLengthRadians = 0;
            multiLineString.sphericalLengthMeters = 0;
            for (var _i = 0, latlngs_1 = latlngs; _i < latlngs_1.length; _i++) {
                var linestring = latlngs_1[_i];
                // @ts-ignore
                var segment = [];
                segment.sphericalLengthRadians = 0;
                segment.sphericalLengthMeters = 0;
                for (var j = 1; j < linestring.length; j++) {
                    var line = this[fn](linestring[j - 1], linestring[j]);
                    segment.splice.apply(segment, __spreadArray([segment.length - 1, 1], line, false));
                    segment.sphericalLengthRadians += line.sphericalLengthRadians;
                    segment.sphericalLengthMeters += line.sphericalLengthMeters;
                }
                multiLineString.push(segment);
                multiLineString.sphericalLengthRadians += segment.sphericalLengthRadians;
                multiLineString.sphericalLengthMeters += segment.sphericalLengthMeters;
            }
            return multiLineString;
        };
        GeodesicGeometry.prototype.lineString = function (latlngs) {
            return this.multiLineString([latlngs])[0];
        };
        /**
         * Copies fields of {@link SphericalStatistics} from src to dest
         * @param src Source object
         * @param dest Destination object
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GeodesicGeometry.copySphericalStatistics = function (src, dest) {
            var params = ["sphericalLengthRadians", "sphericalLengthMeters"];
            for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
                var param = params_1[_i];
                if (src[param] !== undefined) {
                    dest[param] = src[param];
                }
            }
        };
        /**
         * Splits a segment on antimeridians.
         *
         * @param startPosition Start segment point
         * @param destPosition End segment point
         *
         * @return Split segment
         */
        GeodesicGeometry.prototype.splitLine = function (startPosition, destPosition) {
            // It's much (10x) faster than the previous implementation:
            // Benchmark (no split):  splitLine x 459,044 ops/sec ±0.53% (95 runs sampled)
            // Benchmark (split):     splitLine x 42,999 ops/sec ±0.51% (97 runs sampled)
            var antimeridianWest = {
                point: new L__namespace.LatLng(89.9, -180.0000001),
                bearing: 180
            };
            var antimeridianEast = {
                point: new L__namespace.LatLng(89.9, 180.0000001),
                bearing: 180
            };
            // make a copy to work with
            var start = new L__namespace.LatLng(startPosition.lat, startPosition.lng);
            var dest = new L__namespace.LatLng(destPosition.lat, destPosition.lng);
            start.lng = this.geodesic.wrap(start.lng, 360);
            dest.lng = this.geodesic.wrap(dest.lng, 360);
            if ((dest.lng - start.lng) > 180) {
                dest.lng = dest.lng - 360;
            }
            else if ((dest.lng - start.lng) < -180) {
                dest.lng = dest.lng + 360;
            }
            var result = [[new L__namespace.LatLng(start.lat, this.geodesic.wrap(start.lng, 180)), new L__namespace.LatLng(dest.lat, this.geodesic.wrap(dest.lng, 180))]];
            // crossing antimeridian from "this" side?
            if ((start.lng >= -180) && (start.lng <= 180)) {
                // crossing the "western" antimeridian
                if (dest.lng < -180) {
                    var bearing = this.geodesic.inverse(start, dest).initialBearing;
                    var intersection = this.geodesic.intersection(start, bearing, antimeridianWest.point, antimeridianWest.bearing);
                    if (intersection) {
                        result = [[start, intersection], [new L__namespace.LatLng(intersection.lat, intersection.lng + 360), new L__namespace.LatLng(dest.lat, dest.lng + 360)]];
                    }
                }
                else if (dest.lng > 180) { // crossing the "eastern" antimeridian
                    var bearing = this.geodesic.inverse(start, dest).initialBearing;
                    var intersection = this.geodesic.intersection(start, bearing, antimeridianEast.point, antimeridianEast.bearing);
                    if (intersection) {
                        result = [[start, intersection], [new L__namespace.LatLng(intersection.lat, intersection.lng - 360), new L__namespace.LatLng(dest.lat, dest.lng - 360)]];
                    }
                }
            }
            else if ((dest.lng >= -180) && (dest.lng <= 180)) { // coming back over the antimeridian from the "other" side?
                // crossing the "western" antimeridian
                if (start.lng < -180) {
                    var bearing = this.geodesic.inverse(start, dest).initialBearing;
                    var intersection = this.geodesic.intersection(start, bearing, antimeridianWest.point, antimeridianWest.bearing);
                    if (intersection) {
                        result = [[new L__namespace.LatLng(start.lat, start.lng + 360), new L__namespace.LatLng(intersection.lat, intersection.lng + 360)], [intersection, dest]];
                    }
                }
                else if (start.lng > 180) { // crossing the "eastern" antimeridian
                    var bearing = this.geodesic.inverse(start, dest).initialBearing;
                    var intersection = this.geodesic.intersection(start, bearing, antimeridianWest.point, antimeridianWest.bearing);
                    if (intersection) {
                        result = [[new L__namespace.LatLng(start.lat, start.lng - 360), new L__namespace.LatLng(intersection.lat, intersection.lng - 360)], [intersection, dest]];
                    }
                }
            }
            return result;
        };
        /**
         * Linestrings of a given multilinestring that cross the antimeridian will be split in two separate linestrings.
         * This function is used to wrap lines around when they cross the antimeridian
         * It iterates over all linestrings and reconstructs the step-by-step if no split is needed.
         * In case the line was split, the linestring ends at the antimeridian and a new linestring is created for the
         * remaining points of the original linestring.
         *
         * @param multilinestring
         * @return another multilinestring where segments crossing the antimeridian are split
         */
        GeodesicGeometry.prototype.splitMultiLineString = function (multilinestring) {
            var result = [];
            for (var _i = 0, multilinestring_1 = multilinestring; _i < multilinestring_1.length; _i++) {
                var linestring = multilinestring_1[_i];
                if (linestring.length === 1) {
                    result.push(linestring); // just a single point in linestring, no need to split
                    continue;
                }
                var segment = [];
                for (var j = 1; j < linestring.length; j++) {
                    var split = this.splitLine(linestring[j - 1], linestring[j]);
                    segment.pop();
                    segment = segment.concat(split[0]);
                    if (split.length > 1) {
                        result.push(segment); // the line was split, so we end the linestring right here
                        segment = split[1]; // begin the new linestring with the second part of the split line
                    }
                }
                GeodesicGeometry.copySphericalStatistics(linestring, segment);
                result.push(segment);
            }
            GeodesicGeometry.copySphericalStatistics(multilinestring, result);
            // @ts-ignore
            return result;
        };
        /**
         * Linestrings of a given multilinestring will be wrapped (+- 360°) to show a continuous line w/o any weird discontinuities
         * when `wrap` is set to `false` in the geodesic class
         * @param multilinestring Multilinestring to wrap
         * @returns Multilinestring where the points of each linestring are wrapped accordingly
         */
        GeodesicGeometry.prototype.wrapMultiLineString = function (multilinestring) {
            // @ts-ignore
            var result = [];
            for (var _i = 0, multilinestring_2 = multilinestring; _i < multilinestring_2.length; _i++) {
                var linestring = multilinestring_2[_i];
                var resultLine = [];
                var previous = null;
                // iterate over every point and check if it needs to be wrapped
                for (var _a = 0, linestring_1 = linestring; _a < linestring_1.length; _a++) {
                    var point = linestring_1[_a];
                    // The first point is the anchor of the linestring from which the line will always start.
                    // If the difference between the current and *previous* point is greater than 360°,
                    // the current point needs to be shifted to be on the same 'sphere' as the previous one.
                    // We're doing toFixed() for when lng difference is close to 0.5. Otherwise, it won't wrap
                    // natural drawing line correctly.
                    var shift = previous === null ? 0 : Math.round(parseFloat(((point.lng - previous.lng) / 360).toFixed(6))) * 360;
                    var newPoint = new L__namespace.LatLng(point.lat, point.lng - shift);
                    resultLine.push(newPoint);
                    previous = newPoint; // Use the wrapped point as the anchor for the next one
                }
                result.push(resultLine);
                GeodesicGeometry.copySphericalStatistics(linestring, resultLine);
            }
            GeodesicGeometry.copySphericalStatistics(multilinestring, result);
            return result;
        };
        /**
         * Creates a circular (constant radius), closed (1st pos == last pos) geodesic linestring.
         * The number of vertices is calculated with: `vertices == steps + 1` (where 1st == last)
         *
         * @param center
         * @param radius
         * @return resulting linestring
         */
        GeodesicGeometry.prototype.circle = function (center, radius) {
            var vertices = [];
            for (var i = 0; i < this.steps; i++) {
                var point = this.geodesic.direct(center, 360 / this.steps * i, radius);
                vertices.push(new L__namespace.LatLng(point.lat, point.lng));
            }
            // Append first vertex to the end to close the linestring
            vertices.push(new L__namespace.LatLng(vertices[0].lat, vertices[0].lng));
            return vertices;
        };
        /**
         * Handles splitting of circles at the antimeridian.
         * @param linestring a linestring that resembles the geodesic circle
         * @return a multilinestring that consist of one or two linestrings
         */
        GeodesicGeometry.prototype.splitCircle = function (linestring) {
            var result = this.splitMultiLineString([linestring]);
            // If the circle was split, it results in exactly three linestrings where first and last
            // must be re-assembled because they belong to the same "side" of the split circle.
            if (result.length === 3) {
                result[2] = __spreadArray(__spreadArray([], result[2], true), result[0], true);
                result.shift();
            }
            return result;
        };
        /**
         * Calculates the distance between two positions on the earths surface
         * @param start First position
         * @param dest Second position
         * @return Distance in **meters**
         */
        GeodesicGeometry.prototype.distance = function (start, dest) {
            return this.geodesic.inverse(new L__namespace.LatLng(start.lat, this.geodesic.wrap(start.lng, 180)), new L__namespace.LatLng(dest.lat, this.geodesic.wrap(dest.lng, 180))).distance;
        };
        GeodesicGeometry.prototype.multilineDistance = function (multilinestring) {
            var dist = [];
            for (var _i = 0, multilinestring_3 = multilinestring; _i < multilinestring_3.length; _i++) {
                var linestring = multilinestring_3[_i];
                var segmentDistance = 0;
                for (var j = 1; j < linestring.length; j++) {
                    segmentDistance += this.distance(linestring[j - 1], linestring[j]);
                }
                dist.push(segmentDistance);
            }
            return dist;
        };
        /**
         * Calculates and returns statistics **not** including spherical lengths
         * @param points Points to calculate statistics of
         * @param vertices Vertices to calculate statistics of
         *
         * @return Calculated statistics
         */
        GeodesicGeometry.prototype.updateStatistics = function (points, vertices) {
            var stats = {};
            stats.distanceArray = this.multilineDistance(points);
            stats.totalDistance = 0;
            for (var _i = 0, _a = stats.distanceArray; _i < _a.length; _i++) {
                var distance = _a[_i];
                stats.totalDistance += distance;
            }
            stats.points = 0;
            for (var _b = 0, points_1 = points; _b < points_1.length; _b++) {
                var item = points_1[_b];
                stats.points += item.reduce(function (x) { return x + 1; }, 0);
            }
            stats.vertices = 0;
            for (var _c = 0, vertices_1 = vertices; _c < vertices_1.length; _c++) {
                var item = vertices_1[_c];
                stats.vertices += item.reduce(function (x) { return x + 1; }, 0);
            }
            return stats;
        };
        return GeodesicGeometry;
    }());

    /*eslint "@typescript-eslint/no-explicit-any": "off"*/
    function instanceOfLatLngLiteral(object) {
        return ((typeof object === "object")
            && (object !== null)
            && ("lat" in object)
            && ("lng" in object)
            && (typeof object.lat === "number")
            && (typeof object.lng === "number"));
    }
    function instanceOfLatLngTuple(object) {
        return ((object instanceof Array)
            && (typeof object[0] === "number")
            && (typeof object[1] === "number"));
    }
    function instanceOfLatLngExpression(object) {
        return object instanceof L__namespace.LatLng || instanceOfLatLngTuple(object) || instanceOfLatLngLiteral(object);
    }
    function latlngExpressiontoLatLng(input) {
        if (input instanceof L__namespace.LatLng) {
            return input;
        }
        else if (instanceOfLatLngTuple(input)) {
            return new L__namespace.LatLng(input[0], input[1]);
        }
        else if (instanceOfLatLngLiteral(input)) {
            return new L__namespace.LatLng(input.lat, input.lng);
        }
        throw new Error("L.LatLngExpression expected. Unknown object found.");
    }
    function latlngExpressionArraytoLatLngArray(input) {
        var latlng = [];
        var iterateOver = (instanceOfLatLngExpression(input[0]) ? [input] : input);
        var unknownObjectError = new Error("L.LatLngExpression[] | L.LatLngExpression[][] expected. Unknown object found.");
        if (!(iterateOver instanceof Array)) {
            throw unknownObjectError;
        }
        for (var _i = 0, _a = iterateOver; _i < _a.length; _i++) {
            var group = _a[_i];
            if (!(group instanceof Array)) {
                throw unknownObjectError;
            }
            var sub = [];
            for (var _b = 0, group_1 = group; _b < group_1.length; _b++) {
                var point = group_1[_b];
                if (!instanceOfLatLngExpression(point)) {
                    throw unknownObjectError;
                }
                sub.push(latlngExpressiontoLatLng(point));
            }
            latlng.push(sub);
        }
        return latlng;
    }

    /**
     * Draw geodesic line based on L.Polyline
     */
    var GeodesicLine = /** @class */ (function (_super) {
        __extends(GeodesicLine, _super);
        function GeodesicLine(latlngs, options) {
            var _this = _super.call(this, [], options) || this;
            /** Use this if you need some details about the current geometry */
            _this.statistics = {};
            /** Stores all positions that are used to create the geodesic line */
            _this.points = [];
            L__namespace.Util.setOptions(_this, __assign(__assign({}, DEFAULT_GEODESIC_OPTIONS), options));
            _this.geom = new GeodesicGeometry(_this.options);
            if (latlngs !== undefined) {
                _this.setLatLngs(latlngs);
            }
            return _this;
        }
        /** Calculates the geodesics and update the polyline-object accordingly */
        GeodesicLine.prototype.updateGeometry = function (updateStats) {
            if (updateStats === void 0) { updateStats = this.options.updateStatisticsAfterRedrawing; }
            var geodesic = this.geom.multiLineString(this.points), opts = this.options, latLngs;
            if (updateStats) {
                this.statistics = this.geom.updateStatistics(this.points, geodesic);
            }
            this.statistics.sphericalLengthRadians = geodesic.sphericalLengthRadians;
            this.statistics.sphericalLengthMeters = geodesic.sphericalLengthMeters;
            if (opts.naturalDrawing) {
                latLngs = geodesic;
            }
            else if (opts.wrap) {
                latLngs = this.geom.splitMultiLineString(geodesic);
            }
            else {
                latLngs = this.geom.wrapMultiLineString(geodesic);
            }
            _super.prototype.setLatLngs.call(this, latLngs);
        };
        /**
         * Updates statistics of this line.
         * You should call it only if you've set {@link GeodesicOptions.updateStatisticsAfterRedrawing} to `false`.
         */
        GeodesicLine.prototype.updateStatistics = function () {
            this.updateGeometry(true);
            return this;
        };
        /**
         * Overwrites the original function with additional functionality to create a geodesic line
         * @param latlngs an array (or 2d-array) of positions
         */
        GeodesicLine.prototype.setLatLngs = function (latlngs) {
            this.points = latlngExpressionArraytoLatLngArray(latlngs);
            this.fixLatLngs();
            this.updateGeometry();
            return this;
        };
        /**
         * Adds a given point to the geodesic line object
         * @param latlng point to add. The point will always be added to the last linestring of a multiline
         * @param latlngs define a linestring to add the new point to. Read from points-property before (e.g. `line.addLatLng(Beijing, line.points[0]);`)
         */
        GeodesicLine.prototype.addLatLng = function (latlng, latlngs) {
            var point = latlngExpressiontoLatLng(latlng);
            if (this.points.length === 0) {
                this.points.push([point]);
            }
            else {
                if (latlngs === undefined) {
                    this.points[this.points.length - 1].push(point);
                }
                else {
                    latlngs.push(point);
                }
            }
            this.fixLatLngs();
            this.updateGeometry();
            return this;
        };
        /**
         * Fixes following edge cases:
         *
         * 1. Split not working correctly when one point has -180 lng and the other -- +180.
         * 2. When natural drawing is used, points lie on antimeridians, and changeLength() called, wrong line is produced.
         */
        GeodesicLine.prototype.fixLatLngs = function () {
            var opts = this.options, fixSplit = opts.wrap && !opts.naturalDrawing;
            if (!fixSplit && !opts.naturalDrawing) {
                return;
            }
            for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
                var linestring = _a[_i];
                for (var i = 1; i < linestring.length; i++) {
                    var prevPoint = linestring[i - 1], point = linestring[i], absDiff = Math.abs(point.lng - prevPoint.lng);
                    if (fixSplit && absDiff === 360) {
                        prevPoint.lng -= 0.000001; // For split, even this small change helps
                    }
                    else if (opts.naturalDrawing && this.geom.geodesic.isEqual(absDiff % 180, 0)) {
                        prevPoint.lng -= 0.0001; // For natural drawing, less shift doesn't work for some reason
                    }
                }
            }
        };
        /**
         * Changes length of this line (if it's multiline, will change length of all its lines) from given anchor by
         * a given fraction.
         *
         * This function won't shorten or lengthen segments, it'll use only start and end points.
         *
         * **Usage notes:**
         *
         * 1. This function will move original points to split or wrapped line, but won't modify original objects.
         * 2. If new spherical length in radians of a segment with affected point (start and/or end)
         * will exceed Pi (180 degrees), and {@link GeodesicOptions.naturalDrawing} is `false`, an error will be thrown,
         * because in this case it's mandatory to follow long part of a great circle.
         * Consider setting {@link GeodesicOptions.naturalDrawing} to `true` to fix it.
         * 3. If `byFraction` is less than 1 for `start` and `end` or it's less than 0.5 for `both`, an error will be thrown.
         * 4. Modification precision lies withing 0.0001 range in some edge cases.
         *
         * @param from Start point, end point or both. If set to "both", will change length from both anchors by the
         * same given fraction. I.e., if you pass 1.5 as a fraction, new length will be oldLength + oldLength * 1.5 * 2.
         * @param byFraction A fraction to change length by. It it's positive, line will be lengthened.
         * If negative - shortened. If 0, nothing will be done.
         */
        GeodesicLine.prototype.changeLength = function (from, byFraction) {
            // Split sometimes fail with distance really close to 0
            if (byFraction === 0 || this.geom.geodesic.isEqual(this.statistics.sphericalLengthRadians, 0)) {
                return this;
            }
            var isBoth = from === "both", doStart = isBoth || from === "start", doEnd = isBoth || from === "end", fn = "naturalDrawingLine", args = [];
            if (isBoth && byFraction <= -0.5) {
                throw new Error("Can't change length by value less than or equal to -0.5 (whole line length while using " +
                    "from = \"both\"). Provided value: " + byFraction);
            }
            if (byFraction <= -1) {
                throw new Error("Can't change length by value less than or equal to -1 (whole line length). " +
                    "Provided value: " + byFraction);
            }
            if (!this.options.naturalDrawing) {
                fn = "line";
                args.push(false, false);
            }
            args.push(byFraction);
            for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
                var line = _a[_i];
                var start = line[0], end = line[line.length - 1];
                if (doEnd) {
                    line[line.length - 1] = this.changeLengthAndGetLastElement(fn, start, end, args);
                }
                if (doStart) {
                    line[0] = this.changeLengthAndGetLastElement(fn, end, start, args);
                }
            }
            this.updateGeometry(true);
            return this;
        };
        /**
         * Calls given line function defined by given points, passes given args to it and returns the last point of the
         * produced line.
         *
         * @param fn Function to call
         * @param start Start point
         * @param end End point
         * @param args Arguments to pass to the function. Should contain length to change by.
         *
         * @return Last point of the produced line
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GeodesicLine.prototype.changeLengthAndGetLastElement = function (fn, start, end, args) {
            var _a;
            // @ts-ignore
            var line = (_a = this.geom)[fn].apply(_a, __spreadArray([start, end], args, false));
            // Splitting doesn't work on two points, we'll use wrapping instead
            if (!this.options.naturalDrawing) {
                line = this.geom.wrapMultiLineString([line])[0];
            }
            return line[line.length - 1];
        };
        /**
         * Creates geodesic lines from a given GeoJSON-Object.
         * @param input GeoJSON object
         */
        GeodesicLine.prototype.fromGeoJson = function (input) {
            var latlngs = [];
            var features = [];
            if (input.type === "FeatureCollection") {
                features = input.features;
            }
            else if (input.type === "Feature") {
                features = [input];
            }
            else if (["MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"].includes(input.type)) {
                features = [{
                        type: "Feature",
                        geometry: input,
                        properties: {}
                    }];
            }
            else {
                console.log("[Leaflet.Geodesic] fromGeoJson() - Type \"".concat(input.type, "\" not supported."));
            }
            features.forEach(function (feature) {
                switch (feature.geometry.type) {
                    case "MultiPoint":
                    case "LineString":
                        latlngs = __spreadArray(__spreadArray([], latlngs, true), [L__namespace.GeoJSON.coordsToLatLngs(feature.geometry.coordinates, 0)], false);
                        break;
                    case "MultiLineString":
                    case "Polygon":
                        latlngs = __spreadArray(__spreadArray([], latlngs, true), L__namespace.GeoJSON.coordsToLatLngs(feature.geometry.coordinates, 1), true);
                        break;
                    case "MultiPolygon":
                        feature.geometry.coordinates.forEach(function (item) {
                            latlngs = __spreadArray(__spreadArray([], latlngs, true), L__namespace.GeoJSON.coordsToLatLngs(item, 1), true);
                        });
                        break;
                    default:
                        console.log("[Leaflet.Geodesic] fromGeoJson() - Type \"".concat(feature.geometry.type, "\" not supported."));
                }
            });
            if (latlngs.length) {
                this.setLatLngs(latlngs);
            }
            return this;
        };
        /**
         * Calculates the distance between two geo-positions
         * @param start First position
         * @param dest Second position
         * @return Distance in meters
         */
        GeodesicLine.prototype.distance = function (start, dest) {
            return this.geom.distance(latlngExpressiontoLatLng(start), latlngExpressiontoLatLng(dest));
        };
        GeodesicLine.prototype.getLatLngs = function () {
            return _super.prototype.getLatLngs.call(this); // Fix type safety
        };
        return GeodesicLine;
    }(L__namespace.Polyline));

    /**
     * Draw geodesic circle based on L.Polyline
     */
    var GeodesicCircleClass = /** @class */ (function (_super) {
        __extends(GeodesicCircleClass, _super);
        function GeodesicCircleClass(center, options) {
            var _this = _super.call(this, [], options) || this;
            /** Use this if you need some details about the current geometry */
            _this.statistics = {};
            L__namespace.Util.setOptions(_this, __assign(__assign(__assign({}, DEFAULT_GEODESIC_OPTIONS), { wrap: true, steps: 24, fill: true, noClip: true }), options));
            // merge/set options
            var extendedOptions = _this.options;
            _this.radius = (extendedOptions.radius === undefined) ? 1000 * 1000 : extendedOptions.radius;
            _this.center = (center === undefined) ? new L__namespace.LatLng(0, 0) : latlngExpressiontoLatLng(center);
            _this.geom = new GeodesicGeometry(_this.options, true);
            // update the geometry
            _this.update();
            return _this;
        }
        /**
         * Updates the geometry and re-calculates some statistics
         * @param updateStats If should update statistics
         */
        GeodesicCircleClass.prototype.update = function (updateStats) {
            if (updateStats === void 0) { updateStats = this.options.updateStatisticsAfterRedrawing; }
            var circle = this.geom.circle(this.center, this.radius);
            if (updateStats) {
                this.statistics = this.geom.updateStatistics([[this.center]], [circle]);
            }
            // Circumference must be re-calculated from geodesic
            this.statistics.totalDistance = this.geom.multilineDistance([circle]).reduce(function (x, y) { return x + y; }, 0);
            if (this.options.wrap) {
                var split = this.geom.splitCircle(circle);
                _super.prototype.setLatLngs.call(this, split);
            }
            else {
                _super.prototype.setLatLngs.call(this, circle);
            }
        };
        /**
         * Updates statistics of this line.
         * You should call it only if you've set {@link GeodesicOptions.updateStatisticsAfterRedrawing} to `false`.
         */
        GeodesicCircleClass.prototype.updateStatistics = function () {
            this.update(true);
            return this;
        };
        /**
         * Calculates the distance between the current center and an arbitrary position.
         * @param latlng Geo-position to calculate distance to
         * @return Distance in meters
         */
        GeodesicCircleClass.prototype.distanceTo = function (latlng) {
            var dest = latlngExpressiontoLatLng(latlng);
            return this.geom.distance(this.center, dest);
        };
        /**
         * Sets a new center for the geodesic circle and update the geometry. Radius may also be set.
         * @param center New center
         * @param radius New radius
         */
        GeodesicCircleClass.prototype.setLatLng = function (center, radius) {
            this.center = latlngExpressiontoLatLng(center);
            this.radius = radius ? radius : this.radius;
            this.update();
            return this;
        };
        /**
         * Sets a new radius for the geodesic circle and update the geometry. Center may also be set.
         * @param radius New radius
         * @param center New center
         */
        GeodesicCircleClass.prototype.setRadius = function (radius, center) {
            this.radius = radius;
            this.center = center ? latlngExpressiontoLatLng(center) : this.center;
            this.update();
            return this;
        };
        return GeodesicCircleClass;
    }(L__namespace.Polyline));

    if (typeof window.L !== "undefined") {
        window.L.Geodesic = GeodesicLine;
        window.L.geodesic = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new (GeodesicLine.bind.apply(GeodesicLine, __spreadArray([void 0], args, false)))();
        };
        window.L.GeodesicCircle = GeodesicCircleClass;
        window.L.geodesiccircle = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new (GeodesicCircleClass.bind.apply(GeodesicCircleClass, __spreadArray([void 0], args, false)))();
        };
    }

    exports.GeodesicCircleClass = GeodesicCircleClass;
    exports.GeodesicLine = GeodesicLine;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
