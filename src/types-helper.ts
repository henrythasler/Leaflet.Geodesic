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
    else return false;
}

export function latlngExpressiontoLiteral(input: L.LatLngExpression): L.LatLngLiteral {
    if (input instanceof L.LatLng) {
        return { lat: input.lat, lng: input.lng } as L.LatLngLiteral;
    }
    else if (instanceOfLatLngTuple(input)) {
        return { lat: input[0], lng: input[1] } as L.LatLngLiteral;
    }
    else if (instanceOfLatLngLiteral(input)) {
        return input;
    }
    else throw new Error("L.LatLngExpression expected. Unknown object found.");
}

export function latlngExpressionArraytoLiteralArray(input: L.LatLngExpression[] | L.LatLngExpression[][]): L.LatLngLiteral[][] {
    let literal: L.LatLngLiteral[][] = [];
    for (let group of input) {
        // it's a 1D-Array L.LatLngExpression[]
        if (instanceOfLatLngExpression(group)) {
            let sub: L.LatLngLiteral[] = [];
            (input as L.LatLngExpression[]).forEach((point) => {
                sub.push(latlngExpressiontoLiteral(point));
            });
            literal.push(sub);
            break;
        }
        // it's a 2D-Array L.LatLngExpression[][]
        else if (group instanceof Array) {
            if (instanceOfLatLngExpression(group[0])) {
                let sub: L.LatLngLiteral[] = [];
                group.forEach((point) => {
                    sub.push(latlngExpressiontoLiteral(point));
                });
                literal.push(sub);
            }
            else throw new Error("L.LatLngExpression[] | L.LatLngExpression[][] expected. Unknown object found.");
        }
        else throw new Error("L.LatLngExpression[] | L.LatLngExpression[][] expected. Unknown object found.");
    }
    return literal;
}