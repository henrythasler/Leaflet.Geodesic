"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = require("path");
var pkg = require('../package.json');
// clear target folder before bundling to get rid of old artefacts
var distDir = (0, path_1.dirname)(pkg.main);
if ((0, fs_1.existsSync)(distDir)) {
    (0, fs_1.rmdirSync)(distDir, { recursive: true });
}
