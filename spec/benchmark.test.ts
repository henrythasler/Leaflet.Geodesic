import Benchmark from "benchmark";
import { GeodesicGeometry } from "../src/geodesic-geom";

import L from "leaflet";

import "jest";
import { expectCloseTo } from "./test-toolbox";

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
        // The hz value can vary a lot, so we allow a margin of 50k
        // This is because the benchmark is run on a different machine
        // than the one used for development.
        // The hz value is the number of times the function can be called per second.
        expectCloseTo(fastest.hz, 770000, 50000);
    });

    it("Seattle -> Tokyo (with split)", async function () {
        const res = await benchmark(Seattle, Tokyo);
        const fastest = ((res.filter("fastest").pop()) as unknown as Benchmark);
        expectCloseTo(fastest.hz, 80000, 10000);
    });
    
});
