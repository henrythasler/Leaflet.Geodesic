'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var L = _interopDefault(require('leaflet'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
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

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var GeodesicCore = /** @class */ (function () {
    function GeodesicCore(options) {
        // /** used as maximal deviation for all iterative calculation. Smaller value increases computational effort */
        // protected ε = 1e-12;
        this.options = {};
        this.ellipsoid = {
            a: 6378137,
            b: 6356752.3142,
            f: 1 / 298.257223563
        }; // WGS-84
        this.options = __assign(__assign({}, this.options), options);
    }
    GeodesicCore.prototype.toRadians = function (degree) {
        return degree * Math.PI / 180;
    };
    GeodesicCore.prototype.toDegrees = function (radians) {
        return radians * 180 / Math.PI;
    };
    /**
     * source: https://github.com/chrisveness/geodesy/blob/master/dms.js
     * @param degrees arbitrary value
     * @return degrees between 0..360
     */
    GeodesicCore.prototype.wrap360 = function (degrees) {
        if (0 <= degrees && degrees < 360)
            return degrees; // avoid rounding due to arithmetic ops if within range
        return (degrees % 360 + 360) % 360; // sawtooth wave p:360, a:360
    };
    /**
     * @param degrees arbitrary value
     * @return degrees between -180..+180
     */
    GeodesicCore.prototype.wrap180 = function (degrees) {
        if (-180 <= degrees && degrees < 180)
            return degrees;
        return (((degrees + 180) % 360 + 360) % 360) - 180;
    };
    /**
     * Vincenty direct calculation.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
     *
     * @param start starting point
     * @param bearing initial bearing (in degrees)
     * @param distance distance from starting point to calculate along given bearing in meters.
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
        if (iterations >= maxInterations)
            throw new EvalError("Vincenty formula failed to converge after " + maxInterations + " iterations (start=" + start.lat + "/" + start.lng + "; bearing=" + bearing + "; distance=" + distance + ")"); // not possible?
        var x = sinU1 * sinσ - cosU1 * cosσ * cosα1;
        var φ2 = Math.atan2(sinU1 * cosσ + cosU1 * sinσ * cosα1, (1 - f) * Math.sqrt(sinα * sinα + x * x));
        var λ = Math.atan2(sinσ * sinα1, cosU1 * cosσ - sinU1 * sinσ * cosα1);
        var C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
        var L = λ - (1 - C) * f * sinα * (σ + C * sinσ * (cos2σₘ + C * cosσ * (-1 + 2 * cos2σₘ * cos2σₘ)));
        var λ2 = λ1 + L;
        var α2 = Math.atan2(sinα, -x);
        return {
            lat: this.toDegrees(φ2),
            lng: this.wrap360(this.toDegrees(λ2)),
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
    GeodesicCore.prototype.inverse = function (start, dest, maxInterations) {
        if (maxInterations === void 0) { maxInterations = 1000; }
        var p1 = start, p2 = dest;
        var φ1 = this.toRadians(p1.lat), λ1 = this.toRadians(p1.lng);
        var φ2 = this.toRadians(p2.lat), λ2 = this.toRadians(p2.lng);
        var π = Math.PI;
        var ε = Number.EPSILON;
        // allow alternative ellipsoid to be specified
        var _a = this.ellipsoid, a = _a.a, b = _a.b, f = _a.f;
        var L = λ2 - λ1; // L = difference in longitude, U = reduced latitude, defined by tan U = (1-f)·tanφ.
        var tanU1 = (1 - f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
        var tanU2 = (1 - f) * Math.tan(φ2), cosU2 = 1 / Math.sqrt((1 + tanU2 * tanU2)), sinU2 = tanU2 * cosU2;
        var antipodal = Math.abs(L) > π / 2 || Math.abs(φ2 - φ1) > π / 2;
        var λ = L, sinλ = null, cosλ = null; // λ = difference in longitude on an auxiliary sphere
        var σ = antipodal ? π : 0, sinσ = 0, cosσ = antipodal ? -1 : 1, sinSqσ = null; // σ = angular distance P₁ P₂ on the sphere
        var cos2σₘ = 1; // σₘ = angular distance on the sphere from the equator to the midpoint of the line
        var sinα = null, cosSqα = 1; // α = azimuth of the geodesic at the equator
        var C = null;
        var λʹ = null, iterations = 0;
        do {
            sinλ = Math.sin(λ);
            cosλ = Math.cos(λ);
            sinSqσ = (cosU2 * sinλ) * (cosU2 * sinλ) + (cosU1 * sinU2 - sinU1 * cosU2 * cosλ) * (cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
            if (Math.abs(sinSqσ) < ε)
                break; // co-incident/antipodal points (falls back on λ/σ = L)
            sinσ = Math.sqrt(sinSqσ);
            cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
            σ = Math.atan2(sinσ, cosσ);
            sinα = cosU1 * cosU2 * sinλ / sinσ;
            cosSqα = 1 - sinα * sinα;
            cos2σₘ = (cosSqα != 0) ? (cosσ - 2 * sinU1 * sinU2 / cosSqα) : 0; // on equatorial line cos²α = 0 (§6)
            C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
            λʹ = λ;
            λ = L + (1 - C) * f * sinα * (σ + C * sinσ * (cos2σₘ + C * cosσ * (-1 + 2 * cos2σₘ * cos2σₘ)));
            var iterationCheck = antipodal ? Math.abs(λ) - π : Math.abs(λ);
            if (iterationCheck > π)
                throw new EvalError('λ > π');
        } while (Math.abs(λ - λʹ) > 1e-12 && ++iterations < maxInterations);
        if (iterations >= maxInterations)
            throw new EvalError("Vincenty formula failed to converge after " + maxInterations + " iterations");
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
        // console.log(`iterations: ${iterations}`)
        return {
            distance: s,
            initialBearing: Math.abs(s) < ε ? NaN : this.wrap360(this.toDegrees(α1)),
            finalBearing: Math.abs(s) < ε ? NaN : this.wrap360(this.toDegrees(α2))
        };
    };
    /**
     * Returns the point of intersection of two paths defined by position and bearing.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-spherical.js
     *
     * @param firstPos 1st path: position and bearing
     * @param firstBearing
     * @param secondPos 2nd path: position and bearing
     * @param secondBearing
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
        if (Math.abs(δ12) < ε)
            return firstPos; // coincident points
        // initial/final bearings between points
        var cosθa = (Math.sin(φ2) - Math.sin(φ1) * Math.cos(δ12)) / (Math.sin(δ12) * Math.cos(φ1));
        var cosθb = (Math.sin(φ1) - Math.sin(φ2) * Math.cos(δ12)) / (Math.sin(δ12) * Math.cos(φ2));
        var θa = Math.acos(Math.min(Math.max(cosθa, -1), 1)); // protect against rounding errors
        var θb = Math.acos(Math.min(Math.max(cosθb, -1), 1)); // protect against rounding errors
        var θ12 = Math.sin(λ2 - λ1) > 0 ? θa : 2 * π - θa;
        var θ21 = Math.sin(λ2 - λ1) > 0 ? 2 * π - θb : θb;
        var α1 = θ13 - θ12; // angle 2-1-3
        var α2 = θ21 - θ23; // angle 1-2-3
        if (Math.sin(α1) == 0 && Math.sin(α2) == 0)
            return null; // infinite intersections
        if (Math.sin(α1) * Math.sin(α2) < 0)
            return null; // ambiguous intersection (antipodal?)
        var cosα3 = -Math.cos(α1) * Math.cos(α2) + Math.sin(α1) * Math.sin(α2) * Math.cos(δ12);
        var δ13 = Math.atan2(Math.sin(δ12) * Math.sin(α1) * Math.sin(α2), Math.cos(α2) + Math.cos(α1) * cosα3);
        var φ3 = Math.asin(Math.sin(φ1) * Math.cos(δ13) + Math.cos(φ1) * Math.sin(δ13) * Math.cos(θ13));
        var Δλ13 = Math.atan2(Math.sin(θ13) * Math.sin(δ13) * Math.cos(φ1), Math.cos(δ13) - Math.sin(φ1) * Math.sin(φ3));
        var λ3 = λ1 + Δλ13;
        return {
            lat: this.toDegrees(φ3),
            lng: this.toDegrees(λ3)
        };
    };
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
        return {
            lat: this.wrap180(this.toDegrees(φm)),
            lng: this.wrap180(this.toDegrees(λm))
        };
    };
    return GeodesicCore;
}());

var GeodesicGeometry = /** @class */ (function () {
    function GeodesicGeometry() {
        this.geodesic = new GeodesicCore();
    }
    GeodesicGeometry.prototype.recursiveMidpoint = function (start, dest, iterations) {
        var geom = [start, dest];
        var midpoint = this.geodesic.midpoint(start, dest);
        if (iterations > 0) {
            geom.splice.apply(geom, __spreadArrays([0, 1], this.recursiveMidpoint(start, midpoint, iterations - 1)));
            geom.splice.apply(geom, __spreadArrays([geom.length - 2, 2], this.recursiveMidpoint(midpoint, dest, iterations - 1)));
        }
        else
            geom.splice(1, 0, midpoint);
        return geom;
    };
    GeodesicGeometry.prototype.line = function (start, dest) {
        return this.recursiveMidpoint(start, dest, 4);
    };
    GeodesicGeometry.prototype.multiLineString = function (latlngs) {
        var _this = this;
        var multiLineString = [];
        latlngs.forEach(function (linestring) {
            var segment = [];
            for (var j = 1; j < linestring.length; j++) {
                segment.splice.apply(segment, __spreadArrays([segment.length - 1, 1], _this.line(linestring[j - 1], linestring[j])));
            }
            multiLineString.push(segment);
        });
        return multiLineString;
    };
    GeodesicGeometry.prototype.lineString = function (latlngs) {
        return this.multiLineString([latlngs])[0];
    };
    GeodesicGeometry.prototype.splitLine = function (start, dest) {
        var dateLineWest = {
            point: { lat: 89, lng: -180 },
            bearing: 180
        };
        var dateLineEast = {
            point: { lat: 89, lng: 180 },
            bearing: 180
        };
        var line = this.geodesic.inverse(start, dest);
        var intersection;
        // depending on initial direction, we check for crossing the dateline in western or eastern direction
        if (line.initialBearing > 180) {
            intersection = this.geodesic.intersection(start, line.initialBearing, dateLineWest.point, dateLineWest.bearing);
        }
        else {
            intersection = this.geodesic.intersection(start, line.initialBearing, dateLineEast.point, dateLineEast.bearing);
        }
        if (intersection) {
            var intersectionDistance = this.geodesic.inverse(start, intersection);
            if (intersectionDistance.distance < line.distance) {
                if (intersection.lng < -179.9999) {
                    return [[start, intersection], [{ lat: intersection.lat, lng: intersection.lng + 360 }, dest]];
                }
                else if (intersection.lng > 179.9999) {
                    return [[start, intersection], [{ lat: intersection.lat, lng: intersection.lng - 360 }, dest]];
                }
                return [[start, intersection], [intersection, dest]];
            }
        }
        return [[start, dest]];
    };
    GeodesicGeometry.prototype.splitMultiLineString = function (multilinestring) {
        var _this = this;
        var result = [];
        multilinestring.forEach(function (linestring) {
            var segment = [linestring[0]];
            for (var j = 1; j < linestring.length; j++) {
                var split = _this.splitLine(linestring[j - 1], linestring[j]);
                if (split.length === 1) {
                    segment.push(linestring[j]);
                }
                else {
                    segment.push(split[0][1]);
                    result.push(segment);
                    segment = split[1];
                }
            }
            result.push(segment);
        });
        return result;
    };
    return GeodesicGeometry;
}());

function instanceOfLatLngLiteral(object) {
    return ((typeof object === "object")
        && (typeof object !== null)
        && ('lat' in object)
        && ('lng' in object)
        && (typeof object.lat === "number")
        && (typeof object.lng === "number"));
}
function instanceOfLatLngTuple(object) {
    return ((object instanceof Array)
        && (typeof object[0] === "number")
        && (typeof object[1] === "number"));
}
function instanceOfLatLngExpression(object) {
    if (object instanceof L.LatLng) {
        return true;
    }
    else if (instanceOfLatLngTuple(object)) {
        return true;
    }
    else if (instanceOfLatLngLiteral(object)) {
        return true;
    }
    else
        return false;
}
function latlngExpressiontoLiteral(input) {
    if (input instanceof L.LatLng) {
        return { lat: input.lat, lng: input.lng };
    }
    else if (instanceOfLatLngTuple(input)) {
        return { lat: input[0], lng: input[1] };
    }
    else if (instanceOfLatLngLiteral(input)) {
        return input;
    }
    else
        throw new Error("L.LatLngExpression expected. Unknown object found.");
}
function latlngExpressionArraytoLiteralArray(input) {
    var literal = [];
    var _loop_1 = function (group) {
        // it's a 1D-Array L.LatLngExpression[]
        if (instanceOfLatLngExpression(group)) {
            var sub_1 = [];
            input.forEach(function (point) {
                sub_1.push(latlngExpressiontoLiteral(point));
            });
            literal.push(sub_1);
            return "break";
        }
        // it's a 2D-Array L.LatLngExpression[][]
        else if (group instanceof Array) {
            if (instanceOfLatLngExpression(group[0])) {
                var sub_2 = [];
                group.forEach(function (point) {
                    sub_2.push(latlngExpressiontoLiteral(point));
                });
                literal.push(sub_2);
            }
            else
                throw new Error("L.LatLngExpression[] | L.LatLngExpression[][] expected. Unknown object found.");
        }
        else
            throw new Error("L.LatLngExpression[] | L.LatLngExpression[][] expected. Unknown object found.");
    };
    for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
        var group = input_1[_i];
        var state_1 = _loop_1(group);
        if (state_1 === "break")
            break;
    }
    return literal;
}

var GeodesicLine = /** @class */ (function (_super) {
    __extends(GeodesicLine, _super);
    function GeodesicLine(latlngs, options) {
        var _this = _super.call(this) || this;
        _this.options = {};
        _this.geom = new GeodesicGeometry();
        _this.options = __assign(__assign({}, _this.options), options);
        _this.polyline = L.polyline(_this.geom.multiLineString(latlngExpressionArraytoLiteralArray(latlngs)), _this.options);
        return _this;
    }
    GeodesicLine.prototype.onAdd = function (map) {
        this.polyline.addTo(map);
        return this;
    };
    GeodesicLine.prototype.onRemove = function () {
        this.polyline.remove();
        return this;
    };
    GeodesicLine.prototype.update = function (latlngs) {
        // this.polyline.setLatLngs(this.geom.multiLineString(latlngExpressionArraytoLiteralArray(latlngs)));
        var geodesic = this.geom.multiLineString(latlngExpressionArraytoLiteralArray(latlngs));
        this.polyline.setLatLngs(this.geom.splitMultiLineString(geodesic));
        // this.polyline.setLatLngs(this.geom.splitLine(latlngs[0] as any, latlngs[1] as any));
    };
    GeodesicLine.prototype.setLatLngs = function (latlngs) {
        this.update(latlngs);
        return this;
    };
    GeodesicLine.prototype.getLatLngs = function () {
        return this.polyline.getLatLngs();
    };
    return GeodesicLine;
}(L.Layer));

var GreatCircleClass = /** @class */ (function (_super) {
    __extends(GreatCircleClass, _super);
    function GreatCircleClass(latlngs, options) {
        var _this = _super.call(this) || this;
        _this.options = {};
        _this.options = __assign(__assign({}, _this.options), options);
        _this.polygon = L.polygon(latlngs, _this.options);
        return _this;
    }
    GreatCircleClass.prototype.onAdd = function (map) {
        this.polygon.addTo(map);
        return this;
    };
    GreatCircleClass.prototype.onRemove = function () {
        this.polygon.remove();
        return this;
    };
    GreatCircleClass.prototype.setLatLngs = function (latlngs) {
        this.polygon.setLatLngs(latlngs);
        return this;
    };
    GreatCircleClass.prototype.asPolyline = function () {
        console.log("[ Geodesic ]: asPolyline()");
        return [[0, 0]];
    };
    return GreatCircleClass;
}(L.Layer));

L.Geodesic = GeodesicLine;
L.geodesic = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return new (GeodesicLine.bind.apply(GeodesicLine, __spreadArrays([void 0], args)))();
};
L.GreatCircle = GreatCircleClass;
L.greatcircle = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return new (GreatCircleClass.bind.apply(GreatCircleClass, __spreadArrays([void 0], args)))();
};

exports.GeodesicLine = GeodesicLine;
exports.GreatCircleClass = GreatCircleClass;
