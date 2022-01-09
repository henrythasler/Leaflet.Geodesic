import * as L from "leaflet";

export function instanceOfLatLngLiteral(object: any): object is L.LatLngLiteral {
    return ((typeof object === "object")
        && (object !== null)
        && ('lat' in object)
        && ('lng' in object)
        && (typeof object.lat === "number")
        && (typeof object.lng === "number"));
}

export function instanceOfLatLngTuple(object: any): object is L.LatLngTuple {
    return ((object instanceof Array)
        && (typeof object[0] === "number")
        && (typeof object[1] === "number"));
}

export function instanceOfLatLngExpression(object: any): object is L.LatLngExpression {
    return object instanceof L.LatLng || instanceOfLatLngTuple(object) || instanceOfLatLngLiteral(object);
}

export function latlngExpressiontoLatLng(input: L.LatLngExpression): L.LatLng {
    if (input instanceof L.LatLng) {
        return input;
    }
    else if (instanceOfLatLngTuple(input)) {
        return new L.LatLng(input[0], input[1]);
    }
    else if (instanceOfLatLngLiteral(input)) {
        return new L.LatLng(input.lat, input.lng);
    }
    throw new Error("L.LatLngExpression expected. Unknown object found.");
}

export function latlngExpressionArraytoLatLngArray(input: L.LatLngExpression[] | L.LatLngExpression[][]): L.LatLng[][] {
    const latlng: L.LatLng[][] = [];
    const iterateOver = (instanceOfLatLngExpression(input[0]) ? [input] : input);
    const unknownObjectError = new Error("L.LatLngExpression[] | L.LatLngExpression[][] expected. Unknown object found.");

    if (!(iterateOver instanceof Array)) {
        throw unknownObjectError;
    }

    for (const group of iterateOver as L.LatLngExpression[][]) {

        if (!(group instanceof Array)) {
            throw unknownObjectError;
        }

        const sub: L.LatLng[] = [];
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
