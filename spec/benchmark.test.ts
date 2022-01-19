/**
 * @jest-environment jsdom
 */
import Benchmark from "benchmark";
import { GeodesicGeometry } from "../src/geodesic-geom";
import { expect } from "chai";

import L from "leaflet";

import "jest";
import {Berlin, Seattle, Tokyo} from "./test-toolbox";

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
            .on("cycle", (event: Event) => {
                console.log(String(event.target));
            })
            .on("complete abort", () => {
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
