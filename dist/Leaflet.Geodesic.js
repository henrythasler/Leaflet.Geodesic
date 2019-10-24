"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const leaflet_1 = require("leaflet");
var L;
(function (L) {
    class Geodesic extends leaflet_1.Polyline {
        constructor(options) {
            super([[0, 0]], options);
            this.latlngs = this.polyline();
        }
        polyline() {
            return [[0, 0]];
        }
    }
    L.Geodesic = Geodesic;
})(L || (L = {}));
