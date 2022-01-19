import L from "leaflet";
import { expect } from "chai";

import "jest";

export const eps = 0.000001;

export const FlindersPeak = new L.LatLng(-37.9510334166667, 144.424867888889);
export const Buninyong = new L.LatLng(-37.6528211388889, 143.926495527778);
export const Berlin = new L.LatLng(52.5, 13.35);
export const LosAngeles = new L.LatLng(33.82, -118.38);
export const Seattle = new L.LatLng(47.56, -122.33);
export const Santiago = new L.LatLng(-33.44, -70.71);
export const Capetown = new L.LatLng(-33.94, 18.39);
export const Tokyo = new L.LatLng(35.47, 139.15);
export const Sydney = new L.LatLng(-33.91, 151.08);
export const Singapore = new L.LatLng(1.34, 104.01);
export const Beijing = new L.LatLng(39.92, 116.39);

export function checkFixture(specimen: L.LatLng[][], fixture: L.LatLngLiteral[][], customEps = eps): void {
    expect(specimen).to.be.an("array");
    expect(specimen).to.be.length(fixture.length);
    specimen.forEach((line, k) => {
        expect(line).to.be.length(fixture[k].length);
        line.forEach((point, l) => {
            expect(point).to.be.instanceOf(L.LatLng);
            expect(point.lat, "lat").to.be.closeTo(fixture[k][l].lat, customEps);
            expect(point.lng, "lng").to.be.closeTo(fixture[k][l].lng, customEps);
        });
    });
}

export function compareObject(specimen: object, fixture: object): void {
    for (let [key, value] of Object.entries(fixture)) {
        expect(specimen).to.have.deep.own.property(key, value);
    }
}
