import { LatLng, LatLngLiteral } from "leaflet";

import "jest";

export const highPrecisionDigits = 5;
export const medPrecisionDigits = 4;
export const lowPrecisionDigits = 3;

export function checkFixture(specimen: LatLng[][], fixture: LatLngLiteral[][]): void {
    expect(specimen).toBeInstanceOf(Array);
    expect(specimen).toHaveLength(fixture.length);
    specimen.forEach((line, k) => {
        expect(line).toHaveLength(fixture[k].length);
        line.forEach((point, l) => {
            expect(point).toBeInstanceOf(LatLng);
            expect(point.lat).toBeCloseTo(fixture[k][l].lat, highPrecisionDigits);
            expect(point.lng).toBeCloseTo(fixture[k][l].lng, highPrecisionDigits);
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