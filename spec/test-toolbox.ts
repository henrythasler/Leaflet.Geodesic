import L from "leaflet";
import { expect } from "chai";

import "jest";

export const eps = 0.000001;

export function checkFixture(specimen: L.LatLng[][], fixture: L.LatLngLiteral[][]): void {
    expect(specimen).to.be.an("array");
    expect(specimen).to.be.length(fixture.length);
    specimen.forEach((line, k) => {
        expect(line).to.be.length(fixture[k].length);
        line.forEach((point, l) => {
            expect(point).to.be.instanceOf(L.LatLng);
            expect(point.lat).to.be.closeTo(fixture[k][l].lat, eps);
            expect(point.lng).to.be.closeTo(fixture[k][l].lng, eps);
        });
    });
}

export function compareObject(specimen: object, fixture: object): void {
    for (let [key, value] of Object.entries(specimen)) {
        expect(specimen).to.have.own.property(key, value);
    }
}