"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var process_1 = require("process");
var path_1 = require("path");
var pkg = JSON.parse((0, fs_1.readFileSync)('package.json').toString());
function processFile(filename) {
    // calculate sha-sum of the plugin. See https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity#using_subresource_integrity
    var content = (0, fs_1.readFileSync)(filename);
    var hash = (0, crypto_1.createHash)('sha512').update(content).digest('base64');
    // show filesize in bytes and the full integrity-property
    console.log("".concat(filename, ": ").concat((0, fs_1.statSync)(filename).size, " Bytes"));
    console.log("integrity=\"sha512-".concat(hash, "\""));
    // store the sha-sum in a file for distribution
    (0, fs_1.writeFileSync)("".concat(filename, ".sha512"), hash);
    // used for local testing
    (0, fs_1.copyFileSync)(filename, (0, path_1.join)("docs", (0, path_1.basename)(filename)));
}
var fileList = [
    pkg.module,
];
fileList.forEach(function (file) {
    if ((0, fs_1.existsSync)(file)) {
        processFile(file);
    }
    else {
        // The file *should* be there after the build.
        console.log("".concat(file, " not found!"));
        (0, process_1.exit)(1);
    }
});
