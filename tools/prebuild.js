"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var pkg = JSON.parse((0, fs_1.readFileSync)('package.json').toString());
// clear target folder before bundling to get rid of old artefacts
var distDir = (0, path_1.dirname)(pkg.main);
if ((0, fs_1.existsSync)(distDir)) {
    (0, fs_1.rmSync)(distDir, { recursive: true });
}
