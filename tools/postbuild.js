"use strict";
exports.__esModule = true;
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var process_1 = require("process");
var path_1 = require("path");
var pkg = require('../package.json');
if ((0, fs_1.existsSync)(pkg.browser)) {
    // calculate sha-sum of the plugin. See https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity#using_subresource_integrity
    var content = (0, fs_1.readFileSync)(pkg.browser);
    var hash = (0, crypto_1.createHash)('sha512').update(content).digest('base64');
    // show filesize in bytes and the full integrity-property
    console.log("".concat(pkg.browser, ": ").concat((0, fs_1.statSync)(pkg.browser).size, " Bytes"));
    console.log("integrity=\"sha512-".concat(hash, "\""));
    // store the sha-sum in a file for distribution
    (0, fs_1.writeFileSync)("".concat(pkg.browser, ".sha512"), hash);
    // used for local testing
    (0, fs_1.copyFileSync)(pkg.browser, (0, path_1.join)("docs", (0, path_1.basename)(pkg.browser)));
}
else {
    // The file *should* be there after the build.
    console.log("".concat(pkg.browser, " not found!"));
    (0, process_1.exit)(1);
}
