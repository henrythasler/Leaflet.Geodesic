/**
 * @jest-environment jsdom
 */

import L from "leaflet";

export function mockMap() {
    const container = document.createElement("div");
    container.style.width = "400px";
    container.style.height = "400px";
    return L.map(container, { renderer: new L.SVG(), center: [0, 0], zoom: 12 });
}