import L from 'leaflet';

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

var GeodesicLine = /** @class */ (function (_super) {
    __extends(GeodesicLine, _super);
    function GeodesicLine(latlngs, options) {
        var _this = _super.call(this) || this;
        _this.options = {};
        _this.options = __assign(__assign({}, _this.options), options);
        _this.polyline = L.polyline(latlngs, _this.options);
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
    GeodesicLine.prototype.setLatLngs = function (latlngs) {
        this.polyline.setLatLngs(latlngs);
        return this;
    };
    GeodesicLine.prototype.asPolyline = function () {
        console.log("[ Geodesic ]: asPolyline()");
        return [[0, 0]];
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

export { GeodesicLine, GreatCircleClass };
