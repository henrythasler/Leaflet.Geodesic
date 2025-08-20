import L from "leaflet";

import "jest";

export const closeToDigits_5 = 5;
export const closeToDigits_4 = 4;
export const closeToDigits_3 = 3;

export function checkFixture(specimen: L.LatLng[][], fixture: L.LatLngLiteral[][]): void {
    expect(specimen).toBeInstanceOf(Array);
    expect(specimen).toHaveLength(fixture.length);
    specimen.forEach((line, k) => {
        expect(line).toHaveLength(fixture[k].length);
        line.forEach((point, l) => {
            expect(point).toBeInstanceOf(L.LatLng);
            expect(point.lat).toBeCloseTo(fixture[k][l].lat, closeToDigits_5);
            expect(point.lng).toBeCloseTo(fixture[k][l].lng, closeToDigits_5);
        });
    });
}

export function compareObject(specimen: object, fixture: object): void {
    for (let [key, value] of Object.entries(fixture)) {
        expect(specimen).toHaveProperty(key, value);
    }
}

export function expectCloseTo(specimen: number, fixture: number, eps: number = 1e-6): void {
    expect(Math.abs(specimen - fixture)).toBeLessThanOrEqual(eps);
}