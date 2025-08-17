import { LatLng, LatLngLiteral, LatLngTuple, LatLngExpression } from "leaflet";

export function instanceOfLatLngLiteral(object: any): object is LatLngLiteral {
    return (
        typeof object === "object" &&
        object !== null &&
        "lat" in object &&
        "lng" in object &&
        typeof object.lat === "number" &&
        typeof object.lng === "number"
    );
}

export function instanceOfLatLngTuple(object: any): object is LatLngTuple {
    return object instanceof Array && typeof object[0] === "number" && typeof object[1] === "number";
}

export function instanceOfLatLngExpression(object: any): object is LatLngExpression {
    return object instanceof LatLng || instanceOfLatLngTuple(object) || instanceOfLatLngLiteral(object);
}

export function latlngExpressiontoLatLng(input: LatLngExpression): LatLng {
    if (input instanceof LatLng) {
        return input;
    } else if (instanceOfLatLngTuple(input)) {
        return new LatLng(input[0], input[1], input.at(2)); // alt is optional
    } else if (instanceOfLatLngLiteral(input)) {
        return new LatLng(input.lat, input.lng, input.alt);
    }
    throw new Error("LatLngExpression expected. Unknown object found.");
}

export function latlngExpressionArraytoLatLngArray(input: LatLngExpression[] | LatLngExpression[][]): LatLng[][] {
    const latlng: LatLng[][] = [];
    const iterateOver = instanceOfLatLngExpression(input[0]) ? [input] : input;
    const unknownObjectError = new Error(
        "LatLngExpression[] | LatLngExpression[][] expected. Unknown object found."
    );

    if (!(iterateOver instanceof Array)) {
        throw unknownObjectError;
    }

    for (const group of iterateOver as LatLngExpression[][]) {
        if (!(group instanceof Array)) {
            throw unknownObjectError;
        }

        const sub: LatLng[] = [];
        for (const point of group) {
            if (!instanceOfLatLngExpression(point)) {
                throw unknownObjectError;
            }
            sub.push(latlngExpressiontoLatLng(point));
        }
        latlng.push(sub);
    }
    return latlng;
}
