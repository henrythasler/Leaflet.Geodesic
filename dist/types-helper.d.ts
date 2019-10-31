import L from "leaflet";
export declare function instanceOfLatLngLiteral(object: any): object is L.LatLngLiteral;
export declare function instanceOfLatLngTuple(object: any): object is L.LatLngTuple;
export declare function instanceOfLatLngExpression(object: any): object is L.LatLngExpression;
export declare function latlngExpressiontoLiteral(input: L.LatLngExpression): L.LatLngLiteral;
export declare function latlngExpressionArraytoLiteralArray(input: L.LatLngExpression[] | L.LatLngExpression[][]): L.LatLngLiteral[][];
