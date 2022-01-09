import { createHash } from 'crypto';
import { readFileSync, existsSync, statSync, writeFileSync, copyFileSync } from 'fs';
import { exit } from 'process';
import { basename, join } from 'path';

const pkg = require('../package.json');

if (existsSync(pkg.browser)) {
    // calculate sha-sum of the plugin. See https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity#using_subresource_integrity
    const content = readFileSync(pkg.browser);
    const hash = createHash('sha512').update(content).digest('base64');

    // show filesize in bytes and the full integrity-property
    console.log(`${pkg.browser}: ${statSync(pkg.browser).size} Bytes`);
    console.log(`integrity="sha512-${hash}"`);

    // store the sha-sum in a file for distribution
    writeFileSync(`${pkg.browser}.sha512`, hash);

    // used for local testing
    copyFileSync(pkg.browser, join("docs", basename(pkg.browser)));
}
else {
    // The file *should* be there after the build.
    console.log(`${pkg.browser} not found!`);
    exit(1);
}
