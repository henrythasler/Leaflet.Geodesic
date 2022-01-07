/**
 * @jest-environment jsdom
 */
import Benchmark = require("benchmark");
import { GeodesicGeometry } from "../src/geodesic-geom";
import { expect } from "chai";

import L from "leaflet";

import "jest";

const Tokyo = new L.LatLng(35.47, 139.15);
const Seattle = new L.LatLng(47.56, -122.33);
const Berlin = new L.LatLng(52.5, 13.35);

const geom = new GeodesicGeometry();

// see: https://github.com/bestiejs/benchmark.js/issues/191
Benchmark.support.browser = false;

async function benchmark(start: L.LatLng, dest: L.LatLng): Promise<Benchmark.Suite> {
    const suite = new Benchmark.Suite();
    return new Promise(resolve => {
        suite
            .add("splitLine", () => {
                geom.splitLine(start, dest);
            })
            .on('cycle', (event: any) => {
                console.log(String(event.target));
            })
            .on('complete abort', () => {
                resolve(suite);
            })
            .run();
    });
}

describe("function benchmarks", function () {
    it("Seattle -> Berlin (no split)", async function () {
        const res = await benchmark(Seattle, Berlin);
        const fastest = ((res.filter("fastest").pop()) as unknown as Benchmark);
        expect(fastest.hz).to.be.closeTo(800000, 50000);
    });

    it("Seattle -> Tokyo (with split)", async function () {
        const res = await benchmark(Seattle, Tokyo);
        const fastest = ((res.filter("fastest").pop()) as unknown as Benchmark);
        expect(fastest.hz).to.be.closeTo(80000, 10000);
    });
    
});
