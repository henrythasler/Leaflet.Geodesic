import L from "leaflet";

function instanceOfLatLngLiteral(object: any): object is L.LatLngLiteral {
    return (('lat' in object) && ('lng' in object));
}

export function latlngExpressiontoLiteral(input: L.LatLngExpression): L.LatLngLiteral {
    if(input instanceof L.LatLng) {
        return {lat: input.lat, lng: input.lng} as L.LatLngLiteral;
    }
    else if(input instanceof Array) {
        return {lat: input[0], lng: input[1]} as L.LatLngLiteral;
    }
    else if (instanceOfLatLngLiteral(input)) {
        return input;
    }
    else throw("L.LatLngExpression expected. Unknown object found.");
}
