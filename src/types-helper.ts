import L from "leaflet";

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
    if (object instanceof L.LatLng) {
        return true;
    }
    else if (instanceOfLatLngTuple(object)) {
        return true;
    }
    else if (instanceOfLatLngLiteral(object)) {
        return true;
    }
    else {
        return false;
    }
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
    else {
        throw new Error("L.LatLngExpression expected. Unknown object found.");
    }
}

export function latlngExpressionArraytoLatLngArray(input: L.LatLngExpression[] | L.LatLngExpression[][]): L.LatLng[][] {
    const latlng: L.LatLng[][] = [];
    for (const group of input) {
        // it's a 1D-Array L.LatLngExpression[]
        if (instanceOfLatLngExpression(group)) {
            const sub: L.LatLng[] = [];
            (input as L.LatLngExpression[]).forEach((point) => {
                sub.push(latlngExpressiontoLatLng(point));
            });
            latlng.push(sub);
            break;
        }
        // it's a 2D-Array L.LatLngExpression[][]
        else if (group instanceof Array) {
            if (instanceOfLatLngExpression(group[0])) {
                const sub: L.LatLng[] = [];
                group.forEach((point) => {
                    sub.push(latlngExpressiontoLatLng(point));
                });
                latlng.push(sub);
            }
            else {
                throw new Error("L.LatLngExpression[] | L.LatLngExpression[][] expected. Unknown object found.");
            }
        }
        else {
            throw new Error("L.LatLngExpression[] | L.LatLngExpression[][] expected. Unknown object found.");
        }
    }
    return latlng;
}