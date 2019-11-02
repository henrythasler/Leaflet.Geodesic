/**
 * @jest-environment jsdom
 */

 import { GreatCircleClass } from "../src/great-circle";

import { expect } from "chai";

import "jest";

const eps = 0.000001;

describe("Main functionality", function () {
    it("Create class w/o any parameters", function () {
        const circle = new GreatCircleClass();
        expect(circle.options).to.be.deep.equal({});
        expect(circle.polyline).to.be.an("object");
    });
});