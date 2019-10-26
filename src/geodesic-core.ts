import L from "leaflet";

export interface GeodesicOptions extends L.PolylineOptions {
    wrap?: true,
    steps?: 10
}

export interface WGS84Vector extends L.LatLngLiteral {
    bearing: number;
}

export class GeodesicCore {
    readonly options: GeodesicOptions = {};
    readonly ellipsoid = {
        a: 6378137,
        b: 6356752.3142,
        f: 1 / 298.257223563
    }; // WGS-84

    constructor(options?: GeodesicOptions) {
        this.options = { ...this.options, ...options };
    }

    toRadians(degree: number): number {
        return degree * Math.PI / 180;
    }

    toDegrees(radians: number): number {
        return radians * 180 / Math.PI;
    }

    /**
     * source: https://github.com/chrisveness/geodesy/blob/master/dms.js
     * @param degrees arbitrary value
     * @return degrees between 0..360
     */
    wrap360(degrees: number) {
        if (0 <= degrees && degrees < 360) return degrees; // avoid rounding due to arithmetic ops if within range
        return (degrees % 360 + 360) % 360; // sawtooth wave p:360, a:360
    }

    /**
     * Vincenty direct calculation.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
     *
     * @param start starting point 
     * @param bearing initial bearing (in degrees)
     * @param distance distance from starting point to calculate along given bearing in meters.
     * @return Final point (destination point) and bearing (in degrees)
     */
    direct(start: L.LatLngLiteral, bearing: number, distance: number): WGS84Vector {
        const φ1 = this.toRadians(start.lat)
        const λ1 = this.toRadians(start.lng);
        const α1 = this.toRadians(bearing);
        const s = distance;

        const { a, b, f } = this.ellipsoid;

        const sinα1 = Math.sin(α1);
        const cosα1 = Math.cos(α1);

        const tanU1 = (1 - f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
        const σ1 = Math.atan2(tanU1, cosα1); // σ1 = angular distance on the sphere from the equator to P1
        const sinα = cosU1 * sinα1;          // α = azimuth of the geodesic at the equator
        const cosSqα = 1 - sinα * sinα;
        const uSq = cosSqα * (a * a - b * b) / (b * b);
        const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
        const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

        let σ = s / (b * A), sinσ = null, cosσ = null, Δσ = null; // σ = angular distance P₁ P₂ on the sphere
        let cos2σₘ = null; // σₘ = angular distance on the sphere from the equator to the midpoint of the line

        let σʹ = null, iterations = 0;
        do {
            cos2σₘ = Math.cos(2 * σ1 + σ);
            sinσ = Math.sin(σ);
            cosσ = Math.cos(σ);
            Δσ = B * sinσ * (cos2σₘ + B / 4 * (cosσ * (-1 + 2 * cos2σₘ * cos2σₘ) -
                B / 6 * cos2σₘ * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σₘ * cos2σₘ)));
            σʹ = σ;
            σ = s / (b * A) + Δσ;
        } while (Math.abs(σ - σʹ) > 1e-12 && ++iterations < 100);
        if (iterations >= 100) throw new EvalError('Vincenty formula failed to converge'); // not possible?

        const x = sinU1 * sinσ - cosU1 * cosσ * cosα1;
        const φ2 = Math.atan2(sinU1 * cosσ + cosU1 * sinσ * cosα1, (1 - f) * Math.sqrt(sinα * sinα + x * x));
        const λ = Math.atan2(sinσ * sinα1, cosU1 * cosσ - sinU1 * sinσ * cosα1);
        const C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
        const L = λ - (1 - C) * f * sinα * (σ + C * sinσ * (cos2σₘ + C * cosσ * (-1 + 2 * cos2σₘ * cos2σₘ)));
        const λ2 = λ1 + L;

        const α2 = Math.atan2(sinα, -x);

        return {
            lat: this.toDegrees(φ2),
            lng: this.toDegrees(λ2),
            bearing: this.wrap360(this.toDegrees(α2))
        }
    }
}
